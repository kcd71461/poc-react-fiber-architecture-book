# React Fiber Architecture Ebook - Completion Prompt

## Step 0: Understand the Project

Before writing any content, read and fully understand these files:

- `AGENTS.md` — available skills and how to use them
- `README.md` — project overview and structure
- `REQUIREMENTS.md` — full requirements specification
- `.agent/skills/chapter-review/SKILL.md` — how to review chapters
- `.agent/skills/review-feedback-apply/SKILL.md` — how to apply review feedback
- `docs/plans/ebook-rebuild-plan.md` — release plan and content spec
- `src/content/chapters/_meta.js` — existing chapter registry

## Step 1: Identify Remaining Chapters

Chapters 01-04 already exist in `src/content/chapters/`. Based on REQUIREMENTS.md, identify which chapters still need to be written to complete the ebook (Phase 2 and Phase 3 content). Update `_meta.js` accordingly.

## Step 2: Write and Review Each Chapter (Double Loop)

For each chapter (including reviewing existing 01-04 and writing new ones):

### Inner Loop (max 5 iterations per chapter):

1. **Write/Update** the chapter MDX file in `src/content/chapters/`
   - Follow the chapter structure: Analogy → Problem Definition → Solution → Technical Implementation (TypeScript pseudo-code) → Browser Integration → Practice Example → Source Map → Misconceptions → Summary Checklist
   - Write in Korean (this is a Korean-language ebook)
   - Follow REQUIREMENTS.md quality standards

2. **Review** the chapter using another agent
   - Use the `chapter-review` skill (`.agent/skills/chapter-review/SKILL.md`)
   - Review output goes to `reviews/chapter-{NN}-review.md`

3. **Apply feedback** if the review found issues that need fixing
   - Use the `review-feedback-apply` skill (`.agent/skills/review-feedback-apply/SKILL.md`)
   - Apply fixes to the chapter content
   - Delete the review file only after all feedback is resolved

4. **If issues remain**, go back to step 2 (max 5 iterations)

### After Inner Loop Completes for a Chapter:

5. **Validate** the build: `pnpm run validate:content && pnpm build`
6. **Git commit and push** the completed chapter to trigger GitHub Pages deployment

## Step 3: Repeat for All Chapters

Move to the next chapter and repeat Step 2 until the entire ebook is complete.

## Step 4: Send Slack Notification

When all chapters are written, reviewed, and deployed, send a Slack message announcing the ebook completion.

## Completion Signal

When every chapter is written, reviewed, committed, pushed, and the Slack message is sent:

<promise>EBOOK COMPLETE</promise>
