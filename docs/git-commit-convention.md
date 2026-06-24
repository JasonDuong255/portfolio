# Git Commit Convention

This project follows Conventional Commits so history stays easy to scan and
release notes can be generated later.

## Format

```text
<type>(<scope>): <summary>
```

The scope is optional, but preferred when the change touches a clear area.

Examples:

```text
feat(admin): add project image editor
fix(portfolio): prevent broken local image paths
docs(git): add commit convention
chore(deps): update Next.js packages
```

## Types

- `feat`: a new user-facing feature or capability.
- `fix`: a bug fix or broken behavior repair.
- `docs`: documentation-only changes.
- `style`: formatting-only changes that do not alter behavior.
- `refactor`: code restructuring without user-facing behavior changes.
- `perf`: performance improvements.
- `test`: tests, QA scripts, fixtures, or test-only updates.
- `build`: build system, package, or dependency changes.
- `ci`: CI/CD workflow changes.
- `chore`: maintenance work that does not fit the above types.
- `revert`: revert a previous commit.

## Scopes

Use short lowercase scopes. Prefer these project scopes:

- `admin`: admin CMS, auth checks, content editing.
- `portfolio`: public portfolio UI and content rendering.
- `design`: theme, visual system, layout styling.
- `supabase`: database, RLS, Supabase clients, API writes.
- `qa`: Playwright/browser QA scripts and verification.
- `docs`: documentation and project notes.
- `deps`: package or lockfile updates.
- `config`: Next.js, TypeScript, Codex, or tooling config.

## Summary Rules

- Use imperative mood: `add`, `fix`, `update`, `remove`.
- Keep the summary under 72 characters when possible.
- Start with lowercase after the colon.
- Do not end the summary with a period.
- Commit one logical change at a time.

## Body And Footer

Add a body when the reason or tradeoff is not obvious:

```text
feat(admin): add field-based CMS editor

Replace the JSON-only editor with grouped inputs so portfolio fields can be
updated without editing raw JSON.
```

Use `BREAKING CHANGE:` in the footer for incompatible data or API changes:

```text
feat(content): split portfolio content tables

BREAKING CHANGE: portfolio_content rows must be migrated before deploy.
```

## Before Committing

- Run relevant checks for code changes, usually `npm run typecheck`,
  `npm run build`, and `npm run qa:ui`.
- Confirm `.env.local`, `.next`, `.qa`, `node_modules`, and generated artifacts
  are not staged.
- Review `git diff --cached --check` before committing.
