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
      navAnchors.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));
}

if (window.matchMedia('(pointer:fine)').matches && glow && !reduceMotion) {
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
    '<span class="term-output"><strong>skills</strong>      inspect technical stack</span>',
    '<span class="term-output"><strong>experience</strong>  professional timeline</span>',
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
  palette.classList.add('open');
  palette.setAttribute('aria-hidden', 'false');
  document.body.classList.add('palette-open');
  paletteSelection = 0;
  if (paletteSearch) paletteSearch.value = '';
  renderPalette();
  requestAnimationFrame(() => paletteSearch?.focus());
}

function closePalette() {
  if (!palette) return;
  palette.classList.remove('open');
  palette.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('palette-open');
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

const wbScenarios = {
  wifi: {
    changeTime: '09:14', rebootTime: '09:22', failureTime: '09:27', change: 'linux-firmware upgraded', failure: 'mt7921e timeout', previous: '15', signal: 'New in visible history',
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">mt7921e: Timeout for driver own</span>\n\ncurrent boot      <span class="term-good">17 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\nlinux-firmware    upgraded\nlinux             upgraded\nNetworkManager    upgraded\n\n<span class="term-note">Evidence shown. Cause not assumed.</span>`
  },
  service: {
    changeTime: '14:03', rebootTime: '14:11', failureTime: '14:12', change: 'docker upgraded', failure: 'docker.service failed', previous: '8', signal: 'Service failure appeared after update',
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">docker.service: Failed with result exit-code</span>\n\ncurrent boot      <span class="term-good">4 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\ndocker            upgraded\ncontainerd        upgraded\nrunc              upgraded\n\n<span class="term-note">Temporal candidates, not a diagnosis.</span>`
  },
  package: {
    changeTime: '18:41', rebootTime: '18:49', failureTime: '18:53', change: 'openssl upgraded', failure: 'shared library error', previous: '10', signal: 'New application failure signature',
    output: `<span class="term-label">NEWLY OBSERVED ERROR</span>\n<span class="term-strong">myapp: error while loading shared libraries</span>\n\ncurrent boot      <span class="term-good">6 occurrences</span>\nprevious boots    <span class="term-good">0 occurrences</span>\n\n<span class="term-label">PRECEDING CHANGES</span>\nopenssl           upgraded\nglibc             upgraded\nca-certificates   upgraded\n\n<span class="term-note">A starting point for investigation.</span>`
  }
};
let currentScenario = 'wifi';
let wbTimers = [];

function clearWbTimers() {
  wbTimers.forEach(window.clearTimeout);
  wbTimers = [];
}

function renderWbScenario(name) {
  const scenario = wbScenarios[name];
  if (!scenario) return;
  currentScenario = name;
  Object.entries(wbFields).forEach(([key, node]) => { if (node) node.textContent = scenario[key]; });
  if (wbSignal) wbSignal.textContent = scenario.signal;
  if (wbOutput) wbOutput.innerHTML = scenario.output;
  if (wbRunState) wbRunState.textContent = 'ready';
  scenarioTabs.forEach((tab) => {
    const active = tab.dataset.scenario === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

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

  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'normalizing signatures…';
    wbOutput.textContent += '\nnormalizing failure signatures...';
  }, 550));
  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'comparing boots…';
    wbOutput.textContent += `\ncomparing current boot against ${scenario.previous} earlier boots...`;
  }, 1050));
  wbTimers.push(window.setTimeout(() => {
    wbRunState.textContent = 'analysis complete';
    wbOutput.innerHTML = scenario.output;
    wbDemo.classList.remove('running');
    wbRun.disabled = false;
  }, 1750));
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
const moviePosters = $$('.movie-poster');
movieSearch?.addEventListener('input', () => {
  const query = movieSearch.value.trim().toLowerCase();
  moviePosters.forEach((poster) => poster.classList.toggle('hidden', !poster.dataset.title.toLowerCase().includes(query)));
});
moviePosters.forEach((poster) => poster.addEventListener('click', () => showToast(`${poster.dataset.title} · sample movie card`)));

