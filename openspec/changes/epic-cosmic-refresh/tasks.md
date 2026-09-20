# Tasks

## 1. Verified third-party motion integration

- [x] 1.1 Add pinned, deferred GSAP and ScrollTrigger script tags from a verified CDN with `crossorigin` (and Subresource Integrity only if a hash for the exact pinned version is confirmed), then verify the page loads with no console error and a runtime guard for `window.gsap` and `window.ScrollTrigger` exists.
- [x] 1.2 Add a load guard and graceful fallback so that when the library or its network request is unavailable, every section, link, and action still works and no unhandled error is thrown; verify by blocking the CDN request.
- [x] 1.3 Initialize GSAP/ScrollTrigger only for the `full` tier (and, at most, cheap entrances for `constrained`) using `gsap.matchMedia()`, integrating with the existing `data-motion` tier state; verify `static` starts no timelines and toggling reduced motion tears existing timelines down.
- [x] 1.4 Move section reveals, hero intro, scroll-linked ambience, and the WhatBroke sequence onto GSAP timelines without `normalizeScroll`, pinning, or snap; verify `node --check script.js` passes and wheel, touch, keyboard, and anchor scrolling remain native and un-snapped.

## 2. Copy refresh

- [x] 2.1 Reword the Professional Experience section intro and bullets into direct, résumé-grounded language and delete the disclaimer sentence; verify every claim is traceable to `assets/Karthik-Resume.pdf` and the disclaimer text is absent.
- [x] 2.2 Remove the Skills "No fake percentage bars." line and any other defensive/hedging copy while keeping conventional capability labels and résumé-listed tools; verify no hedging phrasing remains.
- [x] 2.3 Reword the WhatBroke closing note confidently while preserving the evidence-versus-causation distinction; verify the final output never implies correlation proves cause.
- [x] 2.4 Rewrite the About copy in confident, warm, cliché-free prose; verify the portrait, alternative text, caption, and contact facts remain intact and no slogan-style lines remain.

## 3. Supporting project cards

- [x] 3.1 Redesign the Pronunciation, NL→SQL, and Movie Database cards into one uniform structure (meta row, status, title, description, uniform tags, consistent link row); verify NL→SQL reads as work in progress and Movie Database retains both its repository and `https://karthik-07.github.io/movie-database/` live-demo links.
- [x] 3.2 Update card styles and responsive rules for the uniform structure; verify no clipped text, overlap, or inaccessible action at 320px, tablet width, and 1440px in both themes.

## 4. Verification

- [x] 4.1 Verify reduced-motion, no-JavaScript, and simulated CDN-blocked loads each leave every section, action, and link present and usable with the static presentation.
- [x] 4.2 Audit keyboard order, visible focus, heading order, landmarks, labels, contrast, theme state, and dynamic announcements; verify a keyboard-only pass completes without a focus trap and decorative layers stay out of the accessibility tree.
- [x] 4.3 Run `node --check script.js`, audit duplicate IDs, internal anchors, local assets, external links (including the pinned CDN), and obsolete copy; verify the only new dependency is GSAP + ScrollTrigger and record all checks as passing.
