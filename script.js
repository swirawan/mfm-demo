(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* Portfolio demonstration notice. Shows on first visit unless the visitor
     explicitly chooses not to see it again. The footer can always reopen it. */
  const demoNotice = document.querySelector('[data-demo-notice]');
  const demoNoticeClose = document.querySelector('[data-close-demo-notice]');
  const demoNoticeRemember = document.querySelector('[data-demo-notice-remember]');
  const demoNoticeOpenButtons = document.querySelectorAll('[data-open-demo-notice]');
  const DEMO_NOTICE_KEY = 'mfm-portfolio-demo-notice-dismissed-v1';
  let demoNoticePreviousFocus = null;

  const demoNoticeDismissed = () => {
    try { return window.localStorage.getItem(DEMO_NOTICE_KEY) === 'true'; }
    catch (_) { return false; }
  };

  const openDemoNotice = ({ force = false } = {}) => {
    if (!demoNotice || (!force && demoNoticeDismissed())) return;
    demoNoticePreviousFocus = document.activeElement;
    demoNotice.classList.add('is-open');
    demoNotice.setAttribute('aria-hidden', 'false');
    document.body.classList.add('demo-notice-open');
    window.setTimeout(() => demoNoticeClose?.focus(), reduceMotion ? 0 : 180);
  };

  const closeDemoNotice = () => {
    if (!demoNotice) return;
    if (demoNoticeRemember?.checked) {
      try { window.localStorage.setItem(DEMO_NOTICE_KEY, 'true'); } catch (_) {}
    }
    demoNotice.classList.remove('is-open');
    demoNotice.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('demo-notice-open');
    demoNoticePreviousFocus?.focus?.();
  };

  demoNoticeClose?.addEventListener('click', closeDemoNotice);
  demoNoticeOpenButtons.forEach((button) => button.addEventListener('click', () => openDemoNotice({ force: true })));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && demoNotice?.classList.contains('is-open')) closeDemoNotice();
  });
  window.setTimeout(() => openDemoNotice(), 120);

  /* Header + mobile menu */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('is-open', !open);
  });
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  }));


  /* Truly continuous rails: requestAnimationFrame + modulo wrapping keeps the loop
     mathematically continuous instead of restarting a CSS keyframe. */
  const initContinuousRail = (root) => {
    const track = root.querySelector('[data-loop-track]');
    const source = track?.querySelector('[data-loop-segment]');
    if (!track || !source) return;

    const speed = Number(root.dataset.speed || 30); // pixels per second
    const viewport = root.querySelector('.affiliate-viewport') || root;
    let segmentWidth = 0;
    let offset = 0;
    let paused = false;
    let raf = 0;
    let last = performance.now();
    let resizeTimer = 0;

    const rebuild = () => {
      [...track.children].slice(1).forEach(el => el.remove());
      source.removeAttribute('aria-hidden');
      source.style.flex = '0 0 auto';
      segmentWidth = source.getBoundingClientRect().width;
      if (!segmentWidth) return;

      const copies = Math.max(3, Math.ceil(viewport.clientWidth / segmentWidth) + 3);
      for (let i = 1; i < copies; i += 1) {
        const clone = source.cloneNode(true);
        clone.removeAttribute('data-loop-segment');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      }
      offset = 0;
      track.style.transform = 'translate3d(0,0,0)';
    };

    const tick = (now) => {
      const dt = Math.min(50, now - last);
      last = now;
      if (!paused && document.visibilityState === 'visible' && segmentWidth > 0) {
        offset -= speed * (dt / 1000);
        while (offset <= -segmentWidth) offset += segmentWidth;
        track.style.transform = `translate3d(${offset.toFixed(3)}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    root.addEventListener('mouseenter', () => { paused = true; });
    root.addEventListener('mouseleave', () => { paused = false; last = performance.now(); });
    root.addEventListener('focusin', () => { paused = true; });
    root.addEventListener('focusout', () => { paused = false; last = performance.now(); });

    rebuild();
    document.fonts?.ready?.then(rebuild);
    root.querySelectorAll('img').forEach(img => {
      if (!img.complete) img.addEventListener('load', rebuild, { once: true });
    });
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 180);
    }, { passive: true });

    if (!reduceMotion) raf = requestAnimationFrame(tick);
    else track.style.transform = 'none';
  };
  document.querySelectorAll('[data-loop-marquee]').forEach(initContinuousRail);

  /* Reveal motion */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }



  /* Editorial article transition inspired by the supplied CodePen reference.
     The image and copy enter as one composition, then settle with a very
     restrained focus scale so it feels editorial rather than gimmicky. */
  const articleTransition = document.querySelector('[data-article-transition]');
  if (articleTransition) {
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const articleIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('article-transition--active');
            articleIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.24, rootMargin: '0px 0px -8% 0px' });
      articleIO.observe(articleTransition);
    } else {
      articleTransition.classList.add('article-transition--active');
    }
  }

  /* Live time on the departure board */
  const boardClock = document.querySelector('[data-board-clock]');
  const updateClock = () => {
    if (!boardClock) return;
    boardClock.textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  };
  updateClock();
  setInterval(updateClock, 15000);

  /* Split-flap display */
  const flapAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /–';
  const createFlapChar = (char = ' ') => {
    const tile = document.createElement('span');
    tile.className = 'flap-char';
    tile.dataset.char = char;
    tile.innerHTML = `
      <span class="flap-half flap-top"><span>${char}</span></span>
      <span class="flap-half flap-bottom"><span>${char}</span></span>
      <span class="flap-flip flap-flip--top"><span>${char}</span></span>
      <span class="flap-flip flap-flip--bottom"><span>${char}</span></span>`;
    return tile;
  };

  const setupFlap = (el, length) => {
    if (!el) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < length; i += 1) {
      const random = reduceMotion ? ' ' : flapAlphabet[Math.floor(Math.random() * flapAlphabet.length)];
      frag.appendChild(createFlapChar(random));
    }
    el.replaceChildren(frag);
  };

  const flipChar = (tile, nextChar, delay = 0) => {
    const current = tile.dataset.char || ' ';
    if (current === nextChar) return;
    const top = tile.querySelector('.flap-top span');
    const bottom = tile.querySelector('.flap-bottom span');
    const flipTop = tile.querySelector('.flap-flip--top span');
    const flipBottom = tile.querySelector('.flap-flip--bottom span');

    if (reduceMotion) {
      [top, bottom, flipTop, flipBottom].forEach(el => { if (el) el.textContent = nextChar; });
      tile.dataset.char = nextChar;
      return;
    }

    window.setTimeout(() => {
      if (top) top.textContent = nextChar;
      if (bottom) bottom.textContent = current;
      if (flipTop) flipTop.textContent = current;
      if (flipBottom) flipBottom.textContent = nextChar;
      tile.classList.remove('is-flipping');
      void tile.offsetWidth;
      tile.classList.add('is-flipping');

      window.setTimeout(() => {
        if (bottom) bottom.textContent = nextChar;
        if (flipTop) flipTop.textContent = nextChar;
        tile.dataset.char = nextChar;
        tile.classList.remove('is-flipping');
      }, 520);
    }, delay);
  };

  const setFlapText = (el, text, baseDelay = 0) => {
    if (!el) return;
    const tiles = [...el.querySelectorAll('.flap-char')];
    const normalized = text.toUpperCase().padEnd(tiles.length, ' ').slice(0, tiles.length);
    tiles.forEach((tile, i) => flipChar(tile, normalized[i], baseDelay + i * 34));
    el.setAttribute('aria-label', text);
  };

  const boardEdits = [
    { destination: 'LAKE COMO', mood: 'LAKESIDE / SLOW', stay: '3–5 NIGHTS', note: 'PRIVATE BOAT · LONG LUNCH · ONE PERFECT HOTEL' },
    { destination: 'KYOTO', mood: 'CULTURE / DESIGN', stay: '4–6 NIGHTS', note: 'EARLY TEMPLES · SMALL STREETS · QUIET RYOKAN' },
    { destination: 'SOUTHERN AFRICA', mood: 'SAFARI / WILD', stay: '8–12 NIGHTS', note: 'CAPE TOWN · WINELANDS · SAFARI AT DUSK' },
    { destination: 'FRENCH POLYNESIA', mood: 'ISLAND / EXHALE', stay: '5–8 NIGHTS', note: 'OVERWATER MORNING · LAGOON AFTERNOON · NOTHING RUSHED' },
    { destination: 'WHISTLER', mood: 'ALPINE / FAMILY', stay: '4–7 NIGHTS', note: 'MOUNTAIN AIR · FIRESIDE DINNER · FAMILY TIME' }
  ];

  const flapDestination = document.querySelector('[data-flap-destination]');
  const flapMood = document.querySelector('[data-flap-mood]');
  const flapStay = document.querySelector('[data-flap-stay]');
  const boardNumber = document.querySelector('[data-board-number]');
  const boardNote = document.querySelector('[data-board-note]');
  const boardCountdown = document.querySelector('[data-board-countdown]');
  setupFlap(flapDestination, 16);
  setupFlap(flapMood, 16);
  setupFlap(flapStay, 11);

  let boardIndex = 0;
  let secondsToBoardTurn = 5;
  const paintBoard = (index) => {
    const edit = boardEdits[index];
    setFlapText(flapDestination, edit.destination, 0);
    setFlapText(flapMood, edit.mood, 120);
    setFlapText(flapStay, edit.stay, 240);
    if (boardNumber) boardNumber.textContent = `EDIT ${String(index + 1).padStart(2, '0')} / ${String(boardEdits.length).padStart(2, '0')}`;
    if (boardNote) {
      boardNote.animate?.([{ opacity: .2 }, { opacity: 1 }], { duration: 650, easing: 'ease' });
      boardNote.textContent = edit.note;
    }
    secondsToBoardTurn = 5;
    if (boardCountdown) boardCountdown.textContent = '05';
  };
  window.setTimeout(() => paintBoard(0), reduceMotion ? 0 : 350);
  if (!reduceMotion) {
    setInterval(() => {
      secondsToBoardTurn -= 1;
      if (secondsToBoardTurn <= 0) {
        boardIndex = (boardIndex + 1) % boardEdits.length;
        paintBoard(boardIndex);
      } else if (boardCountdown) {
        boardCountdown.textContent = String(secondsToBoardTurn).padStart(2, '0');
      }
    }, 1000);
  }

  /* Maddy Lens V30 - exact uploaded 20-page magazine rendered at 200 DPI.
     Desktop pairs the cover by itself, then 02/03, 04/05 ... 18/19, with page 20 closing the issue.
     Mobile presents every page individually. */
  const lookbookPages = Array.from({ length: 20 }, (_, idx) => {
    const pageNo = String(idx + 1).padStart(2, '0');
    return `<div class="pdf-page"><img src="assets/lookbook/pages/page-${pageNo}.png" alt="Maddy Lens Issue 01 page ${idx + 1}" draggable="false" decoding="async"></div>`;
  });

  const blankLookbookPage = `<div class="pdf-page pdf-page--blank" aria-hidden="true"></div>`;
  const spreads = [{ left: blankLookbookPage, right: lookbookPages[0] }];
  for (let i = 1; i < lookbookPages.length; i += 2) {
    spreads.push({
      left: lookbookPages[i],
      right: lookbookPages[i + 1] || blankLookbookPage
    });
  }

  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const sineEase = (value) => .5 - .5 * Math.cos(Math.PI * clamp01(value));

  /* Flexible paper curl. The turning sheet is split into narrow vertical strips.
     Each strip follows the strip before it, so the outer edge leads and the
     bend travels toward the spine instead of the whole page rotating as a card. */
  const animatePaperCurl = ({ sheet, pageWidth, frontMarkup, backMarkup, direction, singlePage, done }) => {
    const sliceCount = Math.max(14, Math.min(20, Math.round(pageWidth / 38)));
    const sliceWidth = pageWidth / sliceCount;
    const fragment = document.createDocumentFragment();
    const slices = [];

    sheet.replaceChildren();
    sheet.style.left = singlePage ? '0' : '50%';
    sheet.style.width = `${pageWidth}px`;
    sheet.classList.add('is-active', 'is-paper-curl');

    for (let i = 0; i < sliceCount; i += 1) {
      const strip = document.createElement('div');
      strip.className = 'paper-slice';
      strip.style.width = `${sliceWidth + 1.2}px`;

      const front = document.createElement('div');
      front.className = 'curl-face curl-face--front';
      const frontContent = document.createElement('div');
      frontContent.className = 'curl-page-content curl-page-content--right';
      frontContent.style.width = `${pageWidth}px`;
      frontContent.style.left = `${-(i * sliceWidth)}px`;
      frontContent.innerHTML = frontMarkup;
      front.appendChild(frontContent);

      const back = document.createElement('div');
      back.className = 'curl-face curl-face--back';
      const backContent = document.createElement('div');
      backContent.className = `curl-page-content ${singlePage ? 'curl-page-content--right' : 'curl-page-content--left'}`;
      backContent.style.width = `${pageWidth}px`;
      // Backside is sampled in reverse from the spine toward the outer edge.
      backContent.style.left = `${-(pageWidth - ((i + 1) * sliceWidth))}px`;
      backContent.innerHTML = backMarkup;
      back.appendChild(backContent);

      strip.append(front, back);
      fragment.appendChild(strip);
      slices.push(strip);
    }
    sheet.appendChild(fragment);

    const draw = (paperProgress) => {
      let x = 0;
      let z = 0;
      for (let i = 0; i < slices.length; i += 1) {
        const u = (i + .5) / slices.length;
        // The outer edge starts first; the spine follows a fraction later.
        const delay = (1 - u) * .13;
        const local = clamp01((paperProgress - delay) / (1 - delay));
        const eased = sineEase(local);
        const angle = -180 * eased;
        const radians = angle * Math.PI / 180;
        const lift = -2.45 * Math.sin(Math.PI * eased) * Math.sin(Math.PI * u);
        const shade = Math.sin(Math.PI * eased);

        const strip = slices[i];
        strip.style.setProperty('--curl-shade', shade.toFixed(3));
        strip.style.transform = `translate3d(${x.toFixed(3)}px,${lift.toFixed(3)}px,${z.toFixed(3)}px) rotateY(${angle.toFixed(3)}deg)`;

        x += sliceWidth * Math.cos(radians);
        z += -sliceWidth * Math.sin(radians);
      }
    };

    if (reduceMotion) {
      draw(direction === 'next' ? 1 : 0);
      done();
      return;
    }

    const duration = 3650;
    const from = direction === 'next' ? 0 : 1;
    const to = direction === 'next' ? 1 : 0;
    const started = performance.now();

    const frame = (now) => {
      const raw = clamp01((now - started) / duration);
      // Long, gentle acceleration/deceleration like a soft magazine page.
      const motion = sineEase(raw);
      const paperProgress = from + (to - from) * motion;
      draw(paperProgress);
      if (raw < 1) {
        requestAnimationFrame(frame);
      } else {
        window.setTimeout(done, 34);
      }
    };
    draw(from);
    requestAnimationFrame(frame);
  };

  const createBook = ({ root, countEl, progressEl, loop = false, auto = false }) => {
    if (!root) return null;
    const left = root.querySelector('[data-book-left]');
    const right = root.querySelector('[data-book-right]');
    const sheet = root.querySelector('[data-turning-sheet]');
    left.classList.add('book-page--pdf');
    right.classList.add('book-page--pdf');
    let index = 0;
    let turning = false;
    let autoTimer = null;
    let autoPaused = false;

    const singlePageMode = () => window.matchMedia('(max-width: 600px)').matches;
    const totalItems = () => singlePageMode() ? lookbookPages.length : spreads.length;

    const updateMeta = () => {
      const total = totalItems();
      if (countEl) countEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      if (progressEl) progressEl.style.width = `${((index + 1) / total) * 100}%`;
    };

    const paint = (at = index) => {
      const total = totalItems();
      index = Math.max(0, Math.min(total - 1, at));
      if (singlePageMode()) {
        left.innerHTML = '';
        right.innerHTML = lookbookPages[index];
      } else {
        left.innerHTML = spreads[index].left;
        right.innerHTML = spreads[index].right;
      }
      updateMeta();
    };

    const getTarget = (direction) => {
      const total = totalItems();
      let target = index + (direction === 'next' ? 1 : -1);
      if (loop) target = (target + total) % total;
      if (target < 0 || target >= total) return null;
      return target;
    };

    const finishTurn = (target) => {
      index = target;
      paint(index);
      sheet.classList.remove('is-active', 'is-paper-curl');
      sheet.replaceChildren();
      sheet.removeAttribute('style');
      turning = false;
    };

    const turn = (direction = 'next') => {
      if (turning) return false;
      const target = getTarget(direction);
      if (target === null) return false;
      turning = true;

      const singlePage = singlePageMode();
      const pageWidth = Math.max(1, right.getBoundingClientRect().width);
      let frontMarkup;
      let backMarkup;

      if (singlePage) {
        if (direction === 'next') {
          frontMarkup = lookbookPages[index];
          backMarkup = lookbookPages[target];
          right.innerHTML = lookbookPages[target];
        } else {
          frontMarkup = lookbookPages[target];
          backMarkup = lookbookPages[index];
        }
      } else if (direction === 'next') {
        frontMarkup = spreads[index].right;
        backMarkup = spreads[target].left;
        right.innerHTML = spreads[target].right;
      } else {
        frontMarkup = spreads[target].right;
        backMarkup = spreads[index].left;
        left.innerHTML = spreads[target].left;
      }

      animatePaperCurl({
        sheet,
        pageWidth,
        frontMarkup,
        backMarkup,
        direction,
        singlePage,
        done: () => finishTurn(target)
      });
      return true;
    };

    const startAuto = () => {
      if (!auto || reduceMotion || autoTimer) return;
      autoTimer = window.setInterval(() => {
        if (!autoPaused && !turning && document.visibilityState === 'visible') turn('next');
      }, 11800);
    };
    const stopAuto = () => {
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = null;
    };
    const pauseAuto = (value) => { autoPaused = value; };
    const setIndex = (nextIndex) => paint(nextIndex);
    const getIndex = () => index;

    paint(0);
    startAuto();

    let touchX = null;
    root.addEventListener('touchstart', (event) => {
      touchX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    root.addEventListener('touchend', (event) => {
      if (touchX === null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchX;
      const delta = endX - touchX;
      touchX = null;
      if (Math.abs(delta) > 44) turn(delta < 0 ? 'next' : 'prev');
    }, { passive: true });

    return { turn, setIndex, getIndex, pauseAuto, stopAuto, startAuto, paint };
  };

  const previewBookRoot = document.querySelector('[data-book-preview]');

  const previewBook = createBook({
    root: previewBookRoot,
    countEl: document.querySelector('[data-book-count]'),
    progressEl: document.querySelector('[data-book-progress]'),
    loop: true,
    auto: true
  });
  const previewWrap = document.querySelector('[data-book-preview-wrap]');
  previewWrap?.addEventListener('mouseenter', () => previewBook?.pauseAuto(true));
  previewWrap?.addEventListener('mouseleave', () => previewBook?.pauseAuto(false));
  previewWrap?.addEventListener('focusin', () => previewBook?.pauseAuto(true));
  previewWrap?.addEventListener('focusout', () => previewBook?.pauseAuto(false));

  /* Full lookbook modal: manual page turning */
  const modal = document.querySelector('[data-lookbook-modal]');
  const modalBook = createBook({
    root: document.querySelector('[data-book-modal]'),
    countEl: document.querySelector('[data-modal-count]'),
    progressEl: document.querySelector('[data-modal-progress]'),
    loop: false,
    auto: false
  });
  const openButtons = document.querySelectorAll('[data-open-lookbook]');
  const closeButtons = document.querySelectorAll('[data-close-lookbook]');
  const modalPrev = document.querySelector('[data-modal-prev]');
  const modalNext = document.querySelector('[data-modal-next]');

  const openModal = () => {
    if (!modal) return;
    previewBook?.pauseAuto(true);
    modalBook?.setIndex(previewBook?.getIndex() || 0);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.setTimeout(() => modal.querySelector('[data-close-lookbook]')?.focus(), 100);
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    previewBook?.pauseAuto(false);
  };
  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
  modalPrev?.addEventListener('click', () => modalBook?.turn('prev'));
  modalNext?.addEventListener('click', () => modalBook?.turn('next'));

  document.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') modalBook?.turn('next');
    if (e.key === 'ArrowLeft') modalBook?.turn('prev');
  });


  let lookbookWasSingle = window.matchMedia('(max-width: 600px)').matches;
  window.addEventListener('resize', () => {
    const nowSingle = window.matchMedia('(max-width: 600px)').matches;
    if (nowSingle !== lookbookWasSingle) {
      lookbookWasSingle = nowSingle;
      previewBook?.setIndex(0);
      modalBook?.setIndex(0);
    }
  });

  /* MFM team archive: one active profile at a time on touch/keyboard. */
  const teamRoster = document.querySelector('[data-team-roster]');
  if (teamRoster) {
    const teamCards = [...teamRoster.querySelectorAll('[data-team-card]')];
    const activateTeamCard = (card) => {
      teamCards.forEach((item) => {
        const active = item === card;
        item.classList.toggle('is-active', active);
        item.querySelector('.team-card-toggle')?.setAttribute('aria-expanded', String(active));
      });
    };
    teamCards.forEach((card) => {
      const toggle = card.querySelector('.team-card-toggle');
      toggle?.addEventListener('click', () => activateTeamCard(card));
      toggle?.addEventListener('focus', () => {
        if (window.innerWidth > 900) activateTeamCard(card);
      });
      card.addEventListener('mouseenter', () => {
        if (window.innerWidth > 900) activateTeamCard(card);
      });
    });
  }

  /* Team story reader: full bios live inside this site rather than linking back to the legacy team page. */
  const teamStories = [
    {
      key: 'maddy', index: '01', initials: 'MM', name: 'Maddy Moffitt', role: 'Owner & Travel Advisor', image: 'assets/images/team/maddy.webp', position: 'center 27%',
      paragraphs: [
        'Maddy’s relationship with travel began as a curiosity about how life looks and feels somewhere else. Studying in London, playing legendary golf courses in Scotland and Ireland, and exploring destinations across Europe, Asia, Oceania, Africa and South America shaped a point of view that values both discovery and the comfort of a well-considered plan.',
        'Her own travels — from Thailand with a best friend and a month through Australia and New Zealand to Italy, Greece and a Bora Bora honeymoon — reinforced the idea that the best itineraries are organized without feeling over-programmed. There should be enough structure to make a trip effortless and enough room for a place to surprise you.',
        'At MFM, she brings that balance to every journey: personal pacing, thoughtful curation, and access to Virtuoso and a global network of trusted partners, all shaped around the way each traveler actually wants to experience the world.'
      ]
    },
    {
      key: 'neelie', index: '02', initials: 'NS', name: 'Neelie Shore', role: 'Travel Advisor', image: 'assets/images/team/neelie.webp', position: '43% 47%',
      paragraphs: [
        'Neelie came to travel advising through more than a decade in hospitality. Her career has included guest-facing work at The Peninsula Beverly Hills, regional sales representing Mandarin Oriental’s global portfolio, and international hotel operations and logistics.',
        'That background gave her an unusually complete view of what exceptional service requires behind the scenes — from anticipating a guest’s needs to making sure the operational details hold together when travel becomes complicated.',
        'As a mother of young children, Neelie found travel advising to be a natural way to stay close to hospitality while creating more room for family life. She now channels that hotelier’s instinct into trips designed to become lasting memories for her clients.'
      ]
    },
    {
      key: 'amy', index: '03', initials: 'AG', name: 'Amy Gennaro', role: 'Travel Advisor', image: 'assets/images/team/amy.webp', position: 'center 33%',
      paragraphs: [
        'Amy began her career with leading European luxury fashion houses, where detail, taste and thoughtful curation were part of the everyday work. Travel entered naturally: she began planning trips for friends and family with the same eye she had developed in fashion.',
        'Her perspective is grounded in lived experience — living in New York, working in Switzerland, studying in Austria, spending time in Italy and traveling more adventurously through Southeast Asia. Those different rhythms help her match a destination and style of trip to the person taking it.',
        'Today she brings the sensibility of luxury fashion into travel planning: edited choices, an instinct for what feels special, and an emphasis on creating experiences that remain memorable long after the suitcase is unpacked.'
      ]
    },
    {
      key: 'lisi', index: '04', initials: 'LG', name: 'Lisi Garcia', role: 'Travel Advisor', image: 'assets/images/team/lisi.webp', position: '52% 46%',
      paragraphs: [
        'Lisi grew up in a family that treated travel as a way to understand people and place. Her parents encouraged attention to local food, traditions and everyday culture on trips across Europe, Africa and beyond, while summers in Greece and family ties to the Bahamas gave travel an especially personal meaning.',
        'Now a mother herself, she is drawn to journeys that strengthen relationships between families and friends. Her approach goes beyond a checklist of sights; she looks for the cultural details that make a destination feel real and memorable for the people experiencing it together.',
        'A decade as a fitness instructor and Director of Operations at Houston boutique cycling studio RYDE also shaped her client-service style: energetic, organized and relationship-driven, with a strong understanding of how many small details contribute to an effortless experience.'
      ]
    },
    {
      key: 'morgan', index: '05', initials: 'MH', name: 'Morgan Hanley', role: 'Travel Advisor', image: 'assets/images/team/morgan.webp', position: '50% 51%',
      paragraphs: [
        'Morgan’s love of travel began with her parents, who taught her that seeing the world can deepen an understanding of different cultures and ways of life. She has always been captivated by the feeling of arriving somewhere new and imagining what everyday life there might be like.',
        'For years, planning trips was the part of life she returned to most enthusiastically — researching hotels, reading travel stories, tracking down distinctive restaurants and building five-star getaways for family and friends. Eventually, that fascination became her profession.',
        'Her planning style is highly detailed without losing sight of the experience itself. Whether the trip is a short retreat or a major once-in-a-lifetime journey, Morgan approaches it with the same commitment to getting every moving part right.'
      ]
    },
    {
      key: 'ellen', index: '06', initials: 'EG', name: 'Ellen Gurley', role: 'Travel Coordinator', image: 'assets/images/team/ellen.webp', position: 'center 48%',
      paragraphs: [
        'Travel has been part of Ellen’s life since childhood. Growing up in Indonesia exposed her to the country’s many islands, cuisines and cultures, giving her an early appreciation for how much variety can exist within a single destination.',
        'She began her career in the hotel industry, working with both corporate and leisure guests before moving into luxury travel. That experience shaped her belief that hospitality and travel share the same essential promise: exceptional service built from careful attention to the small things.',
        'As MFM’s Travel Coordinator, Ellen brings that precision to the details that support each journey. Outside the logistics, she is especially drawn to history, art, culture, nature and the simple pleasure of a beautiful view — reminders that travel creates space to be fully present beyond everyday routines.'
      ]
    },
    {
      key: 'rachael', index: '07', initials: 'RL', name: 'Rachael Levy', role: 'Travel Advisor', image: 'assets/images/team/rachael.webp', position: '50% 29%',
      paragraphs: [
        'For Rachael, travel has always been tied to the moments that reset perspective: cycling through London streets, long summer days in the Bahamas, or tapas-filled evenings in Barcelona. Those experiences became the memories she returned to for energy, joy and connection.',
        'Her professional background in real-estate finance adds a different kind of strength to that passion. Precision, organization and disciplined planning sit alongside an exploratory spirit, allowing her to build itineraries that feel both seamless and alive.',
        'Rachael’s goal is to understand what matters to each traveler and translate that into a journey with lasting resonance — not simply a getaway, but an experience that continues to feel meaningful after coming home.'
      ]
    }
  ];

  const teamStoryModal = document.querySelector('[data-team-story-modal]');
  if (teamStoryModal) {
    const storyImage = teamStoryModal.querySelector('[data-team-story-image]');
    const storyInitials = teamStoryModal.querySelector('[data-team-story-initials]');
    const storyIndex = teamStoryModal.querySelector('[data-team-story-index]');
    const storyRole = teamStoryModal.querySelector('[data-team-story-role]');
    const storyName = teamStoryModal.querySelector('[data-team-story-name]');
    const storyBody = teamStoryModal.querySelector('[data-team-story-body]');
    const storyCount = teamStoryModal.querySelector('[data-team-story-count]');
    const storyPrev = teamStoryModal.querySelector('[data-team-story-prev]');
    const storyNext = teamStoryModal.querySelector('[data-team-story-next]');
    const storyCloseButtons = teamStoryModal.querySelectorAll('[data-team-story-close]');
    const storyInquiry = teamStoryModal.querySelector('[data-team-story-inquire]');
    let storyCursor = 0;
    let lastStoryTrigger = null;

    const renderTeamStory = (cursor) => {
      storyCursor = (cursor + teamStories.length) % teamStories.length;
      const story = teamStories[storyCursor];
      if (storyImage) {
        storyImage.src = story.image;
        storyImage.alt = `${story.name}, ${story.role}`;
        storyImage.style.objectPosition = story.position;
      }
      if (storyInitials) storyInitials.textContent = story.initials;
      if (storyIndex) storyIndex.textContent = `${story.index} / 07`;
      if (storyCount) storyCount.textContent = `${story.index} / 07`;
      if (storyRole) storyRole.textContent = story.role;
      if (storyName) storyName.textContent = story.name;
      if (storyBody) {
        storyBody.replaceChildren(...story.paragraphs.map((text) => {
          const p = document.createElement('p');
          p.textContent = text;
          return p;
        }));
      }
      teamStoryModal.querySelector('.team-story-copy')?.scrollTo({ top: 0, behavior: 'instant' });
    };

    const openTeamStory = (key, trigger = null) => {
      const nextIndex = teamStories.findIndex((story) => story.key === key);
      if (nextIndex < 0) return;
      lastStoryTrigger = trigger;
      renderTeamStory(nextIndex);
      teamStoryModal.classList.add('is-open');
      teamStoryModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      window.setTimeout(() => teamStoryModal.querySelector('[data-team-story-close]')?.focus(), 80);
    };

    const closeTeamStory = () => {
      teamStoryModal.classList.remove('is-open');
      teamStoryModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      lastStoryTrigger?.focus?.();
    };

    document.querySelectorAll('[data-team-story-open]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        openTeamStory(button.dataset.teamStoryOpen, button);
      });
    });
    document.querySelectorAll('[data-team-card]').forEach((card) => {
      const toggle = card.querySelector('.team-card-toggle');
      const storyButton = card.querySelector('[data-team-story-open]');
      if (!toggle || !storyButton) return;
      toggle.addEventListener('click', () => {
        if (window.innerWidth > 900) openTeamStory(storyButton.dataset.teamStoryOpen, toggle);
      });
    });
    storyCloseButtons.forEach((button) => button.addEventListener('click', closeTeamStory));
    storyPrev?.addEventListener('click', () => renderTeamStory(storyCursor - 1));
    storyNext?.addEventListener('click', () => renderTeamStory(storyCursor + 1));
    storyInquiry?.addEventListener('click', closeTeamStory);

    document.addEventListener('keydown', (event) => {
      if (!teamStoryModal.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeTeamStory();
      if (event.key === 'ArrowRight') renderTeamStory(storyCursor + 1);
      if (event.key === 'ArrowLeft') renderTeamStory(storyCursor - 1);
    });
  }

  /* Inquiry */
  const form = document.querySelector('[data-inquiry-form]');
  const formNote = document.querySelector('[data-form-note]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const destination = data.get('destination') || '';
    const message = data.get('message') || '';
    const subject = encodeURIComponent(`Travel inquiry from ${name}${destination ? ` — ${destination}` : ''}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nDestination / idea: ${destination}\n\n${message}`);
    if (formNote) formNote.textContent = 'Opening your email app…';
    window.location.href = `mailto:maddy@MFMLuxuryTravel.com?subject=${subject}&body=${body}`;
  });
})();
