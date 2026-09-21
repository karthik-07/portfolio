const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const rootElement = document.documentElement;

const header = $('.site-header');
const menuToggle = $('.menu-toggle');
const navLinks = $('#nav-links');
const toast = $('#toast');

// =========================================================
// Motion tiers (static / constrained / full)
// =========================================================
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
const noHoverQuery = window.matchMedia('(hover: none)');
const lightPreferenceQuery = window.matchMedia('(prefers-color-scheme: light)');

const Motion = {
  tier: 'static',
  reduced: reduceMotionQuery.matches,
  pointer: { x: -9999, y: -9999, mx: 0, my: 0, active: false, dirty: false }
};

function resolveMotionTier() {
  if (reduceMotionQuery.matches) return 'static';
  const coarse = coarsePointerQuery.matches || noHoverQuery.matches;
  const narrow = window.innerWidth < 900;
  const saveData = Boolean(navigator.connection?.saveData);
  const memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : 8;
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 8;
  const low = memory <= 4 || cores <= 4;
  return (coarse || narrow || saveData || low) ? 'constrained' : 'full';
}

function refreshMotionTier() {
  const next = resolveMotionTier();
  const changed = next !== Motion.tier;
  Motion.tier = next;
  Motion.reduced = reduceMotionQuery.matches;
  rootElement.setAttribute('data-motion', next);
  if (changed) document.dispatchEvent(new CustomEvent('motion:tierchange', { detail: next }));
  return changed;
}
refreshMotionTier();

// =========================================================
// Motion engine (GSAP enhancement — never the content layer)
// =========================================================
function hasMotionEngine() {
  return Boolean(window.gsap && window.ScrollTrigger);
}

let gsapMedia = null;

function registerMotionEngine() {
  if (!hasMotionEngine()) return false;
  window.gsap.registerPlugin(window.ScrollTrigger);
  rootElement.setAttribute('data-engine', 'gsap');
  return true;
}

// Hand the transform back to CSS once a reveal lands so major surfaces keep ownership
// of their tilt; the class also disables the stylesheet's hidden reveal state.
function settleReveals(items) {
  items.forEach((item) => item.classList.add('is-visible'));
  window.gsap.set(items, { clearProps: 'transform' });
}

function initGsapReveals() {
  if (!registerMotionEngine()) return false;
  const gsap = window.gsap;
  gsap.set(revealItems, { autoAlpha: 0, y: 18 });
  window.ScrollTrigger.batch(revealItems, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.07, overwrite: true,
      onComplete: () => settleReveals(batch)
    })
  });
  // Safety net: motion must never gate content. Anything already on screen that the
  // engine has not revealed shortly after init is shown regardless.
  window.setTimeout(() => {
    const limit = window.innerHeight * 0.95;
    const pending = revealItems.filter((item) => {
      const rect = item.getBoundingClientRect();
      return rect.top < limit && rect.bottom > 0 && parseFloat(getComputedStyle(item).opacity) < 0.05;
    });
    if (pending.length) {
      gsap.to(pending, { autoAlpha: 1, y: 0, duration: 0.4, overwrite: true, onComplete: () => settleReveals(pending) });
    }
  }, 1000);
  return true;
}

function initGsapEnhancements() {
  if (Motion.tier === 'static' || !hasMotionEngine()) return;
  const gsap = window.gsap;
  if (!registerMotionEngine()) return;
  if (gsapMedia) gsapMedia.revert();
  gsapMedia = gsap.matchMedia();
}

function teardownMotionEngine() {
  if (gsapMedia) gsapMedia.revert();
  if (wbTimeline) { wbTimeline.kill(); wbTimeline = null; }
  if (window.gsap) {
    try { window.gsap.set(revealItems, { clearProps: 'opacity,visibility,transform' }); } catch (error) { /* engine already gone */ }
  }
  rootElement.removeAttribute('data-engine');
}

// =========================================================
// Toast
// =========================================================
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

// =========================================================
// Theme
// =========================================================
const THEME_KEY = 'portfolio-theme';
const themeToggle = $('.theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
let explicitTheme = null;

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch (error) {
    return null;
  }
}

function writeStoredTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Storage can be blocked; the in-memory choice still drives the current visit.
  }
}

function applyTheme(theme, { persist = false } = {}) {
  const next = theme === 'light' ? 'light' : 'dark';
  rootElement.setAttribute('data-theme', next);
  if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', next);
  if (themeColorMeta) themeColorMeta.setAttribute('content', next === 'light' ? '#eef2f8' : '#05060a');
  if (themeToggle) {
    const upcoming = next === 'light' ? 'dark' : 'light';
    themeToggle.setAttribute('aria-label', `Switch to ${upcoming} theme`);
    themeToggle.setAttribute('aria-pressed', String(next === 'light'));
  }
  if (persist) {
    explicitTheme = next;
    writeStoredTheme(next);
  }
}

const storedTheme = readStoredTheme();
if (storedTheme) explicitTheme = storedTheme;
applyTheme(storedTheme || (lightPreferenceQuery.matches ? 'light' : 'dark'));

themeToggle?.addEventListener('click', () => {
  const current = rootElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current === 'light' ? 'dark' : 'light', { persist: true });
});

const handleSystemThemeChange = (event) => {
  if (explicitTheme) return;
  applyTheme(event.matches ? 'light' : 'dark');
};
if (lightPreferenceQuery.addEventListener) lightPreferenceQuery.addEventListener('change', handleSystemThemeChange);
else lightPreferenceQuery.addListener(handleSystemThemeChange);

// =========================================================
// Smooth in-page navigation
// =========================================================
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function getHeaderOffset() {
  return Math.max(0, (header?.getBoundingClientRect().height || 0) + 14);
}

function cancelSmoothScroll() {
  if (!scrollToTarget.frame) return;
  cancelAnimationFrame(scrollToTarget.frame);
  scrollToTarget.frame = null;
}

