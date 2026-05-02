# AGENTS.md

Standing instructions for AI agents working on this project.

This project is a static HTML/CSS/JavaScript comedic wizard card battler. The current priority is to preserve the satisfying physical card interaction system while making the codebase easier to grow into a larger, spec-driven game.

## Start Of Every Conversation

1. Read `ARCHITECTURE.md` before making decisions.
2. Inspect the files relevant to the request before proposing or editing.
3. If the request changes structure, gameplay systems, assets, tests, build tooling, debug tooling, or file ownership, update `ARCHITECTURE.md` before finishing.
4. Keep changes scoped. Do not refactor unrelated systems just because they are nearby.

## Hard Project Rules

- New source files should stay under 300 lines.
- Current known exceptions are `css/style.css` and `js/GameManager.js`; do not make them larger unless the task is specifically a short-term patch.
- When a major edit touches an oversized file, prefer extracting a focused module instead of adding more responsibility to that file.
- Keep UI text in English only.
- Preserve the core feel: cards must fan at the bottom, lift on hover, enlarge/read clearly, drag smoothly, show target feedback when needed, play or return without teleporting, and use interpolation for position, rotation, and scale.
- All game visuals must come from image files in `Assets/`.
- Do not use external images, CSS-drawn game assets, emoji art, SVG placeholders, or remote asset URLs for game visuals.
- Generated assets must be saved into `Assets/` before being referenced by the game.
- Do not introduce a bundler, framework, dependency manager, or test runner unless the task explicitly includes that migration or the user approves it.

## Architecture Discipline

- `ARCHITECTURE.md` is a living map of the project and must stay accurate.
- Treat `ARCHITECTURE.md` as required reading before implementation.
- Update the file map whenever files are added, removed, renamed, or have their responsibilities changed.
- Record intentional architecture debt instead of hiding it.
- If a new subsystem is added, document ownership, data flow, and the main integration point.

## Spec Driven Development

- Large features should start with a written spec before implementation.
- Future specs should live in a `specs/` folder using numbered names, for example `specs/001-debug-menu.md`.
- A spec should define player-facing behavior, non-goals, data/state changes, UI states, edge cases, and acceptance checks.
- Keep specs decision-complete enough that another agent can implement without guessing.
- Do not create specs for tiny fixes unless the behavior is ambiguous or risky.

## Testing And Verification

- For any gameplay logic change, add or update tests once a test harness exists.
- Before commit, the intended future gate is unit tests plus a full build/check command.
- Until a test harness exists, run targeted syntax checks such as `node --check js/*.js` for changed JavaScript files.
- Verify meaningful UI changes in a browser screenshot at desktop size.
- Verify responsive UI changes in a mobile-sized screenshot.
- Check that card text, buttons, health bars, and hand layout do not overlap after visual changes.
- No docs-only change should alter runtime behavior.

## Performance Rules

- Keep animation work frame-friendly. Avoid per-frame DOM churn unless it is bounded and intentional.
- Preserve smooth card movement and particle effects without adding unbounded particles, timers, or event listeners.
- Future work should add always-visible performance stats in a debug overlay, including uncapped FPS and average frame time.
- Future benchmark scripts should simulate high-pressure scenarios such as large hands, many particles, repeated turns, rapid drag/release, and long sessions.
- Benchmark checks should report average milliseconds per frame and catch regressions before commits.

## Feature Flags And Debug Tools

- New gameplay systems and experimental visual effects should be toggleable.
- Future debug menu controls should expose feature flags and tweakable values for card movement, particle density, enemy behavior, and timing humor.
- Debug controls must not obscure normal gameplay by default.
- Defaults should represent the intended player experience, not the debug-heavy configuration.

## Visual And UX Direction

- Tone: magical, funny, chaotic, charming, and polished.
- Main character: Archmage Brolo, overconfident and slightly incompetent.
- Enemy/companion: Skelly Steve, expressive, clumsy, and likeable.
- Palette direction: purples, blues, warm gold accents, readable fantasy UI.
- Avoid one-note palettes and avoid UI text that explains controls in a tutorial-like way unless the feature explicitly calls for onboarding.
- Cards should feel physical and responsive, with subtle magical sparks, glow flickers, and imperfect comedic spell trails.

## Current Cleanup Debt

- `js/GameManager.js` owns too many responsibilities: turn flow, card definitions, hand layout, card play validation, effect resolution, UI updates, and enemy turn orchestration.
- `css/style.css` should eventually split into layout, combat UI, cards, effects, and responsive rules.
- There is no unit test harness yet.
- There are no performance benchmark scripts yet.
- There is no debug menu or feature flag registry yet.
- There is no `specs/` folder yet.

