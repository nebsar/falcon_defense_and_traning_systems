const sideMenu = document.getElementById('sideMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const openMenuButton = document.querySelector('.hamburger-button');
const closeMenuButton = document.querySelector('.side-menu-close');

const openMenu = () => {
  sideMenu.classList.add('open');
  menuBackdrop.classList.add('open');
  sideMenu.setAttribute('aria-hidden', 'false');
};

const closeMenu = () => {
  sideMenu.classList.remove('open');
  menuBackdrop.classList.remove('open');
  sideMenu.setAttribute('aria-hidden', 'true');
};

openMenuButton.addEventListener('click', openMenu);
closeMenuButton.addEventListener('click', closeMenu);
menuBackdrop.addEventListener('click', closeMenu);

document.querySelectorAll('.side-nav a, .nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});