// ----------------------------
// Experience timeline
// ----------------------------
const experienceData = {
  current: {
    period: '2025 — PRESENT', title: 'Software Developer',
    summary: 'Building production software across backend services, web interfaces, deployment workflows, and containerized infrastructure while keeping internal product details private.',
    highlights: ['Backend APIs', 'Production services', 'Container workflows', 'Frontend delivery'],
    tags: ['Python', 'React / Next.js', 'Docker', 'MongoDB', 'Redis', 'Nginx']
  },
  previous: {
    period: '2025 — 2026', title: 'Software Developer',
    summary: 'Worked across full-stack applications, APIs, relational data, cloud infrastructure, and CI/CD workflows. Public portfolio intentionally excludes proprietary client and company systems.',
    highlights: ['Full-stack delivery', 'Relational data', 'Cloud deployment', 'CI/CD'],
    tags: ['React / Next.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'GitLab CI/CD']
  },
  education: {
    period: '2023 — 2024', title: 'Postgraduate Certificate · Cloud Computing',
    summary: 'Hands-on cloud and infrastructure work spanning AWS, Azure, containers, Kubernetes, infrastructure as code, and deployment pipelines.',
    highlights: ['Cloud architecture', 'Infrastructure as code', 'Containers', 'CI/CD'],
    tags: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD']
  }
};

const expTabs = $$('.timeline-tab');
const expNodes = { period: $('#exp-period'), title: $('#exp-title'), summary: $('#exp-summary'), highlights: $('#exp-highlights'), tags: $('#exp-tags') };
function renderExperience(key) {
  const data = experienceData[key];
  if (!data) return;
  expNodes.period.textContent = data.period;
  expNodes.title.textContent = data.title;
  expNodes.summary.textContent = data.summary;
  expNodes.highlights.innerHTML = data.highlights.map((item) => `<span>${item}</span>`).join('');
  expNodes.tags.innerHTML = data.tags.map((item) => `<span>${item}</span>`).join('');
  expTabs.forEach((tab) => {
    const active = tab.dataset.exp === key;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}
expTabs.forEach((tab) => tab.addEventListener('click', () => renderExperience(tab.dataset.exp)));

// ----------------------------
// Interactive stack
// ----------------------------
const stackData = {
  systems: {
    label: 'SYSTEMS', title: 'I like knowing what the machine is actually doing.',
    description: 'Linux is my daily environment. I work comfortably around systemd, journald, networking, shells, containers, and the boundary between applications and the OS.',
    tools: ['Linux', 'Arch', 'systemd', 'journald', 'Docker', 'Shell'], projects: ['What Broke?'], tags: ['linux', 'systems']
  },
  backend: {
    label: 'BACKEND', title: 'APIs are easy. Reliable boundaries are the interesting part.',
    description: 'Backend work includes Python services, REST APIs, task processing, authentication flows, database integration, and translating product rules into predictable interfaces.',
    tools: ['Python', 'FastAPI', 'Node.js', 'REST', 'Celery', 'Nginx'], projects: ['NL → SQL', 'What Broke?'], tags: ['backend', 'python']
  },
  cloud: {
    label: 'CLOUD', title: 'Ship it, observe it, and know how to recover it.',
    description: 'I have worked with AWS and Azure, Docker, Kubernetes, Terraform, CI/CD, reverse proxies, and production-oriented deployment workflows.',
    tools: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'GitLab CI/CD'], projects: ['Professional work'], tags: ['cloud']
  },
  frontend: {
    label: 'FRONTEND', title: 'Interfaces should make the system easier to understand.',
    description: 'I build responsive interfaces with JavaScript, TypeScript, React, Next.js, HTML, and CSS—usually as the visible layer over a more interesting backend problem.',
    tools: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML', 'CSS'], projects: ['Movie Dashboard'], tags: ['frontend', 'javascript']
  },
  data: {
    label: 'DATA', title: 'Structured data is useful when the application respects its constraints.',
    description: 'Relational and document databases across PostgreSQL, SQL Server, MongoDB, and Redis, with an emphasis on practical application integration rather than database theatre.',
    tools: ['PostgreSQL', 'SQL Server', 'MongoDB', 'Redis', 'SQL'], projects: ['NL → SQL'], tags: ['data', 'sql']
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
  stackNodes.innerHTML = data.tools.map((tool) => `<button type="button">${tool}</button>`).join('');
  stackProjects.innerHTML = data.projects.map((project) => `<button type="button" data-scroll="#projects">${project}</button>`).join('');
  $$('[data-scroll]', stackProjects).forEach((button) => button.addEventListener('click', () => scrollToTarget(button.dataset.scroll)));
  stackTabs.forEach((tab) => {
    const active = tab.dataset.stack === key;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  projectCards.forEach((card) => {
    const tags = (card.dataset.tags || '').split(' ');
    const relevant = data.tags.some((tag) => tags.includes(tag));
    card.classList.toggle('project-dimmed', !relevant);
  });
  window.setTimeout(() => projectCards.forEach((card) => card.classList.remove('project-dimmed')), 2200);
}
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

// Subtle interactive 3D response on major surfaces.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
  const tiltSurfaces = $$('.hero-terminal, .flagship, .lab-card, .experience-shell, .stack-console, .about-terminal, .contact-panel');

  tiltSurfaces.forEach((surface) => {
    surface.classList.add('motion-surface');

    surface.addEventListener('pointermove', (event) => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const maxTilt = surface.classList.contains('lab-card') ? 2.8 : 1.7;
      const ry = (x - 0.5) * maxTilt * 2;
      const rx = (0.5 - y) * maxTilt * 2;

      surface.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      surface.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      surface.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      surface.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      surface.classList.add('is-hovered');
    }, { passive: true });

    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--rx', '0deg');
      surface.style.setProperty('--ry', '0deg');
      surface.style.setProperty('--mx', '50%');
      surface.style.setProperty('--my', '50%');
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
const ambientCanvas = $('#ambient-canvas');
if (ambientCanvas && !reduceMotion) {
  const ctx = ambientCanvas.getContext('2d', { alpha: true });
  if (!ctx) {
    ambientCanvas.classList.add('canvas-unavailable');
  } else {
  const pointer = { x: -9999, y: -9999, active: false };
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let canvasDpr = 1;
  let ambientFrame = 0;
  let ambientRunning = true;

  const particleCount = () => {
    if (window.innerWidth < 600) return 34;
    if (window.innerWidth < 1000) return 54;
    return 82;
  };

  function makeParticle() {
    const cyan = Math.random() > 0.58;
    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
      size: 1.05 + Math.random() * 1.35,
      alpha: 0.42 + Math.random() * 0.28,
      cyan
    };
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
  }

  function drawAmbientFrame() {
    if (!ambientRunning) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 250 && distance > 1) {
          const force = (250 - distance) / 250;
          p.vx += (dx / distance) * force * 0.0028;
          p.vy += (dy / distance) * force * 0.0028;
        }
      }

      p.vx *= 0.992;
      p.vy *= 0.992;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 0.42) {
        p.vx = (p.vx / speed) * 0.42;
        p.vy = (p.vy / speed) * 0.42;
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

    if (pointer.active) {
      // Draw a local interaction field and link nearby nodes to the pointer.
      for (const p of particles) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 220) {
          const alpha = (1 - distance / 220) * 0.28;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(110,220,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 185);
      halo.addColorStop(0, 'rgba(110,220,255,.09)');
      halo.addColorStop(.42, 'rgba(114,246,177,.035)');
      halo.addColorStop(1, 'rgba(110,220,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 185, 0, Math.PI * 2);
      ctx.fill();
    }

    ambientFrame = requestAnimationFrame(drawAmbientFrame);
  }

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.active = false; });

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
