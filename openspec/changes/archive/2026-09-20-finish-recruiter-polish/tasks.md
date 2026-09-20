# Tasks

## 1. Reconcile interaction requirements and regression coverage

- [x] 1.1 Update the active `refine-interactive-skills` proposal, design, delta spec, and tasks so bounded Skills tilt is no longer prohibited and verify both active changes describe the same fine-pointer and reduced-motion behavior.
- [x] 1.2 Add structural regression assertions requiring all six capability controls to opt into the existing tilt system, retain `role="button"`, `tabindex="0"`, and `aria-pressed="false"`, and contain no Skills-specific pointer loop; run the targeted test first and verify it fails because the tilt opt-ins are absent.
- [x] 1.3 Add source assertions for the AWS-specific About wording and preserved legitimate cloud references, then verify the targeted test fails only on the remaining generic “cloud infrastructure” phrase.

## 2. Add Skills interaction parity

- [x] 2.1 Opt all six Skills capability cards into the established shared tilt coordinator without adding listeners, animation loops, or dependencies; verify the targeted structural test passes and the coordinator still discovers surfaces through its existing selector.
- [x] 2.2 Refine Skills hover, focus-visible, and persistent selected styling so border, illumination, marker, and related constellation paths remain clearly distinct when transforms are absent; verify source assertions cover the state selectors and selected state remains synchronized with `aria-pressed`.
- [x] 2.3 Gate Skills transform and lift to the full-motion, hover-capable fine-pointer context and ensure constrained/static motion, reduced motion, coarse pointers, and touch layouts reset or omit transforms; verify the structural safeguards and reduced-motion assertions pass.
- [x] 2.4 Exercise click/tap, Enter, Space, second-activation, and Escape behavior after adding tilt and verify only one card is selected, selection can be cleared, and hover never mutates persistent selection.

## 3. Finish recruiter wording

- [x] 3.1 Replace the About-section phrase “cloud infrastructure” with “AWS infrastructure” while preserving the official Cloud Innovation Hackathon title and WhatBroke's “No daemon / cloud” proof; verify the copy regression assertions pass and no other recruiter-facing generic infrastructure label remains.

## 4. Responsive and visual acceptance

- [x] 4.1 Verify Skills at 1440px in dark and light themes with a fine pointer: all six cards align in two rows of three, tilt and lift remain bounded, text stays readable, selected styling persists, and related paths respond without overlap or clipping.
- [x] 4.2 Verify an intermediate tablet viewport in both themes: cards form a balanced two-column layout, desktop connector geometry is hidden, card text is not truncated, and touch/coarse-pointer interaction remains static but selectable.
- [x] 4.3 Verify 320px and 430px mobile layouts in both themes: cards form one column with no horizontal page overflow, clipped content, sticky transform, or inaccessible selection state.
- [x] 4.4 Verify keyboard-only, reduced-motion, no-JavaScript, canvas-blocked, and GSAP-blocked states: all Skills content remains visible, focus and selection are perceivable, and optional tilt or ambience never blocks recruiter-critical content.

## 5. Final validation

- [x] 5.1 Run `node --check script.js`, the complete structural test suite, duplicate-ID and internal-anchor audits, and `git diff --check`; verify every command passes with no new runtime dependency.
- [x] 5.2 Run strict OpenSpec validation for `finish-recruiter-polish` and the reconciled `refine-interactive-skills` change; verify both changes are valid and their interaction requirements no longer conflict.
