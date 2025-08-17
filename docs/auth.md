[ReadMe](/README.md)

# Authentication Flow

The project uses Supabase Auth with a server-side implementation:

1. **Server-Side Auth**: Implemented using Supabase SSR client
2. **Protected Routes**: Middleware handles auth protection
3. **Session Management**: Automatic session refresh and cookie handling
4. **Centralised**: Network request to Supabase auth server from middleware
4. **Auth Operations**: Business logic centralized in `@/operations/auth-operations.ts`