function scrollToTarget(selector) {
  const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!target) return;

  const isTop = target.id === 'top';
  const startY = window.scrollY;
  const targetY = isTop
    ? 0
    : Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset());

  if (reduceMotionQuery.matches) {
    window.scrollTo(0, targetY);
    return;
  }

  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const duration = Math.min(900, Math.max(520, Math.abs(distance) * 0.28));
  const startTime = performance.now();

  if (scrollToTarget.frame) cancelAnimationFrame(scrollToTarget.frame);

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutQuart(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      scrollToTarget.frame = requestAnimationFrame(step);
    } else {
      scrollToTarget.frame = null;
    }
  };

  scrollToTarget.frame = requestAnimationFrame(step);
}

// If the user takes over mid-animation, stop immediately instead of fighting their input.
window.addEventListener('wheel', cancelSmoothScroll, { passive: true });
window.addEventListener('touchstart', cancelSmoothScroll, { passive: true });
document.addEventListener('keydown', (event) => {
  if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) cancelSmoothScroll();
});

const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

// =========================================================
// Mobile navigation
// =========================================================
const navAnchors = $$('.nav-center a[href^="#"]');

menuToggle?.addEventListener('click', () => {
  const open = !navLinks?.classList.contains('open');
  navLinks?.classList.toggle('open', open);
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

function closeMobileMenu({ restoreFocus = false } = {}) {
  const wasOpen = navLinks?.classList.contains('open');
  navLinks?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && wasOpen) menuToggle?.focus();
}

navAnchors.forEach((link) => link.addEventListener('click', () => closeMobileMenu()));

document.addEventListener('pointerdown', (event) => {
  if (!navLinks?.classList.contains('open')) return;
  if (event.target.closest('.nav-center, .menu-toggle')) return;
  closeMobileMenu();
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks?.classList.contains('open')) closeMobileMenu({ restoreFocus: true });
});

// Route every same-page hash link through one smooth-scrolling system.
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const href = anchor.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.querySelector(href);
  if (!target) return;

  event.preventDefault();
  closeMobileMenu();
  scrollToTarget(target);

  if (history.replaceState) history.replaceState(null, '', href);
});

$$('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => scrollToTarget(button.dataset.scroll));
});

// =========================================================
// Reveal sequencing
// =========================================================
const revealItems = $$('.reveal');
let revealsReady = false;

function revealAll() {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function initReveals() {
  if (revealsReady) return;
  revealsReady = true;

  if (Motion.tier === 'static' || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  // GSAP drives reveals when the verified engine is available. If it misbehaves the
  // teardown restores inline styles and the observer below takes over.
  try {
    if (initGsapReveals()) return;
  } catch (error) {
    teardownMotionEngine();
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  // Group-aware stagger so a row of cards sequences instead of popping at once.
  revealItems.forEach((item) => {
    const siblings = [...(item.parentElement?.children || [])].filter((node) => node.classList?.contains('reveal'));
    const index = Math.max(0, siblings.indexOf(item));
    item.style.transitionDelay = `${Math.min(index, 3) * 70}ms`;
    revealObserver.observe(item);
  });
}

// Deferred CDN scripts run before DOMContentLoaded, so initialise here to give the
// engine a chance to load. The safety timer guarantees content if the CDN stalls.
function initEnhancements() {
  initReveals();
  initGsapEnhancements();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements, { once: true });
  window.setTimeout(initEnhancements, 900);
} else {
  initEnhancements();
}

// =========================================================
// Section activation, orbital progress, accent shifts
// =========================================================
const sections = $$('[data-section]');
const progressNode = $('#orbital-progress-node');
const timeline = $('.timeline');
const accentMap = {
  cyan: ['var(--cyan)', 'var(--glow-cyan)'],
  green: ['var(--green)', 'var(--glow-green)'],
  warm: ['var(--warm)', 'color-mix(in srgb, var(--warm) 42%, transparent)']
};
const sectionAccentName = {
  hero: 'cyan', projects: 'green', experience: 'cyan', 'more-projects': 'green',
  skills: 'cyan', about: 'warm', contact: 'green', top: 'cyan', footer: 'cyan'
};

function setGlobalAccent(name) {
  const pair = accentMap[name] || accentMap.cyan;
  rootElement.style.setProperty('--section-accent', pair[0]);
  rootElement.style.setProperty('--section-accent-soft', pair[1]);
}

function setActiveNav(id) {
  navAnchors.forEach((link) => {
    const active = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sections.forEach((section) => section.classList.toggle('is-current', section === entry.target));
      setActiveNav(entry.target.id);
      setGlobalAccent(sectionAccentName[entry.target.dataset.section] || 'cyan');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));
}

// Timeline milestones light up as their card reaches the reading band.
const timelineItems = $$('.timeline-item');
if ('IntersectionObserver' in window) {
  const milestoneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-active', entry.isIntersecting));
  }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });
  timelineItems.forEach((item) => milestoneObserver.observe(item));
}

const tiltSurfaces = $$('[data-tilt]');
let tiltRectsValid = false;
let tiltMax = 3;
try {
  const parsedTilt = parseFloat(getComputedStyle(rootElement).getPropertyValue('--tilt-max'));
  if (!Number.isNaN(parsedTilt)) tiltMax = parsedTilt;
} catch (error) { /* keep default */ }

function measureTiltSurfaces() {
  tiltSurfaces.forEach((surface) => { surface.__rect = surface.getBoundingClientRect(); });
}

let scrollTicking = false;
function updateScrollEffects() {
  scrollTicking = false;
  const scrollable = Math.max(1, rootElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
  if (progressNode) {
    progressNode.style.left = `${(progress * 100).toFixed(2)}%`;
    progressNode.style.opacity = progress > 0.015 ? '1' : '0';
  }
  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const start = window.innerHeight * 0.8;
    const span = rect.height + start;
    const seen = Math.min(1, Math.max(0, (start - rect.top) / span));
    timeline.style.setProperty('--timeline-progress', `${(seen * 100).toFixed(1)}%`);
  }
  tiltRectsValid = false;
  if (Motion.pointer.active) Motion.pointer.dirty = true;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollEffects);
}, { passive: true });
updateScrollEffects();

