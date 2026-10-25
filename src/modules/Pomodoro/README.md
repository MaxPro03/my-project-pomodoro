# Pomodoro

Pomodoro cycle like pomofocus.io: focus → short break, every Nth round → long break, any mode can be picked by hand.
A fully finished focus earns an orange; skipping still counts as a round.

- `PomodoroScreen` — the whole game screen (uses the Orange module for the mascot and crates)
- `ACTIVITIES` — what you are busy with during focus (sport, computer, reading); `timer.activity` picks the orange's pose while a focus runs
- `useTimerStore()` — timer state, settings, `activity` (per device), `snapshot()` / `hydrate()` for syncing, `lastFinished` for session history
- `useTimerSync({ isEnabled, onPhaseFinished })` — backend sync while logged in, wired from `app/integrations/backend.client.js`

State is kept in `localStorage` (`apelsini:v1`). `?fast` in the URL shortens all phases to seconds.
