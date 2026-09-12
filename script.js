const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const header = $('.site-header');
const menuToggle = $('.menu-toggle');
const navLinks = $('#nav-links');
const navAnchors = $$('.nav-center a[href^="#"]');
const glow = $('.cursor-glow');
const toast = $('#toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const isFinePointer = window.matchMedia('(pointer:fine)').matches;

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

function pulseTarget(target) {
  if (!target) return;
  target.classList.remove('project-targeted');
  requestAnimationFrame(() => {
    target.classList.add('project-targeted');
    window.setTimeout(() => target.classList.remove('project-targeted'), 1200);
  });
}

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

// If the user takes control mid-animation, stop immediately instead of fighting their input.
window.addEventListener('wheel', cancelSmoothScroll, { passive: true });
window.addEventListener('touchstart', cancelSmoothScroll, { passive: true });
document.addEventListener('keydown', (event) => {
  if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) cancelSmoothScroll();
});

const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = !navLinks?.classList.contains('open');
  navLinks?.classList.toggle('open', open);
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

navAnchors.forEach((link) => link.addEventListener('click', () => {
  navLinks?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

function closeMobileMenu({ restoreFocus = false } = {}) {
  const wasOpen = navLinks?.classList.contains('open');
  navLinks?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (restoreFocus && wasOpen) menuToggle?.focus();
}

document.addEventListener('pointerdown', (event) => {
  if (!navLinks?.classList.contains('open')) return;
  if (event.target.closest('.nav-center, .menu-toggle')) return;
  closeMobileMenu();
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks?.classList.contains('open')) closeMobileMenu({ restoreFocus: true });
});

// Route every same-page hash link through one smooth-scrolling system.
// This keeps the brand, nav, CTA links and footer navigation feeling identical.
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const href = anchor.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.querySelector(href);
  if (!target) return;

  event.preventDefault();
  navLinks?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  scrollToTarget(target);

  if (history.replaceState) history.replaceState(null, '', href);
});

$$('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => scrollToTarget(button.dataset.scroll));
});

const reduceMotion = reduceMotionQuery.matches;
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -35px' });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 55}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const sections = $$('main section[id]');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));
}

if (isFinePointer && glow && !reduceMotion) {
  window.addEventListener('mousemove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.style.opacity = '1';
  }, { passive: true });
}

const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = new Date().getFullYear();
const terminalDate = $('#terminal-date');
if (terminalDate) terminalDate.textContent = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

// ----------------------------
// Interactive hero terminal
// ----------------------------
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
    '<span class="term-output"><strong>projects</strong>    jump to public projects</span>',
    '<span class="term-output"><strong>whatbroke</strong>   open the flagship Linux tool</span>',
    '<span class="term-output"><strong>story</strong>       why I built it</span>',
    '<span class="term-output"><strong>skills</strong>      inspect technical stack</span>',
    '<span class="term-output"><strong>experience</strong>  professional timeline</span>',
    '<span class="term-output"><strong>about</strong>       about / developer.json</span>',
    '<span class="term-output"><strong>movie</strong>       movie dashboard project</span>',
    '<span class="term-output"><strong>sql</strong>         NL → SQL project</span>',
    '<span class="term-output"><strong>pronunciation</strong> audio alignment project</span>',
    '<span class="term-output"><strong>contact</strong>     contact options</span>',
    '<span class="term-output"><strong>github</strong>      open GitHub</span>',
    '<span class="term-output"><strong>resume</strong>      open résumé</span>',
    '<span class="term-output"><strong>clear</strong>       clear terminal</span>'
  ],
  whoami: () => [
    '<span class="term-output">Karthik Saligram — Software Developer</span>',
    '<span class="term-output muted-line">Backend · Cloud · Linux · Full-stack · Developer tooling</span>'
  ],
  projects: () => {
    setTimeout(() => scrollToTarget('#projects'), 180);
    return ['<span class="term-output">Opening <strong>/projects</strong>...</span>'];
  },
  story: () => [
    '<span class="term-output">Most of my side projects start with an annoyance, not a pitch deck.</span>',
    '<span class="term-output">What Broke? started after I got tired of manually comparing journal logs and package changes on my own Arch machine.</span>',
    '<span class="term-output muted-line">If I have to debug the same kind of problem twice, I start wondering whether it should be a tool.</span>'
  ],
  whatbroke: () => {
    setTimeout(() => {
      scrollToTarget('#projects');
      window.setTimeout(() => $('#whatbroke-demo')?.classList.add('attention'), 450);
      window.setTimeout(() => $('#whatbroke-demo')?.classList.remove('attention'), 1450);
    }, 180);
    return [
      '<span class="term-output"><strong>What Broke?</strong></span>',
      '<span class="term-output">Linux system-change forensics CLI.</span>',
      '<span class="term-output muted-line">Comparing boots → finding new errors → showing preceding changes.</span>'
    ];
  },
  skills: () => {
    setTimeout(() => scrollToTarget('#stack'), 180);
    return ['<span class="term-output">Opening <strong>/stack</strong>...</span>'];
  },
  stack: () => terminalCommands.skills(),
  experience: () => {
    setTimeout(() => scrollToTarget('#experience'), 180);
    return ['<span class="term-output">Opening <strong>/experience</strong>...</span>'];
  },
  about: () => {
    setTimeout(() => scrollToTarget('#about'), 180);
    return ['<span class="term-output">Opening <strong>developer.json</strong>...</span>'];
  },
  movie: () => {
    setTimeout(() => {
      const target = $('#project-movie');
      scrollToTarget(target);
      window.setTimeout(() => pulseTarget(target), 480);
    }, 160);
    return ['<span class="term-output">Opening <strong>Movie Database Dashboard</strong>...</span>'];
  },
  sql: () => {
    setTimeout(() => {
      const target = $('#project-nlsql');
      scrollToTarget(target);
      window.setTimeout(() => pulseTarget(target), 480);
    }, 160);
    return ['<span class="term-output">Opening <strong>NL → SQL Translation Layer</strong>...</span>'];
  },
  pronunciation: () => {
    setTimeout(() => {
      const target = $('#project-pronunciation');
      scrollToTarget(target);
      window.setTimeout(() => pulseTarget(target), 480);
    }, 160);
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
    window.open('./assets/Karthik_Resume_New.pdf', '_blank', 'noopener,noreferrer');
    return ['<span class="term-output">Opening résumé ↗</span>'];
  },
  pwd: () => ['<span class="term-output">/home/karthik/portfolio</span>'],
  ls: () => ['<span class="term-output"><strong>projects/</strong> &nbsp; <strong>experience/</strong> &nbsp; <strong>stack/</strong> &nbsp; about.json &nbsp; resume.pdf</span>'],
  orion: () => {
    unlockConstellation('terminal');
    return [
      '<span class="term-output">background://orion <strong>unlocked</strong></span>',
      '<span class="term-output muted-line">Some systems have undocumented features.</span>'
    ];
  },
  stars: () => terminalCommands.orion(),
  '?': () => terminalCommands.help(),
  clear: () => []
};

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
}

terminalForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  runTerminalCommand(terminalInput.value);
  terminalInput.value = '';
});

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

// ----------------------------
// Command palette
// ----------------------------
const palette = $('#command-palette');
const paletteSearch = $('#palette-search');
const paletteResults = $('#palette-results');
const paletteTrigger = $('.palette-trigger');
const paletteBackdrop = $('.palette-backdrop');
let paletteSelection = 0;
let palettePreviousFocus = null;

const paletteActions = [
  { icon: '01', label: 'View projects', description: 'Public projects and interactive demos', hint: 'projects', action: () => scrollToTarget('#projects') },
  { icon: 'WB', label: 'Open What Broke?', description: 'Linux system-change forensics CLI', hint: 'flagship', action: () => scrollToTarget('#projects') },
  { icon: '02', label: 'View experience', description: 'Professional engineering timeline', hint: 'work', action: () => scrollToTarget('#experience') },
  { icon: '03', label: 'Inspect stack', description: 'Systems, backend, cloud, frontend, data', hint: 'skills', action: () => scrollToTarget('#stack') },
  { icon: 'GH', label: 'Open GitHub', description: 'github.com/karthik-07', hint: '↗', action: () => window.open('https://github.com/karthik-07', '_blank', 'noopener,noreferrer') },
  { icon: 'LI', label: 'Open LinkedIn', description: 'Professional profile', hint: '↗', action: () => window.open('https://www.linkedin.com/in/karthik-saligram-17968518b/', '_blank', 'noopener,noreferrer') },
  { icon: 'CV', label: 'View résumé', description: 'Open current résumé PDF', hint: '↗', action: () => window.open('./assets/Karthik_Resume_New.pdf', '_blank', 'noopener,noreferrer') },
  { icon: '@', label: 'Contact Karthik', description: 'karthikvs216@gmail.com', hint: 'email', action: () => { window.location.href = 'mailto:karthikvs216@gmail.com'; } }
];

function filteredPaletteActions() {
  const query = (paletteSearch?.value || '').trim().toLowerCase();
  if (!query) return paletteActions;
  return paletteActions.filter((item) => `${item.label} ${item.description} ${item.hint}`.toLowerCase().includes(query));
}

function renderPalette() {
  if (!paletteResults) return;
  const items = filteredPaletteActions();
  paletteSelection = Math.max(0, Math.min(paletteSelection, items.length - 1));
  if (!items.length) {
    paletteResults.innerHTML = '<div class="palette-empty">No matching command.</div>';
    return;
  }
  paletteResults.innerHTML = items.map((item, index) => `
    <button class="palette-item ${index === paletteSelection ? 'selected' : ''}" type="button" data-palette-index="${index}">
      <span class="palette-icon">${item.icon}</span>
      <span><strong>${item.label}</strong><small>${item.description}</small></span>
      <span>${item.hint}</span>
    </button>`).join('');

  $$('[data-palette-index]', paletteResults).forEach((button) => {
    button.addEventListener('click', () => executePaletteAction(Number(button.dataset.paletteIndex)));
    button.addEventListener('mouseenter', () => {
      paletteSelection = Number(button.dataset.paletteIndex);
      renderPalette();
    });
  });
}

function openPalette() {
  if (!palette) return;
  palettePreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  palette.classList.add('open');
  palette.setAttribute('aria-hidden', 'false');
  paletteTrigger?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('palette-open');
  paletteSelection = 0;
  if (paletteSearch) paletteSearch.value = '';
  renderPalette();
  requestAnimationFrame(() => paletteSearch?.focus());
}

function closePalette({ restoreFocus = true } = {}) {
  if (!palette) return;
  palette.classList.remove('open');
  palette.setAttribute('aria-hidden', 'true');
  paletteTrigger?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('palette-open');
  if (restoreFocus && palettePreviousFocus?.isConnected) palettePreviousFocus.focus();
  palettePreviousFocus = null;
}

function executePaletteAction(index) {
  const items = filteredPaletteActions();
  const item = items[index];
  if (!item) return;
  closePalette();
  setTimeout(item.action, 80);
}

paletteTrigger?.addEventListener('click', openPalette);
paletteBackdrop?.addEventListener('click', closePalette);
paletteSearch?.addEventListener('input', () => { paletteSelection = 0; renderPalette(); });
paletteSearch?.addEventListener('keydown', (event) => {
  const items = filteredPaletteActions();
  if (event.key === 'ArrowDown') { event.preventDefault(); paletteSelection = Math.min(items.length - 1, paletteSelection + 1); renderPalette(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); paletteSelection = Math.max(0, paletteSelection - 1); renderPalette(); }
  if (event.key === 'Enter') { event.preventDefault(); executePaletteAction(paletteSelection); }
  if (event.key === 'Escape') closePalette();
});

palette?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' || !palette.classList.contains('open')) return;
  const focusables = $$('input, button:not([disabled]), a[href], [tabindex]', palette)
    .filter((node) => node.tabIndex >= 0 && !node.hasAttribute('hidden') && node.getClientRects().length);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    palette?.classList.contains('open') ? closePalette() : openPalette();
  } else if (event.key === 'Escape' && palette?.classList.contains('open')) {
    closePalette();
  }
});

