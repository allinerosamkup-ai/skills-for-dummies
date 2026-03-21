# Stacks Recomendadas por Tipo de App

## Web (Frontend)
- **React** + Vite + TailwindCSS
- **Next.js** — quando precisar de SSR/SSG ou full-stack
- **Vue** + Vite — alternativa mais simples ao React

## Web (Backend / API)
- **Node.js** + Express ou Fastify
- **Python** + FastAPI — APIs rápidas com tipagem
- **Python** + Django — quando precisar de admin, ORM, auth prontos

## Full-Stack (monorepo)
- **Next.js** (React + API routes)
- **SvelteKit**
- **Remix**

## Mobile
- **React Native** + Expo — cross-platform (iOS + Android)
- **Flutter** — performance nativa, Dart

## Desktop
- **Electron** + React/Vue — cross-platform com web tech
- **Tauri** + React — menor bundle, mais performático que Electron

## CLI
- **Python** + Click ou Typer
- **Node.js** + Commander.js
- **Go** + Cobra — binários rápidos e portáteis
- **Rust** + Clap — máxima performance

## Bot
- **Discord**: discord.py (Python) ou discord.js (Node)
- **Telegram**: python-telegram-bot ou grammy (Node)
- **WhatsApp**: Baileys (Node)

## Banco de Dados
| Caso | Opção |
|------|-------|
| SQL simples | SQLite |
| SQL escalável | PostgreSQL |
| NoSQL documentos | MongoDB |
| Cache / sessões | Redis |
| ORM Python | SQLAlchemy ou Prisma |
| ORM Node | Prisma ou Drizzle |

## Padrão para MVP rápido
- Web: Next.js + SQLite (via Prisma) + TailwindCSS
- API: FastAPI + SQLite
- CLI: Python + Typer
