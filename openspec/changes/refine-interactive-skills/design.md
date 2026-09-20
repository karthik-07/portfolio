# Design

## Context

See `proposal.md` for motivation and `specs/portfolio-presentation/spec.md` for the behavior contract. The current implementation contains two fixed decorative nebula ribbons, a six-module Skills constellation laid out with individually assigned 12-column positions, and generic animated SVG paths. Capability modules are semantic articles and all skill content is already visible without JavaScript. The existing motion coordinator, theme tokens, reduced-motion tiers, and no-build constraint remain controlling architecture.

The durable main spec forbids broad, unrestricted card movement but permits bounded three-dimensional tilt on established card surfaces. Capability modules therefore gain the same bounded fine-pointer tilt and lift already used by the Experience and project cards, while selection and content emphasis remain flat and readable.

## Goals / Non-Goals

**Goals:**

- Make the six Skills modules read as one aligned composition rather than staggered blocks.
- Provide equivalent discoverable emphasis for pointer, keyboard, and touch users.
- Make the connector geometry correspond to actual module relationships and active state.
- Remove the nebula ribbons and oversized hero planet completely, including dormant selectors and animation hooks.
- Increase shooting-star frequency without increasing simultaneous event count or introducing another loop.
- Keep every label and technology present in ordinary document flow.

**Non-Goals:**

- Adding detail drawers, hidden skill descriptions, proficiency ratings, drag-and-drop, or navigation from a skill.
- Reintroducing magnetic motion, pointer trails, or continuous JavaScript animation, or tilt beyond the bounded fine-pointer card treatment.
- Changing skill names, technologies, hierarchy, recruiter wording, or any section outside Skills and the identified ambient hero decoration.
- Adding a dependency or bitmap background.

## Decisions

### 1. Use a balanced two-row desktop grid

Arrange the six modules as two rows of three aligned tracks. AWS & DevOps and AI-Assisted Development retain emphasis through stronger spectral treatment, markers, and strategic placement rather than spanning awkward widths. Equal row structure gives every card shared edges and makes connector endpoints stable. At tablet width the same content becomes two columns; on mobile it becomes one column.

Alternative considered: keep the asymmetric 12-column spans and tune offsets. Rejected because the uneven spans are the source of the current arrangement problem and make the decorative paths fragile.

### 2. Make the whole module an explicit selection control without hiding content

Each capability remains an `article` but receives an explicit button role, keyboard focus, an accessible category label, and `aria-pressed` state. Hover and focus provide immediate emphasis; Enter, Space, click, or tap selects one module. Selecting the active module again clears it. Only presentation changes: content never expands, collapses, or becomes conditional.

This provides a genuine keyboard and touch equivalent rather than adding focus without semantics. JavaScript manages only keyboard activation, selection state, and related connector classes; CSS supplies hover/focus visuals. Without JavaScript every module and technology remains visible, and the focusable articles still identify themselves as category controls.

Alternative considered: hover-only lighting. Rejected because touch and keyboard users would not receive an equivalent interaction. Alternative considered: expandable cards. Rejected because there is no additional approved content to reveal and collapsed information would slow scanning.

### 3. Bind connectors to stable module identifiers

Give each module a stable skill key and each SVG path matching endpoint metadata. The selected or hovered module brightens its related path and node while unrelated geometry dims slightly. Decorative SVG remains `aria-hidden`, ignores pointer events, and is hidden when the layout no longer matches its fixed desktop anchors.

Use event delegation on the Skills container and the existing motion-tier conventions. Do not add another animation loop. Reduced motion changes state without path-travel animation.

Alternative considered: measure cards and redraw connectors on every resize. Rejected because a fixed aligned grid provides stable endpoints and avoids unnecessary layout measurement.

### 4. Remove nebula ribbons and the oversized hero planet at every layer

Delete both ribbon elements and the hero planet, including their theme/responsive/static selectors, GSAP tweens, and structural-test expectations. Keep the depth stars, orbital arcs, grain, and horizon forms. This is a removal rather than an opacity reduction so the unwanted visual cannot reappear in another theme or motion tier.

### 5. Remove only the identified Skills sentence

Delete the paragraph containing “Six groups, each built around the kind of problem it solves.” The eyebrow and heading remain unchanged; no replacement sentence or spacer is added. Section-heading layout should collapse naturally when its secondary column is absent.

### 6. Increase shooting-star frequency within the existing canvas loop

Change the initial event schedule from 9–18 seconds to 4–8 seconds and the recurring schedule from 11–23 seconds to 6–12 seconds. Keep the existing randomized origin, trajectory, lifetime, viewport eligibility, and one-active-event cap. Static/reduced-motion mode continues to stop the canvas loop, and narrow viewports continue to omit shooting stars.

Alternative considered: allow multiple concurrent shooting stars. Rejected because it would make the scene noisy and increase canvas work; frequency alone supplies the requested liveliness.

### 7. Reuse the shared tilt surface for Skills

Opt each capability module into the existing `data-tilt` coordinator rather than adding a Skills-specific pointer listener or loop. The coordinator already caches rectangles and writes transform custom properties at the full motion tier, so the same bounded amplitude and lift apply with no new per-frame work. CSS limits the transform to hover-capable fine pointers and resets it for coarse pointers, constrained/static tiers, and reduced motion, so touch and low-power devices keep static cards while hover, focus, selection, and related connector emphasis stay intact.

Alternative considered: implement Skills-specific pointer math. Rejected because it duplicates the coordinator and risks inconsistent motion across sections.

## Risks / Trade-offs

- [Button-role articles could interfere with selecting text] → Keep activation limited to click/tap and Enter/Space, avoid pointer-down cancellation, and preserve ordinary text rendering and selection.
- [Equal card sizes could imply equal proficiency] → Use the grid only for alignment and preserve AWS/AI emphasis through styling and labels, not ratings.
- [Connectors could drift from modules] → Use the fixed three-column desktop grid and hide geometry at the tablet breakpoint rather than dynamically measuring it.
- [Selected state could remain visually loud] → Use a single-selection model and let Escape or a second activation clear the state.
- [Removing the nebula and planet could make the page feel empty] → Retain existing star depth, orbital arcs, horizons, and section-local illumination; do not compensate by adding more particles.
- [More frequent shooting stars could become distracting] → Randomize within 6–12 seconds, retain one active event, and preserve static, reduced-motion, and narrow-screen suppression.

## Migration Plan

1. Remove the Skills subtitle plus nebula ribbon and hero-planet markup, styling, motion hooks, and obsolete tests.
2. Normalize the Skills grid and connector geometry for desktop, tablet, and mobile.
3. Add semantic module controls and shared hover/focus/selected styles.
4. Add delegated selection behavior and connector-state synchronization with reduced-motion safeguards.
5. Adjust shooting-star scheduling constants without changing the canvas loop or concurrency cap.
6. Verify both themes, keyboard/touch behavior, no-JavaScript content, celestial-event timing, and 320px through 1440px layouts.

Rollback restores the previous Skills markup/layout and ribbon elements; no data or dependency migration is involved.