// ----------------------------
// What Broke? interactive demo
// ----------------------------
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
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">mt7921e: Timeout for driver own</span>\n\ncurrent boot      <span class="term-good">17 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\nlinux-firmware    upgraded\nlinux             upgraded\nNetworkManager    upgraded\n\n<span class="term-note">Evidence shown. Cause not assumed.</span>`
  },
  service: {
    changeTime: '14:03', rebootTime: '14:11', failureTime: '14:12', change: 'docker upgraded', failure: 'docker.service failed', previous: '8', signal: 'Service failure appeared after update',
    events: {
      change: { label: 'EVENT 01 · PACKAGE CHANGE', title: 'docker upgraded', copy: 'A Docker package change is recorded before the service begins failing in the next boot.' },
      reboot: { label: 'EVENT 02 · BOOT BOUNDARY', title: 'system restarted', copy: 'The reboot separates the package transaction from the first failed service start.' },
      failure: { label: 'EVENT 03 · SERVICE FAILURE', title: 'docker.service failed', copy: 'systemd reports a new exit-code failure for docker.service compared with the selected earlier boots.' }
    },
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">docker.service: Failed with result exit-code</span>\n\ncurrent boot      <span class="term-good">4 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\ndocker            upgraded\ncontainerd        upgraded\nrunc              upgraded\n\n<span class="term-note">Temporal candidates, not a diagnosis.</span>`
  },
  package: {
    changeTime: '18:41', rebootTime: '18:49', failureTime: '18:53', change: 'openssl upgraded', failure: 'shared library error', previous: '10', signal: 'New application failure signature',
    events: {
      change: { label: 'EVENT 01 · PACKAGE CHANGE', title: 'openssl upgraded', copy: 'A shared-library package upgrade appears in the bounded change window before the application failure.' },
      reboot: { label: 'EVENT 02 · BOOT BOUNDARY', title: 'system restarted', copy: 'The reboot provides the point where the changed runtime environment becomes active.' },
      failure: { label: 'EVENT 03 · APPLICATION FAILURE', title: 'shared library error', copy: 'The target boot contains a new loader failure signature that was not observed in the selected baseline boots.' }
    },
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">myapp: error while loading shared libraries</span>\n\ncurrent boot      <span class="term-good">6 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\nopenssl           upgraded\nglibc             upgraded\nca-certificates   upgraded\n\n<span class="term-note">A starting point for investigation.</span>`
  }
}
let currentScenario = 'wifi';
let wbTimers = [];

function clearWbTimers() {
  wbTimers.forEach(window.clearTimeout);
  wbTimers = [];
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
  wbDemo?.classList.remove('running');
  if (wbRun) wbRun.disabled = false;
  renderWbScenario(tab.dataset.scenario);
}));

wbRun?.addEventListener('click', () => {
  clearWbTimers();
  const scenario = wbScenarios[currentScenario];
  if (!scenario || !wbDemo || !wbOutput || !wbRunState) return;
  wbRun.disabled = true;
  wbDemo.classList.add('running');
  wbRunState.textContent = 'collecting journal…';
  wbOutput.textContent = 'collecting boot history...\nreading priority 0–3 journal records...';
  inspectWbEvent('change');

  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'reading change history…';
    inspectWbEvent('change');
    wbOutput.textContent += '\nreading package history...';
  }, 420));
  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'crossing boot boundary…';
    inspectWbEvent('reboot');
    wbOutput.textContent += '\nresolving target boot and baseline boots...';
  }, 900));
  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'comparing signatures…';
    inspectWbEvent('failure');
    wbOutput.textContent += `\ncomparing current boot against ${scenario.previous} earlier boots...`;
  }, 1380));
  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'analysis complete';
    wbOutput.innerHTML = scenario.output;
    wbDemo.classList.remove('running');
    wbRun.disabled = false;
    inspectWbEvent('failure');
  }, 2050));
});

// ----------------------------
// Pronunciation demo
// ----------------------------
const alignmentDemo = $('#alignment-demo');
const runAlignment = $('#run-alignment');
const alignmentFill = $('#alignment-fill');
const alignmentScore = $('#alignment-score');
const alignmentStatus = $('#alignment-status');

runAlignment?.addEventListener('click', () => {
  if (!alignmentDemo || !alignmentFill || !alignmentScore || !alignmentStatus) return;
  alignmentDemo.classList.remove('running');
  void alignmentDemo.offsetWidth;
  alignmentDemo.classList.add('running');
  alignmentFill.style.width = '0%';
  alignmentScore.textContent = '…';
  alignmentStatus.textContent = 'Aligning MFCC sequences';
  runAlignment.disabled = true;
  setTimeout(() => { alignmentFill.style.width = '82%'; }, 80);
  setTimeout(() => {
    alignmentScore.textContent = '0.82';
    alignmentStatus.textContent = 'Aligned · timing drift near phrase end';
    runAlignment.disabled = false;
  }, 1400);
});

// ----------------------------
// NL → SQL illustrative demo
// ----------------------------
const sqlQuestion = $('#sql-question');
const sqlOutput = $('#sql-output');
const translateSql = $('#translate-sql');

const sqlExamples = {
  'show patients admitted this month': `<code><span class="sql-keyword">SELECT</span> patient_id, admitted_at\n<span class="sql-keyword">FROM</span> <span class="sql-table">admissions</span>\n<span class="sql-keyword">WHERE</span> admitted_at &gt;= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);</code>`,
  'count appointments by department': `<code><span class="sql-keyword">SELECT</span> department_id, COUNT(*) <span class="sql-keyword">AS</span> appointment_count\n<span class="sql-keyword">FROM</span> <span class="sql-table">appointments</span>\n<span class="sql-keyword">GROUP BY</span> department_id\n<span class="sql-keyword">ORDER BY</span> appointment_count <span class="sql-keyword">DESC</span>;</code>`,
  'show the 5 most recent lab results': `<code><span class="sql-keyword">SELECT TOP</span> 5 patient_id, test_name, result_value, result_date\n<span class="sql-keyword">FROM</span> <span class="sql-table">lab_results</span>\n<span class="sql-keyword">ORDER BY</span> result_date <span class="sql-keyword">DESC</span>;</code>`
};

$$('[data-sql-example]').forEach((button) => button.addEventListener('click', () => {
  if (sqlQuestion) sqlQuestion.value = button.dataset.sqlExample;
  translateSql?.click();
}));

sqlQuestion?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    translateSql?.click();
  }
});

