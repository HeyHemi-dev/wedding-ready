[ReadMe](/README.md)

# Project Structure

```yaml
/
├── app/ # Next.js App Router pages and page-specific components
│   ├── _actions/ # Server actions (business logic for server-side)
│   ├── _hooks/ # Custom hooks (business logic for client-side)
│   ├── _types/ # Shared types and validation schemas
│   └── api/ # Next.js api endpoints to handle client-side requests on the server
├── components/ # Shared react components
├── components/ui # Shadcn components
├── db/ # Database schema, constants and migrations
├── docs/ # Documentation
├── models/ # Single-table model operations (data access layer)
├── operations/ # Business logic orchestration spanning multiple models
├── public/ # Static assets
└── utils/ # Utility, helper and library functions
```
