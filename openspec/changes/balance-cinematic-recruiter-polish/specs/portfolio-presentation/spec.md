# Spec Delta

## MODIFIED Requirements

### Requirement: Recruiter-focused page hierarchy
The portfolio SHALL present its primary content in the following reading order: hero, WhatBroke? flagship project, professional experience, supporting projects, technical capabilities, personal About content, and contact call to action.

#### Scenario: Visitor scans the page from top to bottom
- **WHEN** a visitor reads the main page in document order
- **THEN** the visitor encounters the candidate identity and hiring intent before project evidence, experience, supporting evidence, skills, personal context, and contact information

#### Scenario: Visitor uses primary navigation
- **WHEN** a visitor activates a primary navigation link
- **THEN** the page moves to the corresponding visible content section using a stable section anchor

### Requirement: Clear candidate positioning
The hero, personal summary, and contact call to action SHALL identify Karthik as a full-stack software developer with backend, AWS, and systems strengths, show his availability and location, and provide direct actions for viewing projects, the résumé, and contacting him about relevant roles.

#### Scenario: Recruiter evaluates the hero
- **WHEN** the initial viewport is displayed
- **THEN** the candidate's role, differentiating strengths, availability, location, project action, and résumé action are understandable without using an interactive control

#### Scenario: Recruiter reads infrastructure positioning
- **WHEN** a recruiter encounters general infrastructure wording in the hero, Skills, About, or Contact content
- **THEN** the wording identifies AWS specifically rather than using an unexplained generic cloud label

#### Scenario: Recruiter reaches Contact
- **WHEN** a recruiter reaches the Contact section
- **THEN** the copy reinforces availability for full-stack roles involving backend systems, AWS, or production ownership and provides direct contact actions

### Requirement: Restrained interaction model
The portfolio SHALL omit the command palette, pointer-following page glow or trail, click ripples, hidden constellations, and magnetic controls while allowing one coherent bounded three-dimensional treatment on major content surfaces only for capable fine-pointer devices without a reduced-motion request.

#### Scenario: Visitor points or clicks around the page
- **WHEN** pointer movement or a click occurs outside an explicit control or supported major content surface
- **THEN** the page does not create a pointer-following effect, ripple, hidden discovery, magnetic displacement, or unrelated surface response

#### Scenario: Fine-pointer visitor explores major content
- **WHEN** a visitor using a capable fine pointer moves across the flagship, a Professional Experience card, a supporting-project card, a Skills card, or the Contact panel while full motion is enabled
- **THEN** only that major surface receives bounded pointer-relative tilt, lift, and localized lighting without moving its nested controls independently

#### Scenario: Fine-pointer visitor explores a Skills card
- **WHEN** a visitor using a capable fine pointer moves across a Skills card while full motion is enabled
- **THEN** that card responds with the same bounded pointer-relative tilt and lift language used by the other major content surfaces while its related decorative connection is emphasized

#### Scenario: Visitor explores utility or nested surfaces
- **WHEN** a visitor points at navigation, a button, tag, status pill, proof cell, terminal control, demo-internal panel, About note, or small statistic
- **THEN** that surface remains spatially stable and uses only its ordinary hover or focus treatment

#### Scenario: Visitor selects a Skills card
- **WHEN** a visitor clicks, taps, or keyboard-activates a Skills card
- **THEN** that card retains a clear persistent selected treatment and synchronized `aria-pressed` state without hiding technologies or requiring tilt to communicate selection

#### Scenario: Motion or pointer capability is limited
- **WHEN** reduced motion is requested, the motion tier is constrained or static, or the primary input cannot hover precisely
- **THEN** major content surfaces remain static while preserving visible hover where applicable, focus, selection, actions, and readable content

### Requirement: Flagship project evidence
The portfolio SHALL present WhatBroke? as the visually dominant flagship project with consistent product naming, its active status, a concise problem-and-mechanism explanation, relevant technologies, an evidence-oriented demo, and a direct link to `https://github.com/karthik-07/whatBroke`.

#### Scenario: Recruiter reviews WhatBroke
- **WHEN** the recruiter reaches the flagship project
- **THEN** the recruiter can identify within the opening copy that WhatBroke? is a local Linux forensics CLI that relates newly observed failures to preceding system changes, understand its current status and technical context, and access its source

