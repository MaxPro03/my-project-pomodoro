# Pomodoro

Pomodoro cycle like pomofocus.io: focus → short break, every Nth round → long break, any mode can be picked by hand.
A fully finished focus earns an orange; skipping still counts as a round.

- `PomodoroScreen` — the whole game screen (uses the Orange module for the mascot and crates)
- `useTimerStore()` — timer state, settings, `snapshot()` / `hydrate()` for syncing, `lastFinished` for session history
- `useTimerSync({ isEnabled, onPhaseFinished })` — draft backend sync, not wired yet

State is kept in `localStorage` (`apelsini:v1`). `?fast` in the URL shortens all phases to seconds.
