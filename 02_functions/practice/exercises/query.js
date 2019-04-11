/**
 * Задание: написать построитель SQL-запросов.
 * Данный модуль должен экспортировать функцию `query`, вызов которой должен возвращать новый экземпляр объекта query.
 * Например:
 * const q1 = query();
 * const q2 = query();
 * console.log(Object.is(q1, q2)) // false
 *
 * В качестве аргументов query может передаваться имя таблицы.
 * Тогда при дальнейшем составлении запроса вызовы метода from(tableName) игнорируются.
 *
 * У возвращаемого объекта должны быть следующие методы:
 *
 * select(arg1, arg2 ... argN) - может принимать список полей для выборки.
 * Аргументы должны иметь тип String. Если ни одного аргумента не передано должны быть получены все поля таблицы
 * Например:
 * q.select().from('users')
 * > SELECT * FROM users
 * q.select('id', 'name').from('users')
 * > SELECT id, name FROM users
 *
 * from(tableName: String) - указывает из какой таблицы получать данные.
 *
 * where(fieldName: String) - служит для задания условия фильтрации.
 * При множественном вызове метода where в одном запросе условия должны объединяться через логическое "И".
 * Метод where должен возвращать объект имеющий следующие методы:
 * orWhere(fieldName: String) - делает то же самое что where, но объединяет через "ИЛИ".
 * Метод where должен возвращать объект имеющий следующие методы:
 *
 * equals(value: any) - условие равенства
 * Например: SELECT * FROM student WHERE age = 42;
 *
 * in(values: array) - позволяет определить, совпадает ли значение объекта со значением в списке
 * Например: SELECT * FROM offices WHERE city IN ('Minsk', 'Nicosia', 'Seattle');
 *
 * gt(value: any) - условие больше '>'
 * gte(value: any) - условие больше или равно '>='
 * lt(value: any) -  условие меньше '<'
 * lte(value: any) -  условие меньше или равно '<='
 * between(from: any, to: any) -  условие нахождения значения поля в заданном диапазоне:
 * SELECT * FROM products WHERE price BETWEEN 4.95 AND 9.95;
 *
 * isNull() - условие отсутствия значения у поля
 *
 * not() - служит для задания противоположного.
 * После вызова not можно вызывать только те же методы, которые использует where для сравнения.
 *
 * q.select().from('users').where('name').not().equals('Vasya')
 *
 * Вызов not не может быть вызван более одного раза подряд:
 * q.select().from('users').where('name').not().not().equals('Vasya')
 *
 * Внимание: методы сравнения не могут быть вызваны до вызова метода where()!
 *
 * Получения строчного представления сконструированного SQL-запроса должно происходить при
 * вызове метода toString() у объекта query.
 * В конце строки SQL-запроса должен быть символ ';'
 *
 *
 *
 * Дополнительные задания:
 *
 * 1. Добавить в сигнатуру функии query второй опциональный аргумент options типа Object.
 * Если в options есть поле escapeNames со значением true, названия полей и таблиц должны быть обёрнуты в двойные кавычки:
 *
 * const q = query({escapeNames: true});
 * q.select('name').from('peo ple').toString()
 * > SELECT "name" FROM "people";

 * const q = query('books', {escapeNames: true});
 * q.select('title').toString()
 * > SELECT "title" FROM "books";
 *
 * 2. Добавить возможность передавать в условия методов сравнения в качестве значения экземпляр запроса query.
 *
 * const q1 = query('users');
 * const admins = q1.select('id').where('role').equals('admin');
 * const q2 = query('posts');
 * const posts = q2.select().where('author_id').in(admins);
 * posts.toString();
 * > SELECT * FROM posts WHERE author_id IN (SELECT id FROM users WHERE role = 'admin');
 *
 * 3. Реализовать функциональность создания INSERT и DELETE запросов. Написать для них тесты.
 */

export default function query(queryName) {
  let sql = '';
  let fromCounter = 0;
  let notEr = false;
  const select = function(selectArguments) {
    if (selectArguments) {
      sql = 'SELECT ' + selectArguments;
    } else {
      sql = 'SELECT *';
    }
    return this;
  };
  const from = function(tableName) {
    if (fromCounter === 0) {
      if (queryName) {
        sql += ' FROM ' + queryName;
        fromCounter = 1;
      } else {
        sql += ' FROM ' + tableName;
        fromCounter = 1;
      }
    }
    return this;
  };

  const whereMethods = {
    equals(value) {
      if (notEr) {
        let wherePos = sql.indexOf('WHERE') + 5;
        sql = sql.slice(0, wherePos) + ' NOT' + sql.slice(wherePos);
      }
      if (typeof value === 'string') {
        sql += ' = ' + "'" + value + "'";
      } else {
        sql += ' = ' + value;
      }
      return query;
    },

    in(array) {
      let arr = [];
      for (let i of array) {
        if (typeof i === 'string') {
          arr.push("'" + i + "'");
        } else {
          arr.push(i);
        }
      }
      if (notEr) {
        sql += ' NOT IN (' + arr.join(', ') + ')';
      } else {
        sql += ' IN (' + arr.join(', ') + ')';
      }
      return query;
    },

    isNull() {
      if (notEr) {
        sql += ' IS NOT NULL';
      } else {
        sql += ' IS NULL';
      }
      return query;
    },

    not() {
      if (notEr) {
        throw new Error("not() can't be called multiple times in a row");
      }
      notEr = true;
      return whereMethods;
    },

    gt(value) {
      if (typeof value === 'string') {
        sql += ' > ' + "'" + value + "'";
      } else {
        sql += ' > ' + value;
      }
      return query;
    },

    gte(value) {
      if (typeof value === 'string') {
        sql += ' >= ' + "'" + value + "'";
      } else {
        sql += ' >= ' + value;
      }
      return query;
    },

    lt(value) {
      if (typeof value === 'string') {
        sql += ' < ' + "'" + value + "'";
      } else {
        sql += ' < ' + value;
      }
      return query;
    },

    lte(value) {
      if (typeof value === 'string') {
        sql += ' <= ' + "'" + value + "'";
      } else {
        sql += ' <= ' + value;
      }
      return query;
    },

    between(from, to) {
      sql += ' BETWEEN ' + from + ' AND ' + to;
      return query;
    }
  };

  const where = function(value) {
    if (sql && sql.indexOf('WHERE') >= 0) {
      sql += ' AND ' + value;
    } else {
      sql += ' WHERE ' + value;
      whereCounter = 1;
    }
    return whereMethods;
  };

  const orWhere = function(value) {
    if (sql && sql.indexOf('WHERE') >= 0) {
      sql += ' OR ' + value;
    } else {
      sql += ' WHERE ' + value;
      whereCounter = 1;
    }
    return whereMethods;
  };

  const toString = function() {
    return sql + ';';
  };
  const query = { select, from, where, orWhere, toString };

  return query;
}
