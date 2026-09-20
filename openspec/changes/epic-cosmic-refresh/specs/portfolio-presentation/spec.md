# Spec Delta

## ADDED Requirements

### Requirement: Enhanced cinematic motion system
The portfolio SHALL use a verified, version-pinned third-party motion library and its scroll-linked capabilities as the primary engine for non-essential cinematic motion, applied through capability-aware tiers. Motion SHALL never block, gate, reorder, or hijack native scrolling, and the presentation SHALL remain complete when the library is unavailable or motion is reduced.

#### Scenario: Capable device loads the page
- **WHEN** the page loads on a capable fine-pointer device
- **THEN** cinematic motion is driven by the verified pinned library while all hiring-critical content is already present and interactive

#### Scenario: Motion library fails to load
- **WHEN** the third-party motion library or its network request is unavailable
- **THEN** every section, navigation link, project demo, and action remains complete and usable, and no error is surfaced to the visitor

#### Scenario: Visitor scrolls
- **WHEN** a visitor scrolls with wheel, touch, or keyboard
- **THEN** native scrolling is preserved under the visitor's control and library motion only responds to scroll position without snapping or interception

#### Scenario: Reduced motion is requested
- **WHEN** the visitor enables reduced-motion preferences
- **THEN** library-driven motion is not started and the full visual composition and content remain visible

#### Scenario: Capability is constrained
- **WHEN** data-saving, coarse-pointer, small-viewport, low-memory, or low-concurrency signals indicate constrained capability
- **THEN** expensive motion is reduced or skipped while theme, hierarchy, and interaction correctness are preserved

## MODIFIED Requirements

### Requirement: Visible experience and capabilities
The portfolio SHALL expose every professional role and technical capability group in the document without requiring tab selection, use conventional recruiter-facing labels, include AWS and AI-Assisted Development as explicit capabilities, and present résumé-supported proof near the relevant content. Professional-experience and capabilities copy SHALL be written in direct, recruiter-facing language without defensive disclaimers or self-deprecating hedging.

#### Scenario: JavaScript is unavailable
- **WHEN** the page is loaded without JavaScript
- **THEN** all experience entries, proof points, and technical capability groups remain visible and readable

#### Scenario: Recruiter scans experience and skills
- **WHEN** the recruiter scrolls through Professional Experience and Skills
- **THEN** roles, dates, organizations, supported evidence, capability categories, and technologies can be compared without switching views or decoding themed terminology

#### Scenario: Recruiter reads experience and capabilities copy
- **WHEN** the recruiter reads the Professional Experience and Skills sections
- **THEN** the copy states roles, technologies, and outcomes directly, with no résumé-disclaimer sentence, "no fake percentage bars" framing, or other defensive hedging

### Requirement: Personal About presentation
The About section SHALL combine an optimized portrait of Karthik with concise, résumé-consistent personal copy about his full-stack, cloud, cybersecurity, Linux, and AI-assisted engineering background and his preference for clear, explainable systems. The copy SHALL be written in a confident, warm voice and SHALL avoid cliché slogans and self-description aphorisms.

#### Scenario: Visitor reaches About
- **WHEN** the About section is displayed
- **THEN** the visitor sees a meaningful portrait with accessible alternative text and personal context that complements the experience and skills sections without unsupported claims or space-themed job terminology

#### Scenario: Visitor reads About copy
- **WHEN** the visitor reads the About text
- **THEN** it describes his background and working approach in plain, specific, confident language rather than slogan-style or clichéd phrasing

### Requirement: Honest supporting project status and proof
The portfolio SHALL present supporting projects as secondary evidence using one consistent card structure and visual treatment, label unfinished work accurately, and retain available source and live-demo links, including the Movie Database live site.

#### Scenario: Recruiter reviews NL to SQL
- **WHEN** the recruiter views the NL to SQL project
- **THEN** the project is visibly identified as work in progress and its illustrative demo is not represented as a completed production system

#### Scenario: Recruiter reviews Movie Database
- **WHEN** the recruiter views the Movie Database project
- **THEN** both its repository and `https://karthik-07.github.io/movie-database/` live demo are directly accessible

#### Scenario: Recruiter scans supporting projects
- **WHEN** the recruiter scans the supporting-project cards
- **THEN** the cards share one consistent, uncluttered structure with matching status, title, description, technology, and link treatments while each keeps its accurate status and available links

### Requirement: Responsive and accessible presentation
The portfolio SHALL preserve semantic document structure, keyboard access, visible focus, sufficient color contrast, descriptive labels, no-JavaScript content access, and responsive reflow while adapting cosmic effects to motion preferences, input type, viewport, visibility, and available device capability. Motion SHALL be treated as progressive enhancement: if any motion library, canvas, or effect fails to load or run, all content, navigation, and actions SHALL remain complete and usable.

#### Scenario: Narrow mobile viewport
- **WHEN** the page is viewed at 320 CSS pixels wide
- **THEN** content reflows into a readable single-column presentation with no page-level horizontal scrolling, clipped card text, inaccessible action, or interaction-dependent information

#### Scenario: Keyboard-only navigation
- **WHEN** a visitor navigates with a keyboard
- **THEN** every actionable element is reachable in logical order, displays visible focus, and does not require pointer effects to communicate state

#### Scenario: Reduced motion is requested
- **WHEN** the visitor enables reduced-motion preferences
- **THEN** canvas animation, parallax, tilt, trails, orbital motion, library-driven motion, and cinematic reveals stop or become static while the complete visual composition and all content remain visible

#### Scenario: Device capability is constrained
- **WHEN** data-saving, coarse-pointer, small-viewport, low-memory, or low-concurrency signals indicate constrained capability
- **THEN** the portfolio reduces particle density and disables expensive pointer effects while preserving theme, hierarchy, and interaction correctness

#### Scenario: Page is not visible
- **WHEN** the document becomes hidden
- **THEN** continuous animation work pauses until the document becomes visible again

#### Scenario: Motion library unavailable
- **WHEN** the third-party motion library fails to load or JavaScript is disabled
- **THEN** all sections, content, and actions are readable and operable with the static presentation

#### Scenario: Large desktop viewport
- **WHEN** the page is viewed at 1440 CSS pixels wide on a capable device
- **THEN** the full cosmic presentation provides layered depth and rich interaction while retaining readable line lengths and stable layout
