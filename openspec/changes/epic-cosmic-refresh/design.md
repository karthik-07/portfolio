# Design

## Context

See `proposal.md` — Why. The site is a no-build single page (`index.html`, `style.css`, `mediaqueries.css`, `script.js`) that already ships a hand-rolled motion tier system (`data-motion="static|constrained|full"`), an ambient canvas, a pointer/depth coordinator, IntersectionObserver reveals, and section activation. It currently loads no third-party JavaScript; only Google Fonts is external.

`refined-visual-change` and `cosmic-interactive-portfolio` are both complete but unarchived, so the authoritative `portfolio-presentation` spec on disk is the post-refined baseline. This change layers on top of the cosmic implementation in code and composes with the cosmic delta in the specs.

## Goals / Non-Goals

**Goals:**

- Move non-essential cinematic motion onto a verified, pinned third-party engine (GSAP + ScrollTrigger) while keeping the existing tier system as the capability gate.
- Guarantee that the site is complete and error-free when the library, network, or JavaScript is unavailable.
- Rewrite the Professional Experience section, remove defensive/hedging copy, redesign the supporting-project cards into one consistent structure, and rewrite About in a confident, warm voice.
- Keep WCAG 2.1 expectations, reduced-motion behavior, and performance tiers intact.

**Non-Goals:**

- Adding a build pipeline, bundler, package manager, or framework.
- Replacing native scrolling with scroll hijacking, section snapping, or a virtual scroller.
- Adding more than the two verified scripts (GSAP core + ScrollTrigger); no other plugins or CSS frameworks.
- Changing the information architecture, section order, anchors, or résumé-grounded claims.

## Decisions

### 1. Adopt GSAP 3 + ScrollTrigger from a pinned CDN, loaded with `defer`

Load `gsap.min.js` and `ScrollTrigger.min.js` from a single verified CDN (jsDelivr or unpkg, official npm distribution) with an exact pinned version, `defer`, and `crossorigin`. Add Subresource Integrity if a trusted hash for the pinned version can be verified at implementation time; never ship a fabricated hash.

- Alternative considered: vendoring the files locally. Rejected for this change because the user explicitly asked for a library via a verified third-party source; vendoring can be revisited if offline delivery becomes a requirement.
- Alternative considered: a CSS-only animation library. Rejected because it cannot drive scroll-linked choreography.

### 2. GSAP is an enhancement engine, never the content layer

All content, anchors, labels, and actions stay in HTML. Motion is initialized only after a guard (`window.gsap && window.ScrollTrigger`). If the guard fails, the existing hand-rolled CSS reveals and IntersectionObserver paths continue to run unchanged. Script tags use `onerror`-tolerant loading so a CDN failure produces no unhandled error and no console-visible breakage for visitors.

### 3. Reuse the existing motion tiers as the single capability gate

`data-motion="static"` never initializes GSAP or ScrollTrigger. `constrained` gets, at most, cheap entrance transitions. `full` gets scroll-linked choreography, hero intro, and timeline sequencing. This keeps reduced-motion, coarse-pointer, small-viewport, save-data, low-memory, and low-concurrency handling in one place rather than duplicating it inside GSAP code. `gsap.matchMedia()` is used so a runtime reduced-motion switch tears the timelines down rather than leaving them running.

### 4. Preserve native scrolling; use ScrollTrigger only for observation

ScrollTrigger is used for reveal triggers, scrub-linked ambience, and progress, not for controlling scroll position. `normalizeScroll`, `scrollerProxy`, pinning that changes document flow, and snap are not used. Anchor navigation keeps the existing `window.scrollTo` routine so it still works with no library. This satisfies the "no hijacking" and "native scroll preserved" requirements.

### 5. Rewrite copy from the résumé, with hedging removed

- Professional Experience: reword the section intro and bullets in direct, recruiter-facing language, keeping every claim traceable to `assets/Karthik-Resume.pdf`; delete the disclaimer sentence.
- Skills: delete "No fake percentage bars." and any other defensive framing; keep conventional category labels and résumé-listed tools.
- WhatBroke: reword the closing note so it reads confidently while still distinguishing evidence from causation (the active spec requires that distinction), e.g. a statement that the tool ranks candidate changes and leaves root-cause judgment to the engineer.
- About: confident, warm, specific prose describing full-stack/cloud/Linux/cybersecurity background and a preference for clear, explainable systems; remove slogan-style lines such as the "reasoning layer vs demo layer" aphorism.

- Alternative considered: keep the disclaimers for honesty. Rejected because the résumé grounding already provides honesty and the user asked to remove them.

### 6. Redesign supporting projects as one uniform card component

Replace the three bespoke in-card widgets with a single card structure: consistent meta row (index + category), status pill, title, description, a uniform tag row, and a consistent action row of external links. Cards keep accurate statuses (technical prototype, work in progress, shipped) and the Movie Database repository and live-demo links. The section stays visually secondary to the flagship.

- Alternative considered: keep each demo and only restyle the chrome. Rejected because the user identified the mismatched widgets as the problem.
- Alternative considered: drop the section's interactivity entirely with no links. Rejected because the spec requires the Movie links.

### 7. Keep the cosmic art direction; make it more deliberate, not busier

Elevate choreography with stronger entrance sequencing, scroll-scrubbed ambience, and a more intentional hero intro, while reducing gratuitous repetition so the page reads as one system. Effects remain behind content, never obscure text, and never change control geometry.

## Risks / Trade-offs

- [Third-party CDN becomes unavailable or is blocked] → Ship the guard and fallback paths so the static presentation is fully usable; consider local vendoring as a follow-up if needed.
- [New runtime dependency conflicts with the project's "no unnecessary libraries" context] → The user explicitly authorized verified style/motion libraries; limit to GSAP + ScrollTrigger and keep `defer` + pinned version.
- [ScrollTrigger hurts performance or causes jank on weak devices] → Gate on the full tier, cap trigger counts, animate only transform/opacity, and pause on hidden documents.
- [Integrity hash mistakes break loading] → Add SRI only with a verified hash; otherwise pin the version and use `crossorigin` without a hash.
- [Copy rewrites drift from the résumé] → Treat `assets/Karthik-Resume.pdf` as the source of truth and check every claim during verification.
- [Unarchived prior changes cause spec ordering issues] → This delta uses requirement headers that survive the cosmic archive and writes the full composed requirement text; notes the ordering in the proposal.
- [Removing supporting-project demos reduces interactivity] → The flagship WhatBroke demo and hero terminal remain the interactive showpieces; supporting cards stay useful through clear status and links.

## Migration Plan

1. Add pinned, deferred CDN script tags for GSAP and ScrollTrigger and a load guard.
2. Initialize GSAP timelines from the existing tier system, keeping the current fallback behavior; verify no-library and reduced-motion paths.
3. Rewrite the Professional Experience, Skills, WhatBroke, and About copy in `index.html`.
4. Redesign the supporting-project card markup and styles; update responsive rules.
5. Verify at 320px, tablet width, and 1440px in both themes, plus reduced motion, no-JavaScript, and a simulated CDN failure.

Rollback: remove the two script tags and restore the four source files from the pre-change revision; no data or service migration is involved.

## Open Questions

- Exact GSAP version, CDN host, and whether a verifiable SRI hash is available for that version — resolved at implementation, without changing the approach or specs.
