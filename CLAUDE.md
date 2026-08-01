@AGENTS.md

## Project notes

- After adding or updating any npm dependency, run `npm run relock` (full lockfile regeneration). Plain `npm install <pkg>` on macOS prunes Linux-only optional deps from the lock and breaks `npm ci` in CI.
- Content pages live in `content/`; factual pages must carry sources, lastVerified, and verifiedBy or the build fails (see `src/lib/content.ts`).
- Run `npm run typecheck && npm run lint && npm test && npm run validate:content && npm run build` before opening a PR; CI runs the same plus format and contrast checks.
