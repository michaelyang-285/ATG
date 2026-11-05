---
name: "All Things Gwinnett"
description: "Independent local reading with a Soft Serif identity, candid sans-serif type, orange actions, and thin editorial rules."
colors:
  orange: "#ff4d22"
  text-orange: "#b92f10"
  ink: "#171717"
  white: "#ffffff"
  surface: "#f5f5f2"
  rule: "#d3d3ce"
  muted: "#62625e"
  field-stroke: "#9a9a94"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(32px, 3.5vw, 48px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body-compact:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  action:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
  utility-link:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.6
  story-metadata:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "0.035em"
  quiet:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "4px"
spacing:
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "36": "36px"
components:
  button-orange:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  field:
    rounded: "{rounded.control}"
    padding: "10px 14px"
    width: "min(550px, 100%)"
  desktop-nav:
    textColor: "{colors.ink}"
  mobile-disclosure:
    textColor: "{colors.ink}"
  story-preview:
    textColor: "{colors.ink}"
    padding: "18px 0"
  newsletter:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "26px 28px"
  empty-state:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "36px"
---

# Design System: All Things Gwinnett

## Overview

**Creative North Star: "The guide desk"**

All Things Gwinnett is an independent local publication with a warm, recognizable Soft Serif logo and direct, compact reading surfaces. White space, ink typography, fine dividers, and a concentrated orange accent carry the approved lighter neo-brutalist character. The supplied logo owns the outlined lettering and shallow offset; the interface itself remains flat.

The built system favors a clear headline, a useful short summary, and a visible destination. DM Sans supplies the complete live-text hierarchy. Density comes from editorial rows and aligned columns, with a single reading sequence on small screens. The launch tagline remains separate from the permanent logo artwork.

**Key Characteristics:**

- Supplied Soft Serif artwork paired with locally hosted DM Sans.
- White reading surfaces, ink text, and orange identity and action areas.
- Thin dividers and open editorial rows instead of elevated card shells.
- Readable summaries, restrained controls, and explicit empty states.

This record describes the implemented public website. Evidence: `styles/globals.css`, `app/layout.tsx`, `app/(site)/page.tsx`, `components/SiteHeader.tsx`, `components/Publication.tsx`, and `components/DirectionIcon.tsx`; durable brand commitments are in `PRODUCT.md`. Approved homepage/navigation references are in `.impeccable/mocks/approved-homepage.png` and `.impeccable/mocks/approved-navigation.png`; rendered desktop, tablet, mobile, and open-menu evidence is in `.impeccable/review/`. The source supplies exact values. Screenshots confirm the visible empty-content state. The approved guide-desk composition is one surface expression, not a required layout for every page.

## Colors

One vivid accent sits against a warm neutral reading palette. Frontmatter values are normative; the roles below explain their use.

### Primary

- **Orange** (`orange`): supplied brand identity, newsletter band, newsletter buttons, and selection background.
- **Text orange** (`text-orange`): small text links, story metadata, input caret, and focus outlines. This deeper orange is the text treatment, not a second accent family.

### Neutral

- **Ink** (`ink`): reading text, headings, stroke icons, and text on orange surfaces; inverse button fill.
- **White** (`white`): page, search, desktop submenu, and mobile menu surfaces; inverse button text.
- **Surface** (`surface`): quiet empty-content panels, the launch artwork frame, submenu hover, and expanded mobile navigation groups.
- **Rule** (`rule`): the repeated fine section and list dividers.
- **Muted** (`muted`): placeholder text, bylines, coming-soon status, and footer credit.
- **Field stroke** (`field-stroke`): search and text-field boundaries.

### Named Rules

**The Two Oranges Rule.** Use orange for filled action areas and brand emphasis; use text-orange for small links, metadata, caret, and keyboard focus. Filled orange controls carry ink text.

## Typography

**Display and Body Font:** DM Sans, with a generic sans-serif fallback. The three supplied local TTF files provide regular (400), medium (500), and bold (700), with `font-display: swap`.

**Logo:** supplied Soft Serif vector artwork; it is not a loaded heading font.

**Character:** friendly sans-serif reading with compact, strongly weighted headlines. Headings use balanced wrapping, tight leading, and modest negative tracking; body copy remains open and sentence case. The scale is an observed set of editorial roles rather than a mathematical ratio.

### Hierarchy

- **Display:** the responsive page-heading role in frontmatter. The mobile homepage lead is fixed at 34px; article titles use `clamp(34px, 4vw, 52px)`.
- **Headline:** section and results headings. The supporting-story section uses 30px on larger screens and 27px on mobile; mobile section headings also use 27px.
- **Title:** repeated story titles, topic previews, and utility-row headings. Headings share bold weight, 1.12 leading, and negative tracking.
- **Body:** reading and general prose. Introductory and preview copy uses the compact role; the featured deck keeps 18px type with 1.55 leading.
- **Action:** button text. Navigation and text links also use 16px bold, with inherited 1.6 leading; utility-row links use the medium-weight role.
- **Story metadata:** compact uppercase category/format text below the headline. It names real taxonomy and is not a standalone kicker.
- **Quiet:** short coming-soon annotations. Footer navigation and bylines use 14px; footer credit is 12px.

Reading measures are constrained by use: lead decks and empty-state paragraphs (60ch), introductory copy (62ch), page decks (65ch), and general prose (68ch). These are maximum widths, not forced line breaks.

### Named Rules

**The Artwork Boundary Rule.** Render the supplied Soft Serif logo as artwork. Keep live headings and interface text in DM Sans; preserve the launch tagline as separate text.

**The Headline First Rule.** Place story taxonomy after its headline. Category and format metadata describe real content; they are not decorative eyebrows.

## Layout

The public shell is centered with a maximum width of 1200px and desktop side space of 40px. At 950px and below, side space becomes 24px; at 760px and below, it becomes 20px; below 360px, it becomes 12px. The masthead, navigation, page sections, and footer share this alignment.

Spacing is a mixed editorial rhythm rather than an asserted universal grid. The repeated steps in frontmatter cover small metadata separation, control groups, section gaps, and panel padding. Fine divisions use 1px rules; larger groups are separated by space and heading hierarchy.

On the homepage, the lead and supporting rail use `minmax(0, 1.85fr) minmax(0, 1fr)` with a 48px gap, reduced to 30px at 950px. The introductory tagline and description stack at that breakpoint. At 760px, the lead and rail become a single sequence, the guides change from two columns to one, vertical guide dividers become horizontal, and utility links wrap. Newsletter content and footer groups stack at the same breakpoint.

The shared guide pair uses equal columns, a 32px gap, and a dividing rule with 32px inset on the second item; mobile uses a 20px gap and inset above the second item. General article reading is capped at 760px and centered; results and empty panels cap at 850px. Other content surfaces may use those reading containers without inheriting the homepage composition.

Story images use `object-fit: cover` in a 16:9 frame. The homepage lead uses the approved shallow frame (2.7:1 desktop, 2.4:1 mobile). Missing story imagery renders no invented photograph; the current no-story homepage uses a distinct surface-colored launch panel with the supplied logo.

## Elevation & Depth

The public UI has no box-shadow vocabulary. White, surface fills, thin borders, and spacing provide separation. The desktop submenu sits above content at z-index 20 with a flat white fill and a 1px rule. The native mobile dialog occupies the viewport and uses a translucent ink backdrop (`#17171780`); its layering is functional. The focus outline is a state indicator, not elevation. The logo’s approved shallow flat offset is part of the identity artwork.

### Named Rules

**The Flat Reading Surface Rule.** Separate content with white space, thin rules, and surface fills. UI components do not inherit the logo artwork’s offset or gain drop shadows.

## Shapes

Editorial rows, photographs, content panels, and dropdowns use rectangular geometry. Buttons, search shells, text fields, and the newsletter band share the subtle control radius in frontmatter. Thin rules remain square and uninterrupted. Icon drawings are inline SVG line work, generally with a 1.6 stroke; directional arrows are 18px, the search icon is 20px, and menu controls use 20–24px drawings. These dimensions describe artwork, not universal touch-target size.

## Components

### Buttons

Compact, bold filled actions. Orange buttons pair the orange fill with ink text; inverse buttons pair ink with white. Both use the action typography, control radius, 10px 20px padding, and a 46px minimum height. Hover underlines the label. Keyboard focus uses a 3px text-orange outline with 4px offset. No custom pressed transformation or transition is implemented. Disabled buttons retain the shipped wait cursor; there is no separate disabled-color token.

### Cards / Containers

Story previews are open editorial rows with no enclosing card surface, radius, or shadow. Their 18px vertical padding and bottom rule create cadence; the final row omits the rule. Headline, real taxonomy, and optional excerpt form the order. Results use roomier 24px vertical padding. Guide previews reuse this content pattern without an extra lower border inside the two-column guide layout.

Empty-content panels use surface fill, 36px padding (24px on mobile), an explanatory heading, and readable copy. Their current messages are content states, not permanent campaign text.

### Inputs / Fields

Search is a white, thin-stroked rounded shell. Its text input uses 16px type, 10px 12px padding, a 210px desktop width (180px at 950px), and a muted placeholder. The adjacent submit button is 44px square with a real SVG search icon. Mobile search fills its container. A separate page text field uses the same stroke and radius with 10px 14px padding, a width of `min(550px, 100%)`, and `min-width: 0`. Both retain the shared visible keyboard outline and text-orange caret. No custom error-color system is implemented.

### Navigation

The masthead logo is 260px wide on desktop and 240px on mobile. Desktop navigation uses four bold 16px topic links in a row with 32px gaps and top/bottom rules. The current page gets a 3px orange underline. Each direct destination has a separate disclosure button; clicking it opens one white, bordered submenu at a time. Submenus have 8px outer padding, 10px 12px link padding, and a 240px minimum width. Links underline on hover, with surface fill for submenu hover. Escape, focus leaving the group, outside click, and route change close the expanded group.

At 760px and below, the desktop tools and navigation give way to a Menu control and a native modal dialog. The open dialog is white, 100dvh high, scrollable, and padded 20px. It locks body scrolling, restores trigger focus on close, and supports Escape. Its close control is 44px square. Section summaries use bold 23px text with ruled lower edges. Native details expand surface-colored lists; an SVG plus becomes a minus by hiding the vertical stroke. Shortcut links follow the groups, then the orange newsletter action. Content-gated subtype links may be absent while primary destinations remain available.

### Newsletter Band

A flat orange panel with the shared control radius. Desktop content sits in a horizontal row with 32px gap and 26px 28px padding; mobile stacks it with 24px gap and padding. Ink copy preserves contrast. A configured destination reveals an inverse action; otherwise the shipped panel plainly states that signup is opening soon and links to the community. It does not render a functioning email field without a configured collection service.

### Links, Focus, and Motion

Text destinations use descriptive labels and optional inline SVG directional arrows. Links underline on hover with a 5px underline offset; article/prose links and the pending newsletter destination stay underlined. Interactive anchors, buttons, inputs, and summaries share the visible focus outline. A skip link appears on keyboard focus. Smooth document scrolling is the only declared motion; reduced-motion preference switches it to auto. No entrance choreography or transition-duration system is present.

## Do's and Don'ts

### Do:

- Do use the supplied logo artwork and the locally hosted DM Sans weights already shipped.
- Do use text-orange for small actionable text and ink on filled orange controls.
- Do preserve headline-first story previews, short summaries, and visible link destinations.
- Do carry the same content order into the single-column mobile layout.
- Do retain the visible keyboard outline, real SVG icons, and keyboard-operable disclosures.
- Do distinguish unpublished content and unavailable signup with explicit empty-state copy.

### Don't:

- Don’t recreate the Soft Serif logo with a system display font or attach the launch tagline to its artwork.
- Don’t extend the logo’s outline and offset into shadows on reading surfaces or controls.
- Don’t place invented kickers or decorative eyebrows above story headings.
- Don’t replace the repeated editorial rows with elevated, heavily rounded card shells.
- Don’t present wireframe sample stories or an unconfigured newsletter form as available content.

**Not canonized:** illustrative wireframe headlines, pre-headline kicker placement in the mock, one-off launch-art framing values, and the temporary coming-soon copy are not reusable system rules. The shipped source places taxonomy after the headline; the approved logo offset remains an artwork-specific treatment rather than a general UI effect. No remaining craft-floor defect is promoted into a token.