// =========================================================
// Pointer / depth coordinator (full tier)
// =========================================================
window.addEventListener('pointermove', (event) => {
  const p = Motion.pointer;
  p.x = event.clientX;
  p.y = event.clientY;
  p.active = true;
  p.dirty = true;
}, { passive: true });

document.documentElement.addEventListener('pointerleave', () => {
  const p = Motion.pointer;
  p.active = false;
  rootElement.style.setProperty('--mx', '0');
  rootElement.style.setProperty('--my', '0');
  tiltSurfaces.forEach((surface) => {
    surface.style.setProperty('--tilt-x', '0deg');
    surface.style.setProperty('--tilt-y', '0deg');
    surface.style.setProperty('--lift', '0px');
  });
});

function applyPointer() {
  const p = Motion.pointer;
  if (!p.active) return;
  const vw = Math.max(1, window.innerWidth);
  const vh = Math.max(1, window.innerHeight);
  p.mx = (p.x / vw) * 2 - 1;
  p.my = (p.y / vh) * 2 - 1;
  rootElement.style.setProperty('--mx', p.mx.toFixed(3));
  rootElement.style.setProperty('--my', p.my.toFixed(3));

  if (!p.dirty) return;
  p.dirty = false;
  if (!tiltRectsValid) {
    measureTiltSurfaces();
    tiltRectsValid = true;
  }
  const pad = 70;
  tiltSurfaces.forEach((surface) => {
    const rect = surface.__rect;
    if (!rect || !rect.width || !rect.height) return;
    const inside = p.x > rect.left - pad && p.x < rect.right + pad && p.y > rect.top - pad && p.y < rect.bottom + pad;
    if (inside) {
      const lx = Math.min(1, Math.max(0, (p.x - rect.left) / rect.width));
      const ly = Math.min(1, Math.max(0, (p.y - rect.top) / rect.height));
      surface.style.setProperty('--tilt-y', `${((lx - 0.5) * tiltMax * 2).toFixed(2)}deg`);
      surface.style.setProperty('--tilt-x', `${((0.5 - ly) * tiltMax * 2).toFixed(2)}deg`);
      surface.style.setProperty('--lift', '-4px');
      surface.style.setProperty('--sx', `${(lx * 100).toFixed(1)}%`);
      surface.style.setProperty('--sy', `${(ly * 100).toFixed(1)}%`);
    } else {
      surface.style.setProperty('--tilt-x', '0deg');
      surface.style.setProperty('--tilt-y', '0deg');
      surface.style.setProperty('--lift', '0px');
    }
  });
}

// =========================================================
// Skills constellation selection
// =========================================================
const skillsConstellation = $('.skills-constellation');
const skillCards = skillsConstellation ? $$('.capability[data-skill]', skillsConstellation) : [];
const skillGeometry = skillsConstellation ? $$('[data-skill-link], [data-skill-node]', skillsConstellation) : [];
let selectedSkill = null;

function setSkillEmphasis(skill) {
  if (!skillsConstellation) return;
  skillsConstellation.classList.toggle('has-active-skill', Boolean(skill));
  skillGeometry.forEach((item) => {
    const linked = (item.dataset.skillLink || item.dataset.skillNode || '').split(/\s+/);
    item.classList.toggle('is-related', Boolean(skill) && linked.includes(skill));
  });
}

