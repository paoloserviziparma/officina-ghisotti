/* Officina Agricola Ghisotti Emanuele – interazioni del sito (nessun cookie, nessun tracciamento) */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var head = document.getElementById('site-head');
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');

  // ---- Badge a scadenza (es. fiera): sparisce dopo la data indicata in data-until ----
  document.querySelectorAll('[data-until]').forEach(function (el) {
    var d = new Date(el.getAttribute('data-until') + 'T00:00:00');
    if (!isNaN(d) && new Date() >= d) el.hidden = true;
  });

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

  var lang = (doc.getAttribute('lang') || 'it').slice(0, 2);
  var L = {
    it: { close: 'Chiudi il video', title: 'Video' },
    en: { close: 'Close video', title: 'Video' },
    fr: { close: 'Fermer la vidéo', title: 'Vidéo' }
  }[lang] || { close: 'Chiudi', title: 'Video' };

  // ---- Video: si caricano da YouTube (modalità privacy avanzata) solo al clic ----
  var dlg = null, frameBox = null, lastTrigger = null;
  function closeVideo() {
    if (!dlg) return;
    frameBox.innerHTML = '';            // ferma il video e scarica il player
    if (dlg.open) dlg.close();
    if (lastTrigger) lastTrigger.focus();
  }
  function openVideo(id, label, trigger) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'vmodal';
      dlg.innerHTML = '<div class="vmodal-box"><button type="button" class="vmodal-x" aria-label="' + L.close +
        '"><svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2"></path></svg></button>' +
        '<div class="vmodal-frame"></div></div>';
      document.body.appendChild(dlg);
      frameBox = dlg.querySelector('.vmodal-frame');
      dlg.querySelector('.vmodal-x').addEventListener('click', closeVideo);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) closeVideo(); });
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeVideo(); });
    }
    lastTrigger = trigger;
    var f;
    if (id.type === 'mp4') {
      // video ospitato sul sito: nessun servizio esterno
      f = document.createElement('video');
      f.src = id.src; f.controls = true; f.autoplay = true; f.playsInline = true;
    } else {
      f = document.createElement('iframe');
      f.src = id.type === 'vimeo'
        ? 'https://player.vimeo.com/video/' + encodeURIComponent(id.src) + '?dnt=1&autoplay=1'
        : 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id.src) + '?autoplay=1&rel=0&modestbranding=1';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
    }
    f.title = label || L.title;
    frameBox.innerHTML = '';
    frameBox.appendChild(f);
    dlg.setAttribute('aria-label', f.title);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  document.querySelectorAll('[data-yt], [data-vimeo], [data-mp4]').forEach(function (a) {
    var v = a.hasAttribute('data-mp4') ? { type: 'mp4', src: a.getAttribute('data-mp4') }
          : a.hasAttribute('data-vimeo') ? { type: 'vimeo', src: a.getAttribute('data-vimeo') }
          : { type: 'yt', src: a.getAttribute('data-yt') };
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;   // nuova scheda: lascia fare al browser
      e.preventDefault();
      var t = a.querySelector('p');
      openVideo(v, t ? t.textContent.trim() : '', a);
    });
  });

  // ---- Selettore "Quale attrezzatura per il mio escavatore?" ----
  var finder = document.querySelector('.finder');
  if (finder) {
    var outs = finder.querySelectorAll('[data-result]');
    var bigNote = finder.querySelector('[data-note="big"]');
    var quoteBtn = finder.querySelector('[data-finder-quote]');
    var pick = function (name) { var el = finder.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; };
    var labelOf = function (name) {
      var el = finder.querySelector('input[name="' + name + '"]:checked');
      return el ? el.closest('label').textContent.trim() : '';
    };
    var current = '';
    function decide() {
      var goal = pick('f-goal'), place = pick('f-place'), size = pick('f-size');
      if (!goal || !place || !size) return '';
      if (size === 'big') return place === 'city' ? 'auger-hard' : 'auger';
      if (goal === 'extract') return place === 'wood' ? 'crown-wings' : 'crown';
      if (goal === 'grind') return place === 'city' ? 'auger-hard' : 'auger';
      return place === 'wood' ? 'crown-wings' : (place === 'city' ? 'crown' : 'auger');   // "non so"
    }
    function render() {
      current = decide();
      outs.forEach(function (o) { o.hidden = o.getAttribute('data-result') !== current; });
      var empty = finder.querySelector('[data-result="none"]');
      if (empty) empty.hidden = !!current;
      if (bigNote) bigNote.hidden = !(current && pick('f-size') === 'big' && pick('f-goal') === 'extract');
      if (quoteBtn) quoteBtn.hidden = !current;
    }
    finder.addEventListener('change', render);
    finder.addEventListener('submit', function (e) { e.preventDefault(); });
    render();

    if (quoteBtn) quoteBtn.addEventListener('click', function (e) {
      var form = document.querySelector('form[name="preventivo"]');
      var msg = form && form.querySelector('[name="messaggio"]');
      if (!msg) return;
      var shown = finder.querySelector('[data-result="' + current + '"] h3');
      var t = finder.querySelector('[name="f-tons"]').value.trim();
      var m = finder.querySelector('[name="f-model"]').value.trim();
      var lines = [
        finder.getAttribute('data-l-advice') + ': ' + (shown ? shown.textContent.trim() : ''),
        finder.getAttribute('data-l-goal') + ': ' + labelOf('f-goal'),
        finder.getAttribute('data-l-place') + ': ' + labelOf('f-place'),
        finder.getAttribute('data-l-size') + ': ' + labelOf('f-size')
      ];
      if (t) lines.push(finder.getAttribute('data-l-tons') + ': ' + t + ' t');
      if (m) lines.push(finder.getAttribute('data-l-model') + ': ' + m);
      msg.value = lines.join('\n') + (msg.value ? '\n\n' + msg.value : '');
      // l'ancora #contatti / #contact porta al modulo; il focus va al primo campo
      setTimeout(function () { var n = form.querySelector('[name="nome"]'); if (n) n.focus({ preventScroll: true }); }, 600);
    });
  }

  // ---- Modulo preventivo: invio a Netlify Forms restando nella lingua della pagina ----
  var M = {
    it: { sending: 'Invio in corso…', error: 'Non è stato possibile inviare la richiesta. Riprova o scrivici a ghisotti.officina@gmail.com.' },
    en: { sending: 'Sending…', error: 'Your request could not be sent. Please try again or email ghisotti.officina@gmail.com.' },
    fr: { sending: 'Envoi en cours…', error: 'Votre demande n\'a pas pu être envoyée. Réessayez ou écrivez-nous à ghisotti.officina@gmail.com.' }
  }[lang] || null;
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    if (!M || !window.fetch) return;   // senza JS resta l'invio classico
    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.style.cssText = 'margin:0;font-size:14px;line-height:1.5';
    form.appendChild(status);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var body = new URLSearchParams(new FormData(form)).toString();
      if (btn) btn.disabled = true;
      status.style.color = '';
      status.textContent = M.sending;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          window.location.href = form.getAttribute('action');   // pagina di ringraziamento nella stessa lingua
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          status.style.color = '#B42318';
          status.textContent = M.error;
        });
    });
  });

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
