# Proposal

## Why

The current Skills constellation is visually busy but still reads as six uneven blocks with decorative lines laid over them, and the hero's oversized nebula-like planet plus the background ribbons compete with the content. The section needs a deliberate, aligned layout and useful interaction that rewards exploration without slowing recruiter scanning.

## What Changes

- Remove both broad nebula ribbon elements and the oversized hero planet with all corresponding CSS/GSAP behavior while retaining the stars, orbital geometry, and lower-page horizon forms.
- Rebuild the desktop Skills arrangement on a clean, balanced grid so every module edge, gap, connector, and anchor point aligns intentionally.
- Preserve emphasis for AWS & DevOps and AI-Assisted Development through placement and styling rather than awkward card dimensions.
- Make Skills modules interactive through bounded hover, keyboard-focus, and touch/selection states that emphasize the active module and its related constellation paths without hiding content.
- Keep interactions restrained: no magnetic motion, drag behavior, or interaction required to read technologies, while allowing bounded Skills-card tilt and lift only for capable fine-pointer devices with full motion enabled.
- Remove the sentence “Six groups, each built around the kind of problem it solves.” without replacing it with filler copy.
- Increase shooting-star frequency on capable viewports while retaining randomized timing, the single-active-event limit, and reduced-motion/static safeguards.
- Preserve single-column mobile readability, a balanced tablet layout, light/dark theme parity, reduced-motion behavior, and no-JavaScript access to every skill.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-presentation`: Refines the permitted interaction model for Skills by allowing bounded fine-pointer card tilt alongside selection emphasis, removes the nebula ribbons and oversized hero planet, requires an aligned Skills layout, removes the redundant Skills explanatory sentence, and increases restrained shooting-star frequency while preserving accessible static content.

## Impact

- Primary files during implementation: `index.html`, `style.css`, `mediaqueries.css`, `script.js`, and the existing structural tests.
- Builds on the in-progress `elevate-cosmic-presence` change and should be applied after that implementation state is retained.
- No new dependency, asset, build step, route, or external service is introduced.
- Existing recruiter terminology, capability categories, technologies, section order, and non-Skills interactions remain unchanged.
