# CLAUDE.md

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

1. **Anonymous ID system** (`utils.js`): Per-post anonymous display names derived by `hash(userId + postId)` → picks from `ADJECTIVES` + `ANIMALS` arrays (e.g., "温柔的小蓝鲸"). Same user = same name within a post, different across posts.

2. **Backend layered architecture** (documented in `docs/wiki/`):
   - Routes → Controllers → Services → Models
   - AnonymousService as isolated core module for ID generation/tracing
   - JWT + HTTP-only Cookie auth
   - Logic delete for posts/comments, physical delete for drafts
   - Error handling via custom `AppError` with error codes

3. **Frontend layered architecture**: `components/` split into `pages/`, `features/`, `layout/`, `common/`. State in Zustand stores (`store/`). API calls in `services/`. Business logic in `hooks/`.

4. **OpenSpec workflow**: `explore` → `propose` → `apply` → `archive` (skills in `.claude/skills/`)

## Frontend Component Organization

```
frontend/src/
├── components/
│   ├── pages/        # Page-level components (routed via activePage state)
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
- Commit prefix: `[AI-assisted]` or `[Human-written]` + conventional commit message
- AI-generated code must be reviewed by at least one team member
- Main branch: `main`, active development: `frontend`

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
