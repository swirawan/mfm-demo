(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



  /* Private access gate for the static portfolio demo.
     The key itself is not stored in plaintext; only its SHA-256 digest is compared.
     This is a client-side gate suitable for discouraging casual access on static hosting. */
  const accessGate = document.querySelector('[data-access-gate]');
  const accessForm = document.querySelector('[data-access-gate-form]');
  const accessInput = document.querySelector('[data-access-key-input]');
  const accessError = document.querySelector('[data-access-gate-error]');
  const ACCESS_GRANTED_KEY = 'mfm-private-demo-access-v1';
  const ACCESS_KEY_SHA256 = 'e6303531f6b77fa270b6bfacf0c8730ec8fcf18b5fdcb577d07841b67350e2b5';

  const hasPrivateAccess = () => {
    try { return window.localStorage.getItem(ACCESS_GRANTED_KEY) === 'true'; }
    catch (_) { return false; }
  };

  const sha256Hex = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const unlockPrivateDemo = () => {
    try { window.localStorage.setItem(ACCESS_GRANTED_KEY, 'true'); } catch (_) {}
    accessGate?.classList.add('is-unlocked');
    accessGate?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('access-gate-open');
    window.setTimeout(() => accessGate?.remove(), reduceMotion ? 0 : 420);
    window.setTimeout(() => openDemoNotice(), reduceMotion ? 0 : 180);
  };

  const showPrivateGate = () => {
    if (!accessGate) return;
    accessGate.classList.add('is-open');
    accessGate.setAttribute('aria-hidden', 'false');
    document.body.classList.add('access-gate-open');
    window.setTimeout(() => accessInput?.focus(), reduceMotion ? 0 : 160);
  };

  accessForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const value = accessInput?.value || '';
    if (!value) {
      if (accessError) accessError.textContent = 'Please enter the access key.';
      accessInput?.focus();
      return;
    }
    const button = accessForm.querySelector('button[type="submit"]');
    button?.setAttribute('disabled', '');
    if (accessError) accessError.textContent = 'Checking access…';
    try {
      const digest = await sha256Hex(value);
      if (digest === ACCESS_KEY_SHA256) {
        if (accessError) accessError.textContent = '';
        unlockPrivateDemo();
      } else {
        if (accessError) accessError.textContent = 'That access key is not correct.';
        if (accessInput) { accessInput.value = ''; accessInput.focus(); }
      }
    } catch (_) {
      if (accessError) accessError.textContent = 'Unable to verify the key in this browser.';
    } finally {
      button?.removeAttribute('disabled');
    }
  });

  /* Portfolio demonstration notice. Shows on first visit unless the visitor
     explicitly chooses not to see it again. The footer can always reopen it. */
  const demoNotice = document.querySelector('[data-demo-notice]');
  const demoNoticeClose = document.querySelector('[data-close-demo-notice]');
  const demoNoticeRemember = document.querySelector('[data-demo-notice-remember]');
  const demoNoticeOpenButtons = document.querySelectorAll('[data-open-demo-notice]');
  const demoNoticePanel = demoNotice?.querySelector('.demo-notice-panel');
  const demoNoticeTitle = document.getElementById('demo-notice-title');
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

    // Always present the notice from its beginning. Focusing the bottom "View demo"
    // button previously made some browsers restore/scroll the panel to the middle.
    if (demoNoticePanel) demoNoticePanel.scrollTop = 0;
    window.setTimeout(() => {
      if (demoNoticePanel) demoNoticePanel.scrollTop = 0;
      demoNoticeTitle?.focus?.({ preventScroll: true });
    }, reduceMotion ? 0 : 180);
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
  if (hasPrivateAccess()) {
    accessGate?.remove();
    window.setTimeout(() => openDemoNotice(), 120);
  } else {
    showPrivateGate();
  }

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
      }, 700);
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
    {
      key: 'lake-como',
      title: 'Lake Como',
      destination: 'LAKE COMO',
      mood: 'LAKESIDE / SLOW',
      stay: '3–5 NIGHTS',
      note: 'PRIVATE BOAT · LONG LUNCH · ONE PERFECT HOTEL',
      season: 'May · June · September',
      bestFor: 'Couples · milestone trips',
      subtitle: 'For travelers who want classic beauty, one perfect hotel, and days with room to breathe.',
      image: 'assets/images/hero-lake.webp',
      imageAlt: 'Lake Como view',
      highlights: ['Private boat afternoons', 'Long lakeside lunches', 'One exceptional hotel base'],
      template: `Hello MFM team,

I would love to learn more about the Lake Como departure edit.

Destination: Lake Como
Mood: Lakeside / Slow
Ideal stay: 3–5 nights
Best season: May · June · September

Travelers:
Hotel style preferences:
Flexibility around dates:
What matters most on this trip:
`
    },
    {
      key: 'kyoto',
      title: 'Kyoto',
      destination: 'KYOTO',
      mood: 'CULTURE / DESIGN',
      stay: '4–6 NIGHTS',
      note: 'EARLY TEMPLES · SMALL STREETS · QUIET RYOKAN',
      season: 'March · April · October',
      bestFor: 'Culture lovers · design-minded travelers',
      subtitle: 'A beautifully paced city break with early temple mornings, thoughtful meals, and a serene ryokan base.',
      image: 'assets/images/kyoto-evening.webp',
      imageAlt: 'Kyoto evening street',
      highlights: ['Temple visits before the crowds', 'Small streets and neighborhood shops', 'Quiet ryokan evenings'],
      template: `Hello MFM team,

I would love to learn more about the Kyoto departure edit.

Destination: Kyoto
Mood: Culture / Design
Ideal stay: 4–6 nights
Best season: March · April · October

Travelers:
Hotel style preferences:
Flexibility around dates:
What matters most on this trip:
`
    },
    {
      key: 'southern-africa',
      title: 'Southern Africa',
      destination: 'SOUTHERN AFRICA',
      mood: 'SAFARI / WILD',
      stay: '8–12 NIGHTS',
      note: 'CAPE TOWN · WINELANDS · SAFARI AT DUSK',
      season: 'May · June · July',
      bestFor: 'Big experiences · celebratory journeys',
      subtitle: 'An edited multi-stop journey pairing Cape Town polish, the Winelands, and unforgettable safari days.',
      image: 'assets/images/safari-sunset.webp',
      imageAlt: 'Safari sunset scene',
      highlights: ['Cape Town city stay', 'Winelands interlude', 'Twice-daily game drives'],
      template: `Hello MFM team,

I would love to learn more about the Southern Africa departure edit.

Destination: Southern Africa
Mood: Safari / Wild
Ideal stay: 8–12 nights
Best season: May · June · July

Travelers:
Lodge style preferences:
Flexibility around dates:
What matters most on this trip:
`
    },
    {
      key: 'french-polynesia',
      title: 'French Polynesia',
      destination: 'FRENCH POLYNESIA',
      mood: 'ISLAND / EXHALE',
      stay: '5–8 NIGHTS',
      note: 'OVERWATER MORNING · LAGOON AFTERNOON · NOTHING RUSHED',
      season: 'April · May · September',
      bestFor: 'Honeymoons · total unwind',
      subtitle: 'The kind of trip where the days feel long, the water does the talking, and every detail is softened.',
      image: 'assets/images/bora-bora.webp',
      imageAlt: 'French Polynesia overwater villas',
      highlights: ['Overwater villa stays', 'Lagoon time built in', 'A pace designed for exhale'],
      template: `Hello MFM team,

I would love to learn more about the French Polynesia departure edit.

Destination: French Polynesia
Mood: Island / Exhale
Ideal stay: 5–8 nights
Best season: April · May · September

Travelers:
Villa style preferences:
Flexibility around dates:
What matters most on this trip:
`
    },
    {
      key: 'whistler',
      title: 'Whistler',
      destination: 'WHISTLER',
      mood: 'ALPINE / FAMILY',
      stay: '4–7 NIGHTS',
      note: 'MOUNTAIN AIR · FIRESIDE DINNER · FAMILY TIME',
      season: 'December · January · February',
      bestFor: 'Families · winter reset',
      subtitle: 'A polished mountain escape with fresh air, easy logistics, and room for everyone to truly settle in.',
      image: 'assets/images/whistler.webp',
      imageAlt: 'Whistler mountain village',
      highlights: ['Easy family-friendly logistics', 'Mountain views from start to finish', 'Warm fireside evenings'],
      template: `Hello MFM team,

I would love to learn more about the Whistler departure edit.

Destination: Whistler
Mood: Alpine / Family
Ideal stay: 4–7 nights
Best season: December · January · February

Travelers:
Hotel style preferences:
Flexibility around dates:
What matters most on this trip:
`
    }
  ];

  const flapDestination = document.querySelector('[data-flap-destination]');
  const flapMood = document.querySelector('[data-flap-mood]');
  const flapStay = document.querySelector('[data-flap-stay]');
  const boardNumber = document.querySelector('[data-board-number]');
  const boardNote = document.querySelector('[data-board-note]');
  const boardCountdown = document.querySelector('[data-board-countdown]');
  const destinationCardTitle = document.querySelector('[data-destination-title]');
  const destinationCardKicker = document.querySelector('[data-destination-kicker]');
  const destinationCardSubtitle = document.querySelector('[data-destination-subtitle]');
  const destinationCardStay = document.querySelector('[data-destination-stay]');
  const destinationCardSeason = document.querySelector('[data-destination-season]');
  const destinationCardBestFor = document.querySelector('[data-destination-bestfor]');
  const destinationCardNote = document.querySelector('[data-destination-note-list]');
  const destinationCardImage = document.querySelector('[data-destination-image]');
  const destinationCardHighlights = document.querySelector('[data-destination-highlights]');
  const destinationCard = document.querySelector('[data-destination-card]');
  const destinationCardCopy = destinationCard?.querySelector('.destination-card-copy');
  setupFlap(flapDestination, 16);
  setupFlap(flapMood, 16);
  setupFlap(flapStay, 11);

  let boardIndex = 0;
  let secondsToBoardTurn = 6;
  let boardAutoplay = !reduceMotion;
  const boardPrevTrigger = document.querySelector('[data-departure-prev]');
  const boardNextTrigger = document.querySelector('[data-departure-next]');
  const boardPlayTrigger = document.querySelector('[data-departure-play]');
  const updateBoardAutoplayUi = () => {
    if (!boardPlayTrigger) return;
    boardPlayTrigger.setAttribute('aria-pressed', boardAutoplay ? 'true' : 'false');
    boardPlayTrigger.textContent = boardAutoplay ? 'Pause autoplay' : 'Resume autoplay';
    boardPlayTrigger.classList.toggle('is-paused', !boardAutoplay);
  };
  const animateDestinationRefresh = () => {
    if (reduceMotion || !destinationCard) return;
    destinationCard.classList.remove('is-refreshing');
    window.clearTimeout(window.__mfmDepartureRefreshTimer);
    window.cancelAnimationFrame(window.__mfmDepartureRefreshRafA || 0);
    window.cancelAnimationFrame(window.__mfmDepartureRefreshRafB || 0);
    window.__mfmDepartureRefreshRafA = window.requestAnimationFrame(() => {
      window.__mfmDepartureRefreshRafB = window.requestAnimationFrame(() => {
        destinationCard.classList.add('is-refreshing');
      });
    });
    window.__mfmDepartureRefreshTimer = window.setTimeout(() => {
      destinationCard.classList.remove('is-refreshing');
    }, 1260);
  };

  let destinationHasPainted = false;
  const transitionDestinationCard = (edit) => {
    if (!destinationCard || reduceMotion || !destinationHasPainted) {
      applyDestinationCard(edit);
      destinationHasPainted = true;
      animateDestinationRefresh();
      return;
    }
    window.clearTimeout(window.__mfmDepartureSwapTimer);
    window.clearTimeout(window.__mfmDepartureRefreshTimer);
    destinationCard.classList.remove('is-refreshing');
    destinationCard.classList.add('is-switching-out');
    window.__mfmDepartureSwapTimer = window.setTimeout(() => {
      applyDestinationCard(edit);
      destinationCard.classList.remove('is-switching-out');
      void destinationCard.offsetWidth;
      animateDestinationRefresh();
    }, 210);
  };

  const toJourneyTag = (value = '') => value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|[\s/])([a-z])/g, (match, prefix, char) => `${prefix}${char.toUpperCase()}`);

  const renderDestinationNoteTags = (note = '') => {
    if (!destinationCardNote) return;
    const parts = String(note).split('·').map(part => part.trim()).filter(Boolean);
    const items = (parts.length ? parts : [String(note).trim()]).filter(Boolean);
    destinationCardNote.setAttribute('aria-label', note);
    destinationCardNote.innerHTML = items.map(item => `<li>${toJourneyTag(item)}</li>`).join('');
  };

  const applyDestinationCard = (edit) => {
    if (destinationCardTitle) destinationCardTitle.textContent = edit.title;
    if (destinationCardKicker) destinationCardKicker.textContent = edit.mood;
    if (destinationCardSubtitle) destinationCardSubtitle.textContent = edit.subtitle;
    if (destinationCardStay) destinationCardStay.textContent = edit.stay.toLowerCase();
    if (destinationCardSeason) destinationCardSeason.textContent = edit.season;
    if (destinationCardBestFor) destinationCardBestFor.textContent = edit.bestFor;
    renderDestinationNoteTags(edit.note);
    if (destinationCardImage) {
      destinationCardImage.src = edit.image;
      destinationCardImage.alt = edit.imageAlt;
    }
    if (destinationCardHighlights) {
      destinationCardHighlights.innerHTML = edit.highlights.map(item => `<li>${item}</li>`).join('');
    }
    const departureCta = document.querySelector('[data-plan-destination]');
    if (departureCta) departureCta.dataset.planDestination = edit.key;
  };

  const paintBoard = (index) => {
    const edit = boardEdits[index];
    setFlapText(flapDestination, edit.destination, 0);
    setFlapText(flapMood, edit.mood, 120);
    setFlapText(flapStay, edit.stay, 240);
    if (boardNumber) boardNumber.textContent = `EDIT ${String(index + 1).padStart(2, '0')} / ${String(boardEdits.length).padStart(2, '0')}`;
    if (boardNote) boardNote.textContent = edit.note;
    transitionDestinationCard(edit);
    secondsToBoardTurn = 6;
    if (boardCountdown) boardCountdown.textContent = boardAutoplay ? '06' : 'PA';
  };
  const goToBoard = (index, manual = false) => {
    boardIndex = (index + boardEdits.length) % boardEdits.length;
    if (manual) boardAutoplay = false;
    updateBoardAutoplayUi();
    paintBoard(boardIndex);
  };
  window.setTimeout(() => paintBoard(0), reduceMotion ? 0 : 350);
  updateBoardAutoplayUi();
  if (!reduceMotion) {
    setInterval(() => {
      if (!boardAutoplay) return;
      secondsToBoardTurn -= 1;
      if (secondsToBoardTurn <= 0) {
        boardIndex = (boardIndex + 1) % boardEdits.length;
        paintBoard(boardIndex);
      } else if (boardCountdown) {
        boardCountdown.textContent = String(secondsToBoardTurn).padStart(2, '0');
      }
    }, 1000);
  }
  boardPrevTrigger?.addEventListener('click', () => goToBoard(boardIndex - 1, true));
  boardNextTrigger?.addEventListener('click', () => goToBoard(boardIndex + 1, true));
  boardPlayTrigger?.addEventListener('click', () => {
    boardAutoplay = !boardAutoplay;
    if (boardAutoplay) secondsToBoardTurn = 6;
    updateBoardAutoplayUi();
    if (boardCountdown) boardCountdown.textContent = boardAutoplay ? '06' : 'PA';
  });

  /* V89 voyage selector — Departure board visual system, list interaction preserved. */
  const voyageCards=[...document.querySelectorAll('[data-voyage-card]')];
  const voyageSound=document.querySelector('[data-voyage-sound]');
  const voyageRows=[...document.querySelectorAll('[data-voyage-select]')];

  const voyageEdits=[
    {key:'mediterranean',title:'MEDITERRANEAN VOYAGE',ship:'SEABOURN OVATION',date:'JUN 14'},
    {key:'alaska',title:'ALASKAN PASSAGE',ship:'SILVER NOVA',date:'AUG 02'},
    {key:'fjords',title:'NORWEGIAN FJORDS',ship:'VIKING SKY',date:'SEP 12'},
    {key:'caribbean',title:'CARIBBEAN ESCAPE',ship:'REGENT SEVEN SEAS',date:'DEC 06'}
  ];

  /* Each list row uses the exact same flap renderer as the Departure board. */
  voyageRows.forEach((row,index)=>{
    const edit=voyageEdits[index];
    const title=row.querySelector('[data-voyage-row-title]');
    const ship=row.querySelector('[data-voyage-row-ship]');
    const date=row.querySelector('[data-voyage-row-date]');
    setupFlap(title,21);
    setupFlap(ship,18);
    setupFlap(date,6);
    setFlapText(title,edit.title,0);
    setFlapText(ship,edit.ship,70);
    setFlapText(date,edit.date,140);

    /* Dedicated overflow tracks for voyage + ship. Both use the same flap
       renderer, but only fields that genuinely overflow are allowed to glide. */
    [title,ship].forEach(viewport=>{
      if (viewport && !viewport.querySelector('.voyage-flap-track')) {
        const track=document.createElement('span');
        track.className='voyage-flap-track';
        [...viewport.children].forEach(tile=>track.appendChild(tile));
        viewport.appendChild(track);
      }
    });
  });

  const sizeVoyageMarquees=()=>{
    voyageRows.forEach(row=>{
      row.querySelectorAll('[data-voyage-row-title],[data-voyage-row-ship]').forEach(viewport=>{
        const track=viewport.querySelector('.voyage-flap-track');
        if(!track)return;
        track.classList.remove('is-marquee');
        track.style.removeProperty('--marquee-distance');
        track.style.removeProperty('--marquee-duration');
        requestAnimationFrame(()=>{
          const distance=Math.max(0,Math.ceil(track.scrollWidth-viewport.clientWidth));
          if(distance>5){
            track.style.setProperty('--marquee-distance',`${distance}px`);
            track.style.setProperty('--marquee-duration',`${Math.max(8.2,7.2+distance/28).toFixed(1)}s`);
            track.classList.add('is-marquee');
          }
        });
      });
    });
  };
  sizeVoyageMarquees();
  window.addEventListener('resize',()=>window.requestAnimationFrame(sizeVoyageMarquees),{passive:true});

  let voyageSoundOn=false, voyageCtx=null;
  const voyageClick=()=>{
    if(!voyageSoundOn)return;
    const A=window.AudioContext||window.webkitAudioContext;
    if(!A)return;
    voyageCtx ||= new A();
    if(voyageCtx.state==='suspended') voyageCtx.resume();
    const c=voyageCtx, n=c.currentTime;
    const strike=(when,freq,gainValue)=>{
      const o=c.createOscillator(),g=c.createGain();
      o.type='square';
      o.frequency.setValueAtTime(freq,when);
      o.frequency.exponentialRampToValueAtTime(Math.max(52,freq*.58),when+.045);
      g.gain.setValueAtTime(gainValue,when);
      g.gain.exponentialRampToValueAtTime(.0001,when+.05);
      o.connect(g).connect(c.destination);o.start(when);o.stop(when+.055);
    };
    strike(n,150,.02); strike(n+.035,104,.015);
  };

  const selectVoyage=(key,playSound=true)=>{
    voyageRows.forEach(row=>{
      const active=row.dataset.voyageSelect===key;
      row.classList.toggle('is-active',active);
      row.setAttribute('aria-selected',active?'true':'false');
    });
    voyageCards.forEach(card=>card.classList.toggle('is-active',card.dataset.voyageCard===key));
    if(playSound)voyageClick();
  };

  voyageRows.forEach(row=>row.addEventListener('click',()=>selectVoyage(row.dataset.voyageSelect,true)));
  voyageSound?.addEventListener('click',()=>{
    voyageSoundOn=!voyageSoundOn;
    voyageSound.setAttribute('aria-pressed',voyageSoundOn?'true':'false');
    voyageSound.textContent=voyageSoundOn?'SOUND ON':'SOUND OFF';
    voyageClick();
  });
  selectVoyage('mediterranean',false);

  /* Curated Edit toggle */
  const editTabs = [...document.querySelectorAll('[data-edit-trigger]')];
  const editViews = [...document.querySelectorAll('[data-edit-view]')];
  const travelEditSection = document.querySelector('.travel-edit');
  const travelEditTitle = document.getElementById('travel-edit-title');
  const travelEditLead = document.querySelector('.travel-edit-lead');
  const editHeadingCopy = {
    departures: {
      title: 'The Departure <em>Edit</em>',
      lead: 'Thoughtfully paced destinations, simplified beautifully. Browse the departure board, pause when something catches your eye, and let MFM handle the details.'
    },
    voyages: {
      title: 'Voyages worth <em>remembering.</em>',
      lead: 'Hand-selected sailings for travelers who value ease, clarity, and beautifully handled details. Choose a sailing and open its private voyage brief below.'
    }
  };
  const setEditView = (viewKey) => {
    editTabs.forEach(tab => {
      const active = tab.dataset.editTrigger === viewKey;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    editViews.forEach(view => {
      const active = view.dataset.editView === viewKey;
      view.classList.toggle('is-active', active);
      view.hidden = !active;
      view.classList.remove('is-panel-entering');
    });
    travelEditSection?.classList.toggle('is-voyages-view', viewKey === 'voyages');
    travelEditSection?.classList.toggle('is-departures-view', viewKey === 'departures');
    if (travelEditTitle && editHeadingCopy[viewKey]) travelEditTitle.innerHTML = editHeadingCopy[viewKey].title;
    if (travelEditLead && editHeadingCopy[viewKey]) travelEditLead.textContent = editHeadingCopy[viewKey].lead;
  };
  editTabs.forEach(tab => tab.addEventListener('click', () => setEditView(tab.dataset.editTrigger || 'departures')));
  setEditView(document.querySelector('[data-edit-trigger].is-active')?.dataset.editTrigger || 'departures');

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

    const closeTeamStory = (restoreFocus = true) => {
      teamStoryModal.classList.remove('is-open');
      teamStoryModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (restoreFocus) lastStoryTrigger?.focus?.();
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
    storyCloseButtons.forEach((button) => button.addEventListener('click', () => closeTeamStory(true)));
    storyPrev?.addEventListener('click', () => renderTeamStory(storyCursor - 1));
    storyNext?.addEventListener('click', () => renderTeamStory(storyCursor + 1));
    storyInquiry?.addEventListener('click', (event) => {
      event.preventDefault();
      const selectedStory = teamStories[storyCursor];
      closeTeamStory(false);
      if (selectedStory?.key) chooseAdvisor(selectedStory.key, false);
      const inquirySection = document.querySelector('#inquire');
      window.requestAnimationFrame(() => {
        inquirySection?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });

    document.addEventListener('keydown', (event) => {
      if (!teamStoryModal.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeTeamStory();
      if (event.key === 'ArrowRight') renderTeamStory(storyCursor + 1);
      if (event.key === 'ArrowLeft') renderTeamStory(storyCursor - 1);
    });
  }

  /* V35 inquiry advisor selector — reuses the same seven team portraits and editorial voice. */
  const advisorProfiles = {
    'no-preference': {
      index: 'MFM / 01', eyebrow: 'Your starting point', name: 'Maddy Moffitt',
      role: 'Owner & Travel Advisor · MFM team lead', image: 'assets/images/team/maddy.webp', position: 'center 27%',
      bio: 'Not sure who to choose? Start with Maddy. Share the trip you have in mind and MFM will connect you with the team member whose experience and planning style best fit it.',
      tags: ['PERSONAL MATCH','MFM TEAM','WORLDWIDE']
    },
    maddy: {
      index: '01 / 07', eyebrow: 'Selected advisor', name: 'Maddy Moffitt', role: 'Owner & Travel Advisor', image: 'assets/images/team/maddy.webp', position: 'center 27%',
      bio: 'Founder and the thread running through the MFM point of view: thoughtful structure, room for spontaneity, and journeys that feel personal rather than programmed.',
      tags: ['FOUNDER','CURATION','WORLDWIDE']
    },
    neelie: {
      index: '02 / 07', eyebrow: 'Selected advisor', name: 'Neelie Shore', role: 'Travel Advisor', image: 'assets/images/team/neelie.webp', position: '43% 47%',
      bio: 'A hospitality insider whose experience spans The Peninsula Beverly Hills, Mandarin Oriental and international hotel operations, with an instinct for service that feels natural.',
      tags: ['HOSPITALITY','SERVICE','FAMILY']
    },
    amy: {
      index: '03 / 07', eyebrow: 'Selected advisor', name: 'Amy Gennaro', role: 'Travel Advisor', image: 'assets/images/team/amy.webp', position: 'center 33%',
      bio: 'Luxury-fashion instincts translated into travel: considered curation, a strong eye for detail, and lived experience across Europe and Southeast Asia.',
      tags: ['FASHION','CURATION','EUROPE']
    },
    lisi: {
      index: '04 / 07', eyebrow: 'Selected advisor', name: 'Lisi Garcia', role: 'Travel Advisor', image: 'assets/images/team/lisi.webp', position: '52% 46%',
      bio: 'Family travel, local culture and lasting connections — backed by a decade of operations and client-service leadership and a love of trips that bring people together.',
      tags: ['FAMILY','CULTURE','CONNECTION']
    },
    morgan: {
      index: '05 / 07', eyebrow: 'Selected advisor', name: 'Morgan Hanley', role: 'Travel Advisor', image: 'assets/images/team/morgan.webp', position: '50% 51%',
      bio: 'A devoted researcher and planner with a soft spot for exceptional hotels, memorable restaurants and the small details that make a trip feel effortless.',
      tags: ['RESEARCH','HOTELS','DETAIL']
    },
    ellen: {
      index: '06 / 07', eyebrow: 'Selected team member', name: 'Ellen Gurley', role: 'Travel Coordinator', image: 'assets/images/team/ellen.webp', position: 'center 48%',
      bio: 'Raised with travel in Indonesia and shaped by the hotel industry, Ellen brings exacting coordination together with a love of history, art, culture and nature.',
      tags: ['COORDINATION','CULTURE','HOSPITALITY']
    },
    rachael: {
      index: '07 / 07', eyebrow: 'Selected advisor', name: 'Rachael Levy', role: 'Travel Advisor', image: 'assets/images/team/rachael.webp', position: '50% 29%',
      bio: 'Precision from a real-estate-finance background, balanced with an exploratory spirit and a belief that travel should create lasting perspective.',
      tags: ['PRECISION','DISCOVERY','PLANNING']
    }
  };
  const advisorSelect = document.querySelector('[data-advisor-select]');
  const advisorCard = document.querySelector('[data-advisor-card]');
  const advisorPhoto = document.querySelector('[data-advisor-photo]');
  const advisorCollage = document.querySelector('[data-advisor-collage]');
  const advisorIndex = document.querySelector('[data-advisor-index]');
  const advisorEyebrow = document.querySelector('[data-advisor-eyebrow]');
  const advisorName = document.querySelector('[data-advisor-name]');
  const advisorRole = document.querySelector('[data-advisor-role]');
  const advisorBio = document.querySelector('[data-advisor-bio]');
  const advisorTags = document.querySelector('[data-advisor-tags]');

  let advisorRenderTimer = null;
  let advisorCelebrateTimer = null;
  const renderAdvisorSelection = (key = 'no-preference', { celebrate = false, preview = false } = {}) => {
    const profile = advisorProfiles[key] || advisorProfiles['no-preference'];
    window.clearTimeout(advisorRenderTimer);
    advisorCard?.classList.add('is-changing');
    advisorCard?.classList.toggle('is-previewing', preview);
    advisorRenderTimer = window.setTimeout(() => {
      if (advisorIndex) advisorIndex.textContent = profile.index;
      if (advisorEyebrow) advisorEyebrow.textContent = preview ? 'Preview advisor' : profile.eyebrow;
      if (advisorName) advisorName.textContent = profile.name;
      if (advisorRole) advisorRole.textContent = profile.role;
      if (advisorBio) advisorBio.textContent = profile.bio;
      if (advisorTags) {
        advisorTags.replaceChildren(...profile.tags.map((tag) => {
          const span = document.createElement('span'); span.textContent = tag; return span;
        }));
      }
      if (profile.image && advisorPhoto) {
        advisorPhoto.src = profile.image;
        advisorPhoto.alt = `${profile.name}, ${profile.role}`;
        advisorPhoto.style.objectPosition = profile.position;
        advisorPhoto.hidden = false;
        if (advisorCollage) advisorCollage.hidden = true;
      } else {
        if (advisorPhoto) { advisorPhoto.hidden = true; advisorPhoto.alt = ''; }
        if (advisorCollage) advisorCollage.hidden = false;
      }
      advisorCard?.classList.remove('is-changing');
      if (celebrate && advisorCard && !reduceMotion) {
        window.clearTimeout(advisorCelebrateTimer);
        advisorCard.classList.remove('is-selected-moment');
        void advisorCard.offsetWidth;
        advisorCard.classList.add('is-selected-moment');
        advisorCelebrateTimer = window.setTimeout(() => advisorCard.classList.remove('is-selected-moment'), 1250);
      }
    }, preview ? 80 : 145);
  };
  advisorSelect?.addEventListener('change', () => renderAdvisorSelection(advisorSelect.value));

  /* V36 bespoke advisor picker — keeps the real select for form submission,
     but presents a fully styled, keyboard-accessible editorial listbox. */
  const advisorPicker = document.querySelector('[data-advisor-picker]');
  const advisorTrigger = document.querySelector('[data-advisor-trigger]');
  const advisorMenu = document.querySelector('[data-advisor-menu]');
  const advisorTriggerName = document.querySelector('[data-advisor-trigger-name]');
  const advisorTriggerMeta = document.querySelector('[data-advisor-trigger-meta]');
  const advisorOptions = [...document.querySelectorAll('[data-advisor-option]')];
  let advisorFocusIndex = 0;

  const getAdvisorOptionIndex = (key) => Math.max(0, advisorOptions.findIndex((option) => option.dataset.advisorOption === key));
  const syncAdvisorPicker = (key = 'no-preference') => {
    const profile = advisorProfiles[key] || advisorProfiles['no-preference'];
    advisorFocusIndex = getAdvisorOptionIndex(key);
    advisorOptions.forEach((option, index) => {
      const selected = index === advisorFocusIndex;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-selected', String(selected));
    });
    if (advisorTriggerName) advisorTriggerName.textContent = key === 'no-preference' ? 'No preference — match me with the best fit' : profile.name;
    if (advisorTriggerMeta) advisorTriggerMeta.textContent = key === 'no-preference' ? 'PERSONAL MATCH · MFM TEAM' : `${profile.index} · ${profile.role.toUpperCase()}`;
  };

  const setAdvisorPickerOpen = (open, focusMenu = false) => {
    if (!advisorPicker || !advisorTrigger || !advisorMenu) return;
    advisorPicker.classList.toggle('is-open', open);
    advisorTrigger.setAttribute('aria-expanded', String(open));
    if (open) {
      advisorFocusIndex = getAdvisorOptionIndex(advisorSelect?.value || 'no-preference');
      advisorOptions[advisorFocusIndex]?.classList.add('is-keyboard-focus');
      if (focusMenu) advisorOptions[advisorFocusIndex]?.focus({ preventScroll: true });
    } else {
      advisorOptions.forEach((option) => option.classList.remove('is-keyboard-focus'));
    }
  };

  const chooseAdvisor = (key, returnFocus = true) => {
    if (!advisorSelect) return;
    advisorSelect.value = key;
    syncAdvisorPicker(key);
    renderAdvisorSelection(key, { celebrate: true });
    advisorPicker?.classList.remove('has-selection-pulse');
    if (!reduceMotion) {
      void advisorPicker?.offsetWidth;
      advisorPicker?.classList.add('has-selection-pulse');
      window.setTimeout(() => advisorPicker?.classList.remove('has-selection-pulse'), 900);
    }
    setAdvisorPickerOpen(false);
    if (returnFocus) advisorTrigger?.focus({ preventScroll: true });
  };

  advisorTrigger?.addEventListener('click', () => {
    const open = advisorPicker?.classList.contains('is-open');
    setAdvisorPickerOpen(!open, !open);
  });

  advisorOptions.forEach((option) => {
    option.addEventListener('click', () => chooseAdvisor(option.dataset.advisorOption));
    option.addEventListener('mouseenter', () => {
      advisorOptions.forEach((item) => item.classList.remove('is-keyboard-focus'));
      option.classList.add('is-keyboard-focus');
      advisorFocusIndex = advisorOptions.indexOf(option);
      renderAdvisorSelection(option.dataset.advisorOption, { preview: true });
    });
    option.addEventListener('focus', () => {
      advisorFocusIndex = advisorOptions.indexOf(option);
      renderAdvisorSelection(option.dataset.advisorOption, { preview: true });
    });
  });
  advisorMenu?.addEventListener('mouseleave', () => {
    if (advisorPicker?.classList.contains('is-open')) renderAdvisorSelection(advisorSelect?.value || 'no-preference');
  });

  const moveAdvisorFocus = (nextIndex) => {
    advisorFocusIndex = (nextIndex + advisorOptions.length) % advisorOptions.length;
    advisorOptions.forEach((option, index) => option.classList.toggle('is-keyboard-focus', index === advisorFocusIndex));
    advisorOptions[advisorFocusIndex]?.focus({ preventScroll: true });
    advisorOptions[advisorFocusIndex]?.scrollIntoView({ block: 'nearest' });
  };

  const handleAdvisorKeys = (event) => {
    const isOpen = advisorPicker?.classList.contains('is-open');
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) setAdvisorPickerOpen(true, true);
      else moveAdvisorFocus(advisorFocusIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home' && isOpen) {
      event.preventDefault(); moveAdvisorFocus(0);
    } else if (event.key === 'End' && isOpen) {
      event.preventDefault(); moveAdvisorFocus(advisorOptions.length - 1);
    } else if ((event.key === 'Enter' || event.key === ' ') && isOpen && document.activeElement?.matches('[data-advisor-option]')) {
      event.preventDefault(); chooseAdvisor(advisorOptions[advisorFocusIndex].dataset.advisorOption);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault(); setAdvisorPickerOpen(false); advisorTrigger?.focus({ preventScroll: true });
    }
  };
  advisorTrigger?.addEventListener('keydown', handleAdvisorKeys);
  advisorMenu?.addEventListener('keydown', handleAdvisorKeys);
  document.addEventListener('pointerdown', (event) => {
    if (advisorPicker?.classList.contains('is-open') && !advisorPicker.contains(event.target)) setAdvisorPickerOpen(false);
  });

  syncAdvisorPicker(advisorSelect?.value || 'no-preference');
  renderAdvisorSelection(advisorSelect?.value || 'no-preference');

  /* V39 premium contact + discovery-call controls. */
  const emailField = document.querySelector('[data-email-field]');
  const emailInput = emailField?.querySelector('input[name="email"]');
  const emailError = document.querySelector('[data-email-error]');
  const validateEmail = (show = true) => {
    if (!emailInput) return true;
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
    const state = !value ? false : valid;
    emailField?.classList.toggle('is-valid', state);
    emailField?.classList.toggle('is-invalid', Boolean(value) && !valid);
    if (emailError) emailError.textContent = show && value && !valid ? 'Please enter a valid email address.' : '';
    return valid;
  };
  emailInput?.addEventListener('blur', () => validateEmail(true));
  emailInput?.addEventListener('input', () => { if (emailField?.classList.contains('is-invalid')) validateEmail(true); });

  /* International phone composer. The dial code is separate visually but is
     included in the generated inquiry. North American numbers get familiar
     parentheses; other countries remain readable without forcing one mask. */
  const countryData = [
    ['US','United States','+1'],['CA','Canada','+1'],['GB','United Kingdom','+44'],['AU','Australia','+61'],['NZ','New Zealand','+64'],
    ['ID','Indonesia','+62'],['SG','Singapore','+65'],['MY','Malaysia','+60'],['TH','Thailand','+66'],['VN','Vietnam','+84'],['PH','Philippines','+63'],
    ['JP','Japan','+81'],['KR','South Korea','+82'],['CN','China','+86'],['HK','Hong Kong','+852'],['TW','Taiwan','+886'],['IN','India','+91'],
    ['AE','United Arab Emirates','+971'],['QA','Qatar','+974'],['SA','Saudi Arabia','+966'],['IL','Israel','+972'],['TR','Türkiye','+90'],
    ['FR','France','+33'],['IT','Italy','+39'],['ES','Spain','+34'],['PT','Portugal','+351'],['DE','Germany','+49'],['NL','Netherlands','+31'],['BE','Belgium','+32'],
    ['CH','Switzerland','+41'],['AT','Austria','+43'],['GR','Greece','+30'],['IE','Ireland','+353'],['IS','Iceland','+354'],['NO','Norway','+47'],['SE','Sweden','+46'],['DK','Denmark','+45'],['FI','Finland','+358'],
    ['CZ','Czechia','+420'],['PL','Poland','+48'],['HR','Croatia','+385'],['ZA','South Africa','+27'],['BW','Botswana','+267'],['KE','Kenya','+254'],['TZ','Tanzania','+255'],['MA','Morocco','+212'],['EG','Egypt','+20'],
    ['MX','Mexico','+52'],['BR','Brazil','+55'],['AR','Argentina','+54'],['CL','Chile','+56'],['PE','Peru','+51'],['CO','Colombia','+57'],['CR','Costa Rica','+506'],['BS','Bahamas','+1'],
    ['JM','Jamaica','+1'],['BB','Barbados','+1'],['DO','Dominican Republic','+1'],['PR','Puerto Rico','+1']
  ].map(([code,name,dial]) => ({ code, name, dial }));
  const flagFor = (code) => code.replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
  const phoneField = document.querySelector('[data-phone-field]');
  const phoneInput = document.querySelector('[data-phone-input]');
  const countryTrigger = document.querySelector('[data-country-trigger]');
  const countryMenu = document.querySelector('[data-country-menu]');
  const countryFlag = document.querySelector('[data-country-flag]');
  const countryDial = document.querySelector('[data-country-dial]');
  const countryCodeDisplay = document.querySelector('[data-country-code-display]');
  const phoneCountry = document.querySelector('[data-phone-country]');
  const phoneDialCode = document.querySelector('[data-phone-dial-code]');
  let selectedCountry = countryData[0];

  const formatNationalPhone = (value, country = selectedCountry) => {
    const digits = value.replace(/\D/g,'').slice(0, 15);
    if (!digits) return '';
    if ((country.code === 'US' || country.code === 'CA' || country.dial === '+1') && digits.length <= 10) {
      if (digits.length <= 3) return digits.length === 3 ? `(${digits})` : digits;
      if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;
    }
    if (country.code === 'GB') {
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0,4)} ${digits.slice(4)}`;
      return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7,11)}`;
    }
    return digits.replace(/(\d{3})(?=\d)/g,'$1 ').trim();
  };
  const paintCountry = (country) => {
    selectedCountry = country;
    if (countryFlag) countryFlag.textContent = flagFor(country.code);
    if (countryDial) countryDial.textContent = country.dial;
    if (countryCodeDisplay) countryCodeDisplay.textContent = country.code;
    if (phoneCountry) phoneCountry.value = country.code;
    if (phoneDialCode) phoneDialCode.value = country.dial;
    countryMenu?.querySelectorAll('[data-country-code]').forEach(btn => btn.classList.toggle('is-selected', btn.dataset.countryCode === country.code));
    if (phoneInput?.value) phoneInput.value = formatNationalPhone(phoneInput.value, country);
  };
  if (countryMenu) {
    const frag = document.createDocumentFragment();
    countryData.forEach(country => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'country-option'; btn.dataset.countryCode = country.code; btn.setAttribute('role','option');
      btn.innerHTML = `<span class="flag">${flagFor(country.code)}</span><b>${country.name}</b><small>${country.dial}</small>`;
      btn.addEventListener('click', () => { paintCountry(country); phoneField?.classList.remove('is-country-open'); countryTrigger?.setAttribute('aria-expanded','false'); phoneInput?.focus(); });
      frag.appendChild(btn);
    });
    countryMenu.appendChild(frag);
  }
  paintCountry(selectedCountry);
  countryTrigger?.addEventListener('click', () => {
    const open = !phoneField?.classList.contains('is-country-open');
    phoneField?.classList.toggle('is-country-open', open); countryTrigger.setAttribute('aria-expanded', String(open));
  });
  phoneInput?.addEventListener('input', () => { phoneInput.value = formatNationalPhone(phoneInput.value); });

  /* Bespoke calendar + time picker — avoids browser-native date/time chrome. */
  const callSchedule = document.querySelector('[data-call-schedule]');
  const callDate = document.querySelector('[data-call-date]');
  const callTime = document.querySelector('[data-call-time]');
  const dateTrigger = document.querySelector('[data-date-trigger]');
  const timeTrigger = document.querySelector('[data-time-trigger]');
  const dateDisplay = document.querySelector('[data-date-display]');
  const timeDisplay = document.querySelector('[data-time-display]');
  const datePopover = document.querySelector('[data-date-popover]');
  const timePopover = document.querySelector('[data-time-popover]');
  const calMonth = document.querySelector('[data-cal-month]');
  const calGrid = document.querySelector('[data-cal-grid]');
  const timeGrid = document.querySelector('[data-time-grid]');
  const dateControl = dateTrigger?.closest('.call-control');
  const timeControl = timeTrigger?.closest('.call-control');
  const today = new Date(); today.setHours(0,0,0,0);
  let calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;

  const isoDate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const friendlyDate = date => new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'}).format(date);
  const closeCallPopovers = (except = null) => {
    [[dateControl,dateTrigger],[timeControl,timeTrigger]].forEach(([control,trigger]) => {
      if (control !== except) { control?.classList.remove('is-open'); trigger?.setAttribute('aria-expanded','false'); }
    });
  };
  const updateCallScheduleState = (celebrate = false) => {
    const complete = Boolean(callDate?.value && callTime?.value);
    callSchedule?.classList.toggle('is-complete', complete);
    if (complete && celebrate && callSchedule && !reduceMotion) {
      callSchedule.classList.remove('is-just-completed'); void callSchedule.offsetWidth; callSchedule.classList.add('is-just-completed');
    }
  };
  const renderCalendar = () => {
    if (!calGrid || !calMonth) return;
    calMonth.textContent = new Intl.DateTimeFormat(undefined,{month:'long',year:'numeric'}).format(calendarCursor);
    calGrid.replaceChildren();
    const first = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
    const last = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth()+1, 0);
    for (let i=0;i<first.getDay();i++){ const spacer=document.createElement('span'); calGrid.appendChild(spacer); }
    for (let day=1; day<=last.getDate(); day++) {
      const date = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), day); date.setHours(0,0,0,0);
      const btn = document.createElement('button'); btn.type='button'; btn.className='calendar-day'; btn.textContent=String(day);
      const value=isoDate(date); btn.dataset.date=value; btn.setAttribute('aria-label', friendlyDate(date));
      if (date < today) btn.disabled=true;
      if (date.getTime()===today.getTime()) btn.classList.add('is-today');
      if (selectedDate && isoDate(selectedDate)===value) btn.classList.add('is-selected');
      btn.addEventListener('click', () => {
        selectedDate=date; if(callDate) callDate.value=value; if(dateDisplay) dateDisplay.textContent=friendlyDate(date); dateTrigger?.classList.add('has-value');
        renderCalendar(); dateControl?.classList.remove('is-open'); dateTrigger?.setAttribute('aria-expanded','false'); updateCallScheduleState(true);
      });
      calGrid.appendChild(btn);
    }
  };
  document.querySelector('[data-cal-prev]')?.addEventListener('click', () => {
    const prev=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);
    const floor=new Date(today.getFullYear(),today.getMonth(),1);
    if(prev>=floor){calendarCursor=prev;renderCalendar();}
  });
  document.querySelector('[data-cal-next]')?.addEventListener('click', () => { calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderCalendar(); });
  document.querySelector('[data-date-clear]')?.addEventListener('click', () => { selectedDate=null;if(callDate)callDate.value='';if(dateDisplay)dateDisplay.textContent='Select date';dateTrigger?.classList.remove('has-value');renderCalendar();dateControl?.classList.remove('is-open');dateTrigger?.setAttribute('aria-expanded','false');updateCallScheduleState(); });
  dateTrigger?.addEventListener('click', () => { const open=!dateControl?.classList.contains('is-open'); closeCallPopovers(open?dateControl:null);dateControl?.classList.toggle('is-open',open);dateTrigger.setAttribute('aria-expanded',String(open));if(open)renderCalendar(); });
  renderCalendar();

  const formatTime = value => {
    const [h,m]=value.split(':').map(Number); return new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(2020,0,1,h,m));
  };
  if (timeGrid) {
    for(let minutes=8*60;minutes<=20*60;minutes+=30){
      const h=Math.floor(minutes/60),m=minutes%60,value=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      const btn=document.createElement('button');btn.type='button';btn.className='time-option';btn.dataset.time=value;btn.setAttribute('role','option');btn.textContent=formatTime(value);
      btn.addEventListener('click',()=>{if(callTime)callTime.value=value;if(timeDisplay)timeDisplay.textContent=formatTime(value);timeTrigger?.classList.add('has-value');timeGrid.querySelectorAll('.time-option').forEach(x=>x.classList.toggle('is-selected',x===btn));timeControl?.classList.remove('is-open');timeTrigger?.setAttribute('aria-expanded','false');updateCallScheduleState(true);});
      timeGrid.appendChild(btn);
    }
  }
  document.querySelector('[data-time-clear]')?.addEventListener('click',()=>{if(callTime)callTime.value='';if(timeDisplay)timeDisplay.textContent='Select time';timeTrigger?.classList.remove('has-value');timeGrid?.querySelectorAll('.time-option').forEach(x=>x.classList.remove('is-selected'));timeControl?.classList.remove('is-open');timeTrigger?.setAttribute('aria-expanded','false');updateCallScheduleState();});
  timeTrigger?.addEventListener('click',()=>{const open=!timeControl?.classList.contains('is-open');closeCallPopovers(open?timeControl:null);timeControl?.classList.toggle('is-open',open);timeTrigger.setAttribute('aria-expanded',String(open));});

  document.addEventListener('pointerdown', event => {
    if (phoneField?.classList.contains('is-country-open') && !phoneField.contains(event.target)) { phoneField.classList.remove('is-country-open'); countryTrigger?.setAttribute('aria-expanded','false'); }
    if (dateControl?.classList.contains('is-open') && !dateControl.contains(event.target)) { dateControl.classList.remove('is-open'); dateTrigger?.setAttribute('aria-expanded','false'); }
    if (timeControl?.classList.contains('is-open') && !timeControl.contains(event.target)) { timeControl.classList.remove('is-open'); timeTrigger?.setAttribute('aria-expanded','false'); }
  });

  /* Inquiry */
  const form = document.querySelector('[data-inquiry-form]');
  const formNote = document.querySelector('[data-form-note]');
  const inquiryDestinationField = form?.querySelector('input[name="destination"]');
  const inquiryMessageField = form?.querySelector('textarea[name="message"]');
  const autoSizeInquiryMessage = () => {
    if (!inquiryMessageField) return;
    inquiryMessageField.style.height = 'auto';
    inquiryMessageField.style.height = `${Math.max(112, inquiryMessageField.scrollHeight + 2)}px`;
  };
  inquiryMessageField?.addEventListener('input', autoSizeInquiryMessage);
  window.addEventListener('resize', autoSizeInquiryMessage, { passive: true });
  autoSizeInquiryMessage();
  const journeyPlanLinks = [...document.querySelectorAll('[data-plan-journey]')];
  const destinationPlanLinks = [...document.querySelectorAll('[data-plan-destination]')];

  const focusPrefilledForm = (noteText) => {
    if (formNote) formNote.textContent = noteText;
    document.getElementById('inquire')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => {
      inquiryMessageField?.focus({ preventScroll: true });
      if (inquiryMessageField?.setSelectionRange) {
        const len = inquiryMessageField.value.length;
        inquiryMessageField.setSelectionRange(len, len);
      }
    }, reduceMotion ? 0 : 360);
  };

  const prefillVoyageInquiry = (key) => {
    if (!form) return;
    const card = document.querySelector(`[data-voyage-card="${key}"]`);
    if (!card) return;
    const voyageTitle = card.dataset.voyageTitle || 'Selected voyage';
    const destination = card.dataset.voyageDestination || voyageTitle;
    const template = decodeURIComponent(card.dataset.voyageTemplate || `Hello MFM team,

I would love to learn more about the ${voyageTitle}.
`);
    if (inquiryDestinationField) inquiryDestinationField.value = destination;
    if (inquiryMessageField) inquiryMessageField.value = template;
    autoSizeInquiryMessage();
    focusPrefilledForm(`${voyageTitle} has been added below — tailor anything before sending.`);
  };

  const prefillDepartureInquiry = (key) => {
    if (!form) return;
    const edit = boardEdits.find(item => item.key === key) || boardEdits[0];
    if (!edit) return;
    if (inquiryDestinationField) inquiryDestinationField.value = edit.title;
    if (inquiryMessageField) inquiryMessageField.value = edit.template;
    autoSizeInquiryMessage();
    focusPrefilledForm(`${edit.title} has been added below — tailor anything before sending.`);
  };

  journeyPlanLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      prefillVoyageInquiry(link.dataset.planJourney || '');
    });
  });

  destinationPlanLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      prefillDepartureInquiry(link.dataset.planDestination || '');
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailOkay = validateEmail(true);
    if (!emailOkay) {
      emailInput?.focus();
      if (formNote) formNote.textContent = 'Please check the highlighted email address.';
      return;
    }
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const phone = data.get('phone') || '';
    const phoneDial = data.get('phoneDialCode') || '';
    const phoneCountryValue = data.get('phoneCountry') || '';
    const fullPhone = phone ? `${phoneDial} ${phone}`.trim() : '';
    const destination = data.get('destination') || '';
    const callDateValue = data.get('callDate') || '';
    const callTimeValue = data.get('callTime') || '';
    const advisorKey = data.get('advisor') || 'no-preference';
    const advisor = advisorProfiles[advisorKey] || advisorProfiles['no-preference'];
    const advisorChoice = advisorKey === 'no-preference' ? 'No preference — please match me with the best fit' : `${advisor.name} — ${advisor.role}`;
    const message = data.get('message') || '';
    const subject = encodeURIComponent(`Travel inquiry from ${name}${destination ? ` — ${destination}` : ''}`);
    const preferredCall = callDateValue || callTimeValue ? `${callDateValue || 'Date flexible'}${callTimeValue ? ` at ${callTimeValue}` : ' · time flexible'}` : 'Not specified';
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${fullPhone || 'Not provided'}\nDestination / idea: ${destination}\nPreferred advisor: ${advisorChoice}\nPreferred call: ${preferredCall}\n\n${message}`);
    if (formNote) formNote.textContent = 'Opening your email app…';
    window.location.href = `mailto:maddy@MFMLuxuryTravel.com?subject=${subject}&body=${body}`;
  });

  /* Hero editorial typewriter — keeps Travel, fixed and types the signature line. */
  const heroTypeTitle = document.querySelector('.hero-type-title');
  const heroTypeBeautiful = document.querySelector('[data-hero-type-beautiful]');
  const heroTypeArranged = document.querySelector('[data-hero-type-arranged]');
  const heroTypeCaret = heroTypeTitle?.querySelector('.hero-type-caret');
  const heroTypeFirstLine = heroTypeBeautiful?.closest('.hero-type-line');
  const heroTypeSecondLine = heroTypeArranged?.closest('.hero-type-line');
  if (heroTypeTitle && heroTypeBeautiful && heroTypeArranged && heroTypeCaret && heroTypeFirstLine && heroTypeSecondLine) {
    const beautifulWord = 'beautifully';
    const arrangedWord = 'arranged.';
    const heroReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let heroTypeTimer = null;

    const moveHeroCaret = line => {
      if (line === 'second') heroTypeSecondLine.appendChild(heroTypeCaret);
      else heroTypeFirstLine.appendChild(heroTypeCaret);
    };

    const showCompleteHeroType = () => {
      heroTypeBeautiful.textContent = beautifulWord;
      heroTypeArranged.textContent = arrangedWord;
      moveHeroCaret('second');
      heroTypeTitle.classList.add('is-on-second-line','is-paused');
    };

    if (heroReduceMotion) {
      showCompleteHeroType();
    } else {
      const wait = ms => new Promise(resolve => { heroTypeTimer = window.setTimeout(resolve, ms); });
      const typeInto = async (el, word, delay) => {
        for (let i = 1; i <= word.length; i++) {
          el.textContent = word.slice(0, i);
          await wait(delay + Math.random() * 34);
        }
      };
      const eraseFrom = async (el, delay) => {
        while (el.textContent.length) {
          el.textContent = el.textContent.slice(0, -1);
          await wait(delay + Math.random() * 18);
        }
      };
      const heroTypeLoop = async () => {
        while (document.documentElement.contains(heroTypeTitle)) {
          heroTypeTitle.classList.remove('is-on-second-line','is-paused');
          moveHeroCaret('first');
          heroTypeBeautiful.textContent = '';
          heroTypeArranged.textContent = '';
          await wait(420);
          await typeInto(heroTypeBeautiful, beautifulWord, 105);
          await wait(190);
          heroTypeTitle.classList.add('is-on-second-line');
          moveHeroCaret('second');
          await typeInto(heroTypeArranged, arrangedWord, 118);
          heroTypeTitle.classList.add('is-paused');
          await wait(2850);
          heroTypeTitle.classList.remove('is-paused');
          await eraseFrom(heroTypeArranged, 62);
          heroTypeTitle.classList.remove('is-on-second-line');
          moveHeroCaret('first');
          await eraseFrom(heroTypeBeautiful, 66);
          await wait(900);
        }
      };
      heroTypeLoop();
      /* Do not cancel the pending typewriter timeout when mobile browsers briefly
         hide/freeze the page; cancelling it strands the async loop forever. */
      window.addEventListener('pageshow', () => {
        heroTypeTitle.classList.remove('is-paused');
      });
    }
  }

})();
