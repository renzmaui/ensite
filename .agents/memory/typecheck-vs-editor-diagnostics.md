---
name: Typecheck versus editor diagnostics
description: Environment-specific guidance for stale JSX diagnostics after repairing workspace React declarations.
---

The Video Lyrics workspace can retain stale TypeScript language-service diagnostics after a corrupted `@types/react` install is repaired. A valid React declaration file plus a passing package typecheck is authoritative; JSX cascade errors may require reopening the file or workspace to refresh the editor.

**Why:** The editor can keep an in-memory snapshot of an empty or invalid declaration file even after pnpm restores the dependency on disk, making one import error appear as hundreds of JSX and implicit-any errors.

**How to apply:** Run `pnpm --filter @workspace/video-lyrics run typecheck` first. If it passes while the editor still reports missing `JSX.IntrinsicElements`, refresh the editor/language service instead of adding local JSX suppressions.