function selectSkill(card) {
  const nextSkill = card?.dataset.skill === selectedSkill ? null : card?.dataset.skill || null;
  selectedSkill = nextSkill;
  skillCards.forEach((item) => {
    const selected = item.dataset.skill === selectedSkill;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  const focusedSkill = skillCards.includes(document.activeElement) ? document.activeElement.dataset.skill : null;
  setSkillEmphasis(selectedSkill || focusedSkill);
}

skillsConstellation?.addEventListener('click', (event) => {
  const card = event.target.closest('.capability[data-skill]');
  if (!card || !skillsConstellation.contains(card)) return;
  card.focus({ preventScroll: true });
  selectSkill(card);
});

skillsConstellation?.addEventListener('keydown', (event) => {
  const card = event.target.closest('.capability[data-skill]');
  if (event.key === 'Escape') {
    selectSkill(null);
    return;
  }
  if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  selectSkill(card);
});

skillsConstellation?.addEventListener('pointerover', (event) => {
  const card = event.target.closest('.capability[data-skill]');
  if (card) setSkillEmphasis(card.dataset.skill);
});
skillsConstellation?.addEventListener('pointerout', (event) => {
  const card = event.target.closest('.capability[data-skill]');
  if (!card || card.contains(event.relatedTarget)) return;
  setSkillEmphasis(selectedSkill);
});
skillsConstellation?.addEventListener('focusin', (event) => {
  const card = event.target.closest('.capability[data-skill]');
  if (card) setSkillEmphasis(card.dataset.skill);
});
skillsConstellation?.addEventListener('focusout', (event) => {
  if (skillsConstellation.contains(event.relatedTarget)) return;
  setSkillEmphasis(selectedSkill);
});

// =========================================================
// Cosmic canvas environment
// =========================================================
const cosmosCanvas = $('#cosmos-canvas');
const canvasCtx = cosmosCanvas ? cosmosCanvas.getContext('2d', { alpha: true }) : null;
if (cosmosCanvas && !canvasCtx) cosmosCanvas.classList.add('canvas-unavailable');

const cosmos = {
  far: [], near: [], dust: [], events: [],
  width: 0, height: 0, dpr: 1,
  nextEventAt: 0,
  palette: { starA: '150,229,255', starB: '166,255,209', solidA: '176,236,255', solidB: '186,255,214' },
  measured: false
};

function readCanvasPalette() {
  const styles = getComputedStyle(rootElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  cosmos.palette = {
    starA: read('--sky-star-1', '150,229,255'),
    starB: read('--sky-star-2', '166,255,209'),
    solidA: read('--sky-star-solid-1', '176,236,255'),
    solidB: read('--sky-star-solid-2', '186,255,214')
  };
}
readCanvasPalette();

if (cosmosCanvas) {
  new MutationObserver(readCanvasPalette)
    .observe(rootElement, { attributes: true, attributeFilter: ['data-theme'] });
}

function cosmosCounts() {
  const constrained = Motion.tier === 'constrained';
  const w = cosmos.width;
  const base = w < 640 ? 0.5 : w < 1100 ? 0.78 : 1;
  const far = Math.round((constrained ? 42 : 96) * base);
  const near = Math.round((constrained ? 12 : 26) * base);
  const dust = Math.round((constrained ? 26 : 70) * base);
  return { far: Math.max(18, far), near: Math.max(6, near), dust: Math.max(10, dust) };
}

function makeFarStar() {
  return {
    x: Math.random() * Math.max(1, cosmos.width),
    y: Math.random() * Math.max(1, cosmos.height),
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.06,
    size: 0.5 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2,
    warm: Math.random() > 0.9,
    cyan: Math.random() > 0.5
  };
}

function makeNearStar() {
  return {
    x: Math.random() * Math.max(1, cosmos.width),
    y: Math.random() * Math.max(1, cosmos.height),
    vx: (Math.random() - 0.5) * 0.16,
    vy: (Math.random() - 0.5) * 0.16,
    size: 1 + Math.random() * 1.6,
    phase: Math.random() * Math.PI * 2,
    cyan: Math.random() > 0.5
  };
}

function makeDust() {
  return {
    x: Math.random() * Math.max(1, cosmos.width),
    y: Math.random() * Math.max(1, cosmos.height),
    vx: (Math.random() - 0.5) * 0.03,
    vy: (Math.random() - 0.5) * 0.03,
    size: 0.4 + Math.random() * 0.7,
    alpha: 0.12 + Math.random() * 0.2
  };
}

function seedCosmos() {
  const counts = cosmosCounts();
  cosmos.far = Array.from({ length: counts.far }, makeFarStar);
  cosmos.near = Array.from({ length: counts.near }, makeNearStar);
  cosmos.dust = Array.from({ length: counts.dust }, makeDust);
  cosmos.events = [];
}

function resizeCosmos() {
  if (!cosmosCanvas || !canvasCtx) return;
  const cap = Motion.tier === 'constrained' ? 1.25 : 1.75;
  cosmos.dpr = Math.min(window.devicePixelRatio || 1, cap);
  cosmos.width = window.innerWidth;
  cosmos.height = window.innerHeight;
  cosmosCanvas.width = Math.round(cosmos.width * cosmos.dpr);
  cosmosCanvas.height = Math.round(cosmos.height * cosmos.dpr);
  cosmosCanvas.style.width = `${cosmos.width}px`;
  cosmosCanvas.style.height = `${cosmos.height}px`;
  canvasCtx.setTransform(cosmos.dpr, 0, 0, cosmos.dpr, 0, 0);
  seedCosmos();
  cosmos.nextEventAt = performance.now() + 4000 + Math.random() * 4000;
}

function spawnCelestialEvent(now) {
  const p = Motion.pointer;
  const fromTop = Math.random() > 0.45;
  const speed = 4.4 + Math.random() * 2.8;
  const angle = 0.4 + Math.random() * 0.26;
  cosmos.events.push({
    x: fromTop ? Math.random() * cosmos.width * 0.7 : -40,
    y: fromTop ? -30 : Math.random() * cosmos.height * 0.4,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 100 + Math.random() * 50,
    length: 60 + Math.random() * 70,
    warm: Math.random() > 0.75
  });
  if (cosmos.events.length > 1) cosmos.events.shift();
  cosmos.nextEventAt = now + 6000 + Math.random() * 6000;
}

const pointerInfluence = { radius: 240, strength: 0.09 };

function drawCosmos(now, tier) {
  if (!canvasCtx) return;
  const { width, height } = cosmos;
  canvasCtx.clearRect(0, 0, width, height);

  // Far stars: slow drift under gentle twinkle.
  for (let i = 0; i < cosmos.far.length; i += 1) {
    const star = cosmos.far[i];
    star.x += star.vx;
    star.y += star.vy;
    if (star.x < -20) star.x = width + 20;
    if (star.x > width + 20) star.x = -20;
    if (star.y < -20) star.y = height + 20;
    if (star.y > height + 20) star.y = -20;
    const twinkle = 0.32 + (Math.sin(now / 760 + star.phase + i * 0.27) + 1) * 0.24;
    canvasCtx.beginPath();
    canvasCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    canvasCtx.fillStyle = star.warm
      ? `rgba(255,217,160,${twinkle * 0.8})`
      : star.cyan
        ? `rgba(${cosmos.palette.solidA},${twinkle})`
        : `rgba(${cosmos.palette.solidB},${twinkle})`;
    canvasCtx.fill();
  }

  // Dust: faint, very slow, adds depth without noise.
  for (const mote of cosmos.dust) {
    mote.x += mote.vx;
    mote.y += mote.vy;
    if (mote.x < -10) mote.x = width + 10;
    if (mote.x > width + 10) mote.x = -10;
    if (mote.y < -10) mote.y = height + 10;
    if (mote.y > height + 10) mote.y = -10;
    canvasCtx.beginPath();
    canvasCtx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
    canvasCtx.fillStyle = `rgba(${cosmos.palette.starA},${mote.alpha})`;
    canvasCtx.fill();
  }

  // Near stars: react to the pointer with bounded gravity in full tier only.
  const pointerActive = tier === 'full' && Motion.pointer.active;
  for (const star of cosmos.near) {
    if (pointerActive) {
      const dx = Motion.pointer.x - star.x;
      const dy = Motion.pointer.y - star.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance < pointerInfluence.radius) {
        const force = (1 - distance / pointerInfluence.radius) * pointerInfluence.strength;
        star.vx += (dx / distance) * force;
        star.vy += (dy / distance) * force;
      }
    }
    const speed = Math.hypot(star.vx, star.vy);
    if (speed > 0.7) {
      star.vx = (star.vx / speed) * 0.7;
      star.vy = (star.vy / speed) * 0.7;
    }
    star.vx *= 0.995;
    star.vy *= 0.995;
    if (Math.abs(star.vx) < 0.02) star.vx += (Math.random() - 0.5) * 0.02;
    if (Math.abs(star.vy) < 0.02) star.vy += (Math.random() - 0.5) * 0.02;
    star.x += star.vx;
    star.y += star.vy;
    if (star.x < -20) star.x = width + 20;
    if (star.x > width + 20) star.x = -20;
    if (star.y < -20) star.y = height + 20;
    if (star.y > height + 20) star.y = -20;

    const twinkle = 0.42 + (Math.sin(now / 620 + star.phase) + 1) * 0.24;
    canvasCtx.beginPath();
    canvasCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    canvasCtx.fillStyle = star.cyan
      ? `rgba(${cosmos.palette.solidA},${twinkle})`
      : `rgba(${cosmos.palette.solidB},${twinkle})`;
    canvasCtx.fill();
  }

  // Restrained celestial events (shooting stars / comet streaks).
  if (width >= 720 && now >= cosmos.nextEventAt) spawnCelestialEvent(now);
  cosmos.events = cosmos.events.filter((event) => {
    event.life += 1;
    event.x += event.vx;
    event.y += event.vy;
    const ratio = event.life / event.maxLife;
    if (ratio >= 1 || event.x > width + 140 || event.y > height + 140) return false;
    const alpha = Math.sin(Math.min(1, ratio) * Math.PI) * 0.62;
    const magnitude = Math.max(0.001, Math.hypot(event.vx, event.vy));
    const tailX = event.x - (event.vx / magnitude) * event.length;
    const tailY = event.y - (event.vy / magnitude) * event.length;
    const gradient = canvasCtx.createLinearGradient(tailX, tailY, event.x, event.y);
    gradient.addColorStop(0, `rgba(${cosmos.palette.starA},0)`);
    gradient.addColorStop(1, event.warm
      ? `rgba(255,217,160,${alpha})`
      : `rgba(${cosmos.palette.solidA},${alpha})`);
    canvasCtx.beginPath();
    canvasCtx.moveTo(tailX, tailY);
    canvasCtx.lineTo(event.x, event.y);
    canvasCtx.strokeStyle = gradient;
    canvasCtx.lineWidth = 1.2;
    canvasCtx.stroke();
    return true;
  });
}

// =========================================================
// Single coordinated animation loop
// =========================================================
let cosmicFrame = 0;
let cosmicRunning = true;
let lastDraw = 0;

function shouldRunCosmic() {
  if (document.hidden || !cosmicRunning) return false;
  if (Motion.tier === 'full') return true;
  if (Motion.tier === 'constrained' && canvasCtx) return true;
  return false;
}

function cosmicLoop(now) {
  cosmicFrame = 0;
  if (!shouldRunCosmic()) return;
  if (Motion.tier === 'full') applyPointer();
  if (canvasCtx) {
    const minFrame = 1000 / (Motion.tier === 'full' ? 60 : 30);
    if (now - lastDraw >= minFrame) {
      lastDraw = now;
      drawCosmos(now, Motion.tier);
    }
  }
  if (shouldRunCosmic()) cosmicFrame = requestAnimationFrame(cosmicLoop);
}

function startCosmic() {
  if (cosmicFrame || !shouldRunCosmic()) return;
  cosmicFrame = requestAnimationFrame(cosmicLoop);
}
function stopCosmic() {
  if (cosmicFrame) cancelAnimationFrame(cosmicFrame);
  cosmicFrame = 0;
}

if (cosmosCanvas && canvasCtx) {
  cosmos.measured = true;
  resizeCosmos();
} else {
  measureTiltSurfaces();
  tiltRectsValid = true;
}

let resizeTimer = 0;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    refreshMotionTier();
    if (cosmosCanvas && canvasCtx) resizeCosmos();
    tiltRectsValid = false;
    if (Motion.tier === 'full' && Motion.pointer.active) Motion.pointer.dirty = true;
    if (shouldRunCosmic()) startCosmic();
    else stopCosmic();
  }, 140);
}, { passive: true });

document.addEventListener('visibilitychange', () => {
  cosmicRunning = !document.hidden;
  if (cosmicRunning) {
    lastDraw = 0;
    if (cosmosCanvas) cosmos.nextEventAt = performance.now() + 4000 + Math.random() * 4000;
    startCosmic();
  } else {
    stopCosmic();
  }
});

document.addEventListener('motion:tierchange', () => {
  if (Motion.tier === 'static') {
    stopCosmic();
    teardownMotionEngine();
    rootElement.style.setProperty('--mx', '0');
    rootElement.style.setProperty('--my', '0');
    revealsReady = true;
    revealAll();
  } else {
    startCosmic();
    if (!revealsReady) initReveals();
    initGsapEnhancements();
  }
});

reduceMotionQuery.addEventListener?.('change', () => {
  refreshMotionTier();
});
navigator.connection?.addEventListener?.('change', () => {
  refreshMotionTier();
});

startCosmic();
if (Motion.tier === 'full') {
  measureTiltSurfaces();
  tiltRectsValid = true;
}

// =========================================================
// Footer year + terminal date
// =========================================================
const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = new Date().getFullYear();
const terminalDate = $('#terminal-date');
if (terminalDate) terminalDate.textContent = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

// =========================================================
// Interactive hero terminal
// =========================================================
const terminalForm = $('#terminal-form');
const terminalInput = $('#terminal-input');
const terminalOutput = $('#terminal-output');
const terminalWindow = $('#hero-terminal');
let terminalHistory = [];
let terminalHistoryIndex = 0;

