const backToTop = document.querySelector('.back-to-top');
backToTop.setAttribute('aria-label', document.documentElement.lang === 'bn' ? 'পৃষ্ঠার শীর্ষে ফিরুন' : 'Back to top');

function updateBackToTop() {
  backToTop.hidden = window.scrollY < 320;
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('pageshow', updateBackToTop);
backToTop.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
});

updateBackToTop();
