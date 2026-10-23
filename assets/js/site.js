/* Officina Agricola Ghisotti Emanuele – interazioni del sito (nessun cookie, nessun tracciamento) */
(function () {
  var doc = document.documentElement;

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Comparsa dei blocchi allo scroll
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  doc.classList.add('rv-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv, .rvx').forEach(function (el) { io.observe(el); });
})();