const terminalCommands = {
  help: () => [
    '<span class="term-output">Available commands:</span>',
    '<span class="term-output"><strong>whoami</strong>      developer profile</span>',
    '<span class="term-output"><strong>projects</strong>    jump to the flagship project</span>',
    '<span class="term-output"><strong>whatbroke</strong>   open the flagship Linux tool</span>',
    '<span class="term-output"><strong>story</strong>       why I built it</span>',
    '<span class="term-output"><strong>skills</strong>      jump to skills</span>',
    '<span class="term-output"><strong>experience</strong>  professional timeline</span>',
    '<span class="term-output"><strong>about</strong>       about me</span>',
    '<span class="term-output"><strong>movie</strong>       movie dashboard project</span>',
    '<span class="term-output"><strong>sql</strong>         NL → SQL project</span>',
    '<span class="term-output"><strong>pronunciation</strong> audio alignment project</span>',
    '<span class="term-output"><strong>contact</strong>     contact options</span>',
    '<span class="term-output"><strong>github</strong>      open GitHub</span>',
    '<span class="term-output"><strong>resume</strong>      open résumé</span>',
    '<span class="term-output"><strong>clear</strong>       clear terminal</span>'
  ],
  whoami: () => [
    '<span class="term-output">Karthik Saligram — Full Stack Developer</span>',
    '<span class="term-output muted-line">Production software · Backend · AWS · AI-assisted</span>'
  ],
  projects: () => {
    setTimeout(() => scrollToTarget('#projects'), 180);
    return ['<span class="term-output">Opening <strong>/projects</strong>...</span>'];
  },
  story: () => [
    '<span class="term-output">Most of my side projects start with an annoyance, not a pitch deck.</span>',
    '<span class="term-output">WhatBroke? started after I got tired of manually comparing journal logs and package changes on my own Arch machine.</span>',
    '<span class="term-output muted-line">If I have to debug the same kind of problem twice, I start wondering whether it should be a tool.</span>'
  ],
  whatbroke: () => {
    setTimeout(() => {
      scrollToTarget('#projects');
      window.setTimeout(() => $('#whatbroke-demo')?.classList.add('attention'), 450);
      window.setTimeout(() => $('#whatbroke-demo')?.classList.remove('attention'), 1450);
    }, 180);
    return [
      '<span class="term-output"><strong>WhatBroke?</strong></span>',
      '<span class="term-output">Linux system-change forensics CLI.</span>',
      '<span class="term-output muted-line">Comparing boots → finding new errors → showing preceding changes.</span>'
    ];
  },
  skills: () => {
    setTimeout(() => scrollToTarget('#skills'), 180);
    return ['<span class="term-output">Opening <strong>/skills</strong>...</span>'];
  },
  stack: () => terminalCommands.skills(),
  experience: () => {
    setTimeout(() => scrollToTarget('#experience'), 180);
    return ['<span class="term-output">Opening <strong>/experience</strong>...</span>'];
  },
  about: () => {
    setTimeout(() => scrollToTarget('#about'), 180);
    return ['<span class="term-output">Opening <strong>/about</strong>...</span>'];
  },
  movie: () => {
    setTimeout(() => scrollToTarget('#project-movie'), 160);
    return ['<span class="term-output">Opening <strong>Movie Database Dashboard</strong>...</span>'];
  },
  sql: () => {
    setTimeout(() => scrollToTarget('#project-nlsql'), 160);
    return ['<span class="term-output">Opening <strong>NL → SQL Translation Layer</strong>...</span>'];
  },
  pronunciation: () => {
    setTimeout(() => scrollToTarget('#project-pronunciation'), 160);
    return ['<span class="term-output">Opening <strong>Pronunciation Alignment Engine</strong>...</span>'];
  },
  contact: () => {
    setTimeout(() => scrollToTarget('#contact'), 180);
    return ['<span class="term-output">Email: <span class="term-link">karthikvs216@gmail.com</span></span>'];
  },
  github: () => {
    window.open('https://github.com/karthik-07', '_blank', 'noopener,noreferrer');
    return ['<span class="term-output">Opening GitHub ↗</span>'];
  },
  linkedin: () => {
    window.open('https://www.linkedin.com/in/karthik-saligram-17968518b/', '_blank', 'noopener,noreferrer');
    return ['<span class="term-output">Opening LinkedIn ↗</span>'];
  },
  resume: () => {
    window.open('./assets/Karthik-Resume.pdf', '_blank', 'noopener,noreferrer');
    return ['<span class="term-output">Opening résumé ↗</span>'];
  },
  pwd: () => ['<span class="term-output">/home/karthik/portfolio</span>'],
  ls: () => ['<span class="term-output"><strong>projects/</strong> &nbsp; <strong>experience/</strong> &nbsp; <strong>skills/</strong> &nbsp; about &nbsp; resume.pdf</span>'],
  '?': () => terminalCommands.help(),
  clear: () => []
};

function signalTerminalResponse() {
  if (!terminalWindow) return;
  terminalWindow.classList.remove('is-responding');
  void terminalWindow.offsetWidth;
  terminalWindow.classList.add('is-responding');
  window.setTimeout(() => terminalWindow.classList.remove('is-responding'), 520);
}

function appendTerminalLine(html) {
  if (!terminalOutput) return;
  const line = document.createElement('div');
  line.innerHTML = html;
  terminalOutput.appendChild(line);
}

