# Agent Synapse - Mission Control

## Overview

Agent Synapse is a "Mission Control" style interface for orchestrating AI agent workflows. It provides a visual, inspectable environment where users can spawn teams of AI agents, watch them execute tasks in real-time, and steer their behavior through intuitive controls. The application emphasizes transparency, determinism, and observability over polish - designed as a hackathon project demonstrating agentic execution with full visibility.

Key capabilities:
- **God Mode Input**: Natural language commands to spawn agent teams (e.g., "Create a research team for crypto analysis")
- **Agent Graph Canvas**: Visual React Flow-based display of agents and their relationships
- **Steering Controls**: XY pad and tool toggles to modulate agent behavior in real-time
- **Omni-Console**: Terminal-style execution log showing all agent decisions and actions
- **Artifact System**: Generated documents (markdown, JSON, code) that agents produce

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: Zustand store (`agentStore.ts`) for agents, tasks, artifacts, messages, and execution logs
- **UI Components**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Graph Visualization**: React Flow (`@xyflow/react`) for agent/artifact node canvas
- **Animations**: Framer Motion for node interactions
- **Real-time Updates**: WebSocket connection for live agent execution streaming

### Backend Architecture
- **Runtime**: Node.js with Express
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **WebSocket**: Native `ws` library for real-time bidirectional communication
- **AI Integration**: Google Gemini API (`@google/genai`) for agent LLM calls
- **Agent Runtime**: Custom implementation in `server/agent-runtime.ts` handling:
  - Goal decomposition into tasks
  - Agent decision loops with tool selection
  - Artifact creation and management
  - Execution logging

### Data Flow
1. User submits goal via God Mode Input
2. Server decomposes goal into tasks and spawns agents
3. Agents run decision loops, selecting tools or creating artifacts
4. All decisions/actions broadcast via WebSocket to frontend
5. Frontend updates Zustand store, triggering UI re-renders
6. User can steer agents mid-execution via XY pad and tool toggles

### Data Storage
- **Current**: In-memory storage (`MemStorage` class) for mission state
- **Schema Ready**: Drizzle ORM configured with PostgreSQL for user persistence
- **Session**: Express session support with `connect-pg-simple` available

### Key Design Decisions

**Bounded Execution**: Agents have max iteration limits to prevent infinite loops. All execution is observable through the Omni-Console.

**Tool System**: Agents declare available tools; users can enable/disable tools per-agent. Mock tool execution with real LLM-driven decisions.

**Artifact-First Output**: Agents produce typed artifacts (markdown, JSON, code, text) rather than just chat messages, making outputs inspectable and downloadable.

**Steering Over Configuration**: Instead of complex upfront configuration, users steer agents via continuous XY controls (creativity vs. factuality, summary vs. detailed).

## External Dependencies

### AI/LLM Services
- **Google Gemini API**: Primary LLM for agent reasoning and goal decomposition
  - Requires `GEMINI_API_KEY` environment variable

### Database
- **PostgreSQL**: Configured via Drizzle ORM for persistent storage
  - Requires `DATABASE_URL` environment variable
  - Schema in `shared/schema.ts`
  - Migrations in `./migrations` directory

### Frontend Libraries
- **@xyflow/react**: Graph visualization for agent canvas
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **Radix UI**: Accessible primitive components (dialogs, tooltips, tabs, etc.)

### Development Tools
- **Vite**: Frontend dev server and bundler
- **Drizzle Kit**: Database migration tooling (`npm run db:push`)
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay