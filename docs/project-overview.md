# Personal Finance Management App — Project Overview

## Executive Summary

A full-stack personal finance management application built with a **microservices architecture**. The system helps users track income/expenses, manage budgets, analyze spending patterns, and interact with an AI financial assistant. The backend consists of **11 independently deployable services** communicating via REST (through an API Gateway), **RabbitMQ** (async events), and **gRPC** (inter-service calls), with a **React** single-page application as the frontend.

## Repository Structure

| Aspect | Detail |
|--------|--------|
| **Type** | Monorepo (multi-part) |
| **Parts** | 1 Frontend + 1 Gateway + 9 Backend Services + Shared Libraries |
| **Primary Languages** | TypeScript/JavaScript (frontend + 7 Node.js services), C# (2 .NET services) |
| **Architecture** | Microservices with API Gateway pattern |

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | React 19, Vite 7 |
| **UI Library** | Radix UI + TailwindCSS 4 | Latest |
| **Charts** | Recharts | 3.8 |
| **Routing** | React Router | 7.x |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |
| **API Gateway** | Express + http-proxy-middleware | Express 5, Node.js |
| **Node.js Services** | Express | 5.x |
| **.NET Services** | ASP.NET Core (Clean Architecture) | .NET 8+ |
| **Message Broker** | RabbitMQ | 3.x (alpine) |
| **Database (Analytics)** | MongoDB | 7.x |
| **Cache** | Redis | 7 (alpine) |
| **Workflow Automation** | N8N | Latest |
| **Inter-service Comm.** | gRPC + Protobuf | — |
| **Containerization** | Docker Compose | 3.8 |

## Service Inventory

| Service | Tech | Port | Database | Role |
|---------|------|------|----------|------|
| **frontend** | React/TS/Vite | 5173 | — | SPA web client |
| **gateway** | Node.js/Express | 3000 | — | API Gateway, auth middleware, request routing |
| **auth_service** | .NET/C# | 3006 | — | Authentication, JWT, password management |
| **user_service** | Node.js | 3001 (+ gRPC 50054) | — | User profile management |
| **account_service** | Node.js | 3002 (+ gRPC 50051) | — | Financial accounts (bank, wallet, etc.) |
| **transaction_service** | .NET/C# | 3007 | — | Transaction CRUD with category/account validation |
| **category_service** | Node.js | 3003 (+ gRPC 50052) | — | Income/expense categories |
| **budget_service** | Node.js | 3008 (+ gRPC 50053) | — | Budget planning and tracking |
| **analytics_service** | Node.js | 3004 | MongoDB | Spending analytics, anomaly detection, reports |
| **notification_service** | Node.js | 3005 | — | Push notifications, alerts |
| **ai_service** | Node.js | 4005 | — | AI chatbot, financial insights, deep scan |

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/` | User authentication |
| Register | `/register` | New user registration |
| Forgot Password | `/forgot-password` | Password recovery |
| Reset Password | `/reset-password` | Password reset flow |
| Dashboard | `/dashboard` | Overview with balances, charts, recent activity |
| Accounts | `/accounts` | Manage financial accounts |
| Transactions | `/transactions` | List, filter, CRUD transactions |
| Transaction Detail | `/transactions/:id` | Single transaction view |
| Budgets | `/budgets` | Budget creation and monitoring |
| Statistics | `/statistics` | Charts, spending trends, category analysis |
| ChatBox | `/chatbox` | AI financial assistant chat |

## Key Execution Flows (from GitNexus)

- **Transaction CRUD** → Cross-service validation (category + account) → RabbitMQ events → Analytics update
- **User Registration** → Auth service → RabbitMQ → User service profile creation
- **Analytics Pipeline** → Transaction events → FlattenObject → MongoDB aggregation
- **AI Chat** → User query → Financial context assembly → LLM response → Streaming
- **Budget Monitoring** → Transaction events → Budget threshold checks → Notification alerts

## Infrastructure

All services are containerized via Docker Compose on a shared `finance-network` bridge. Infrastructure services include MongoDB (analytics data), Redis (caching/sessions), RabbitMQ (message broker), and N8N (workflow automation).