function runTerminalCommand(rawCommand) {
  if (!terminalOutput) return;
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;

  terminalHistory.push(command);
  terminalHistoryIndex = terminalHistory.length;

  if (command === 'clear') {
    terminalOutput.innerHTML = '';
    return;
  }

  appendTerminalLine(`<span class="term-prompt">karthik@portfolio</span>:<span class="term-path">~</span>$ ${command.replace(/[<>]/g, '')}`);
  const handler = terminalCommands[command];
  const response = handler ? handler() : [`<span class="term-error">command not found:</span> ${command.replace(/[<>]/g, '')} <span class="muted-line">— try help</span>`];
  response.forEach(appendTerminalLine);
  const spacer = document.createElement('div');
  spacer.className = 'terminal-gap';
  terminalOutput.appendChild(spacer);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  signalTerminalResponse();
}

terminalForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  runTerminalCommand(terminalInput.value);
  terminalInput.value = '';
});

terminalInput?.addEventListener('focus', () => terminalWindow?.classList.add('is-focused'));
terminalInput?.addEventListener('blur', () => terminalWindow?.classList.remove('is-focused'));

terminalInput?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!terminalHistory.length) return;
    terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
    terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (!terminalHistory.length) return;
    terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
    terminalInput.value = terminalHistory[terminalHistoryIndex] || '';
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    const prefix = terminalInput.value.trim().toLowerCase();
    if (!prefix) return;
    const matches = Object.keys(terminalCommands)
      .filter((command) => command !== '?' && command.startsWith(prefix))
      .sort();
    if (matches.length === 1) {
      terminalInput.value = matches[0];
      terminalInput.setSelectionRange(matches[0].length, matches[0].length);
    } else if (matches.length > 1) {
      appendTerminalLine(`<span class="term-output muted-line">${matches.join('   ')}</span>`);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      terminalWindow?.classList.add('terminal-hint');
      window.setTimeout(() => terminalWindow?.classList.remove('terminal-hint'), 420);
    }
  }
});

terminalWindow?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button, a, input')) return;
  terminalInput?.focus();
});

$$('[data-terminal-command]').forEach((button) => {
  button.addEventListener('click', () => {
    const command = button.dataset.terminalCommand;
    if (terminalWindow) scrollToTarget(terminalWindow);
    setTimeout(() => runTerminalCommand(command), 220);
  });
});

// =========================================================
// WhatBroke? analysis sequence
// =========================================================
const wbDemo = $('#whatbroke-demo');
const scenarioTabs = $$('.scenario-tab');
const wbRun = $('#run-analysis');
const wbOutput = $('#wb-output');
const wbRunState = $('#wb-run-state');
const wbSignal = $('#wb-signal');
const wbFields = {
  changeTime: $('#wb-time-change'), rebootTime: $('#wb-time-reboot'), failureTime: $('#wb-time-failure'),
  change: $('#wb-change'), failure: $('#wb-failure'), previous: $('#wb-prev-count')
};
const wbEventButtons = $$('[data-wb-event]');
const wbInspector = {
  label: $('#wb-inspector-label'),
  title: $('#wb-inspector-title'),
  copy: $('#wb-inspector-copy')
};

const wbScenarios = {
  wifi: {
    changeTime: '09:14', rebootTime: '09:22', failureTime: '09:27', change: 'linux-firmware upgraded', failure: 'mt7921e timeout', previous: '15', signal: 'New in visible history',
    events: {
      change: { label: 'EVENT 01 · PACKAGE CHANGE', title: 'linux-firmware upgraded', copy: 'Pacman recorded a firmware package upgrade before the first visible Wi‑Fi failure.' },
      reboot: { label: 'EVENT 02 · BOOT BOUNDARY', title: 'system restarted', copy: 'The machine rebooted after the package change, creating a clean before/after boundary for comparison.' },
      failure: { label: 'EVENT 03 · NEW FAILURE', title: 'mt7921e timeout', copy: 'The Wi‑Fi driver timeout appears in the target boot and is absent from the selected earlier boots.' }
    },
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">mt7921e: Timeout for driver own</span>\n\ncurrent boot      <span class="term-good">17 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\nlinux-firmware    upgraded\nlinux             upgraded\nNetworkManager    upgraded\n\n<span class="term-note">Candidate changes ranked. The engineer makes the call.</span>`
  },
  service: {
    changeTime: '14:03', rebootTime: '14:11', failureTime: '14:12', change: 'docker upgraded', failure: 'docker.service failed', previous: '8', signal: 'Service failure appeared after update',
    events: {
      change: { label: 'EVENT 01 · PACKAGE CHANGE', title: 'docker upgraded', copy: 'A Docker package change is recorded before the service begins failing in the next boot.' },
      reboot: { label: 'EVENT 02 · BOOT BOUNDARY', title: 'system restarted', copy: 'The reboot separates the package transaction from the first failed service start.' },
      failure: { label: 'EVENT 03 · SERVICE FAILURE', title: 'docker.service failed', copy: 'systemd reports a new exit-code failure for docker.service compared with the selected earlier boots.' }
    },
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">docker.service: Failed with result exit-code</span>\n\ncurrent boot      <span class="term-good">4 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\ndocker            upgraded\ncontainerd        upgraded\nrunc              upgraded\n\n<span class="term-note">Candidate changes ranked for the engineer to judge.</span>`
  },
  package: {
    changeTime: '18:41', rebootTime: '18:49', failureTime: '18:53', change: 'openssl upgraded', failure: 'shared library error', previous: '10', signal: 'New application failure signature',
    events: {
      change: { label: 'EVENT 01 · PACKAGE CHANGE', title: 'openssl upgraded', copy: 'A shared-library package upgrade appears in the bounded change window before the application failure.' },
      reboot: { label: 'EVENT 02 · BOOT BOUNDARY', title: 'system restarted', copy: 'The reboot provides the point where the changed runtime environment becomes active.' },
      failure: { label: 'EVENT 03 · APPLICATION FAILURE', title: 'shared library error', copy: 'The target boot contains a new loader failure signature that was not observed in the selected baseline boots.' }
    },
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">myapp: error while loading shared libraries</span>\n\ncurrent boot      <span class="term-good">6 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\nopenssl           upgraded\nglibc             upgraded\nca-certificates   upgraded\n\n<span class="term-note">Candidate changes ranked for investigation.</span>`
  }
};
let currentScenario = 'wifi';
let wbTimers = [];
let wbTimeline = null;

