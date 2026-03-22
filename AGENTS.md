# Agent Instructions

## Project Overview

- This is a TanStack Start app built with React 19, TypeScript, Tailwind CSS 4, and Vite.
- Backend logic runs on Cloudflare Workers with D1/SQLite and Drizzle ORM.
- The app includes document editing flows, Monaco-based code editing, Mermaid rendering, and folder/document management.

## Repo Basics

- Use `pnpm` for installs, checks, tests, and scripts.
- Prefer `rg` for searches and `apply_patch` for edits.
- Keep changes minimal and consistent with the existing React/TanStack/Cloudflare style.
- Do not overwrite unrelated user changes.

## Architecture And Modularity

- Favor small, focused components and hooks over large monolithic files.
- Keep feature logic close to the feature boundary:
  - UI components under `src/components/...`
  - reusable state and data access in `src/hooks/...`
  - server functions in `src/server/functions/...`
  - shared DB schemas in `src/server/db/schema/...`
- Reuse existing primitives before adding new abstractions.
- Prefer prop-driven composition over duplicate feature-specific variants.
- If a behavior spans multiple layers, update the hook/server/UI boundary cleanly instead of adding ad hoc local state.

## Coding Style

- Use TypeScript throughout; keep types explicit at public boundaries.
- Prefer functional React components and hooks.
- Match the repository’s existing formatting and naming conventions.
- Use concise, purposeful comments only when the intent is not obvious.
- Keep UI changes aligned with the existing design language unless the task explicitly calls for a new visual direction.
- Avoid unnecessary memoization unless the codebase already uses it for that case.

## File Naming

- Use kebab-case for new files unless you are matching an existing convention in the same folder.
- Keep filenames descriptive and feature-oriented, for example `file-sidebar.tsx` or `use-code-doc-settings.ts`.
- Prefer one primary component or hook per file when practical.
- If a file grows too large, split by responsibility rather than adding more conditional logic.

## Before Commit

Run these checks before any commit:

```bash
pnpm check --fix --unsafe
pnpm typecheck
```

If either command fails, fix the issues before committing.

## Implementation Notes

- Prefer reusing existing hooks, UI primitives, and server functions.
- Keep new code ASCII-only unless the file already uses Unicode.
- Add or update tests when behavior changes.
- If a change affects generated code, migrations, or shared schemas, verify the impact before merging.
