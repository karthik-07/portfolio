# Design

## Context

See `proposal.md` for motivation. The implemented site already has an adaptive canvas starfield, blurred nebula circles, thin orbital outlines, pointer depth, GSAP-enhanced motion, and a six-card Skills grid. The hero includes an availability pill, but it competes with the headline and does not persist after the hero. In dark mode, Skills uses the same rounded translucent surface language as several other sections, so it reads as a card grid placed over the cosmic background rather than as part of the scene.

This follow-up must refine those visible gaps without replacing the current motion-tier architecture, external motion integration, semantic content, or recruiter-first information structure.

## Goals / Non-Goals

**Goals:**

- Preserve one cohesive celestial scene through depth, orbital geometry, and horizon forms rather than broad colored washes.
- Make Skills feel spatially composed and native to the dark cosmic theme.
- Turn availability into one of the clearest messages in the initial viewport.
- Reuse the current canvas, CSS token system, GSAP guard, and progressive enhancement tiers.
- Preserve a strong static composition in reduced-motion and no-JavaScript states.

**Non-Goals:**

- Adding another animation or rendering library.
- Reworking portfolio copy, experience, projects, terminal commands, or page order beyond availability presentation.
- Introducing a loading screen, scroll hijacking, audio, a game mechanic, or a navigable 3D world.
- Making skill labels or availability language space-themed.
- Increasing star count as the primary method of creating visual impact.

## Decisions

### 1. Keep a cohesive celestial scene without an oversized subject

Compose the background from depth stars, thin orbital outlines, horizon forms, and layered parallax so it reads as a designed space environment rather than a field of dots. A large procedural planet and atmospheric sphere were removed by the later `refine-interactive-skills` change because they competed with hero copy and terminal contrast; this change does not reintroduce them.

On full-motion devices, pointer and scroll input move the depth layers at capped distances. Static and constrained tiers show the same geometry without continuous motion. Alternative considered: reintroduce a cropped planetary horizon. Rejected because it duplicates the removed composition and competes with recruiter-critical content.

### 2. Continue the space identity with orbital and horizon geometry

Rather than nebula ribbons, the scene continues down the page through partial orbital arcs, horizon forms, and section-local accent glows. Existing stars remain for scale and texture. GSAP may scrub only cheap transform/opacity values through its existing guarded path; the static CSS scene remains complete if GSAP is unavailable.

Flagship and Contact specifically avoid broad green washes: their surfaces stay neutral, and green is reserved for meaningful active, availability, action, and signal details. Other sections keep only localized, restrained accents. Alternative considered: colored nebula fog per section. Rejected because it competes with content and varies unpredictably between themes.

### 3. Replace the equal Skills grid with a constellation dashboard

Use a 12-column desktop composition rather than six equal cards:

- AI-Assisted Development and AWS & DevOps are larger anchor modules.
- Backend and Frontend are medium modules.
- Data and Systems are compact supporting modules.

Modules use deeper translucent surfaces, spectral edge lighting, a small category marker, internal radial illumination, and less generic rounded-card framing. An inline SVG or absolutely positioned decorative layer connects stable module anchor points with thin constellation paths and luminous nodes. Geometry is presentation-only and never owns labels or content.

At tablet widths the layout becomes a balanced two-column grid. At mobile widths it becomes one column and hides connections. Light mode uses an observatory-diagram treatment with ink-like paths and pale glass surfaces instead of dark glows.

Alternative considered: free-floating draggable skill nodes. Rejected because it harms scanning, keyboard use, and mobile layout. Alternative considered: keep equal cards and only strengthen shadows. Rejected because the hierarchy and detached-grid problem would remain.

### 4. Promote availability into a two-level beacon

The hero availability element becomes a compact status panel containing:

- explicit text: “Open to full-stack software engineering roles in Canada”;
- a short supporting phrase such as “Available for interviews”;
- a direct “Let’s talk” link to Contact;
- a decorative radar/orbit pulse that is hidden from assistive technology.

The desktop navigation adds a compact `Open to work` text link with a status dot, replacing or sitting immediately beside the existing Contact treatment without overcrowding the header. On smaller widths, keep the hero panel and simplify the navigation indicator according to available space.

Animation and green color are reinforcement only. Text, link purpose, focus state, and contrast carry the meaning in static, light, and reduced-motion presentations.

Alternative considered: a large modal or banner. Rejected because it would interrupt portfolio review and feel desperate rather than confidently available.

### 5. Preserve the existing progressive enhancement boundaries

The celestial geometry, availability text, and skill content exist in HTML/CSS. JavaScript only coordinates bounded parallax, section depth, and skill-line illumination in the full tier. Constrained mode uses a sparse star canvas and static/cheap CSS ambience; static mode stops all celestial, beacon, and constellation animation.

The existing document visibility pause, device-pixel-ratio cap, pointer rAF coordination, GSAP guards, no-JavaScript visibility, and reduced-motion rules remain controlling behavior. No new continuous animation loop is added.

### 6. Verify the three stated problems directly

Review must answer three qualitative questions alongside normal accessibility checks:

1. Does the hero read as a composed celestial scene before the viewer notices individual stars?
2. Do Skills modules appear embedded in the dark cosmic environment rather than pasted over it?
3. Can a recruiter identify availability and reach Contact within the initial viewport?

Verification also covers light mode, reduced motion, canvas/GSAP failure, 320px, tablet, 1440px, keyboard navigation, contrast, content clipping, and normal scroll behavior.

## Risks / Trade-offs

- [Celestial geometry competes with hero copy or terminal] → Keep large forms behind content, cap luminance with masks and depth shadows, and test both themes at target widths.
- [Skills hierarchy implies weaker competency in smaller modules] → Use size to emphasize recruiter differentiators, not proficiency ratings; keep typography and tool visibility consistent.
- [Constellation lines overlap content after resize] → Use stable decorative anchor points, recalculate only on debounced resize when needed, and hide connections below the desktop breakpoint.
- [Availability treatment feels too promotional] → Use concise factual language, one contact action, and instrumentation styling rather than a marketing banner.
- [Broad gradients cause paint cost] → Prefer static pseudo-elements and transform/opacity animation, avoid animating blur/filter values, and reuse the existing motion tiers.
- [Unarchived prior changes complicate spec history] → Archive completed changes in chronological order before syncing this delta.

## Migration Plan

1. Add semantic availability content and decorative scene/Skills hooks without changing existing anchors or document order.
2. Build the static celestial geometry, availability panel, and redesigned Skills composition in both themes without broad colored washes.
3. Add full-tier parallax and illumination using the existing pointer, GSAP, and motion-tier systems.
4. Add tablet/mobile reflow and reduced-motion/no-JavaScript fallbacks.
5. Run targeted visual, responsive, accessibility, and performance verification.

Rollback restores the previous four source files; no dependency, data, or service migration is involved.
