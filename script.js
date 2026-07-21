// =========================================================
// Kaká Limpeza - Loja 08 | Site institucional
// JS puro, sem dependências externas
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Menu hamburguer (mobile) ----------
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fecha o menu ao clicar em qualquer link
    var mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Contador animado (avaliações / nota) ----------
  function animateCounter(el) {
    var raw = el.textContent.trim().replace(/\s+/g, '');
    var decimals = el.hasAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    var target = parseFloat(raw.replace(',', '.'));

    if (isNaN(target)) { return; }

    if (reduceMotion) {
      el.textContent = decimals ? target.toFixed(decimals).replace('.', ',') : String(Math.round(target));
      return;
    }

    var duration = 1400;
    var start = null;

    function format(value) {
      return decimals ? value.toFixed(decimals).replace('.', ',') : String(Math.round(value));
    }

    function step(timestamp) {
      if (start === null) { start = timestamp; }
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = format(target);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counterHosts = document.querySelectorAll('.hero-rating, .rating-showcase');

  if ('IntersectionObserver' in window && counterHosts.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          entry.target.querySelectorAll('.js-counter').forEach(animateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counterHosts.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ---------- Fade-in suave ao rolar a página ----------
  var fadeEls = document.querySelectorAll('.fade-in, .fade-in-group');

  if ('IntersectionObserver' in window && fadeEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: navegadores sem suporte apenas mostram o conteúdo
    fadeEls.forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  // ---------- Carrossel genérico (depoimentos + fotos de produtos) ----------
  function initCarousel(opts) {
    var track = document.getElementById(opts.trackId);
    if (!track) { return; }

    var slides = track.querySelectorAll(opts.slideSelector);
    var dotsWrap = document.getElementById(opts.dotsId);
    var prevBtn = document.getElementById(opts.prevId);
    var nextBtn = document.getElementById(opts.nextId);
    var wrap = document.querySelector(opts.wrapSelector);
    var total = slides.length;

    if (!total) { return; }

    var index = 0;
    var timer = null;
    var autoplayDelay = opts.autoplayDelay || 6000;

    function goTo(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.carousel-dot').forEach(function (dot, di) {
          var active = di === index;
          dot.classList.toggle('is-active', active);
          dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      }
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      if (reduceMotion || total < 2) { return; }
      stopAutoplay();
      timer = setInterval(next, autoplayDelay);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    }
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.carousel-dot').forEach(function (dot) {
        dot.addEventListener('click', function () {
          goTo(parseInt(dot.getAttribute('data-index'), 10) || 0);
          resetAutoplay();
        });
      });
    }

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
      if (e.key === 'ArrowLeft') { prev(); resetAutoplay(); }
    });

    if (wrap) {
      wrap.addEventListener('mouseenter', stopAutoplay);
      wrap.addEventListener('mouseleave', startAutoplay);
      wrap.addEventListener('focusin', stopAutoplay);
      wrap.addEventListener('focusout', startAutoplay);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    goTo(0);
    startAutoplay();
  }

  initCarousel({
    trackId: 'depoimentosTrack',
    slideSelector: '.avaliacao-card',
    dotsId: 'depoimentosDots',
    prevId: 'depoimentosPrev',
    nextId: 'depoimentosNext',
    wrapSelector: '.depoimentos-carousel',
    autoplayDelay: 6000
  });

  initCarousel({
    trackId: 'sobreFotosTrack',
    slideSelector: '.sobre-carousel-slide',
    dotsId: 'sobreFotosDots',
    prevId: 'sobreFotosPrev',
    nextId: 'sobreFotosNext',
    wrapSelector: '.sobre-carousel',
    autoplayDelay: 4500
  });

  // ---------- Header, progresso de leitura, parallax e voltar ao topo ----------
  var siteHeader = document.getElementById('topo');
  var backToTop = document.getElementById('backToTop');
  var scrollProgress = document.getElementById('scrollProgress');
  var heroBg = document.querySelector('.hero-bg');
  var supportsScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  var ticking = false;

  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset;

    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollY > 24);
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollY > 480);
    }

    if (scrollProgress && !supportsScrollTimeline) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      scrollProgress.style.transform = 'scaleX(' + progress + ')';
    }

    if (heroBg && !reduceMotion && scrollY < window.innerHeight * 1.2) {
      heroBg.style.transform = 'translateY(' + (scrollY * 0.14) + 'px)';
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ---------- Ano atual no rodapé ----------
  var anoAtual = document.getElementById('anoAtual');
  if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
  }

});
