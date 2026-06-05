# CLAUDE.md

**先决规则：每次回答前加上"bHappy"。如果我没加，说明上下文已满，请开启新对话。**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NJU树洞 — 面向南京大学师生的半匿名表达、互助交流与内容治理平台（校园匿名社区）。

## Wiki 索引

项目知识库位于 `docs/wiki/`。遇到以下问题，先查看对应文档：

- 概念不清晰 → [术语表](docs/wiki/glossary.md)
- 需要编码规范 → [编码规范](docs/wiki/coding-standards.md)
- 不清楚项目约定 → [项目约定](docs/wiki/conventions.md)
- 想了解架构设计 → [架构设计](docs/wiki/architecture.md)
- 历史技术决策 → [决策记录](docs/wiki/decisions/)
- 环境搭建 → [环境配置](docs/wiki/setup.md)
- Landing Page 设计 → [Landing Page](docs/wiki/landing-page.md)
- 待办与后续规划 → [待办事项](docs/wiki/todo.md)

## Commands

```bash
# Frontend (React + Vite + Tailwind v4)
cd frontend && npm run dev      # Start dev server
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # ESLint check
cd frontend && npm run lint:fix # Auto-fix lint issues

# Backend (Express + MongoDB)
cd backend && npm run dev       # Dev with nodemon
cd backend && npm run start     # Production start
cd backend && npm run lint      # ESLint check
cd backend && npm run lint:fix  # Auto-fix
```

No tests exist yet (`npm test` is a placeholder in both packages).

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS v4 (`@tailwindcss/vite`), ESLint, Zustand
- **Backend**: Node.js (ESM, `"type": "module"`), Express 4, Mongoose 8, dotenv, nodemon
- **Styling**: Tailwind v4 with warm pink-purple custom palette (defined in `frontend/src/tailwind.css` via `@theme`)
- **State management**: Zustand stores
- **Auth**: JWT + HTTP-only cookies

## Key Architecture

1. **Anonymous ID system** (`utils.js`): Per-post anonymous display names derived by `hash(userId + postId)` → picks from a list of English given names (e.g., "Alice", "Bob", "Charlie"). Same user = same name within a post, different across posts.
2. **Backend layered architecture** (documented in `docs/wiki/`):
  - Routes → Controllers → Services → Models
  - AnonymousService as isolated core module for ID generation/tracing
  - JWT + HTTP-only Cookie auth
  - Logic delete for posts/comments, physical delete for drafts
  - Error handling via custom `AppError` with error codes
3. **Frontend layered architecture**: `components/` split into `pages/`, `features/`, `layout/`, `common/`. State in Zustand stores (`store/`). API calls in `services/`. Business logic in `hooks/`.
4. **Mobile UI architecture** (width < 640px):
  - **Bottom nav**: 5-item bar with center compose button (`.mobile-nav`, `.mobile-nav-item`, `.mobile-compose-btn` in tailwind.css). "我的" uses `matchPages` array to stay active across `my`, `bookmarks`, `likes`, `myposts` sub-pages.
  - **Search expansion**: TopBar search box expands to full width on mobile. `searchExpanded` state toggled by `focus`/click-outside/ESC. On confirm with content, `requestFeedScroll()` triggers HomePage to `scrollIntoView` the feed tabs.
  - `**safe-area-inset`**: TopBar and MobileNav account for notched screens via `env(safe-area-inset-*)`.
  - **No FAB**: Compose entry point is solely the MobileNav center button (the floating action button was removed).
5. **MyPage hub** ([MyPage.jsx](frontend/src/components/pages/MyPage.jsx)): Tabbed sub-navigation aggregating "我的帖子", "我的收藏", "我的喜爱". Collection pages (`BookmarksPage`, `LikesPage`, `MyPostsPage`) accept a `compact` prop to hide their hero section when embedded.
6. **CSS approach**: Layout component styles use semantic CSS classes defined in `tailwind.css` (`.mobile-nav`, `.search-box`, `.collection-page`, `.my-page`, etc.) rather than long inline Tailwind class strings. Reusable utility classes (`.primary-button`, `.pill`, `.masonry-grid`, etc.) live there as well.
7. **Scroll signal**: `uiStore.feedScrollToken` — incremented by `requestFeedScroll()` (e.g. after search confirm). HomePage's `useEffect` watches it and calls `scrollIntoView({ behavior: 'smooth' })` on the feed tabs, then resets the token to 0. Mobile-only guard (`window.innerWidth < 640`).
8. **OpenSpec workflow**: `explore` → `propose` → `apply` → `archive`. Detailed conventions in [项目约定](docs/wiki/conventions.md).

## Frontend Component Organization

```
frontend/src/
├── components/
│   ├── pages/        # Page-level components (routed via activePage state)
│   │   └── MyPage.jsx  # Mobile hub: tabbed nav for my posts/bookmarks/likes
│   ├── features/     # Feature-specific components (post/comment/report/AI/etc.)
│   ├── layout/       # Layout components (Sidebar, TopBar, MobileNav)
│   └── common/       # Reusable primitives (Modal, Toast, Icon, Card, etc.)
├── store/            # Zustand stores
├── hooks/            # Shared logic hooks
├── services/         # API service layer
├── App.jsx           # Root component with routing & auth guard
├── utils.js          # Helpers: genId, formatCount, anonymous ID system
└── tailwind.css      # Tailwind v4 imports + @theme custom palette
```

## Git Conventions

- Branch names: `feature/<module>-<desc>`, `fix/<module>-<desc>`, `docs/<desc>`
- Commit prefix: `[AI-assisted]` or `[Human-written]` + conventional commit message, e.g. `[AI-assisted] feat(auth): implement JWT login`
- AI-generated code must be reviewed by at least one team member
- Security-related code (auth, anonymous mapping, permission control) requires additional review
- Main branch: `main`

## Delete Strategy

- Posts & comments: logic delete (`isDeleted: true`)
- Users: ban/mute, never physically deleted
- Drafts: physical delete (drafts are not formal content)

## Important Notes

- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind` directives. Custom theme values go in `@theme {}` block.
- UI language: 简体中文 throughout.
- Design system: Warm pink-purple palette (rose, lavender, peach tones — see `tailwind.css` for `--color-*` tokens).

## Coding Guidelines

Behavioral guidelines based on Karpathy's observations on LLM coding pitfalls:

### 1. Think Before Coding

State assumptions explicitly. If uncertain, ask. Present multiple interpretations — don't pick silently. Push back when a simpler approach exists. Stop when confused and name what's unclear.

### 2. Simplicity First

Minimum code that solves the problem. No speculative features, no abstractions for single-use code, no flexibility/configurability that wasn't requested, no error handling for impossible scenarios. If 200 lines could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Don't improve adjacent code, refactor things that aren't broken, or change style to match preferences. When your changes create orphans (unused imports/variables), clean those up — don't touch pre-existing dead code.

### 4. Goal-Driven Execution

Define verifiable success criteria before starting. For multi-step tasks, state a brief plan with checks. Loop until criteria met.