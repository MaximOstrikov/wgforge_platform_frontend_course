const sections = document.querySelectorAll('section');
const tank = document.getElementById('tank');
const tankAway = document.getElementById('pageScroll');

for (let section of sections) {
  section.addEventListener('mouseenter', event => {
    const turretDirection = event.target.dataset.turretDirection;
    tank.classList.add(`tank_turret__${turretDirection}`);
  });
  section.addEventListener('mouseleave', event => {
    const turretDirection = event.target.dataset.turretDirection;
    tank.classList.remove(`tank_turret__${turretDirection}`);
  });

  sections[0].addEventListener('click', () => {
    document.body.classList.add('toggle');
  });
}

console.log(tankAway);
let lastPos = 0;
let lastScrollTop = 0;
sections[0].addEventListener('scroll', event => {
  console.log(event);
  let curruntTop = event.target.scrollTop;
  let pageScrollStat = curruntTop - lastScrollTop;
  lastPos += pageScrollStat / 2;
  tankAway.style.transform = `translateX(${lastPos}px)`;
  lastScrollTop = curruntTop;
});
