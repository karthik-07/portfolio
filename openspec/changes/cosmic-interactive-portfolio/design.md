# Design

## Context

See `proposal.md` for motivation. The current site is a no-build, single-page portfolio with semantic recruiter-first content, light and dark themes, an interactive terminal, an evidence-oriented WhatBroke demo, static experience and capability sections, a portrait, and a low-density canvas starfield. Its source is concentrated in `index.html`, `style.css`, `mediaqueries.css`, and `script.js`.

The previous change deliberately removed cursor reactions, hidden constellations, magnetic controls, and broad tilt behavior. This change reverses the aesthetic restraint, but not the information architecture: spectacle is additive, professional terminology stays conventional, and hiring-critical content remains HTML-first.

## Goals / Non-Goals

**Goals:**

- Make the portfolio feel like a premium interactive space experience rather than a decorated static page.
- Demonstrate ambitious frontend execution made possible by an AI-assisted development workflow.
- Use one coherent cosmic art direction across every section without making the copy theatrical or difficult to scan.
- Ground visible claims in the current résumé and emphasize production, AWS, backend, and AI-assisted engineering evidence.
- Scale visual complexity to the visitor's motion preference, input type, viewport, and device capability.
- Keep the implementation dependency-free and understandable within the existing static architecture.

**Non-Goals:**

- Renaming sections or professional concepts with space metaphors.
- Turning the portfolio into a game, virtual desktop, or navigation puzzle.
- Adding a loading sequence, scroll hijacking, mandatory terminal commands, audio, WebGL libraries, or external animation packages.
- Hiding experience, skills, links, or contact actions behind interaction.
- Claiming the portfolio or its projects are autonomous AI agents.
- Rewriting or redesigning the résumé PDF itself.

## Decisions

### 1. Separate content, atmosphere, and interaction into three layers

The semantic HTML remains the content layer and source of truth. A decorative environment layer supplies the fixed canvas, nebula fields, orbital lines, depth stars, and section atmospheres. An enhancement layer adds pointer response, transforms, lighting, and triggered sequences to selected components.

This boundary ensures that canvas or JavaScript failure leaves a complete portfolio. It also avoids embedding important text in canvas or generating professional content dynamically.

Alternative considered: construct the page as one full-screen canvas experience. Rejected because it would weaken accessibility, indexing, responsive text behavior, and maintainability.

### 2. Use a coordinated cosmic scene rather than unrelated effects

The dark theme becomes deep space: near-black and indigo surfaces, cyan and green technical light, restrained warm stellar highlights, soft nebula clouds, fine grain, and layered star depths. The light theme becomes a daylight observatory or celestial chart: warm pale surfaces, ink-like orbital lines, cyan/green instrumentation, and faint star-map geometry.

Each section gets a distinct composition while sharing tokens:

- Hero: dimensional orbital system, luminous focal body, star depth, and terminal cockpit.
- WhatBroke: anomaly scanner, telemetry sweeps, evidence pulses, and event-path illumination.
- Professional Experience: illuminated chronological rail with energized milestones.
- Supporting Projects: holographic surfaces with individual accent signatures and depth response.
- Skills: conventional category cards visually connected as a technical constellation.
- About: portrait framed as a dimensional observation window with slow orbital rings.
- Contact: a focused transmission pulse and converging signal lines around ordinary contact actions.

Alternative considered: give every section a different sci-fi motif. Rejected because visual novelty without shared rules would feel like a component demo rather than a designed system.

### 3. Make the hero and WhatBroke the two highest-intensity moments

The hero combines the strongest atmosphere, responsive depth, and terminal treatment. The terminal remains fully usable and visually sits inside the cosmic scene rather than beside a flat text column.

WhatBroke receives the most elaborate functional animation. Selecting a scenario updates the existing evidence, while running analysis triggers a short deterministic sequence: scan begins, timeline events energize in order, newly observed failure is isolated, preceding changes appear, and the evidence conclusion settles. The sequence never changes the factual conclusion or blocks immediate access to the underlying text.

Alternative considered: distribute equal animation intensity across every card. Rejected because it would flatten hierarchy and exhaust attention.

### 4. Add bounded pointer and scroll responses

On capable fine-pointer devices, the environment responds to pointer position with small parallax offsets and local gravity; selected surfaces use capped tilt and a CSS-variable-driven highlight. Pointer motion is sampled once per animation frame. Transform amplitudes remain small enough that text and targets do not move meaningfully.

Native scroll position drives section activation, ambient color/depth shifts, orbital progress, and reveal timing through passive listeners and IntersectionObserver. There is no custom scroll physics or section snapping.

Alternative considered: cinematic scroll hijacking. Rejected because it frustrates scanning, keyboard navigation, and returning to specific evidence.

### 5. Use progressive animation tiers

The enhancement layer resolves one of three tiers:

