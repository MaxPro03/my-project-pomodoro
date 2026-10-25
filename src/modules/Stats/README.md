# Stats

Session history and statistics.

- `useStatsStore()` — `recordSession()` sends a finished phase to the backend, `loadSummary()` fetches totals and per-day numbers
- `StatsPanel` — today / week numbers, streak and a pixel bar chart of oranges per day (not shown on the page yet)

Finished phases are recorded while logged in (wired in `app/integrations/backend.client.js`).

Backend endpoints: `POST /api/sessions`, `GET /api/stats/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`.