translateSql?.addEventListener('click', () => {
  if (!sqlQuestion || !sqlOutput) return;
  const key = sqlQuestion.value.trim().toLowerCase();
  translateSql.disabled = true;
  const original = translateSql.textContent;
  translateSql.textContent = 'Validating schema…';
  sqlOutput.textContent = '-- translating natural language\n-- checking allowed tables / columns...';
  setTimeout(() => {
    sqlOutput.innerHTML = sqlExamples[key] || `<code><span class="sql-keyword">-- illustrative demo</span>\nQuestion understood, but this static portfolio only renders the bundled examples.\nTry one of the buttons above.</code>`;
    translateSql.textContent = original;
    translateSql.disabled = false;
  }, 650);
});

// ----------------------------
// Movie demo
// ----------------------------
const movieSearch = $('#movie-search');
const movieResults = $$('.movie-result');
const movieEmpty = $('#movie-empty');
const movieDetail = {
  meta: $('#movie-detail-meta'), title: $('#movie-detail-title'), copy: $('#movie-detail-copy'), tags: $('#movie-detail-tags')
};
const movieData = {
  interstellar: { meta: '2014 · SCI‑FI', title: 'Interstellar', copy: 'A compact sample of the browse-and-select interaction from the older movie dashboard project.', tags: ['Search', 'API data', 'Responsive UI'] },
  'dark-knight': { meta: '2008 · ACTION', title: 'The Dark Knight', copy: 'Selecting a result updates the detail view without leaving the project card — the same interaction pattern the original dashboard was built around.', tags: ['Filtering', 'Movie metadata', 'Card UI'] },
  arrival: { meta: '2016 · SCI‑FI', title: 'Arrival', copy: 'The portfolio version keeps the interaction local and lightweight while the linked project shows the original movie-discovery dashboard.', tags: ['JavaScript', 'API-driven', 'Responsive'] }
};

function selectMovie(key, { focus = false } = {}) {
  const data = movieData[key];
  if (!data) return;
  movieResults.forEach((result) => {
    const active = result.dataset.movie === key;
    result.classList.toggle('active', active);
    result.setAttribute('aria-selected', String(active));
    if (active && focus) result.focus({ preventScroll: true });
  });
  if (movieDetail.meta) movieDetail.meta.textContent = data.meta;
  if (movieDetail.title) movieDetail.title.textContent = data.title;
  if (movieDetail.copy) movieDetail.copy.textContent = data.copy;
  if (movieDetail.tags) movieDetail.tags.innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join('');
}

movieSearch?.addEventListener('input', () => {
  const query = movieSearch.value.trim().toLowerCase();
  let visible = 0;
  let firstVisible = null;
  movieResults.forEach((result) => {
    const match = result.dataset.title.toLowerCase().includes(query);
    result.classList.toggle('hidden', !match);
    if (match) {
      visible += 1;
      if (!firstVisible) firstVisible = result;
    }
  });
  if (movieEmpty) movieEmpty.hidden = visible !== 0;
  if (firstVisible && !movieResults.some((result) => result.classList.contains('active') && !result.classList.contains('hidden'))) {
    selectMovie(firstVisible.dataset.movie);
  }
});
movieResults.forEach((result) => result.addEventListener('click', () => selectMovie(result.dataset.movie)));

// ----------------------------
// Experience timeline — mirrors current resume
// ----------------------------
const experienceData = {
  orbmedic: {
    period: 'JULY 2025 — PRESENT', location: 'OTTAWA, ON', title: 'Full Stack Developer', company: 'Orbmedic',
    bullets: [
      'Owned end-to-end development and beta readiness of a wearable-health platform spanning backend ingestion, physiological signal processing, web interfaces, and mobile applications.',
      'Designed backend data pipelines for ingesting and processing ECG, PPG, HRV, and other wearable sensor data, including integration with third-party ECG hardware producing 1 kHz signal streams.',
      'Developed algorithms for establishing longitudinal physiological baselines and identifying deviations in wearable sensor data.',
      'Developed clinician-facing interfaces using React/Next.js and Flutter mobile and smartwatch applications for physiological data collection and visualization.',
      'Worked with containerized backend services using Docker, Celery, MongoDB, Redis, and Nginx to support production deployment and application processing workflows.'
    ],
    tags: ['React / Next.js', 'Flutter', 'Docker', 'Celery', 'MongoDB', 'Redis', 'Nginx']
  },
  fairwinds: {
    period: 'APRIL 2025 — MARCH 2026', location: 'OTTAWA, ON', title: 'Full Stack Developer', company: 'Fair Winds Analytics',
    bullets: [
      'Developed full-stack applications using React/Next.js with backend services in Python and Node.js.',
      'Designed RESTful APIs for data storage, retrieval, and third-party integrations using OpenAPI standards.',
      'Built production features using PostgreSQL, Docker, authentication services, and cloud-based application infrastructure.',
      'Deployed frontend and backend services on AWS and implemented GitLab CI/CD pipelines for automated deployment workflows.'
    ],
    tags: ['React / Next.js', 'Python', 'Node.js', 'OpenAPI', 'PostgreSQL', 'Docker', 'AWS', 'GitLab CI/CD']
  },
  manipal: {
    period: 'SEPTEMBER 2021 — AUGUST 2022', location: 'KARNATAKA, INDIA', title: 'Full Stack Developer', company: 'Manipal School of Information Sciences',
    bullets: [
      'Built an internal ASP.NET and SQL academic performance and research management platform for MAHE, used by department heads and research faculty to track grants, research activity, and PhD supervision.',
      'Developed a points-based evaluation system using research outcomes, grant status, and PhD supervision metrics to support faculty performance, promotion, tenure, and compensation reviews.',
      'Implemented authentication, authorization, and SQL-backed data workflows for internal faculty and administrative users.'
    ],
    tags: ['ASP.NET', 'SQL', 'Authentication', 'Authorization']
  }
};

const expTabs = $$('.timeline-tab');
const expNodes = {
  period: $('#exp-period'), location: $('#exp-location'), title: $('#exp-title'), company: $('#exp-company'), bullets: $('#exp-bullets'), tags: $('#exp-tags')
};
function renderExperience(key) {
  const data = experienceData[key];
  if (!data) return;
  if (expNodes.period) expNodes.period.textContent = data.period;
  if (expNodes.location) expNodes.location.textContent = data.location;
  if (expNodes.title) expNodes.title.textContent = data.title;
  if (expNodes.company) expNodes.company.textContent = data.company;
  if (expNodes.bullets) expNodes.bullets.innerHTML = data.bullets.map((item) => `<li>${item}</li>`).join('');
  if (expNodes.tags) expNodes.tags.innerHTML = data.tags.map((item) => `<span>${item}</span>`).join('');
  const activeTab = expTabs.find((tab) => tab.dataset.exp === key);
  expTabs.forEach((tab) => tab.classList.toggle('active', tab === activeTab));
  activateRovingTab(expTabs, activeTab, $('#experience-panel'));
}
wireRovingTabKeyboard(expTabs);
expTabs.forEach((tab) => tab.addEventListener('click', () => renderExperience(tab.dataset.exp)));