function clearWbTimers() {
  wbTimers.forEach(window.clearTimeout);
  wbTimers = [];
  if (wbTimeline) {
    wbTimeline.kill();
    wbTimeline = null;
  }
}

function activateRovingTab(tabs, activeTab, panel) {
  tabs.forEach((tab) => {
    const active = tab === activeTab;
    tab.tabIndex = active ? 0 : -1;
    tab.setAttribute('aria-selected', String(active));
  });
  if (panel && activeTab?.id) panel.setAttribute('aria-labelledby', activeTab.id);
}

function wireRovingTabKeyboard(tabs) {
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else nextIndex = (index - 1 + tabs.length) % tabs.length;
      const next = tabs[nextIndex];
      next?.focus();
      next?.click();
    });
  });
}

function inspectWbEvent(eventKey, { focus = false } = {}) {
  const scenario = wbScenarios[currentScenario];
  const eventData = scenario?.events?.[eventKey];
  if (!eventData) return;
  wbEventButtons.forEach((button) => {
    const active = button.dataset.wbEvent === eventKey;
    button.classList.toggle('active-step', active);
    button.setAttribute('aria-pressed', String(active));
    if (active && focus) button.focus({ preventScroll: true });
  });
  if (wbInspector.label) wbInspector.label.textContent = eventData.label;
  if (wbInspector.title) wbInspector.title.textContent = eventData.title;
  if (wbInspector.copy) wbInspector.copy.textContent = eventData.copy;
}

function renderWbScenario(name) {
  const scenario = wbScenarios[name];
  if (!scenario) return;
  currentScenario = name;
  Object.entries(wbFields).forEach(([key, node]) => { if (node) node.textContent = scenario[key]; });
  if (wbSignal) wbSignal.textContent = scenario.signal;
  if (wbOutput) wbOutput.innerHTML = scenario.output;
  if (wbRunState) wbRunState.textContent = 'ready';
  const activeTab = scenarioTabs.find((tab) => tab.dataset.scenario === name);
  scenarioTabs.forEach((tab) => tab.classList.toggle('active', tab === activeTab));
  activateRovingTab(scenarioTabs, activeTab, $('#wb-stage'));
  inspectWbEvent('change');
}

wbEventButtons.forEach((button) => {
  button.addEventListener('click', () => inspectWbEvent(button.dataset.wbEvent));
});

wireRovingTabKeyboard(scenarioTabs);
scenarioTabs.forEach((tab) => tab.addEventListener('click', () => {
  clearWbTimers();
  wbDemo?.classList.remove('running', 'complete');
  if (wbRun) wbRun.disabled = false;
  renderWbScenario(tab.dataset.scenario);
}));

function runWbSequence(scenario) {
  clearWbTimers();
  if (!scenario || !wbDemo || !wbOutput || !wbRunState) return;
  wbRun.disabled = true;
  wbDemo.classList.remove('complete');
  wbDemo.classList.add('running');

  // Deterministic sequence: scan → ordered events → failure isolation → preceding changes → conclusion.
  const step0 = () => {
    wbRunState.textContent = 'scan started · collecting journal…';
    wbOutput.textContent = 'collecting boot history...\nreading priority 0–3 journal records...';
    inspectWbEvent('change');
  };
  const step1 = () => {
    wbRunState.textContent = 'step 1/4 · scanning system events';
    inspectWbEvent('change');
    wbOutput.textContent += '\nreading package history...';
  };
  const step2 = () => {
    wbRunState.textContent = 'step 2/4 · crossing boot boundary';
    inspectWbEvent('reboot');
    wbOutput.textContent += '\nresolving target boot and baseline boots...';
  };
  const step3 = () => {
    wbRunState.textContent = 'step 3/4 · isolating newly observed failure';
    inspectWbEvent('failure');
    wbOutput.textContent += `\ncomparing current boot against ${scenario.previous} earlier boots...`;
  };
  const step4 = () => {
    wbRunState.textContent = 'step 4/4 · correlating preceding changes';
    inspectWbEvent('failure');
    wbOutput.textContent += '\nranking package changes before the failure signature...';
  };
  const finish = () => {
    wbRunState.textContent = 'analysis complete · evidence conclusion';
    wbOutput.innerHTML = scenario.output;
    wbDemo.classList.remove('running');
    wbDemo.classList.add('complete');
    wbRun.disabled = false;
    inspectWbEvent('failure');
    window.setTimeout(() => wbDemo.classList.remove('complete'), 1200);
  };

  step0();

  // The verified engine drives the timeline; timers remain the fallback.
  if (hasMotionEngine() && Motion.tier !== 'static') {
    wbTimeline = window.gsap.timeline();
    wbTimeline
      .call(step1, null, 0.44)
      .call(step2, null, 0.9)
      .call(step3, null, 1.36)
      .call(step4, null, 1.78)
      .call(finish, null, 2.15);
    return;
  }

  wbTimers.push(window.setTimeout(step1, 440));
  wbTimers.push(window.setTimeout(step2, 900));
  wbTimers.push(window.setTimeout(step3, 1360));
  wbTimers.push(window.setTimeout(step4, 1780));
  wbTimers.push(window.setTimeout(finish, 2150));
}

wbRun?.addEventListener('click', () => runWbSequence(wbScenarios[currentScenario]));

// Supporting projects are presented as uniform, static cards (no in-card demos),
// so the bespoke alignment, SQL, and movie widget scripts were removed here.

// =========================================================
// Copy email
// =========================================================
$$('.copy-email').forEach((button) => {
  button.addEventListener('click', async () => {
    const email = button.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
});
