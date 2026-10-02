# Apelsini

8-bit pomodoro timer where every finished focus session grows an orange.

```sh
npm install
npm run dev          # http://localhost:5173, add ?fast to shorten phases to seconds
npm run build
```

## Structure (FEOD)

The project follows [FEOD](https://feod.dev/) — Fractal Entity Oriented Design.
Imports only go one way: `common → modules → pages → app`. Modules are used only through their `index.js`;
`common` has no index files.

```
src/
  app/        bootstrap: entry.js, App.vue, styles, config.js, integrations/ (pinia, pwa, backend draft), assets/
  pages/      index.vue — the only screen for now
  modules/
    Pomodoro/ timer logic, settings and the game screen
    Orange/   the 3D mascot, pixel sprites and harvest crates
    Auth/     registration and login (draft, not wired)
    Stats/    session history and statistics (draft, not wired)
  common/
    ui/         PixelButton, PixelSprite
    utilities/  sfx (chiptune sounds), http (API client)
server/       backend draft (Fastify + Prisma), see server/README.md
```