// ----------------------------
// Interactive stack
// ----------------------------
const stackData = {
  systems: {
    label: 'SYSTEMS', title: 'I like knowing what the machine is actually doing.',
    description: 'Linux is my daily environment. My resume stack includes Arch Linux, systemd, Docker, and Nginx alongside backend and cloud tooling.',
    tools: ['Linux', 'Arch Linux', 'systemd', 'Docker', 'Nginx'], projects: [{ label: 'What Broke?', target: '#project-whatbroke' }], tags: ['linux', 'systems']
  },
  backend: {
    label: 'BACKEND', title: 'APIs, workers, and the logic behind the interface.',
    description: 'My current resume highlights Python, JavaScript / Node.js, REST APIs, OpenAPI, Celery, and ASP.NET across backend and full-stack work.',
    tools: ['Python', 'Node.js', 'REST APIs', 'OpenAPI', 'Celery', 'ASP.NET'], projects: [{ label: 'NL → SQL', target: '#project-nlsql' }, { label: 'What Broke?', target: '#project-whatbroke' }], tags: ['backend', 'python']
  },
  cloud: {
    label: 'CLOUD & DEVOPS', title: 'Ship it, automate it, know where it runs.',
    description: 'AWS, Azure, Docker, GitLab CI/CD, Git, and GitHub are the cloud and delivery tools listed on my current resume.',
    tools: ['AWS', 'Azure', 'Docker', 'GitLab CI/CD', 'Git', 'GitHub'], projects: [{ label: 'Professional experience', target: '#experience' }], tags: ['cloud']
  },
  frontend: {
    label: 'FRAMEWORKS', title: 'Interfaces are useful when they make the system easier to understand.',
    description: 'React, Next.js, Flutter, and ASP.NET are the application frameworks on my current resume, backed by JavaScript, Dart, and C#.',
    tools: ['React', 'Next.js', 'Flutter', 'JavaScript', 'Dart', 'C#'], projects: [{ label: 'Movie Dashboard', target: '#project-movie' }], tags: ['frontend', 'javascript']
  },
  data: {
    label: 'DATABASES & DATA', title: 'Structure first, then query it cleanly.',
    description: 'PostgreSQL, MongoDB, Redis, and SQL are the data technologies listed on my current resume.',
    tools: ['PostgreSQL', 'MongoDB', 'Redis', 'SQL'], projects: [{ label: 'NL → SQL', target: '#project-nlsql' }], tags: ['data', 'sql']
  }
};

const stackTabs = $$('.stack-tab');
const stackLabel = $('#stack-label');
const stackTitle = $('#stack-title');
const stackDescription = $('#stack-description');
const stackNodes = $('#stack-nodes');
const stackProjects = $('#stack-projects');
const projectCards = $$('[data-project]');

function renderStack(key) {
  const data = stackData[key];
  if (!data) return;
  stackLabel.textContent = data.label;
  stackTitle.textContent = data.title;
  stackDescription.textContent = data.description;
  stackNodes.innerHTML = data.tools.map((tool) => `<button type="button" data-tool="${tool.replace(/"/g, '&quot;')}">${tool}</button>`).join('');
  $$('[data-tool]', stackNodes).forEach((button) => button.addEventListener('click', () => {
    $$('[data-tool]', stackNodes).forEach((item) => item.classList.toggle('active-tool', item === button));
    showToast(`${button.dataset.tool} · ${data.label.toLowerCase()} stack`);
  }));
  stackProjects.innerHTML = data.projects.map((project) => `<button type="button" data-project-target="${project.target}">${project.label}</button>`).join('');
  $$('[data-project-target]', stackProjects).forEach((button) => button.addEventListener('click', () => {
    const target = $(button.dataset.projectTarget);
    scrollToTarget(target);
    window.setTimeout(() => pulseTarget(target), 460);
  }));
  const activeTab = stackTabs.find((tab) => tab.dataset.stack === key);
  stackTabs.forEach((tab) => tab.classList.toggle('active', tab === activeTab));
  activateRovingTab(stackTabs, activeTab, $('#stack-view'));
  projectCards.forEach((card) => {
    const tags = (card.dataset.tags || '').split(' ');
    const relevant = data.tags.some((tag) => tags.includes(tag));
    card.classList.toggle('project-dimmed', !relevant);
  });
  window.setTimeout(() => projectCards.forEach((card) => card.classList.remove('project-dimmed')), 2200);
}
wireRovingTabKeyboard(stackTabs);
stackTabs.forEach((tab) => tab.addEventListener('click', () => renderStack(tab.dataset.stack)));

// ----------------------------
// Copy email
// ----------------------------
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

// ----------------------------
// Motion system + ambient background
// ----------------------------
const scrollProgressBar = $('#scroll-progress-bar');
let scrollTicking = false;

function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
  scrollProgressBar.style.transform = `scaleX(${progress})`;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollProgress);
}, { passive: true });
updateScrollProgress();

// Card-level interaction: clicking/focusing the body of a project card gives it a persistent selected state.
const interactiveProjectCards = $$('.interactive-project-card');
function toggleProjectCard(card) {
  interactiveProjectCards.forEach((item) => {
    if (item !== card) item.classList.remove('card-selected');
  });
  card.classList.toggle('card-selected');
}
interactiveProjectCards.forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button, input, textarea, select')) return;
    toggleProjectCard(card);
  });
  card.addEventListener('keydown', (event) => {
    if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    toggleProjectCard(card);
  });
});

