<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# STRICT GIT & COMMIT PROTOCOL (NON-NEGOTIABLE)

1. **IDENTITY & STATE VERIFICATION**:
   - Verify local identity before any commit: `git config --local user.name "dkayush7373"` and `git config --local user.email "dkayush73@gmail.com"`.
   - Never use global config. Verify source is `file:.git/config`.

2. **QUALITY GATES BEFORE EVERY COMMIT**:
   - Run `npm run lint`, `npx tsc --noEmit`, and `npm test` before staging.
   - All checks must pass with 0 errors. Never commit broken code.

3. **COMMIT AFTER EVERY SINGLE LOGICAL STEP**:
   - Absolutely NO mega-commits, delayed commits, or batching the whole session at the end.
   - Commit as you build: 1 commit per distinct step (e.g., Step 1: styles/tokens, Step 2: component UI, Step 3: logic/hook, Step 4: tests, Step 5: docs).
   - Use Conventional Commits: `type(scope): description` (`feat:`, `style:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
   - Explicit staging only (`git add <exact-file>`). Never run blind `git add .`.

4. **DIRECT MAIN DELIVERY (GITHUB CONTRIBUTION INTEGRITY)**:
   - Deliver and push all commits directly to `origin main` (or fast-forward merge without squashing) so every individual commit registers immediately on the GitHub profile contribution graph.
   - If submodule changes occur, commit and push the updated pointer to `travel-resque-repo` on `main` as well.
   - Strictly forbidden: Never use `git commit --amend`, squash, `rebase`, `reset --hard`, or force-push.

5. **VERIFICATION & REAL EVIDENCE**:
   - For every commit, verify remotely with `git ls-remote origin main`.
   - Output real terminal proof for each step: full 40-char SHA, commit message, and clickable GitHub URL:
     `https://github.com/dkayush7373/<repo>/commit/<SHA>`

