# Proposal

## Why

The portfolio already has a cosmic interactive identity, but several parts still undersell it: the Professional Experience and About copy reads generically (or defensively), the supporting-project cards are visually inconsistent, and the motion system is hand-rolled. Adopting a verified motion library and tightening the copy and cards will make the site feel genuinely polished and intentional without weakening recruiter clarity.

## What Changes

- Adopt **GSAP + ScrollTrigger** (verified, pinned version) from a CDN as the motion engine for section reveals, scroll-linked sequence, and the hero/WhatBroke choreography, with a graceful first-party fallback when the library or network is unavailable.
- Push the cosmic art direction further with coordinated, capability-aware motion while keeping all hiring-critical content in HTML.
- Reword the **Professional Experience** section copy and remove its disclaimer sentence ("The roles, dates, locations, and responsibilities below mirror my current résumé. No invented titles or unsupported claims.").
- Remove the **Skills** "No fake percentage bars." line and other hedging/disclaimer-style copy; reword the WhatBroke evidence note confidently while preserving the evidence-versus-causation distinction the current spec requires.
- Redesign the **Supporting Projects** cards into one uniform, cleaner card structure.
- Rewrite the **About** section in a confident, warm voice, removing cliché phrasing.
- Preserve accessibility, reduced-motion, no-JavaScript content access, performance tiers, and both themes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-presentation`: experience and capability copy/presentation, About voice, supporting-project card presentation, and the accessibility/resilience obligations that now apply to a third-party motion library; adds an explicit enhanced-cinematic-motion requirement.

## Impact

- Primary implementation: `index.html`, `style.css`, `mediaqueries.css`, and `script.js`.
- Dependencies: introduces the first third-party JavaScript runtime — GSAP 3.x and ScrollTrigger, loaded from a pinned CDN URL with `defer`. No build step, bundler, or package manager is added.
- Resilience: the site must remain fully usable and readable if the library fails to load, JavaScript is disabled, or motion is reduced.
- Process note: `refined-visual-change` and `cosmic-interactive-portfolio` are complete but not yet archived, so the on-disk `portfolio-presentation` spec is the post-refined baseline. This change's delta is written to compose with the cosmic delta in archive order and deliberately does not modify requirements the cosmic delta removes.
