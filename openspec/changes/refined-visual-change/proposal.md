# Proposal

## Why

The portfolio currently demonstrates strong frontend execution, but its many competing interactions and dense technical styling can distract recruiters from the candidate's full-stack, backend, and cloud strengths. A refined technical-editorial presentation will preserve its distinctive developer identity while making professional experience, flagship work, and hiring relevance faster to understand.

## What Changes

- Reorganize the single-page hierarchy around recruiter scanning: hero, WhatBroke flagship case study, experience, supporting projects, capabilities, personal about, and contact.
- Retain the interactive hero terminal and a restrained space-inspired background as the signature visual elements.
- Remove the command palette, cursor trail/glow, click ripples, hidden constellations, magnetic controls, broad 3D tilt effects, and other interactions that compete with portfolio content.
- Establish a restrained technical-editorial system with clearer typography, consistent surfaces, limited accent colors, and accessible minimum text sizes.
- Present WhatBroke as the flagship project with clear status, problem, evidence, and a direct repository link.
- Replace tab-dependent experience and skills presentations with visible, scannable content.
- Add a more personal About presentation using an existing portrait asset and simplify the contact call to action for developer recruiters.
- Ensure content, cards, controls, and media remain readable and usable across mobile and desktop sizes, including reduced-motion and keyboard-accessible experiences.

## Capabilities

### New Capabilities

- `portfolio-presentation`: Defines the portfolio's recruiter-focused information hierarchy, visual system, content presentation, responsive behavior, accessibility, and restrained interaction model.

### Modified Capabilities

None.

## Impact

- Primary files: `index.html`, `style.css`, `mediaqueries.css`, and `script.js`.
- Existing portrait and project assets may be reused; no new framework, build system, runtime service, or third-party library is introduced.
- Existing project demos and theme support remain, while decorative JavaScript and tab-only content mechanisms are reduced.
- Public navigation and section anchors may be adjusted to match the new content order.
