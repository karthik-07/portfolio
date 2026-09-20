# Tasks

## 1. Remove competing ambience and redundant copy

- [x] 1.1 Remove the two nebula ribbon elements and every corresponding CSS, responsive, static-tier, reduced-motion, and GSAP hook; verify repository search finds no `cosmos__ribbon` references and the star layers, orbital geometry, grain, and horizon forms remain present.
- [x] 1.2 Remove only the Skills paragraph “Six groups, each built around the kind of problem it solves.” and adjust the section-heading layout for its single-column content; verify the sentence is absent and the eyebrow and heading remain visible in document order.
- [x] 1.3 Remove the oversized nebula-like hero planet and every corresponding markup, theme, responsive, static-tier, reduced-motion, and GSAP hook; verify repository search finds no `hero-planet` references.

## 2. Align the Skills composition

- [ ] 2.1 Replace the irregular per-card desktop spans with a balanced two-row, three-column Skills grid and preserve stronger AWS/AI styling without unequal card widths; verify all six cards share aligned edges and consistent gaps at 1440px.
- [x] 2.2 Redraw the decorative constellation paths and nodes against the normalized desktop module anchors, attach stable skill-key metadata, and keep the SVG hidden from assistive technology and pointer input; verify each module has at least one matching decorative connection and no required information exists only in SVG.
- [ ] 2.3 Implement a two-column tablet arrangement and single-column mobile arrangement, hiding desktop-only connector geometry below its safe breakpoint; verify every label and technology remains readable with no overlap, clipping, or page-level horizontal overflow at 320px and intermediate widths.

## 3. Add accessible module interaction

- [x] 3.1 Give every Skills article explicit button semantics, keyboard focus, an accessible category label, a stable skill key, and `aria-pressed="false"`; verify all six controls appear in logical tab order while their existing content remains visible without JavaScript.
- [ ] 3.2 Add bounded hover and focus treatments plus a persistent selected treatment that changes border, internal illumination, marker, and related connector emphasis, keeping bounded fine-pointer tilt available on the same cards; verify both themes retain readable text and visible focus.
- [ ] 3.3 Add delegated click/tap and Enter/Space activation with single-selection toggling, second-activation clearing, and Escape clearing; verify `aria-pressed`, selected card styling, and related connector state remain synchronized.
- [x] 3.4 Disable connector travel and non-essential state transitions under reduced motion while preserving immediate selection feedback; verify selection works without continuous animation in static and reduced-motion modes.

## 4. Regression and visual verification

- [x] 4.1 Update structural tests for ribbon removal, subtitle removal, balanced responsive layout, semantic module controls, stable connector metadata, shooting-star timing, and absence of new dependencies; verify the tests fail before implementation and pass afterward.
- [x] 4.2 Change the initial shooting-star delay to 4–8 seconds and recurring interval to 6–12 seconds while retaining the one-active-event cap and existing viewport/motion safeguards; verify timing bounds and safeguards through deterministic source assertions.
- [x] 4.3 Run `node --check script.js`, the repository structural tests, duplicate-ID and internal-anchor audits, and `git diff --check`; verify all commands pass and no unrelated section behavior was changed.
- [ ] 4.4 Perform dark/light checks at 320px, tablet, and 1440px plus keyboard-only, touch-sized, reduced-motion, no-JavaScript, canvas-blocked, and GSAP-blocked checks; verify the cards are aligned, interactions remain optional and accessible, the removed ribbons and subtitle never appear, shooting stars remain restrained, and all Skills content remains readable.
