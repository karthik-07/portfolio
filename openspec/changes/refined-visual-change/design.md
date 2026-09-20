# Design

## Context

See `proposal.md` for motivation. The portfolio is a no-build single page implemented in `index.html`, `style.css`, `mediaqueries.css`, and `script.js`. It already includes semantic landmarks, light and dark themes, a functional hero terminal, detailed project demos, three experience entries, grouped stack data, and multiple portrait assets. Its current interaction layer also contains a command palette, tab-rendered experience and stack content, global tilt and magnetic behaviors, pointer effects, and a canvas system with particles, ripples, shooting stars, and hidden constellations.

The redesign must remain framework-free, avoid new dependencies, preserve useful content and URLs, meet WCAG 2.1 expectations, and prevent card text from clipping at any supported width.

## Goals / Non-Goals

**Goals:**

- Make the page understandable to a developer recruiter through document-order scanning.
- Reduce visual noise while preserving a recognizable technical personality.
- Make core experience, project evidence, and skills available without interaction.
- Simplify the HTML, CSS, and JavaScript where removed features permit it.
- Maintain dark and light themes, responsive behavior, and progressive enhancement.

**Non-Goals:**

- Rebuilding the site with a framework or adding a build pipeline.
- Rewriting project claims beyond clarifying status, hierarchy, and recruiter relevance.
- Adding analytics, a CMS, backend services, or new third-party packages.
- Removing the hero terminal, WhatBroke demonstration, theme switcher, or useful project links.
- Redesigning the résumé or external project sites.

## Decisions

### 1. Use a recruiter-first document structure

Reorder the main content to hero → WhatBroke → experience → supporting projects → capabilities → About → contact. The navigation follows the same conceptual order. This puts the strongest technical story and employment evidence above secondary experiments.

Alternative considered: retain the current projects-first collection followed by tabbed experience. Rejected because it delays professional proof and gives all project interactions similar visual weight.

### 2. Keep one signature interaction

Retain the hero terminal as the distinctive interactive element. Keep the canvas only as a low-density, non-interactive star treatment with optional infrequent shooting stars. Remove constellation discovery, ripple forces, pointer response, the cursor glow, magnetic offsets, global 3D tilt, and the command palette. Scroll reveals use short opacity and vertical-position transitions and become static under reduced motion.

Alternative considered: remove all motion and terminal behavior. Rejected because a restrained terminal reinforces the developer identity without blocking standard content.

### 3. Build hierarchy with typography and whitespace

Continue using the existing Geist and JetBrains Mono font imports. Geist handles headings, body copy, actions, and evidence; JetBrains Mono is limited to labels, status, dates, tags, and terminal output. Establish a minimum 12px size for meaningful metadata and controls, 16–18px body copy, controlled line lengths, two primary radii, subtle borders, and limited shadows. Cyan and green remain the only strong accents; violet is removed or reduced to neutral support.

Alternative considered: preserve dense microtype and glass panels throughout. Rejected because small text and repeated containers reduce scan speed and visual priority.

### 4. Convert hidden content to semantic static structures

Render experience as a vertical sequence of entries containing dates, title, organization, location, evidence bullets, and concise technology highlights. Render capabilities as static groups for Frontend, Backend, Cloud/DevOps, Data, and Systems. Remove the experience and stack tab data/rendering logic after the HTML contains the full content.

Alternative considered: keep tabs and add a static fallback. Rejected because it duplicates content and retains unnecessary state management.

### 5. Separate flagship and supporting project treatments

Keep WhatBroke as a large split-layout case study with a readable evidence demo and direct repository action. Place experience immediately after it. Present Pronunciation Alignment, NL→SQL, and Movie Database in quieter supporting cards; labels explicitly distinguish technical prototype, work in progress, and shipped project. Preserve project demonstrations only where they remain compact, comprehensible, and keyboard-safe.

Alternative considered: use uniform project cards. Rejected because it obscures the intended flagship and makes recruiter-relevant priority unclear.

### 6. Use an optimized portrait instead of a second terminal

Replace the About `developer.json` presentation with a portrait-and-copy composition. Create a web-optimized derivative from the existing portrait assets while preserving the source file. Provide explicit dimensions and meaningful alternative text to avoid layout shift and support accessibility.

Alternative considered: retain both the portrait and `developer.json`. Rejected because another terminal-like surface repeats the hero motif and weakens the human close to the page.

### 7. Keep progressive enhancement boundaries clear

JavaScript continues to support theme switching, mobile navigation, smooth in-page navigation, the hero terminal, the WhatBroke demo, limited project demos, and restrained reveal/ambient behavior. Hiring-critical copy, every role, all capabilities, project statuses, and all external links remain in HTML. Removed UI features also have their markup, styles, listeners, and data removed so dead code is not retained.

Alternative considered: visually hide old mechanisms while leaving their code. Rejected because it preserves complexity and can create keyboard or performance regressions.

### 8. Validate through focused static and browser checks

Because this is a static, dependency-free site, verification will emphasize HTML/CSS/JavaScript syntax, link and asset checks, semantic/accessibility inspection, keyboard operation, reduced motion, theme parity, and visual review at 320px, tablet width, and 1440px. No test framework will be added.

## Risks / Trade-offs

- [Removing playful interactions reduces novelty] → Concentrate personality in the terminal, copy, WhatBroke demo, and restrained ambient background.
- [Reordering sections can break terminal or navigation targets] → Preserve stable IDs where useful and audit every internal target after restructuring.
- [Static experience entries make the page longer] → Use concise bullets, editorial spacing, and clear visual rhythm rather than hiding evidence.
- [A portrait can add significant transfer size] → Generate an appropriately sized optimized derivative and provide intrinsic dimensions.
- [Deleting intertwined interaction code can cause regressions] → Remove features by concern, checking dependent selectors and listeners before each deletion.
- [Light-theme contrast may drift during simplification] → Verify both themes for body text, muted text, borders, controls, focus, and status labels.

## Migration Plan

1. Restructure semantic HTML and content while preserving essential IDs and links.
2. Replace the visual foundation and responsive rules with the refined token and layout system.
3. Reduce JavaScript to supported interactions and remove obsolete markup/style hooks.
4. Optimize and integrate the selected portrait asset.
5. Validate syntax, assets, links, keyboard flow, reduced motion, themes, and target viewport layouts.

Rollback is the restoration of the four existing source files and removal of any generated portrait derivative from the pre-change Git state; no data or service migration is involved.
