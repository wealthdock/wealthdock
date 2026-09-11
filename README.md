# wealthdock

Main product — a central wealth-management dashboard bringing together bank accounts (multi-banking), real estate, vehicles, cash, and investments. Tracks net worth across all asset classes over time.

Part of the [wealthdock](https://github.com/wealthdock) organization — see the [org profile](https://github.com/wealthdock/.github) for how the repos fit together. Depends on [`wealthdock-server`](https://github.com/wealthdock/wealthdock-server) for sync and bank-API integration.

## Layout

| Path       | Description          |
| ---------- | -------------------- |
| `apps/web` | Vite + React web app |

More apps (e.g. a desktop client) and shared `packages/*` will be added as the product grows.

## Dev setup

Requires Node 20+ and [pnpm](https://pnpm.io) (via Corepack: `corepack enable && corepack prepare pnpm@9.15.9 --activate`).

```bash
pnpm install
pnpm dev
```

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## License

MIT — see [LICENSE](LICENSE).