#### Scenario: Visitor encounters the product name
- **WHEN** the product is named in metadata, visible headings, narrative copy, About content, or terminal output
- **THEN** it is displayed as `WhatBroke?`, while lowercase `whatbroke` is reserved for commands, identifiers, and URLs

### Requirement: Visible experience and capabilities
The portfolio SHALL expose every professional role and each technical capability group in the document without requiring tab selection or scripted interaction, arrange Skills modules on visibly aligned desktop, tablet, and mobile layouts, provide clearly perceivable optional card interaction, and lead technical bullets with recruiter-understandable outcomes before unfamiliar tool names.

#### Scenario: JavaScript is unavailable
- **WHEN** the page is loaded without JavaScript
- **THEN** all experience entries and technical capability groups remain visible and readable in their default aligned arrangement

#### Scenario: Recruiter scans experience and skills
- **WHEN** the recruiter scrolls through the experience and capabilities sections
- **THEN** roles, dates, organizations, outcomes, evidence bullets, capability categories, and technologies can be compared without switching views or already knowing agent-tool names

#### Scenario: Recruiter scans Skills on desktop
- **WHEN** the Skills section is displayed at 1440 CSS pixels with full motion and a fine pointer
- **THEN** all six modules have aligned edges and consistent gaps, visibly respond to pointer exploration, and keep AWS & DevOps and AI-Assisted Development emphasized without clipped content

#### Scenario: Visitor views Skills on tablet or mobile
- **WHEN** the viewport no longer safely supports the desktop constellation or pointer interaction
- **THEN** Skills reflows to a balanced two-column tablet layout and a single-column mobile layout with static cards, no clipped text, no overlap, and no horizontal page overflow

### Requirement: Coherent technical-editorial visual system
The portfolio SHALL use Geist for primary reading text, JetBrains Mono selectively for technical labels and terminal content, neutral dark or light glass surfaces, cyan and green as limited semantic accents, consistent major-card depth, and readable type sizing without broad colored washes competing with content.

#### Scenario: Visitor reads standard content
- **WHEN** body copy, metadata, controls, or card content is displayed
- **THEN** body copy remains comfortably readable, meaningful metadata and controls are not rendered below 12 CSS pixels, and text is not clipped or truncated at supported viewport sizes

#### Scenario: Visitor views flagship and Contact surfaces
- **WHEN** the flagship project or Contact section is displayed
- **THEN** its primary surface remains visually neutral while green is localized to meaningful active, available, action, border, or signal details rather than a broad background haze

#### Scenario: Visitor changes theme
- **WHEN** the visitor switches between light and dark themes
- **THEN** content hierarchy, neutral surface treatment, legibility, focus visibility, card depth, and semantic accent restraint remain consistent in both themes

### Requirement: Responsive and accessible presentation
The portfolio SHALL preserve semantic document structure, keyboard access, visible focus and selection, sufficient color contrast, descriptive labels, motion preferences, and reflow without horizontal page overflow across mobile and desktop layouts.

#### Scenario: Narrow mobile viewport
- **WHEN** the page is viewed at 320 CSS pixels wide
- **THEN** content reflows into a readable single-column presentation with no page-level horizontal scrolling, clipped card text, inaccessible action, or tilt-dependent information

#### Scenario: Keyboard-only navigation
- **WHEN** a visitor navigates through cards and controls with a keyboard
- **THEN** every actionable element is reached in logical order, displays a visible focus state, and communicates state without requiring pointer motion

#### Scenario: Visitor changes theme
- **WHEN** the visitor explores major content surfaces in either light or dark theme
- **THEN** boundaries, text, focus, selected state, localized lighting, and meaningful accents remain clearly perceivable

#### Scenario: Motion reduction is requested
- **WHEN** the visitor enables reduced-motion preferences
- **THEN** tilt, lift, connector travel, and non-essential state transitions are disabled while immediate focus, selection, and action feedback remains available

#### Scenario: Large desktop viewport
- **WHEN** the page is viewed at 1440 CSS pixels wide
- **THEN** the content retains readable line lengths, balanced whitespace, clear hierarchy, and major-surface interaction that does not cause overlap, clipping, or excessive movement
