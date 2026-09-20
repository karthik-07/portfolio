const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const header = $('.site-header');
const menuToggle = $('.menu-toggle');
const navLinks = $('#nav-links');
const navAnchors = $$('.nav-center a[href^="#"]');
const toast = $('#toast');

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

// ----------------------------
// Theme preference
// ----------------------------
const THEME_KEY = 'portfolio-theme';
const themeToggle = $('.theme-toggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
const lightPreferenceQuery = window.matchMedia('(prefers-color-scheme: light)');
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
  document.documentElement.setAttribute('data-theme', next);
  if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', next);
  if (themeColorMeta) themeColorMeta.setAttribute('content', next === 'light' ? '#f5f7fa' : '#080a0e');
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
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current === 'light' ? 'dark' : 'light', { persist: true });
});

const handleSystemThemeChange = (event) => {
  if (explicitTheme) return;
  applyTheme(event.matches ? 'light' : 'dark');
};
if (lightPreferenceQuery.addEventListener) lightPreferenceQuery.addEventListener('change', handleSystemThemeChange);
else lightPreferenceQuery.addListener(handleSystemThemeChange);

// ----------------------------
// Smooth in-page navigation
// ----------------------------
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

// ----------------------------
// Mobile navigation
// ----------------------------
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

// ----------------------------
// Reveal transitions
// ----------------------------
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window && !reduceMotionQuery.matches) {
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
    '<span class="term-output"><strong>projects</strong>    jump to the flagship project</span>',
    '<span class="term-output"><strong>whatbroke</strong>   open the flagship Linux tool</span>',
    '<span class="term-output"><strong>story</strong>       why I built it</span>',
    '<span class="term-output"><strong>skills</strong>      jump to capabilities</span>',
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
    '<span class="term-output">Karthik Saligram — Software Developer</span>',
    '<span class="term-output muted-line">Full-stack · Backend · Cloud · Systems</span>'
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
    setTimeout(() => scrollToTarget('#capabilities'), 180);
    return ['<span class="term-output">Opening <strong>/capabilities</strong>...</span>'];
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
  ls: () => ['<span class="term-output"><strong>projects/</strong> &nbsp; <strong>experience/</strong> &nbsp; <strong>capabilities/</strong> &nbsp; about &nbsp; resume.pdf</span>'],
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
};
let currentScenario = 'wifi';
let wbTimers = [];

function clearWbTimers() {
  wbTimers.forEach(window.clearTimeout);
  wbTimers = [];
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
// Scroll progress
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

// ----------------------------
// Ambient background — low-density, non-interactive stars
// ----------------------------
const ambientCanvas = $('#ambient-canvas');
if (ambientCanvas && !reduceMotionQuery.matches) {
  const ctx = ambientCanvas.getContext('2d', { alpha: true });
  if (!ctx) {
    ambientCanvas.classList.add('canvas-unavailable');
  } else {
    // Star colours are read from CSS custom properties so the field follows the theme.
    let skyPalette = {};
    function readSkyPalette() {
      const styles = getComputedStyle(document.documentElement);
      const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
      skyPalette = {
        star1: read('--sky-star-1', '110,220,255'),
        star2: read('--sky-star-2', '114,246,177'),
        solid1: read('--sky-star-solid-1', '150,229,255'),
        solid2: read('--sky-star-solid-2', '166,255,209')
      };
    }
    readSkyPalette();

    // Re-read the palette when the theme changes so the field stays visible.
    const themeObserver = new MutationObserver(readSkyPalette);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const saveData = Boolean(navigator.connection?.saveData);
    const lowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;
    let stars = [];
    let shootingStars = [];
    let nextShootingStarAt = performance.now() + 6000 + Math.random() * 6000;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let canvasDpr = 1;
    let ambientFrame = 0;
    let ambientRunning = true;
    let lastAmbientDraw = 0;

    function starCount() {
      const constrained = saveData || lowPowerDevice;
      if (canvasWidth < 600) return constrained ? 16 : 24;
      if (canvasWidth < 1000) return constrained ? 24 : 38;
      return constrained ? 32 : 56;
    }

    function makeStar() {
      return {
        x: Math.random() * Math.max(1, canvasWidth),
        y: Math.random() * Math.max(1, canvasHeight),
        vx: (Math.random() - 0.5) * 0.09,
        vy: (Math.random() - 0.5) * 0.09,
        size: 0.7 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        cyan: Math.random() > 0.5
      };
    }

    function resetStars() {
      stars = Array.from({ length: starCount() }, makeStar);
    }

    function spawnShootingStar(now) {
      if (saveData || lowPowerDevice || canvasWidth < 720) return;
      const fromTop = Math.random() > 0.45;
      const speed = 4.6 + Math.random() * 2.6;
      const angle = 0.42 + Math.random() * 0.24;
      shootingStars.push({
        x: fromTop ? Math.random() * canvasWidth * 0.7 : -40,
        y: fromTop ? -30 : Math.random() * canvasHeight * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 95 + Math.random() * 45,
        length: 50 + Math.random() * 55
      });
      if (shootingStars.length > 1) shootingStars.shift();
      nextShootingStarAt = now + 9000 + Math.random() * 9000;
    }

    function drawStars(now) {
      stars.forEach((star, index) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x > canvasWidth + 20) star.x = -20;
        if (star.x < -20) star.x = canvasWidth + 20;
        if (star.y > canvasHeight + 20) star.y = -20;
        if (star.y < -20) star.y = canvasHeight + 20;

        const twinkle = 0.4 + (Math.sin(now / 720 + star.phase + index * 0.31) + 1) * 0.26;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.cyan
          ? `rgba(${skyPalette.solid1},${twinkle})`
          : `rgba(${skyPalette.solid2},${twinkle})`;
        ctx.fill();
      });

      if (now >= nextShootingStarAt) spawnShootingStar(now);
      shootingStars = shootingStars.filter((star) => {
        star.life += 1;
        star.x += star.vx;
        star.y += star.vy;
        const lifeRatio = star.life / star.maxLife;
        if (lifeRatio >= 1 || star.x > canvasWidth + 120 || star.y > canvasHeight + 120) return false;
        const alpha = Math.sin(Math.min(1, lifeRatio) * Math.PI) * 0.6;
        const magnitude = Math.max(0.001, Math.hypot(star.vx, star.vy));
        const tailX = star.x - (star.vx / magnitude) * star.length;
        const tailY = star.y - (star.vy / magnitude) * star.length;
        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, `rgba(${skyPalette.star1},0)`);
        gradient.addColorStop(1, `rgba(${skyPalette.solid1},${alpha})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.1;
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
      resetStars();
      shootingStars = [];
      nextShootingStarAt = performance.now() + 6000 + Math.random() * 6000;
    }

    function drawAmbientFrame(now = performance.now()) {
      if (!ambientRunning) return;
      const minFrameTime = 1000 / 30;
      if (now - lastAmbientDraw < minFrameTime) {
        ambientFrame = requestAnimationFrame(drawAmbientFrame);
        return;
      }
      lastAmbientDraw = now;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawStars(now);
      ambientFrame = requestAnimationFrame(drawAmbientFrame);
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeAmbientCanvas, 100);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      ambientRunning = !document.hidden;
      if (ambientRunning) {
        lastAmbientDraw = 0;
        nextShootingStarAt = performance.now() + 6000 + Math.random() * 6000;
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