- **Static:** reduced motion; no canvas loop, parallax, trails, tilt, orbital animation, or animated reveals.
- **Constrained:** coarse pointer, small viewport, data-saving, or low-capability signals; sparse canvas and CSS ambience, but no pointer physics or continuous component effects.
- **Full:** capable fine-pointer desktop; layered canvas, pointer gravity, controlled depth, section transitions, and complete showpiece sequences.

The canvas caps device-pixel ratio, limits particle counts, pauses on `visibilitychange`, recalculates on debounced resize, and avoids per-frame DOM reads. Component transforms use CSS custom properties and compositor-friendly properties.

Alternative considered: render one identical high-intensity experience everywhere. Rejected because it would punish mobile devices and violate the accessibility goal.

### 6. Keep JavaScript organized by enhancement responsibility

The project remains build-free and uses one script file, but new behavior is organized into small initializer functions with explicit guards:

- capability and motion-tier detection;
- cosmic canvas environment;
- pointer/depth coordinator;
- surface lighting and tilt;
- section activation and orbital progress;
- terminal enhancement;
- WhatBroke analysis sequence;
- timeline, skills, portrait, and contact embellishments.

Existing theme, navigation, copy-email, project demo, and terminal behavior remain independent. Every initializer exits safely when its root element or required browser API is absent.

Alternative considered: split the site into ES modules. Rejected for this change because it adds deployment and loading considerations without being necessary to establish clear boundaries.

### 7. Update copy from résumé evidence without themed terminology

The recommended hero structure is:

- Availability: "Open to full-stack software engineering roles in Canada"
- Label: "FULL-STACK DEVELOPER · BACKEND SYSTEMS · AWS · AI-ASSISTED ENGINEERING"
- Headline: "I build production software across the entire stack."
- Supporting copy: production work spanning backend data pipelines, APIs, web/mobile interfaces, AWS infrastructure, and AI-assisted engineering workflow.
- Proof: AWS Certified, production experience, based in Canada.

Professional Experience uses "Built for production" rather than "Straight from my résumé." Orbmedic content includes Graphify/Hermes workflow improvements, 1 kHz ECG ingestion, load shedding, longitudinal baselines, clinician-facing React/Next.js, Flutter, and the deployment stack. Fair Winds emphasizes full-stack features, APIs, PostgreSQL, AWS, Docker, and GitLab CI/CD. Manipal stays limited to the résumé-supported 1,000-faculty platform, evaluation system, and role-based workflows.

Skills replaces the vague cloud emphasis with an `AWS & DevOps` group and adds `AI-Assisted Development`. About explains that AI assistance is an engineering multiplier rather than a substitute for system understanding. The contact headline becomes "Let's build something that has to work."

Metadata and structured data are updated when they repeat changed positioning. Professional role locations remain factual; the general availability/location statement uses Canada as requested.

### 8. Verify behavior at the contract boundaries

No test framework is added. Static checks cover JavaScript syntax, local assets, anchors, links, duplicate IDs, and obsolete copy. Browser verification covers keyboard order, both themes, no-JavaScript visibility, reduced motion, coarse pointer/mobile behavior, full desktop motion, tab visibility pausing, WhatBroke sequence integrity, and layouts at 320px, tablet width, and 1440px.

## Risks / Trade-offs

- [Rich effects make the page feel gimmicky] → Keep ordinary terminology, preserve strong hierarchy, and concentrate peak intensity in the hero and WhatBroke.
- [Animation harms performance] → Use three capability tiers, capped canvas density/DPR, rAF-coalesced pointer work, visibility pausing, and transform-only component motion.
- [Pointer transforms affect usability] → Cap movement, never transform focused controls independently, and disable spatial effects for coarse pointers and reduced motion.
- [Light theme loses the space identity] → Design it as a celestial observatory chart instead of copying dark-theme glows onto white.
- [Résumé content drifts again] → Treat the current résumé as the copy source and remove claims not represented there.
- [One script becomes harder to maintain] → Use responsibility-based initializers and shared motion-state utilities rather than one interleaved animation block.
- [Effects obscure content] → Keep atmosphere behind content, maintain contrast-bearing surfaces, and verify every section in static mode.

## Migration Plan

1. Update visible copy, metadata, experience evidence, capability groups, and proof points while preserving stable anchors.
2. Establish cosmic visual tokens and the static dark/light compositions before enabling motion.
3. Build the adaptive canvas environment and shared motion-tier coordinator.
4. Add bounded surface, section, and pointer enhancements from highest to lowest visual priority.
5. Upgrade the terminal and WhatBroke sequence, then add timeline, skills, portrait, and contact embellishments.
6. Tune responsive and static fallbacks and complete accessibility, performance, and cross-theme verification.

Rollback restores the prior four source files; no data, dependency, or service migration is involved.
