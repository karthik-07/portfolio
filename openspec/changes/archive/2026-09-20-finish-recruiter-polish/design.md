# Design

## Context

See `proposal.md` for motivation and `specs/portfolio-presentation/spec.md` for the observable contract. Professional Experience and supporting-project cards already opt into one shared pointer coordinator through `data-tilt`; the coordinator caches card rectangles, writes CSS custom properties, and runs only at the full motion tier. Skills cards instead have semantic selection controls, constellation synchronization, and hover/focus styling but do not opt into that pointer system. This produces functional selection with much weaker physical feedback.

The active `refine-interactive-skills` change intentionally prohibited Skills movement. This change supersedes only that narrow decision: movement becomes allowed for the same bounded full-motion/fine-pointer context already used elsewhere, while selection and accessibility remain unchanged.

## Goals / Non-Goals

**Goals:**

- Reuse the established tilt coordinator rather than introduce a second event loop or interaction implementation.
- Make Skills pointer response as immediately perceivable as the Experience cards without reducing scanability.
- Preserve click/tap selection, keyboard operation, connector emphasis, and static fallback behavior.
- Keep every card readable and unclipped from 320px through large desktop layouts.
- Make general recruiter-facing infrastructure language consistently AWS-specific.

**Non-Goals:**

- Adding expandable content, hidden details, drag behavior, magnetic controls, sound, particle bursts, or new card copy.
- Increasing the global tilt amplitude or changing Experience/project behavior.
- Adding libraries, assets, dependencies, build tooling, or another animation loop.
- Reworking the page hierarchy, space environment, projects, experience bullets, or terminal.

## Decisions

### 1. Opt Skills cards into the existing tilt system

Add the existing tilt opt-in to each capability card so the shared coordinator discovers, measures, and updates it with no new pointer listener. Keep the current global amplitude and lift values so interaction remains coherent across sections.

Alternative considered: implement Skills-specific pointer math. Rejected because it duplicates the coordinator, risks inconsistent motion, and adds avoidable per-frame work.

### 2. Gate physical motion by capability as well as motion tier

The established full-motion tier remains the primary JavaScript gate. CSS will additionally limit the transform treatment to hover-capable fine pointers so touch and coarse-pointer devices do not receive sticky or accidental movement. Reduced-motion and static tiers will reset or omit tilt while leaving focus and selected styling intact.

Alternative considered: enable tilt on every device and rely on absent pointer movement. Rejected because hybrid and coarse-pointer devices can still produce surprising transforms.

### 3. Separate transient motion from persistent selection

Pointer position controls only temporary transform and lift. Existing card selection continues to control `aria-pressed`, persistent border/internal illumination, marker emphasis, and related constellation paths. Keyboard focus and selection must therefore communicate the full state without tilt.

Alternative considered: make hover or tilt itself select a card. Rejected because transient pointer exploration should not mutate persistent state.

### 4. Keep copy correction narrow

Replace only the About section's generic “cloud infrastructure” phrase with “AWS infrastructure.” Preserve “Cloud Innovation Hackathon” because it is an official achievement title and preserve “No daemon / cloud” because it describes WhatBroke's local-only architecture.

### 5. Treat visual verification as acceptance work

Use the existing structural tests for durable source-level safeguards and perform browser checks for behavior that source assertions cannot establish: tilt feel, theme parity, card alignment, clipping, touch/coarse-pointer fallback, keyboard state, and reduced motion. Validate at 320px, an intermediate tablet width, and 1440px.

## Risks / Trade-offs

- [Six additional tilt surfaces increase pointer-loop work] → Reuse cached rectangles and the existing single coordinator; add no listener or loop.
- [Tilt can make text harder to scan] → Keep the existing small amplitude and lift, restrict it to capable desktop interaction, and never animate card contents independently.
- [Selected and hovered styling can become visually excessive] → Use the current accent tokens and verify combined hover/selected states in both themes.
- [Touch or reduced-motion users could receive an inferior state] → Keep all content visible and make focus/selection styling complete without transforms.
- [Overlapping active OpenSpec deltas could contradict each other] → Reconcile the earlier no-movement language during implementation and archive changes in dependency order.

## Migration Plan

1. Update structural expectations so all six Skills cards opt into the established bounded tilt surface behavior.
2. Add the opt-in and refine Skills transform/state styling without creating new pointer logic.
3. Replace the one generic About phrase with AWS-specific wording.
4. Reconcile the overlapping `refine-interactive-skills` artifacts so the active changes no longer contradict each other.
5. Run structural, syntax, and OpenSpec validation, then perform the required browser matrix.

Rollback removes the Skills tilt opt-ins and associated Skills-only transform styling, restoring static Skills cards without affecting selection or content.
