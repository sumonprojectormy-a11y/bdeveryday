const headerSlot = document.querySelector('.site-header-slot');
const siteHeader = headerSlot.querySelector('.site-header');

function updateFloatingHeader() {
  const bounds = headerSlot.getBoundingClientRect();
  const shouldFloat = bounds.bottom <= 0;

  if (shouldFloat === siteHeader.classList.contains('is-floating')) return;
  headerSlot.style.height = shouldFloat ? bounds.height + 'px' : '';
  siteHeader.classList.toggle('is-floating', shouldFloat);
}

function refreshFloatingHeader() {
  siteHeader.classList.remove('is-floating');
  headerSlot.style.height = '';
  updateFloatingHeader();
}

window.addEventListener('scroll', updateFloatingHeader, { passive: true });
window.addEventListener('resize', refreshFloatingHeader);
window.addEventListener('pageshow', refreshFloatingHeader);
updateFloatingHeader();

const compactHeader = window.matchMedia('(max-width: 720px)');
const mobileSearchToggle = document.getElementById('mobile-search-toggle');
const mobileSearch = document.getElementById('mast-search');
const mobileQuery = document.getElementById('query');

function setMobileSearch(open) {
  mobileSearch.classList.toggle('is-open', open);
  mobileSearchToggle.setAttribute('aria-expanded', String(open));
  refreshFloatingHeader();
}

mobileSearchToggle.addEventListener('click', () => {
  const open = mobileSearchToggle.getAttribute('aria-expanded') === 'false';
  setMobileSearch(open);
  if (open) mobileQuery.focus({preventScroll:true});
});
siteHeader.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !mobileSearch.classList.contains('is-open')) return;
  setMobileSearch(false);
  mobileSearchToggle.focus();
});
document.getElementById('search').addEventListener('submit', event => {
  if (!compactHeader.matches || !mobileQuery.value.trim() || !event.currentTarget.checkValidity()) return;
  setMobileSearch(false);
  mobileSearchToggle.focus();
});
compactHeader.addEventListener('change', () => setMobileSearch(false));
