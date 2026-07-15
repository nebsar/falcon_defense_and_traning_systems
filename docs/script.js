const sideMenu = document.getElementById('sideMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const openMenuButton = document.querySelector('.hamburger-button');
const closeMenuButton = document.querySelector('.side-menu-close');

if (openMenuButton && sideMenu && menuBackdrop) {
  const openMenu = () => {
    sideMenu.classList.add('open');
    menuBackdrop.classList.add('open');
    sideMenu.setAttribute('aria-hidden', 'false');
    openMenuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    sideMenu.classList.remove('open');
    menuBackdrop.classList.remove('open');
    sideMenu.setAttribute('aria-hidden', 'true');
    openMenuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  openMenuButton.addEventListener('click', openMenu);
  closeMenuButton.addEventListener('click', closeMenu);
  menuBackdrop.addEventListener('click', closeMenu);

  // Close menu when any nav link is clicked
  document.querySelectorAll('.side-nav a, .side-menu-cta a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