// Cursor-following 3D response across every major portfolio card.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
  const tiltSurfaces = $$('.hero-terminal, .interactive-project-card, .experience-shell, .stack-console, .about-terminal, .contact-panel');

  const getTiltStrength = (surface) => {
    if (surface.classList.contains('hero-terminal')) return 3.8;
    if (surface.classList.contains('flagship')) return 3.4;
    if (surface.classList.contains('lab-card')) return 4.6;
    if (surface.classList.contains('about-terminal')) return 3.2;
    if (surface.classList.contains('stack-console')) return 2.8;
    if (surface.classList.contains('experience-shell')) return 2.5;
    return 2.2;
  };

  tiltSurfaces.forEach((surface) => {
    surface.classList.add('motion-surface');
    let frame = 0;

    surface.addEventListener('pointermove', (event) => {
      const clientX = event.clientX;
      const clientY = event.clientY;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = surface.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const maxTilt = getTiltStrength(surface);
        const ry = (x - 0.5) * maxTilt * 2;
        const rx = (0.5 - y) * maxTilt * 2;
        const px = (x - 0.5) * 8;
        const py = (y - 0.5) * 8;

        surface.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        surface.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
        surface.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        surface.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        surface.style.setProperty('--parallax-x', `${px.toFixed(2)}px`);
        surface.style.setProperty('--parallax-y', `${py.toFixed(2)}px`);
        surface.style.setProperty('--parallax-x-neg', `${(-px * 0.72).toFixed(2)}px`);
        surface.style.setProperty('--parallax-y-neg', `${(-py * 0.72).toFixed(2)}px`);
        surface.classList.add('is-hovered');
      });
    }, { passive: true });

    surface.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      surface.style.setProperty('--rx', '0deg');
      surface.style.setProperty('--ry', '0deg');
      surface.style.setProperty('--mx', '50%');
      surface.style.setProperty('--my', '50%');
      surface.style.setProperty('--parallax-x', '0px');
      surface.style.setProperty('--parallax-y', '0px');
      surface.style.setProperty('--parallax-x-neg', '0px');
      surface.style.setProperty('--parallax-y-neg', '0px');
      surface.classList.remove('is-hovered');
    });
  });

  // Small magnetic pull on high-intent controls. Movement is intentionally restrained.
  const magneticElements = $$('.button, .key-button, .nav-cta, .terminal-shortcuts button, .scenario-tab, .stack-tab');
  magneticElements.forEach((element) => {
    element.classList.add('magnetic');
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      element.style.setProperty('--mag-x', `${(dx * 0.085).toFixed(1)}px`);
      element.style.setProperty('--mag-y', `${(dy * 0.11).toFixed(1)}px`);
      element.classList.add('is-magnetized');
    }, { passive: true });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mag-x', '0px');
      element.style.setProperty('--mag-y', '0px');
      element.classList.remove('is-magnetized');
    });
  });
}

// Lightweight canvas network: decorative only, no libraries and no background worker.
// It reacts to the pointer, supports click ripples, and contains one intentionally undocumented easter egg.
let constellationUnlocked = false;
let constellationToastShown = false;

function unlockConstellation(source = 'pointer') {
  constellationUnlocked = true;
  if (!constellationToastShown) {
    constellationToastShown = true;
    showToast(source === 'terminal' ? 'Orion unlocked.' : 'Easter egg found: Orion');
  }
}

