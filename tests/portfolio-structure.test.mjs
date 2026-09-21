import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const responsiveCss = readFileSync(new URL('../mediaqueries.css', import.meta.url), 'utf8');
const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

test('availability is explicit, actionable, and present in persistent navigation', () => {
  assert.match(html, /class="availability-beacon"/);
  assert.match(html, /Open to full-stack software engineering roles in Canada/);
  assert.match(html, /Available for interviews/);
  assert.match(html, /class="[^"]*availability-beacon__action[^"]*" href="#contact"/);
  assert.match(html, /class="[^"]*nav-availability[^"]*" href="#contact"/);
  assert.match(html, />Open to work</);
});

test('the celestial scene keeps its horizons without nebula ribbons or the hero planet', () => {
  assert.match(html, /cosmos__horizon/);
  assert.doesNotMatch(html, /cosmos__ribbon/);
  assert.doesNotMatch(css, /cosmos__ribbon/);
  assert.doesNotMatch(responsiveCss, /cosmos__ribbon/);
  assert.doesNotMatch(script, /cosmos__ribbon/);
  assert.doesNotMatch(html, /hero-planet/);
  assert.doesNotMatch(css, /hero-planet/);
  assert.doesNotMatch(responsiveCss, /hero-planet/);
  assert.doesNotMatch(script, /hero-planet/);
});

