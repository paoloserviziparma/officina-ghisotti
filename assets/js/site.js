/* Officina Agricola Ghisotti Emanuele – interazioni del sito (nessun cookie, nessun tracciamento) */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var head = document.getElementById('site-head');
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');

  // ---- Menu mobile ----
  function setMenu(open) {
    if (!btn || !nav) return;
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (head) head.classList.toggle('menu-open', open);
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="#"]')) setMenu(false);
    });
  }

  // ---- Intestazione fissa che scompare/ricompare ----
  function measureHead() {
    if (head && !(nav && nav.classList.contains('open'))) {
      doc.style.setProperty('--head-h', head.offsetHeight + 'px');
    }
  }
  measureHead();
  window.addEventListener('resize', measureHead);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHead);

  var lastY = window.scrollY;
  function updateHead(y) {
    if (!head) return;
    var menuOpen = nav && nav.classList.contains('open');
    var delta = y - lastY;
    if (menuOpen || y < head.offsetHeight) {
      head.classList.remove('is-hidden');
    } else if (delta > 6) {
      head.classList.add('is-hidden');      // scroll verso il basso
    } else if (delta < -6) {
      head.classList.remove('is-hidden');   // scroll verso l'alto
    }
    head.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(delta) > 6) lastY = y;
  }
  if (head) {
    // se si naviga con la tastiera dentro il menu, l'intestazione resta visibile
    head.addEventListener('focusin', function () { head.classList.remove('is-hidden'); });
  }

  // ---- Parallax ----
  var px = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax], [data-parallax-x]'));
  function updateParallax() {
    var vh = window.innerHeight;
    var k = window.innerWidth < 760 ? 0.5 : 1;   // effetto più leggero sui telefoni
    px.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();   // il genitore non si muove: niente scatti
      if (box.bottom < -200 || box.top > vh + 200) return;
      var d = box.top + box.height / 2 - vh / 2;            // distanza dal centro dello schermo
      var sy = parseFloat(el.getAttribute('data-parallax'));
      var sx = parseFloat(el.getAttribute('data-parallax-x'));
      if (!isNaN(sy)) {
        var y = (-d * sy * k).toFixed(1) + 'px';
        if (el.getAttribute('data-parallax-prop') === 'translate') el.style.translate = '0 ' + y;
        else el.style.transform = 'translate3d(0,' + y + ',0)';
      }
      if (!isNaN(sx)) el.style.transform = 'translate3d(' + (d * sx * k).toFixed(1) + 'px,0,0)';
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHead(window.scrollY);
      if (px.length) updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---- Comparsa dei blocchi allo scroll ----
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
