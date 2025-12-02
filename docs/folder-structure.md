[ReadMe](/README.md)

# Project Structure

```yaml
src/
├── app/ # Next.js App Router pages and page-specific components
│   ├── _hooks/ # Custom hooks (business logic for client-side)
│   ├── _types/ # Shared types and validation schemas
│   └── api/ # Next.js api endpoints to handle client-side requests on the server
├── components/ # Shared react components
│   └── ui/ # Shadcn components
├── db/ # Database schema, constants and migrations
├── models/ # Single-table model operations (data access layer)
├── operations/ # Business logic orchestration spanning multiple models
└── utils/ # Utility, helper and library functions
public/ # Static assets
docs/ # Documentation
agents/ # Planing documents (.md) for feature implementation by AI agents
└── tickets/ # Individual PR tickets documents for AI agents, broken down into commit steps

```