test('skills expose a balanced interactive composition without relying on connectors', () => {
  assert.match(html, /skills-constellation/);
  assert.match(html, /skills-constellation__geometry[^>]*aria-hidden="true"/);
  assert.equal((html.match(/<article class="capability [^"]*"[^>]*data-skill="[^"]+"[^>]*role="button"[^>]*tabindex="0"[^>]*aria-pressed="false"/g) || []).length, 6);
  assert.equal((html.match(/data-skill-link="[^"]+"/g) || []).length >= 6, true);
  assert.match(css, /grid-template-columns:\s*repeat\(3/);
  assert.match(responsiveCss, /grid-template-columns:\s*repeat\(2/);
  assert.match(responsiveCss, /grid-template-columns:\s*1fr/);
});

test('motion and responsive fallbacks keep decorative effects bounded', () => {
  assert.match(responsiveCss, /\.skills-constellation__geometry\s*\{\s*display:\s*none/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(script, /requestAnimationFrame\([^)]*planet/i);
});

test('skills remove the redundant subtitle and support bounded selection', () => {
  assert.doesNotMatch(html, /Six groups, each built around the kind of problem it solves\./);
  assert.match(script, /aria-pressed/);
  assert.match(script, /event\.key !== 'Enter'/);
  assert.match(script, /event\.key !== ' '/);
  assert.match(script, /event\.key === 'Escape'/);
  assert.match(css, /\.capability\.is-selected/);
});

test('shooting stars use the increased randomized frequency with existing safeguards', () => {
  assert.match(script, /performance\.now\(\) \+ 4000 \+ Math\.random\(\) \* 4000/);
  assert.match(script, /now \+ 6000 \+ Math\.random\(\) \* 6000/);
  assert.match(script, /if \(cosmos\.events\.length > 1\) cosmos\.events\.shift\(\)/);
  assert.match(script, /if \(width >= 720 && now >= cosmos\.nextEventAt\)/);
  assert.match(script, /function shouldRunCosmic\(\)[\s\S]*if \(Motion\.tier === 'full'\) return true;[\s\S]*return false;/);
});

test('no new runtime dependency is introduced', () => {
  const externalScripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(externalScripts, [
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
    'script.js'
  ]);
});

test('skills cards reuse the shared bounded tilt surface without a private pointer loop', () => {
  assert.equal(
    (html.match(/<article class="capability [^"]*"[^>]*data-tilt[^>]*data-skill="[^"]+"[^>]*role="button"[^>]*tabindex="0"[^>]*aria-pressed="false"/g) || []).length,
    6
  );
  assert.equal((script.match(/addEventListener\('pointermove'/g) || []).length, 1);
  assert.doesNotMatch(script, /skillCards[\s\S]{0,160}requestAnimationFrame/);
});

test('infrastructure wording is AWS-specific without discarding legitimate cloud references', () => {
  assert.match(html, /AWS infrastructure/);
  assert.match(html, /Cloud Innovation Hackathon/);
  assert.match(html, /No daemon \/ cloud/);
  assert.doesNotMatch(html, /cloud infrastructure/);
});

test('skills states stay distinct without transforms and selection stays synchronized', () => {
  assert.match(css, /\.capability:hover\s*,/);
  assert.match(css, /\.capability:focus-visible\s*\{[^}]*outline:\s*2px solid/);
  assert.match(css, /\.capability\.is-selected\s*\{/);
  assert.match(css, /\.capability\.is-selected \.capability__marker/);
  assert.match(css, /\[data-theme="light"\] \.capability\.is-selected/);
  assert.match(script, /setAttribute\('aria-pressed', String\(selected\)\)/);
});

test('skills tilt is gated to fine pointers and full motion', () => {
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)\s*\{[\s\S]*?\[data-motion="full"\] \.capability\[data-tilt\]\s*\{[\s\S]*?transform: perspective/);
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)\s*\{[\s\S]*?\.capability\[data-tilt\]\s*\{[\s\S]*?transform: none/);
  assert.match(css, /\[data-motion="static"\] \.capability\[data-tilt\]\s*\{[^}]*transform: none/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('WhatBroke? naming is human-readable while lowercase stays on commands and paths', () => {
  assert.match(html, /Explore WhatBroke\?,/);
  assert.match(html, /"name": "WhatBroke\?"/);
  assert.match(html, /<h2 id="projects-title">WhatBroke\?/);
  assert.match(html, /<h3>WhatBroke\?<\/h3>/);
  assert.match(html, /WhatBroke\? started after/);
  assert.match(html, /WhatBroke\? came out of/);
  assert.match(script, /<strong>WhatBroke\?<\/strong>/);
  assert.doesNotMatch(html, /What Broke\?/);
  assert.doesNotMatch(script, /What Broke\?/);
  assert.match(html, /data-terminal-command="whatbroke"/);
  assert.match(html, /github\.com\/karthik-07\/whatBroke/);
  assert.match(html, /id="whatbroke-demo"/);
  assert.match(html, /<strong>whatbroke<\/strong>/);
});

test('major surfaces join the shared tilt set while nested surfaces stay static', () => {
  assert.match(html, /<article class="flagship[^"]*"[^>]*data-tilt/);
  assert.equal((html.match(/<li class="timeline-item"[^>]*data-tilt/g) || []).length, 3);
  assert.equal((html.match(/<article class="lab-card[^"]*"[^>]*data-tilt/g) || []).length, 3);
  assert.equal((html.match(/<article class="capability [^"]*"[^>]*data-tilt/g) || []).length, 6);
  assert.match(html, /<div class="shell contact-panel reveal"[^>]*data-tilt/);
  assert.doesNotMatch(html, /class="proof-point"[^>]*data-tilt/);
  assert.doesNotMatch(html, /class="project-proof"[^>]*data-tilt/);
  assert.doesNotMatch(html, /class="wb-console[^"]*"[^>]*data-tilt/);
  assert.doesNotMatch(html, /class="human-note"[^>]*data-tilt/);
  assert.doesNotMatch(html, /class="[^"]*button[^"]*"[^>]*data-tilt/);
});

test('flagship and Contact use neutral surfaces with localized green only', () => {
  assert.doesNotMatch(css, /\[data-atmosphere="flagship"\]::before\s*\{[^}]*nebula-green/);
  assert.doesNotMatch(css, /\[data-atmosphere="contact"\]::before\s*\{[^}]*nebula-green/);
  assert.match(css, /--surface-inset:\s*/);
  assert.match(css, /\.flagship\s*\{[^}]*var\(--surface-inset\)/);
  assert.match(css, /\.contact-panel\s*\{[^}]*var\(--surface-inset\)/);
  assert.match(html, /class="status-pill"><i aria-hidden="true"><\/i> ACTIVE BUILD/);
});
