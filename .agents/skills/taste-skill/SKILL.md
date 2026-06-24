---
name: taste-skill
description: Improve UI taste, art direction, and product specificity for frontend work. Use when Codex is building or refining websites, portfolios, landing pages, dashboards, admin tools, games, visual systems, or any interface that should feel signature, intentional, domain-aware, and less generic or agentic.
---

# Taste Skill

Use this skill as a short art-direction pass before and after implementation.
It is not a component library. It is a taste filter for making UI choices feel
owned by the product and person behind it.

## Direction

Before coding, name the direction in one sentence:

- Subject: what object, person, product, or workflow must be unmistakable?
- Audience: who needs to scan or use this repeatedly?
- Mood: choose 2-3 concrete adjectives, not generic praise.
- Signature detail: one memorable visual or interaction idea.
- Restraint: one common generated-UI habit to avoid.

For a portfolio, make the first viewport the portfolio itself. Do not hide the
work behind a marketing page unless the user explicitly asked for one.

## Taste Rules

- Start from the domain material: real assets, screenshots, typography, motifs,
  content, and constraints already present in the brief.
- Keep one hero idea and let secondary UI support it. Do not make every section
  compete for attention.
- Avoid filler decoration: blobs, generic gradients, empty cards, fake metrics,
  vague feature copy, and stock-like atmosphere.
- Use texture with intent. Pixel art, scanlines, shadows, dithering, and glow
  should support readability and interaction, not obscure content.
- Make controls behave like controls. Buttons need hover, focus, active, and
  disabled states; forms need save/error/success states.
- Prefer direct labels over clever labels for admin or repeated workflows.
- Preserve visual rhythm: align edges, repeat spacing, and keep fixed-format UI
  dimensions stable when content changes.
- Make text fit. Long words, handles, emails, and buttons must wrap or shrink
  gracefully on mobile and desktop.
- Use color as a system, not a wash. Even expressive palettes need neutrals,
  contrast, and at least one non-dominant accent.

## Pixel Portfolio Notes

- Keep pixelated imagery crisp with `image-rendering: pixelated`.
- Use few high-contrast fonts. Pixel display fonts are best for labels and
  window chrome; use a more legible monospace or pixel sans for body text.
- Let windows, taskbars, icons, and drag affordances create the experience.
  Avoid explanatory in-app text about how the interface works.
- Use real window states: focused, minimized/closed, active taskbar item,
  scrollable content, and keyboard-reachable controls.
- Keep the admin CMS quieter than the public site. The CMS should feel like a
  clean editor for the pixel world, not a second flashy portfolio.

## Final Pass

Review the UI at desktop and mobile sizes and answer:

1. Does the first viewport identify the person/product immediately?
2. Does one visual idea carry the design?
3. Did any text overflow, overlap, or look mechanically generated?
4. Are interactive states visible and tactile?
5. Could a designer point to at least one specific, memorable choice?

If the answer to any question is no, make a concrete adjustment before calling
the UI finished.
