const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
document.documentElement.classList.add('js');
menu.hidden = false;

function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = 'Menu';
  navigation.classList.remove('is-open');
}

menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? 'Close' : 'Menu';
  navigation.classList.toggle('is-open', open);
});

navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
