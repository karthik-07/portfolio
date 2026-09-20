# Proposal

## Why

The portfolio now has strong recruiter-focused content and a distinctive space theme, but the Skills cards feel less responsive than the Professional Experience and project cards, leaving the visual system inconsistent. The final generic “cloud infrastructure” wording and outstanding cross-device visual checks also prevent the sister-feedback pass from being considered complete.

## What Changes

- Give every Skills card the same bounded pointer-responsive tilt and lift language already used by Professional Experience and supporting-project cards on capable desktop devices.
- Preserve the existing Skills hover, focus, click/tap selection, `aria-pressed`, and related-constellation emphasis so tilt enhances rather than replaces accessible interaction.
- Keep Skills cards static under reduced motion, constrained/static motion tiers, coarse pointers, touch-only input, and unavailable JavaScript.
- Strengthen the visible Skills hover, focus, and persistent selected treatments so the response is unmistakable in both dark and light themes.
- Replace the remaining generic About-section phrase “cloud infrastructure” with “AWS infrastructure”; retain “cloud” where it belongs to an official title or describes a project constraint.
- Complete responsive, theme, interaction, and fallback visual checks at mobile, tablet, and desktop sizes without adding dependencies or hiding recruiter-critical content.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-presentation`: Allows bounded Skills-card tilt on capable pointer devices, requires equivalent accessible static states and motion safeguards, makes recruiter-facing infrastructure wording AWS-specific, and closes the final responsive visual-quality acceptance gap.

## Impact

- Expected implementation files: `index.html`, `style.css`, `mediaqueries.css`, `script.js`, and the existing structural tests.
- Updates the active `refine-interactive-skills` behavior by superseding its prohibition on Skills-card movement; implementation should reconcile that earlier change before either change is archived.
- No new package, runtime dependency, asset, route, API, or build step is introduced.
- Experience content, project content, skill technologies, section order, terminal commands, and recruiter-facing role terminology remain unchanged.
