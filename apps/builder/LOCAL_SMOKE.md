# Local Smoke

Run these commands from the generated app root:

```bash
npm install
npm run env:check
npm run check
npm run build
```

Generated apps may need `.env` values before runtime auth/data flows work. Build and typecheck should still be the first smoke tests.
