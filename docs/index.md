# Personal Finance Management App — Documentation Index

> **Generated:** 2026-05-08 | **Scan Level:** Quick (pattern-based) | **GitNexus-assisted**
>
> **Stats:** 393 files indexed, 3368 symbols, 119 execution flows, ~70 API routes

## Project Overview

- **Type:** Monorepo (multi-part microservices)
- **Parts:** 1 Frontend + 1 Gateway + 9 Backend Services + Shared Libraries
- **Primary Languages:** TypeScript/JavaScript, C# (.NET)
- **Architecture:** Microservices with API Gateway + Event-Driven (RabbitMQ) + gRPC
- **Infrastructure:** Docker Compose, MongoDB, Redis, RabbitMQ, N8N

### Quick Reference

| Part | Tech | Port |
|------|------|------|
| Frontend | React 19 / Vite 7 / TailwindCSS 4 | 5173 |
| Gateway | Express 5 / http-proxy-middleware | 3000 |
| Auth Service | ASP.NET Core (Clean Architecture) | 3006 |
| User Service | Node.js / Express | 3001 (gRPC: 50054) |
| Account Service | Node.js / Express | 3002 (gRPC: 50051) |
| Transaction Service | ASP.NET Core (Clean Architecture) | 3007 |
| Category Service | Node.js / Express | 3003 (gRPC: 50052) |
| Budget Service | Node.js / Express | 3008 (gRPC: 50053) |
| Analytics Service | Node.js / Express / MongoDB | 3004 |
| Notification Service | Node.js / Express | 3005 |
| AI Service | Node.js / Express | 4005 |

## Generated Documentation

- [Project Overview](./project-overview.md) — Executive summary, tech stack, service inventory
- [Architecture](./architecture.md) — System architecture, communication patterns, data design
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory structure, critical folders
- [API Contracts](./api-contracts.md) — All REST, gRPC, and RabbitMQ contracts (~70 endpoints)
- [Integration Architecture](./integration-architecture.md) — Service dependencies, data flows, event pipelines
- [Development Guide](./development-guide.md) — Setup, local dev, conventions, common tasks

## Documents Available for Deep Scan

The following documents can be generated with a **Deep Scan** for more detailed analysis:

- Component Inventory _(To be generated)_ — Detailed UI component catalog
- Data Models _(To be generated)_ — Database schemas, entity relationships
- Deployment Guide _(To be generated)_ — Production deployment procedures

## Getting Started

1. Review this `index.md` for project orientation
2. Read [Project Overview](./project-overview.md) for executive summary
3. Read [Architecture](./architecture.md) for system design understanding
4. Read [Development Guide](./development-guide.md) to set up local environment
5. Reference [API Contracts](./api-contracts.md) when working on features
6. Reference [Integration Architecture](./integration-architecture.md) for cross-service changes

## For AI Agents

When creating features or fixing bugs:
- **Frontend-only changes**: Reference `architecture.md` (Section 4) + `api-contracts.md`
- **Single service changes**: Reference `architecture.md` (Section 3) + relevant service in `source-tree-analysis.md`
- **Cross-service changes**: Reference `integration-architecture.md` + `api-contracts.md` (gRPC/RabbitMQ sections)
- **Full-stack features**: Reference all documents, start with `project-overview.md`

## Brownfield PRD Command

When ready to plan new features, run the BMad PRD workflow and provide this index as input:
```
"lets create a product requirements document"
```
