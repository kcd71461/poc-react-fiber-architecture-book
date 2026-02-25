# CLAUDE.md — React Fiber Architecture Ebook

This file provides guidance for AI assistants (Claude, etc.) working in this repository.

---

## Project Overview

This is a **Korean-language educational ebook** explaining React Fiber's internal architecture. It is built as a statically-exported Next.js site using Nextra (an MDX documentation framework) and deployed to GitHub Pages.

**Live URL**: `https://kcd71461.github.io/poc-react-fiber-architecture-book`
**Content language**: Korean (한국어)
**Target audience**: Intermediate React developers

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | ^16.1.6 | App framework (static export) |
| React | ^19.1.0 | UI library |
| Nextra | 4.6.1 | MDX-based docs framework |
| nextra-theme-docs | 4.6.1 | Documentation theme |
| TypeScript | ^5.7.3 | Type safety (strict mode) |
| Pagefind | ^1.4.0 | Client-side full-text search |
| pnpm | 10.x | Package manager (required) |
| Node.js | 20.x | Runtime |

---

## Directory Structure

```
.
├── .agent/skills/                  # AI agent skill definitions
│   ├── chapter-review/             # Chapter review skill
│   └── review-feedback-apply/      # Apply review feedback skill
├── .github/workflows/
│   └── deploy-pages.yml            # GitHub Pages CI/CD (triggers on push to main)
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (Nextra theme, navbar, sidebar)
│   ├── page.tsx                    # Root redirect → /book
│   └── book/[[...mdxPath]]/
│       └── page.tsx                # Dynamic MDX page handler
├── docs/                           # Internal planning/reference docs (not served)
│   ├── chapters/                   # Draft markdown chapter notes
│   ├── plans/ebook-rebuild-plan.md # Project roadmap
│   ├── reference/browser-apis.md  # API reference notes
│   └── glossary.md                 # Terminology notes
├── scripts/
│   └── validate-content.mjs        # Content validation (chapter headings & keywords)
├── src/
│   ├── app.css                     # Global styles & custom Nextra theme variables
│   ├── components/ebook/           # Reusable interactive React components
│   │   ├── BlockingVsYieldingTimeline.tsx  # Frame budget visualization
│   │   ├── InlineAnnotation.tsx            # Hover tooltips for terms
│   │   └── SourceMapTable.tsx              # React source code reference table
│   └── content/                    # MDX content (the actual ebook)
│       ├── _meta.js                # Top-level sidebar navigation order
│       ├── index.mdx               # Introduction page (들어가며)
│       ├── glossary.mdx            # Terminology dictionary (용어 사전)
│       ├── chapters/
│       │   ├── _meta.js            # Chapter sidebar order
│       │   ├── index.mdx           # Chapter guide (챕터 가이드)
│       │   ├── 01-why-fiber.mdx    # Chapter 01: Why Fiber was needed
│       │   ├── 02-browser-scheduler.mdx  # Chapter 02: Browser Scheduler
│       │   └── 03-fiber-node-structure.mdx  # Chapter 03: Fiber nodes & traversal
│       └── reference/
│           ├── _meta.js            # Reference sidebar order
│           ├── browser-apis.mdx    # Browser API reference
│           └── react-source-map.mdx # React source code mappings
├── mdx-components.tsx              # MDX component provider (Nextra requirement)
├── next.config.mjs                 # Next.js + Nextra config
├── tsconfig.json                   # TypeScript config (strict, ES2022, @/* alias)
├── package.json                    # Dependencies and scripts
├── pnpm-lock.yaml                  # Lock file (do not edit manually)
├── REQUIREMENTS.md                 # Detailed content and educational specification
└── README.md                       # Project readme (Korean)
```

---

## Development Commands

```bash
# Install dependencies (use pnpm, not npm or yarn)
pnpm install

# Start local dev server → http://localhost:3000/book
pnpm dev

# Validate chapter content structure and required keywords
pnpm run validate:content

# Run ESLint
pnpm lint

# Build static site + generate Pagefind search index
pnpm build

# Serve the built static site
pnpm start
```

