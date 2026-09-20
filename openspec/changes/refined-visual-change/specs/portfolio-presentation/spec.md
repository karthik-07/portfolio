# Spec Delta

## Purpose

Defines a recruiter-focused portfolio presentation that communicates Karthik's full-stack profile, backend and cloud strengths, professional experience, and project evidence through a clear, accessible, responsive interface.

## ADDED Requirements

### Requirement: Recruiter-focused page hierarchy
The portfolio SHALL present its primary content in the following reading order: hero, WhatBroke flagship project, professional experience, supporting projects, technical capabilities, personal About content, and contact call to action.

#### Scenario: Visitor scans the page from top to bottom
- **WHEN** a visitor reads the main page in document order
- **THEN** the visitor encounters the candidate identity and hiring intent before project evidence, experience, supporting evidence, skills, personal context, and contact information

#### Scenario: Visitor uses primary navigation
- **WHEN** a visitor activates a primary navigation link
- **THEN** the page moves to the corresponding visible content section using a stable section anchor

### Requirement: Clear candidate positioning
The hero SHALL identify Karthik as a full-stack software developer with backend, cloud, and systems strengths, show his availability and location, and provide direct actions for viewing projects and the résumé.

#### Scenario: Recruiter evaluates the hero
- **WHEN** the initial viewport is displayed
- **THEN** the candidate's role, differentiating strengths, availability, location, project action, and résumé action are understandable without using an interactive control

### Requirement: Singular signature interaction
The portfolio SHALL retain the interactive hero terminal and a restrained ambient space treatment while ensuring that decorative effects do not compete with content or require discovery.

#### Scenario: Visitor ignores the terminal
- **WHEN** a visitor does not interact with the terminal
- **THEN** all hiring-critical information remains available in standard page content

#### Scenario: Motion reduction is requested
- **WHEN** the visitor enables reduced-motion preferences
- **THEN** non-essential ambient and transition motion is disabled or reduced without hiding content

### Requirement: Restrained interaction model
The portfolio SHALL omit the command palette, pointer-following glow or trail, click ripples, hidden constellations, magnetic controls, and broad three-dimensional tilt effects.

#### Scenario: Visitor points or clicks around the page
- **WHEN** pointer movement or a click occurs outside an explicit control
- **THEN** the page does not create a pointer-following effect, ripple, hidden discovery, magnetic displacement, or card tilt response

### Requirement: Flagship project evidence
The portfolio SHALL present WhatBroke as the visually dominant flagship project with its active status, user problem, operating mechanism, relevant technologies, evidence-oriented demo, and a direct link to `https://github.com/karthik-07/whatBroke`.

#### Scenario: Recruiter reviews WhatBroke
- **WHEN** the recruiter reaches the flagship project
- **THEN** the recruiter can identify what problem it solves, how it approaches that problem, its current status, its technical context, and where to inspect its source

### Requirement: Honest supporting project status and proof
The portfolio SHALL present supporting projects as secondary evidence, label unfinished work accurately, and retain available source and live-demo links, including the Movie Database live site.

#### Scenario: Recruiter reviews NL to SQL
- **WHEN** the recruiter views the NL to SQL project
- **THEN** the project is visibly identified as work in progress and its illustrative demo is not represented as a completed production system

#### Scenario: Recruiter reviews Movie Database
- **WHEN** the recruiter views the Movie Database project
- **THEN** both its repository and `https://karthik-07.github.io/movie-database/` live demo are directly accessible

### Requirement: Visible experience and capabilities
The portfolio SHALL expose every professional role and each technical capability group in the document without requiring tab selection or scripted interaction.

#### Scenario: JavaScript is unavailable
- **WHEN** the page is loaded without JavaScript
- **THEN** all experience entries and technical capability groups remain visible and readable

#### Scenario: Recruiter scans experience and skills
- **WHEN** the recruiter scrolls through the experience and capabilities sections
- **THEN** roles, dates, organizations, evidence bullets, capability categories, and technologies can be compared without switching views

### Requirement: Personal About presentation
The About section SHALL combine an optimized portrait of Karthik with concise personal copy explaining how he approaches and originates technical work.

#### Scenario: Visitor reaches About
- **WHEN** the About section is displayed
- **THEN** the visitor sees a meaningful portrait with accessible alternative text and personal context that complements rather than repeats the technical sections

### Requirement: Coherent technical-editorial visual system
The portfolio SHALL use Geist for primary reading text, JetBrains Mono selectively for technical labels and terminal content, a neutral dark or light surface system, cyan and green as limited accents, consistent surface treatments, and readable type sizing.

#### Scenario: Visitor reads standard content
- **WHEN** body copy, metadata, controls, or card content is displayed
- **THEN** body copy remains comfortably readable, meaningful metadata and controls are not rendered below 12 CSS pixels, and text is not clipped or truncated at supported viewport sizes

#### Scenario: Visitor changes theme
- **WHEN** the visitor switches between light and dark themes
- **THEN** content hierarchy, legibility, focus visibility, and accent restraint remain consistent in both themes

### Requirement: Responsive and accessible presentation
The portfolio SHALL preserve semantic document structure, keyboard access, visible focus, sufficient color contrast, descriptive labels, and reflow without horizontal page overflow across mobile and desktop layouts.

#### Scenario: Narrow mobile viewport
- **WHEN** the page is viewed at 320 CSS pixels wide
- **THEN** content reflows into a readable single-column presentation with no page-level horizontal scrolling, clipped card text, or inaccessible action

#### Scenario: Keyboard-only navigation
- **WHEN** a visitor navigates with a keyboard
- **THEN** every actionable element is reachable in a logical order and displays a visible focus state

#### Scenario: Large desktop viewport
- **WHEN** the page is viewed at 1440 CSS pixels wide
- **THEN** the content retains readable line lengths, balanced whitespace, and clear hierarchy without excessive stretching

