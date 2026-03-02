# Review Criteria

Use this checklist when refining the Gemini prompt or validating report quality.

## 1) Technical Correctness

- Verify claims about React/Fiber/browser internals against code or chapter context.
- Flag ambiguous or potentially wrong statements as `major` or `critical`.

## 2) Terminology Consistency

- Keep core terms consistent across files (e.g., Fiber, Reconciler, Commit).
- Point out mixed translations or term drift between chapters/docs.

## 3) Learning Flow

- Check whether section order supports progressive understanding.
- Flag abrupt jumps where prerequisite concepts are missing.

## 4) Writing Quality

- Find typos, awkward Korean phrasing, and repeated sentences.
- Request concrete rewrite suggestions, not generic comments.

## 5) Actionability

- Every finding must include:
  - Severity (`critical|major|minor`)
  - File path
  - Evidence quote
  - Proposed fix

## Output Sanity Checks

- Require a short executive summary.
- Require top-priority fixes in explicit order.
- Keep optional improvements separated from required fixes.
