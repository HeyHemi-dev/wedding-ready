[ReadMe](/README.md)

# Project Structure

```yaml
/
├── app/ # Next.js App Router pages and page-specific components
│   ├── _actions/ # Server actions (business logic for server-side)
│   ├── _types/ # Shared types and validation schemas
│   └── api/ # Next.js api endpoints to handle client-side requests on the server
├── components/ # Shared react components
├── components/ui # Shadcn components
├── db/ # Database schema, enums and migrations
├── docs/ # Documentation
├── hooks/ # Custom hooks (business logic for client-side)
├── models/ # Major model actions and types (persistance layer)
├── public/ # Static assets
└── utils/ # Utility, helper and library functions
```