**Important**: Always use `pnpm`. The project uses `pnpm-lock.yaml` and frozen lockfile in CI.

---

## Content Conventions

### MDX Frontmatter Schema

Every chapter file in `src/content/chapters/` must include this frontmatter:

```yaml
---
title: "01. 왜 Fiber가 필요했나"
chapter: "01"
summary: "One-sentence chapter summary in Korean"
analogy: "Analogy concept used in the chapter"
learningGoals:
  - "독자가 설명할 수 있어야 할 것 (Korean)"
estimatedReadMinutes: 15
keyQuestions:
  - "핵심 질문 (Korean)"
sourceBaseline: "react@18.2.0"
---
```

### Chapter Structure (Required Order)

Each chapter must follow this sandwich structure from `REQUIREMENTS.md`:

1. **비유 소개** — Analogy introduction (relatable everyday comparison)
2. **문제 정의** — Problem definition (what technical problem Fiber solves)
3. **해결 방법** — Solution description
4. **기술적 구현 (TypeScript 의사 코드)** — Technical implementation with TypeScript pseudocode
5. **브라우저 통합** — Browser integration context
6. **실습** — Hands-on practice
7. **소스 맵** — Source map (links to actual React source)
8. **오해 교정** — Misconception correction
9. **요약 체크리스트** — Summary checklist

### Navigation Config (`_meta.js`)

Sidebar navigation is controlled by `_meta.js` files. Keys must exactly match filenames (without extension).

```javascript
// src/content/_meta.js
export default {
  index: "들어가며",
  chapters: "Part I. Fiber Core",
  glossary: "용어 사전",
  reference: "API 레퍼런스",
};
```

### Content Validation

`scripts/validate-content.mjs` validates Chapter 01 for required headings and key Korean/English technical terms including: `React 15`, `React 16`, `Stop-the-world`, `Sebastian Markbage`, `Andrew Clark`, `MessageChannel`, `performance.now`, `cooperative multitasking`, `algebraic effects`.

Run `pnpm run validate:content` before committing chapter changes.

---

## TypeScript Conventions

- **Strict mode** enabled (`"strict": true` in tsconfig)
- **Target**: ES2022
- **Path alias**: `@/*` maps to repository root (e.g., `@/src/components/ebook/InlineAnnotation`)
- **MDX files** are included in TypeScript compilation
- Use `react-jsx` JSX transform (no need to import React in TSX files)

---

## Interactive Components

Located in `src/components/ebook/`. These are used directly inside MDX chapter files.

| Component | Usage | Description |
|-----------|-------|-------------|
| `<BlockingVsYieldingTimeline />` | Chapter 01 | Visualizes 16.7ms frame budget: Stack vs Fiber task scheduling |
| `<InlineAnnotation term="..." definition="...">` | All chapters | Hover tooltip for technical terms; supports keyboard accessibility |
| `<SourceMapTable />` | Reference section | Table linking React source modules to concepts |

When adding new interactive components:
1. Create `.tsx` file in `src/components/ebook/`
2. Export it from the file directly (no barrel index needed)
3. Import it at the top of the MDX file where it's used

---

## Styling

- **Global styles**: `src/app.css`
- **Theme color**: `--nextra-primary-hue: 199deg`, `--nextra-primary-saturation: 80%`
- Background uses radial gradients
- Custom CSS classes: `.callout`, `.source-map-table`, `.bar` (with animation), `.inline-annotation`
- Avoid adding component-specific styles to the global CSS; use Tailwind or inline styles for component-scoped styles if needed

---

## Configuration

### `next.config.mjs`

- **Output**: `"export"` (static site — no server-side features)
- **basePath/assetPrefix**: Set to `/poc-react-fiber-architecture-book` in production (`NODE_ENV=production`), empty string in dev
- **LaTeX**: Enabled (`latex: true`) via Nextra
- **Search**: Pagefind (codeblocks excluded from index)
- **Images**: `unoptimized: true` (required for static export)

Do not add `getServerSideProps`, API routes, or any server-only Next.js features — they are incompatible with static export.

