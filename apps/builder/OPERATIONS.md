# Operations

Service: Stylyf Builder

## Health

- `GET /api/health`: lightweight liveness check; does not touch external services.
- `GET /api/readiness`: checks required environment presence without printing secret values.

## Logging

- `src/lib/server/observability.ts` emits JSON logs through `logInfo` and `logError`.
- Keep request IDs, user IDs, and domain identifiers explicit in log metadata.
- Never log raw auth tokens, database URLs, object-storage keys, or signed URLs.

## Backend

- auth: supabase
- database: supabase
- storage: s3