const ambientCanvas = $('#ambient-canvas');
if (ambientCanvas && !reduceMotion) {
  const ctx = ambientCanvas.getContext('2d', { alpha: true });
  if (!ctx) {
    ambientCanvas.classList.add('canvas-unavailable');
  } else {
    const pointer = {
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      vx: 0,
      vy: 0,
      active: false
    };

    let particles = [];
    let ripples = [];
    let driftStars = [];
    let shootingStars = [];
    let nextShootingStarAt = performance.now() + 1800 + Math.random() * 1200;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let canvasDpr = 1;
    let ambientFrame = 0;
    let ambientRunning = true;
    let constellationReveal = 0;
    let constellationHoverStartedAt = 0;
    let pointerTrail = [];
    let lastAmbientDraw = 0;
    const saveData = Boolean(navigator.connection?.saveData);
    const lowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;

    const orion = {
      name: 'ORION',
      stars: [
        { x: -0.28, y: -0.32, r: 2.15 },
        { x:  0.25, y: -0.30, r: 1.75 },
        { x: -0.14, y: -0.02, r: 1.45 },
        { x:  0.00, y:  0.00, r: 1.55 },
        { x:  0.15, y:  0.02, r: 1.42 },
        { x: -0.23, y:  0.36, r: 1.70 },
        { x:  0.29, y:  0.39, r: 2.00 }
      ],
      edges: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]]
    };

    const particleCount = () => {
      const multiplier = saveData ? 0.55 : lowPowerDevice ? 0.78 : 1;
      const base = window.innerWidth < 600 ? 34 : window.innerWidth < 1000 ? 54 : 82;
      return Math.max(24, Math.round(base * multiplier));
    };

    function makeParticle() {
      const cyan = Math.random() > 0.58;
      return {
        x: Math.random() * Math.max(1, canvasWidth),
        y: Math.random() * Math.max(1, canvasHeight),
        vx: (Math.random() - 0.5) * 0.13,
        vy: (Math.random() - 0.5) * 0.13,
        size: 1.05 + Math.random() * 1.35,
        alpha: 0.42 + Math.random() * 0.28,
        cyan
      };
    }

    function getOrionGeometry(now = performance.now()) {
      const compact = canvasWidth < 760;
      const scale = compact ? Math.min(105, canvasWidth * 0.18) : Math.min(155, canvasWidth * 0.11);
      const driftX = Math.sin(now / 9000) * 7;
      const driftY = Math.cos(now / 11000) * 5;
      const centerX = (compact ? canvasWidth * 0.74 : canvasWidth * 0.82) + driftX;
      const centerY = (compact ? canvasHeight * 0.30 : canvasHeight * 0.34) + driftY;
      const stars = orion.stars.map((star) => ({
        x: centerX + star.x * scale * 2,
        y: centerY + star.y * scale * 2,
        r: star.r
      }));
      return { centerX, centerY, scale, stars };
    }

    function makeDriftStar() {
      const speed = 0.04 + Math.random() * 0.14;
      const angle = -0.26 + Math.random() * 0.52;
      return {
        x: Math.random() * Math.max(1, canvasWidth),
        y: Math.random() * Math.max(1, canvasHeight),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.045,
        size: 0.7 + Math.random() * 1.65,
        phase: Math.random() * Math.PI * 2,
        cyan: Math.random() > 0.5
      };
    }

    function resetDriftStars() {
      const count = canvasWidth < 760
        ? 15
        : (lowPowerDevice || saveData ? 18 : 36);
      driftStars = Array.from({ length: count }, makeDriftStar);
    }

    function spawnShootingStar(now) {
      if (reduceMotion || saveData || lowPowerDevice || canvasWidth < 720) return;
      const fromTop = Math.random() > 0.45;
      const speed = 4.8 + Math.random() * 2.7;
      const angle = 0.42 + Math.random() * 0.24;
      shootingStars.push({
        x: fromTop ? Math.random() * canvasWidth * 0.72 : -40,
        y: fromTop ? -30 : Math.random() * canvasHeight * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 95 + Math.random() * 45,
        length: 50 + Math.random() * 55
      });
      if (shootingStars.length > 4) shootingStars.shift();

      if (Math.random() < 0.22 && shootingStars.length < 4) {
        const burstDelay = 180 + Math.random() * 420;
        window.setTimeout(() => {
          if (!document.hidden && !reduceMotion && !saveData && !lowPowerDevice && canvasWidth >= 720) {
            const burstFromTop = Math.random() > 0.45;
            const burstSpeed = 4.6 + Math.random() * 3.0;
            const burstAngle = 0.40 + Math.random() * 0.28;

            shootingStars.push({
              x: burstFromTop ? Math.random() * canvasWidth * 0.78 : -40,
              y: burstFromTop ? -30 : Math.random() * canvasHeight * 0.5,
              vx: Math.cos(burstAngle) * burstSpeed,
              vy: Math.sin(burstAngle) * burstSpeed,
              life: 0,
              maxLife: 90 + Math.random() * 50,
              length: 48 + Math.random() * 65
            });

            if (shootingStars.length > 4) shootingStars.shift();
          }
        }, burstDelay);
      }

      nextShootingStarAt = now + 2500 + Math.random() * 2500;
    }

    function drawMovingStars(now) {
      driftStars.forEach((star, index) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x > canvasWidth + 20) star.x = -20;
        if (star.x < -20) star.x = canvasWidth + 20;
        if (star.y > canvasHeight + 20) star.y = -20;
        if (star.y < -20) star.y = canvasHeight + 20;

        const twinkle = 0.42 + (Math.sin(now / 560 + star.phase + index * 0.31) + 1) * 0.27;
        const pointerBoost = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - star.x, pointer.y - star.y) / 180) : 0;
        const alpha = Math.min(0.95, twinkle + pointerBoost * 0.38);
        const radius = star.size + pointerBoost * 0.75;

        if (radius > 1.15) {
          const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius * 5);
          halo.addColorStop(0, star.cyan ? `rgba(110,220,255,${alpha * 0.22})` : `rgba(114,246,177,${alpha * 0.20})`);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(star.x, star.y, radius * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = star.cyan ? `rgba(150,229,255,${alpha})` : `rgba(166,255,209,${alpha})`;
        ctx.fill();
      });

      if (now >= nextShootingStarAt) spawnShootingStar(now);
      shootingStars = shootingStars.filter((star) => {
        star.life += 1;
        star.x += star.vx;
        star.y += star.vy;
        const lifeRatio = star.life / star.maxLife;
        if (lifeRatio >= 1 || star.x > canvasWidth + 120 || star.y > canvasHeight + 120) return false;
        const alpha = Math.sin(Math.min(1, lifeRatio) * Math.PI) * 0.62;
        const magnitude = Math.max(0.001, Math.hypot(star.vx, star.vy));
        const tailX = star.x - (star.vx / magnitude) * star.length;
        const tailY = star.y - (star.vy / magnitude) * star.length;
        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, 'rgba(110,220,255,0)');
        gradient.addColorStop(0.72, `rgba(110,220,255,${alpha * 0.28})`);
        gradient.addColorStop(1, `rgba(225,249,255,${alpha})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.15;
        ctx.stroke();
        return true;
      });
    }

    function resizeAmbientCanvas() {
      canvasDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      ambientCanvas.width = Math.round(canvasWidth * canvasDpr);
      ambientCanvas.height = Math.round(canvasHeight * canvasDpr);
      ambientCanvas.style.width = `${canvasWidth}px`;
      ambientCanvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);

      const desired = particleCount();
      if (particles.length > desired) particles = particles.slice(0, desired);
      while (particles.length < desired) particles.push(makeParticle());
      resetDriftStars();
      shootingStars = [];
      nextShootingStarAt = performance.now() + 3600 + Math.random() * 3200;
    }

    function drawRipple(ripple, now) {
      const elapsed = now - ripple.startedAt;
      const life = Math.min(1, elapsed / ripple.duration);
      const eased = 1 - Math.pow(1 - life, 3);
      ripple.radius = 18 + eased * ripple.maxRadius;
      const alpha = (1 - life) * 0.30;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(110,220,255,${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(114,246,177,${alpha * 0.45})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    function applyRippleForce(particle, ripple) {
      const dx = particle.x - ripple.x;
      const dy = particle.y - ripple.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 1) return;
      const ringDistance = Math.abs(distance - ripple.radius);
      if (ringDistance > 46) return;
      const force = (1 - ringDistance / 46) * 0.010;
      particle.vx += (dx / distance) * force;
      particle.vy += (dy / distance) * force;
    }

    function drawOrion(now) {
      const geometry = getOrionGeometry(now);
      const distanceToCenter = pointer.active
        ? Math.hypot(pointer.x - geometry.centerX, pointer.y - geometry.centerY)
        : Infinity;
      const secretRadius = Math.max(145, geometry.scale * 1.32);
      const insideSecretZone = distanceToCenter < secretRadius;

      if (insideSecretZone && !constellationUnlocked) {
        if (!constellationHoverStartedAt) constellationHoverStartedAt = now;
        if (now - constellationHoverStartedAt > 920) unlockConstellation('pointer');
      } else if (!constellationUnlocked) {
        constellationHoverStartedAt = 0;
      }

      let target = constellationUnlocked ? 0.92 : 0.015;
      if (insideSecretZone && !constellationUnlocked) {
        const proximity = 1 - Math.min(1, distanceToCenter / secretRadius);
        const linger = constellationHoverStartedAt
          ? Math.min(1, (now - constellationHoverStartedAt) / 920)
          : 0;
        target = 0.08 + proximity * 0.42 + linger * 0.38;
      }
      constellationReveal += (target - constellationReveal) * 0.055;

      const starAlpha = 0.08 + constellationReveal * 0.82;
      const lineAlpha = Math.max(0, constellationReveal - 0.12) * 0.42;

      orion.edges.forEach(([a, b]) => {
        const s1 = geometry.stars[a];
        const s2 = geometry.stars[b];
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.strokeStyle = `rgba(151,220,220,${lineAlpha})`;
        ctx.lineWidth = constellationUnlocked ? 1.05 : 0.75;
        ctx.stroke();
      });

      geometry.stars.forEach((star, index) => {
        const pulse = 1 + Math.sin(now / 700 + index * 0.9) * 0.12 * constellationReveal;
        const radius = star.r * pulse;

        if (constellationReveal > 0.18) {
          const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius * 5.5);
          halo.addColorStop(0, `rgba(180,240,226,${0.11 * constellationReveal})`);
          halo.addColorStop(1, 'rgba(180,240,226,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(star.x, star.y, radius * 5.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190,244,232,${starAlpha})`;
        ctx.fill();
      });

      if (constellationUnlocked && constellationReveal > 0.56) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.58, (constellationReveal - 0.45) * 1.2);
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(166,220,212,.82)';
        ctx.fillText('ORION // EASTER EGG', geometry.centerX - geometry.scale * 0.62, geometry.centerY + geometry.scale * 0.96);
        ctx.restore();
      }
    }

    function drawAmbientFrame(now = performance.now()) {
      if (!ambientRunning) return;
      const targetFps = (window.innerWidth < 760 || saveData || lowPowerDevice) ? 30 : 60;
      const minFrameTime = 1000 / targetFps;
      if (now - lastAmbientDraw < minFrameTime) {
        ambientFrame = requestAnimationFrame(drawAmbientFrame);
        return;
      }
      lastAmbientDraw = now;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ripples = ripples.filter((ripple) => {
        const elapsed = now - ripple.startedAt;
        const life = Math.min(1, elapsed / ripple.duration);
        const eased = 1 - Math.pow(1 - life, 3);
        ripple.radius = 18 + eased * ripple.maxRadius;
        return life < 1;
      });

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 270 && distance > 1) {
            const force = (270 - distance) / 270;
            p.vx += (dx / distance) * force * 0.0026;
            p.vy += (dy / distance) * force * 0.0026;
            const cursorSpeed = Math.min(14, Math.hypot(pointer.vx, pointer.vy));
            if (cursorSpeed > 0.5) {
              p.vx += (-dy / distance) * force * cursorSpeed * 0.00007;
              p.vy += ( dx / distance) * force * cursorSpeed * 0.00007;
            }
          }
        }

        for (const ripple of ripples) applyRippleForce(p, ripple);

        p.vx *= 0.992;
        p.vy *= 0.992;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.46) {
          p.vx = (p.vx / speed) * 0.46;
          p.vy = (p.vy / speed) * 0.46;
        }
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvasWidth + 10;
        if (p.x > canvasWidth + 10) p.x = -10;
        if (p.y < -10) p.y = canvasHeight + 10;
        if (p.y > canvasHeight + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? `rgba(110,220,255,${p.alpha})`
          : `rgba(114,246,177,${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distanceSq = dx * dx + dy * dy;
          const maxDistance = 168;
          if (distanceSq > maxDistance * maxDistance) continue;
          const distance = Math.sqrt(distanceSq);
          const alpha = (1 - distance / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(136,205,211,${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      ripples.forEach((ripple) => drawRipple(ripple, now));

      if (pointer.active) {
        for (const p of particles) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 230) {
            const alpha = (1 - distance / 230) * 0.31;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(110,220,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 195);
        halo.addColorStop(0, 'rgba(110,220,255,.105)');
        halo.addColorStop(.42, 'rgba(114,246,177,.042)');
        halo.addColorStop(1, 'rgba(110,220,255,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 195, 0, Math.PI * 2);
        ctx.fill();
      }

      pointerTrail = pointerTrail.filter((point) => now - point.t < 420);
      if (pointerTrail.length > 1) {
        for (let i = 1; i < pointerTrail.length; i += 1) {
          const a = pointerTrail[i - 1];
          const b = pointerTrail[i];
          const age = (now - b.t) / 420;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(110,220,255,${Math.max(0, (1 - age) * 0.095)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      drawMovingStars(now);
      drawOrion(now);
      ambientFrame = requestAnimationFrame(drawAmbientFrame);
    }

    window.addEventListener('pointermove', (event) => {
      if (pointer.lastX > -9000) {
        pointer.vx = event.clientX - pointer.lastX;
        pointer.vy = event.clientY - pointer.lastY;
      }
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      const speed = Math.hypot(pointer.vx, pointer.vy);
      if (speed > 3 && isFinePointer) {
        pointerTrail.push({ x: event.clientX, y: event.clientY, t: performance.now() });
        if (pointerTrail.length > 16) pointerTrail.shift();
      }
    }, { passive: true });

    window.addEventListener('pointerdown', (event) => {
      if (event.target.closest('a, button, input, textarea, select, summary, [role="button"]')) return;
      if (event.pointerType === 'touch') return;

      ripples.push({
        x: event.clientX,
        y: event.clientY,
        radius: 18,
        maxRadius: 155 + Math.random() * 55,
        duration: 820 + Math.random() * 180,
        startedAt: performance.now()
      });
      if (ripples.length > 4) ripples.shift();

      for (const p of particles) {
        const dx = p.x - event.clientX;
        const dy = p.y - event.clientY;
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < 180) {
          const force = (1 - distance / 180) * 0.055;
          p.vx += (dx / distance) * force;
          p.vy += (dy / distance) * force;
        }
      }
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => {
      pointer.active = false;
      pointer.vx = 0;
      pointer.vy = 0;
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeAmbientCanvas, 100);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      ambientRunning = !document.hidden;
      if (ambientRunning) {
        cancelAnimationFrame(ambientFrame);
        ambientFrame = requestAnimationFrame(drawAmbientFrame);
      } else {
        cancelAnimationFrame(ambientFrame);
      }
    });

    resizeAmbientCanvas();
    ambientFrame = requestAnimationFrame(drawAmbientFrame);
  }
}
