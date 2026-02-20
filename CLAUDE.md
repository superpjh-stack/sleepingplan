# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Name:** SleepingPlan (Project #10)
**Level:** Dynamic (fullstack with authentication and database via bkend.ai BaaS)
**Status:** Early phase — no application code exists yet. Development pipeline is at Phase 1.

## Development Pipeline

This project uses the bkit PDCA methodology. Current pipeline phase: **Phase 1 (Schema/Terminology)**.

Progression order:
1. Schema & terminology definition
2. Coding conventions
3. UI mockup
4. API design
5. Design system
6. UI integration
7. SEO & security
8. Code review & gap analysis
9. Deployment

Use `/pdca status` to check current phase, `/pdca next` to advance.

## Tech Stack (Planned)

- **Frontend:** Next.js (App Router)
- **Auth:** NextAuth.js (Credentials Provider)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **AI Coaching:** Claude API (claude-haiku-4-5)
- **Level:** Dynamic (requires login, data storage, API integration)

## Key Files

- `docs/.pdca-status.json` — tracks PDCA pipeline phase and feature status
- `docs/.bkit-memory.json` — bkit session metadata
