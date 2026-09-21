# Design

## Context

See `proposal.md` for motivation and `specs/portfolio-presentation/spec.md` for the behavior contract. The page already has one shared pointer coordinator for `[data-tilt]` surfaces. The flagship, three Experience entries, three supporting projects, and six Skills cards opt into it; the Contact panel does not. The coordinator already writes pointer-location variables, so the same inputs can drive subtle surface lighting without another listener or render loop.

The broad green impression comes from section atmosphere and large inset accent illumination, not from the localized controls alone. WhatBroke? is currently displayed as “What Broke?” in metadata, headings, prose, About copy, and terminal output, while lowercase `whatbroke` correctly serves as the CLI command and identifier.

## Goals / Non-Goals

**Goals:**

- Establish one explicit category of major interactive surface across the page.
- Make depth and lighting feel coherent without making nested interfaces unstable.
- Make flagship and Contact surfaces neutral enough that copy and actions dominate.
- Reserve green for active, available, successful, and actionable meaning.
- Improve recruiter comprehension without inflating or inventing claims.

**Non-Goals:**

- Adding more celestial scenery, cursor effects, sound, shaders, particle systems, or animation loops.
- Making every bordered element tilt.
- Changing factual experience claims, project status, URLs, technologies, dates, or the page's section order.
- Replacing the interactive terminal or WhatBroke? diagnostic demo.

## Decisions

### 1. Define a closed major-surface set

The major set is the flagship article, each Experience card, each supporting-project card, each Skills card, and the Contact panel. The first four families already use the shared tilt system; Contact joins it. All nested or utility surfaces remain static, including proof points, project-proof cells, tags, pills, buttons, the terminal, the WhatBroke? console and its internal panels, the About note, navigation, and small statistics.

Alternative considered: add tilt to every card-like rectangle. Rejected because nested transforms create competing depth planes, weaken hierarchy, and make dense technical content harder to scan.

### 2. Extend the shared coordinator rather than add effects infrastructure

Use the existing opt-in and pointer variables for tilt, lift, and a low-opacity radial highlight on major surfaces. Do not add listeners, per-component pointer handlers, dependencies, or another animation frame loop. Preserve the existing small amplitude.

Alternative considered: create section-specific 3D implementations. Rejected because behavior and performance would drift between component families.

### 3. Replace broad green atmosphere with semantic accents

Remove or neutralize the large green atmosphere applied to the flagship and Contact regions. Their main surfaces use the shared neutral surface tokens in both themes. Green remains on active-build and availability signals, primary actions where appropriate, small status lights, restrained borders, and edge illumination. Existing space identity continues through stars, orbital/horizon geometry, signal rings, typography, and interaction rather than colored fog.

Alternative considered: reduce only the green opacity. Rejected because the same distracting composition would remain and vary unpredictably between themes.

### 4. Standardize product naming by context

Use `WhatBroke?` for the human-readable product name everywhere, including structured metadata, headings, prose, About content, and terminal response copy. Preserve lowercase `whatbroke` for the CLI command, terminal shortcut labels, DOM identifiers, script variables, repository paths, and URLs. This avoids damaging technical correctness while fixing brand consistency.

### 5. Lead content with outcomes and mechanisms

The flagship's first sentence identifies product type, platform, and mechanism before origin story. The agentic Experience bullet leads with the development outcome and explains the tools afterward. Contact copy states the target role profile—full-stack work with backend systems, AWS, and production ownership—without adding unsupported specialization claims.

Alternative considered: add more copy and explanatory panels. Rejected because recruiter comprehension improves more through ordering and precision than length.

### 6. Preserve complete static fallbacks

Fine-pointer full-motion users receive bounded tilt and localized lighting. Coarse-pointer, touch, reduced-motion, constrained/static-tier, and no-JavaScript users receive neutral static surfaces with intact content, hover where applicable, visible focus, selection, and actions. Responsive layouts must remain unchanged except where neutralized effects require small contrast corrections.

## Risks / Trade-offs

- [A shared 3D treatment could flatten section personality] → Keep section-specific content, accents, and internal composition while standardizing only physical response.
- [Pointer lighting could recreate a distracting glow] → Constrain it to the hovered major surface, use low-opacity neutral/accent mixes, and verify both themes.
- [Removing green haze could make sections feel empty] → Retain structural space cues, meaningful signals, typography, and edge lighting; do not compensate with more decorative objects.
- [Brand replacement could alter commands or links] → Use context-aware assertions that preserve lowercase command, identifier, repository, and URL forms.
- [Copy edits could overstate impact] → Reorder and clarify only facts already present in the portfolio and résumé-derived material.
- [More tilt surfaces add measurement work] → Only Contact is new to the existing major-surface set; reuse cached geometry and the single coordinator.

## Migration Plan

1. Add source-level regression coverage for naming contexts, major/static surface boundaries, neutral atmosphere rules, and preserved fallbacks.
2. Standardize visible WhatBroke? naming and refine the approved recruiter-facing sentences.
3. Neutralize flagship and Contact atmosphere and surface treatments in both themes.
4. Add Contact to the shared major-surface interaction and apply common localized lighting without touching nested surfaces.
5. Reconcile overlapping active OpenSpec changes, run automated validation, and complete visual checks across themes, input modes, motion preferences, and supported breakpoints.

Rollback restores the previous display copy and section atmosphere rules and removes Contact from the tilt set; the existing flagship, Experience, project, and Skills tilt behavior remains intact.