### `mdx-components.tsx`

Required by Nextra. Wraps MDX files with the `useMDXComponents` hook. Add any globally available MDX components here.

---

## AI Agent Skills

Located in `.agent/skills/`. These are Claude-specific reusable workflows.

### `chapter-review`

Reviews a chapter from the perspective of an intermediate Korean React developer. Checks:
- Structure and flow (analogy → problem → solution → practice → summary)
- Korean grammar and naturalness
- Terminology introduction timing
- Code example clarity (inline comments, pseudocode vs real code)
- Visual element integration
- Section placement
- Learning support (checklist alignment)

Outputs: `reviews/chapter-{num}-review.md`

### `review-feedback-apply`

Reads `reviews/*.md` files and applies the feedback to the corresponding chapter MDX files. After applying fixes, deletes the review file if all issues are resolved.

---

## Deployment

**Trigger**: Push to `main` branch (or manual workflow dispatch)

**Pipeline** (`.github/workflows/deploy-pages.yml`):
1. Checkout code
2. Setup pnpm 10 + Node 20
3. `pnpm install --frozen-lockfile`
4. `pnpm build` → generates `out/` directory + Pagefind search index
5. Upload `out/` as GitHub Pages artifact
6. Deploy to GitHub Pages

**Do not merge untested changes to `main`** — every push triggers a live deployment.

---

## Git Workflow

- **Main branch**: `main` — deploys automatically to GitHub Pages
- **Feature branches**: Use prefix `claude/` for AI-generated branches
- **Commit messages**: Use conventional commit format:
  - `feat:` — new content or feature
  - `fix:` — bug fix or content correction
  - `docs:` — documentation changes
  - `chore:` — build/config changes
- **Never force-push to `main`**

---

## Content Language Rules

All chapter content (`.mdx` files in `src/content/`) must be written in **Korean (한국어)**, except for:
- Code blocks (always in English)
- Technical terms (can be Korean + English in parentheses on first use, e.g., `파이버 노드(Fiber node)`)
- Frontmatter field values (mixed; `title` in Korean, `sourceBaseline` in English)

---

## Key Domain Concepts

Understanding these is essential for accurate content:

- **Stack Reconciler** (React ≤15): Synchronous, recursive, blocks main thread ("stop-the-world")
- **Fiber Reconciler** (React ≥16): Async, interruptible unit of work; linked list not recursive tree
- **Fiber node**: Object with `child`, `sibling`, `return` pointers + `pendingProps`, `memoizedProps`, `effectTag`
- **Scheduler**: 5ms yield slices using `MessageChannel`; uses `performance.now()` for timing
- **Double Buffering**: `current` tree (on screen) vs `workInProgress` tree (being built)
- **Render Phase**: Async, interruptible — can be paused/resumed/aborted
- **Commit Phase**: Synchronous, non-interruptible — applies DOM mutations
- **Lane model**: Priority system for updates (since React 18)
- **Key React APIs**: `useTransition`, `useDeferredValue`, `Suspense`, `startTransition`
- **Key contributors**: Sebastian Markbåge (architect), Andrew Clark (documentation)
- **React source baseline**: `react@18.2.0`

---

## Common Tasks

### Add a new chapter

1. Create `src/content/chapters/NN-chapter-name.mdx` with required frontmatter
2. Add entry to `src/content/chapters/_meta.js`
3. Follow the 9-section structure from REQUIREMENTS.md
4. Run `pnpm run validate:content` (update validation script if needed for new chapter)
5. Run `pnpm build` to verify no build errors

### Add a new interactive component

1. Create `src/components/ebook/MyComponent.tsx`
2. Import in the MDX file: `import MyComponent from '@/src/components/ebook/MyComponent'`
3. Use it in JSX within the MDX content

### Update navigation sidebar

Edit the relevant `_meta.js` file. The key must match the filename (without `.mdx`).

### Run a chapter review

Use the `.agent/skills/chapter-review` skill — it guides fetching the page and running through all 7 review criteria automatically.
