# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NJU树洞 — 面向南京大学师生的半匿名表达、互助交流与内容治理平台（校园匿名社区）。

Current stage: P1 需求分析完成，前端功能迭代中，后端 API 待实现。

## Wiki 索引

项目知识库位于 `docs/wiki/`。遇到以下类型的问题，先阅读对应文件：

- 概念不清晰 → [术语表](docs/wiki/glossary.md)
- 不知道代码怎么写 → [编码规范](docs/wiki/coding-standards.md)
- 不了解项目约定（Git/命名/分层职责） → [项目约定](docs/wiki/conventions.md)
- 不清楚整体架构 → [架构设计](docs/wiki/architecture.md)
- 想了解历史技术决策 → [决策记录](docs/wiki/decisions/)
- 环境搭建 → [环境配置](docs/wiki/setup.md)

## Commands

```bash
# Frontend (React + Vite + Tailwind v4)
cd frontend && npm run dev      # Start dev server
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # ESLint check
cd frontend && npm run lint:fix # Auto-fix lint issues

# Backend (Express + MongoDB, scaffold only)
cd backend && npm run dev       # Dev with nodemon
cd backend && npm run start     # Production start
cd backend && npm run lint      # ESLint check
cd backend && npm run lint:fix  # Auto-fix
```

No tests exist yet (`npm test` is a placeholder in both packages).

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS v4 (`@tailwindcss/vite`), ESLint
- **Backend**: Node.js (ESM, `"type": "module"`), Express 4, Mongoose 8, dotenv, nodemon
- **Styling**: Tailwind v4 with warm pink-purple custom palette (defined in `frontend/src/tailwind.css` via `@theme`)
- **State**: Currently all state lifted to `App.jsx` with `localStorage` persistence; docs plan Zustand stores
- **No backend src/ yet** — only `backend/package.json` exists, `src/` directory needs to be created

## Project Structure

```
SE2proj/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root app with all page routing & state
│   │   ├── main.jsx          # Entry point
│   │   ├── utils.js          # Helpers: genId, formatCount, loadJSON, saveJSON, anonymous ID system
│   │   ├── tailwind.css      # Tailwind v4 imports + @theme custom palette
│   │   └── components/       # All UI components (flat, no subdirectories)
│   │       ├── HomePage.jsx, DetailPage.jsx, ComposePage.jsx, BookmarksPage.jsx
│   │       ├── PostCard.jsx, Comment.jsx, ReportModal.jsx
│   │       ├── Sidebar.jsx, TopBar.jsx, MobileNav.jsx
│   │       ├── AdminPage.jsx, AnnouncementsPage.jsx, TrendingPage.jsx, SettingsPage.jsx
│   │       ├── AIPanel.jsx, DailyFortune.jsx, DailyLuck.jsx
│   │       ├── HeroCarousel.jsx, Icon.jsx, Toast.jsx
│   │       ├── EmptyState.jsx, StatCard.jsx, Progress.jsx
│   │       └── ...
│   ├── index.html
│   └── vite.config.js
├── backend/
│   └── package.json          # Scaffold only — no src/ code yet
├── docs/
│   └── wiki/                 # Architecture docs, conventions, glossary, ADRs
├── openspec/
│   ├── config.yaml           # OpenSpec project config
│   └── specs/                # Feature specs (bookmarks, carousel, events, etc.)
└── .github/workflows/ci.yml  # Basic structure check on push/PR
```

## Key Architecture

1. **Current frontend pattern (single-page SPA)**: `App.jsx` is the root component holding all state via `useState` + `useEffect` with `localStorage` persistence. Page routing is a simple `activePage` string state that conditionally renders page components. No React Router, no Zustand (yet).

2. **Anonymous ID system** (`utils.js`): Per-post anonymous display names derived by `hash(userId + postId)` → picks from `ADJECTIVES` + `ANIMALS` arrays (e.g., "温柔的小蓝鲸"). Same user = same name within a post, different across posts.

3. **Backend target architecture** (documented in `docs/wiki/`):
   - Routes → Controllers → Services → Models
   - AnonymousService as isolated core module for ID generation/tracing
   - JWT + HTTP-only Cookie auth
   - Logic delete for posts/comments, physical delete for drafts
   - Error handling via custom `AppError` with error codes

4. **OpenSpec workflow**: `explore` → `propose` → `apply` → `archive` (skills in `.claude/skills/`)

## Git Conventions

- Branch names: `feature/<module>-<desc>`, `fix/<module>-<desc>`, `docs/<desc>`
- Commit prefix: `[AI-assisted]` or `[Human-written]` + conventional commit message
- AI-generated code must be reviewed by at least one team member
- Main branch: `main`, active development: `frontend`

## Important Notes

- **No backend code yet** — the `backend/src/` directory does not exist. Feature work is currently all frontend with plain objects (no API calls). When backend implementation begins, follow the Layered architecture (Routes → Controllers → Services → Models).
- **Mock data seeds** are inline in `App.jsx` with `localStorage` persistence keys prefixed `nju_*` (e.g., `nju_posts`, `nju_comments`).
- The documented plans mention Zustand stores, hooks, and service layers for the frontend, but none are implemented yet — the existing code is all flat `useState` in App.
- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind` directives. Custom theme values go in `@theme {}` block.
- UI language: 简体中文 throughout.
- Design system: Warm pink-purple palette (rose, lavender, peach tones — see `tailwind.css` for `--color-*` tokens).
