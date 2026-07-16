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

const solutionCarousel = document.querySelector('[data-solution-carousel]');

if (solutionCarousel) {
  const viewport = solutionCarousel.querySelector('.carousel-viewport');
  const track = solutionCarousel.querySelector('.carousel-track');
  const slides = Array.from(solutionCarousel.querySelectorAll('.solution-slide'));
  const previousButton = solutionCarousel.querySelector('.carousel-prev');
  const nextButton = solutionCarousel.querySelector('.carousel-next');
  const dots = Array.from(solutionCarousel.querySelectorAll('.carousel-dot'));
  const progress = solutionCarousel.querySelector('.carousel-progress-fill');
  const status = solutionCarousel.querySelector('.carousel-status');
  const counters = Array.from(document.querySelectorAll('[data-solution-counter]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interval = 5000;
  let activeIndex = 0;
  let autoplayTimer;
  let dragStartX = 0;
  let dragDelta = 0;
  let isDragging = false;
  let isHovering = false;
  let hasFocus = false;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.classList.add('solution-slide-clone');
  lastClone.classList.add('solution-slide-clone');
  firstClone.classList.remove('is-active');
  lastClone.classList.remove('is-active');
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  firstClone.setAttribute('inert', '');
  lastClone.setAttribute('inert', '');
  track.prepend(lastClone);
  track.append(firstClone);
  track.classList.add('is-resetting');
  track.style.transform = 'translate3d(-100%, 0, 0)';
  void track.offsetWidth;
  track.classList.remove('is-resetting');

  const getSlideName = (slide) => slide.querySelector('h3')?.textContent.trim() || 'Solution';

  const renderCounterCharacters = (counter, currentValue, nextValue = currentValue) => {
    const currentCharacters = Array.from(currentValue);
    const nextCharacters = Array.from(nextValue);
    const characterCount = Math.max(currentCharacters.length, nextCharacters.length);
    const characters = document.createElement('span');
    characters.className = 'stat-characters';
    characters.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < characterCount; index += 1) {
      const currentCharacter = currentCharacters[index] || ' ';
      const nextCharacter = nextCharacters[index] || ' ';
      const slot = document.createElement('span');
      const reel = document.createElement('span');
      const current = document.createElement('span');
      const next = document.createElement('span');

      slot.className = 'stat-char';
      if ('/–-'.includes(currentCharacter) || '/–-'.includes(nextCharacter)) slot.classList.add('is-narrow');
      if (currentCharacter === ' ' && nextCharacter === ' ') slot.classList.add('is-space');

      reel.className = 'stat-char-reel';
      reel.style.setProperty('--char-delay', reducedMotion ? '0ms' : `${index * 55}ms`);
      current.className = 'stat-char-value stat-char-current';
      next.className = 'stat-char-value stat-char-next';
      current.textContent = currentCharacter === ' ' ? '\u00a0' : currentCharacter;
      next.textContent = nextCharacter === ' ' ? '\u00a0' : nextCharacter;

      reel.append(current, next);
      slot.append(reel);
      characters.append(slot);
    }

    counter.replaceChildren(characters);
    counter.setAttribute('aria-label', nextValue);
  };

  counters.forEach((counter) => {
    const initialValue = counter.querySelector('.stat-current')?.textContent.trim() || counter.textContent.trim();
    counter.dataset.value = initialValue;
    renderCounterCharacters(counter, initialValue);
  });

  const rollCounter = (counter, value) => {
    const currentValue = counter.dataset.value || '';
    if (currentValue === value) return;

    clearTimeout(counter.rollTimer);
    counter.classList.remove('is-rolling');
    renderCounterCharacters(counter, currentValue, value);
    void counter.offsetWidth;
    window.requestAnimationFrame(() => counter.classList.add('is-rolling'));

    counter.rollTimer = window.setTimeout(() => {
      counter.dataset.value = value;
      counter.classList.remove('is-rolling');
      renderCounterCharacters(counter, value);
    }, reducedMotion ? 30 : 520 + Math.max(Array.from(currentValue).length, Array.from(value).length) * 55);
  };

  const updateCounters = (slide) => {
    const values = (slide.dataset.counterValues || '').split('|');
    counters.forEach((counter, index) => rollCounter(counter, values[index] || '—'));
  };

  const resetProgress = () => {
    progress.classList.remove('is-running');
    void progress.offsetWidth;
    if (!reducedMotion && !isHovering && !hasFocus && !document.hidden) {
      progress.classList.add('is-running');
    }
  };

  const stopAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    progress.classList.remove('is-running');
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (reducedMotion || isHovering || hasFocus || document.hidden) return;
    resetProgress();
    autoplayTimer = window.setTimeout(() => goTo(activeIndex + 1), interval);
  };

  const goTo = (requestedIndex) => {
    const wrapsForward = requestedIndex >= slides.length;
    const wrapsBackward = requestedIndex < 0;
    activeIndex = (requestedIndex + slides.length) % slides.length;
    const physicalIndex = wrapsForward ? slides.length + 1 : wrapsBackward ? 0 : activeIndex + 1;
    track.style.transform = `translate3d(-${physicalIndex * 100}%, 0, 0)`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === activeIndex)));
    updateCounters(slides[activeIndex]);
    status.textContent = `Showing solution ${activeIndex + 1} of ${slides.length}: ${getSlideName(slides[activeIndex])}`;

    if (wrapsForward || wrapsBackward) {
      window.setTimeout(() => {
        track.classList.add('is-resetting');
        track.style.transform = `translate3d(-${(activeIndex + 1) * 100}%, 0, 0)`;
        void track.offsetWidth;
        track.classList.remove('is-resetting');
      }, reducedMotion ? 20 : 790);
    }

    startAutoplay();
  };

  previousButton.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton.addEventListener('click', () => goTo(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

  solutionCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragDelta = 0;
    viewport.classList.add('is-dragging');
    track.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
    stopAutoplay();
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    dragDelta = event.clientX - dragStartX;
    track.style.transform = `translate3d(calc(-${(activeIndex + 1) * 100}% + ${dragDelta}px), 0, 0)`;
  });

  const finishDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    track.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);

    if (Math.abs(dragDelta) > Math.min(90, viewport.clientWidth * 0.16)) {
      goTo(activeIndex + (dragDelta < 0 ? 1 : -1));
    } else {
      goTo(activeIndex);
    }
  };

  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);

  solutionCarousel.addEventListener('mouseenter', () => {
    isHovering = true;
    stopAutoplay();
  });

  solutionCarousel.addEventListener('mouseleave', () => {
    isHovering = false;
    startAutoplay();
  });

  solutionCarousel.addEventListener('focusin', () => {
    hasFocus = true;
    stopAutoplay();
  });

  solutionCarousel.addEventListener('focusout', (event) => {
    if (solutionCarousel.contains(event.relatedTarget)) return;
    hasFocus = false;
    startAutoplay();
  });

  document.addEventListener('visibilitychange', startAutoplay);
  startAutoplay();
}
