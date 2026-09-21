# Proposal

## Why

The portfolio has a memorable space identity and strong technical material, but broad green atmospheric washes behind the flagship and Contact sections compete with their content, while naming and card-motion rules are not yet fully coherent. A balanced refinement should make the experience feel cinematic and tactile without sacrificing recruiter scanability or turning every nested surface into a moving effect.

## What Changes

- Standardize the displayed product name as `WhatBroke?` across metadata, headings, narrative copy, About content, and terminal output; retain lowercase `whatbroke` only for commands, identifiers, and URLs.
- Sharpen the flagship's opening explanation so a recruiter can immediately understand that WhatBroke? is a local Linux forensics CLI that correlates newly observed failures with preceding system changes.
- Remove the broad green atmospheric washes from the flagship and Contact sections.
- Restyle the flagship and Contact as neutral glass surfaces with localized green meaning: active-build status, availability, actions, signal indicators, thin borders, and restrained edge illumination.
- Apply the established bounded 3D tilt and pointer-relative lighting language consistently to major content surfaces: the flagship, Professional Experience cards, supporting-project cards, Skills cards, and Contact panel.
- Keep utility and nested surfaces static, including navigation, buttons, tags, pills, proof cells, terminal controls, WhatBroke? demo internals, the About note, and small statistics.
- Refine tool-first or generic copy where necessary so outcomes and recruiter-relevant evidence lead, especially the agentic Experience bullet and Contact positioning.
- Preserve touch, coarse-pointer, reduced-motion, constrained/static-tier, no-JavaScript, and responsive fallbacks with no content hidden behind interaction.
- Add no new planets, nebulae, particle systems, cursor trails, dependencies, or continuous animation loops.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-presentation`: Standardizes WhatBroke? branding and recruiter-facing evidence, defines neutral flagship/Contact surfaces with semantic accents, and limits coherent 3D interaction to major content surfaces with accessible static fallbacks.

## Impact

- Expected implementation files: `index.html`, `style.css`, `mediaqueries.css`, `script.js`, and the existing structural tests.
- Reuses the current `data-tilt` coordinator and design tokens; no new runtime system or dependency is introduced.
- Updates visible product copy and selected recruiter-facing prose without changing factual claims, project status, URLs, technologies, role dates, or section order.
- Builds on the active cosmic and Skills changes; implementation must reconcile overlapping surface, motion, and atmosphere requirements before archival.
