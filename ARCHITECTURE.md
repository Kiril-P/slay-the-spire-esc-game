# ARCHITECTURE.md

Living architecture map for the Archmage Brolo card battle demo.

Future agents must read this file before starting work and update it before finishing any structural change.

## Runtime Overview

- The game runs directly from `index.html`.
- The project currently has no package manifest, bundler, framework, module loader, build step, test harness, or dependency manager.
- JavaScript files are loaded as global browser scripts in `index.html`.
- Each JavaScript file uses an IIFE and exports one global on `window`.
- CSS is a single stylesheet at `css/style.css`.
- Visual assets are local PNG files under `Assets/`.
- The game should remain launchable by opening `index.html` directly unless a future migration is explicitly approved.

## Current Gameplay Flow

1. `index.html` loads the DOM, stylesheet, assets, and JavaScript files.
2. `js/main.js` waits for `DOMContentLoaded`.
3. `main.js` creates `new GameManager()` and exposes it as `window.broloGame`.
4. `GameManager.start()` draws the initial hand, updates UI, starts recurring Skelly Steve gag timing, and begins the animation loop.
5. `GameManager.loop()` runs every animation frame, updates cards, updates targeting feedback, and asks `AnimationManager` to render canvas effects.
6. `InputManager` tracks pointer movement, hover, drag start, drag release, and cancel behavior.
7. `Card` instances own visual card state and interpolate toward target position, rotation, and scale every frame.
8. Valid card releases call `GameManager.playCard()`.
9. Played cards animate toward the discard pile, resolve effects after a short timing delay, leave the hand, and enter `Deck.discardPile`.
10. `End Turn` discards the remaining hand, lets the enemy attack, then starts a new player turn if both characters are alive.

## Core Runtime Responsibilities

- `GameManager` is the coordinator. It owns turn state, energy, player/enemy instances, card definitions, deck, hand layout, UI text updates, card play validation, effect resolution, enemy turn sequencing, and the main frame loop.
- `InputManager` owns browser pointer events and translates them into game-level card hover, drag, release, and cancel calls.
- `Card` owns card DOM creation, card state transitions, target values, interpolation, z-index priority, and transform rendering.
- `Deck` owns draw pile, discard pile, shuffling, drawing, discarding, and pile counts.
- `Character` owns shared health/block behavior, health UI updates, hitboxes, cast points, and simple class-based animation flashes.
- `Enemy` extends `Character` with intent selection, enemy attack behavior, and the recurring Skelly Steve bone gag.
- `AnimationManager` owns the effects canvas, target arrow rendering, particles, magical trails, projectiles, sparkles, and floating combat text.
- `GameUtils` owns shared math, geometry, randomness, and wait helpers.

## File Map

### Root

- `AGENTS.md`
  - Standing instructions for AI agents.
  - Defines project rules, architecture discipline, spec-driven workflow, verification expectations, performance direction, feature flag direction, visual rules, and cleanup debt.

- `.gitignore`
  - Source control hygiene for local OS files, logs, environment files, and temporary files.

- `ARCHITECTURE.md`
  - This living architecture map.
  - Must be updated when files, responsibilities, flows, or major constraints change.

- `index.html`
  - Static document entrypoint.
  - Declares the game shell, background image, effects canvas, top resource bar, combatant DOM, battle toast, card layer, bottom pile panel, and `End Turn` button.
  - Loads scripts in dependency order: utilities, animation, characters, deck, cards, input, game manager, main boot script.

### CSS

- `css/style.css`
  - Global reset, game shell, background treatment, top bar, play area, combatants, health UI, battle feed, bottom bar, cards, particles/floating text, keyframe animations, and mobile responsive rules.
  - Current line count is above the preferred 300-line limit.
  - Future structural styling work should split this into focused stylesheets or sections if a bundler/module approach is introduced.

### JavaScript

- `js/main.js`
  - Browser boot script.
  - Creates the `GameManager` after the DOM is ready.
  - Stores the running game at `window.broloGame` for debugging.

- `js/utils.js`
  - Exports `window.GameUtils`.
  - Provides `clamp`, `lerp`, `lerpAngle`, `randomBetween`, `rectContains`, `centerOfRect`, and `wait`.
  - No DOM ownership except use of `window.setTimeout` inside `wait`.

- `js/AnimationManager.js`
  - Exports `window.AnimationManager`.
  - Owns canvas sizing and drawing.
  - Renders targeting line, particles, magical trails, projectile impacts, DOM sparkles, and floating combat text.
  - Uses bounded arrays for particles and projectiles but does not yet expose perf stats or benchmark hooks.

- `js/Character.js`
  - Exports `window.Character`.
  - Shared model/view bridge for combatants.
  - Owns HP, max HP, block, health bar scaling, status text, hit animation flash, sprite center, cast point, and hitbox calculations.

- `js/Enemy.js`
  - Exports `window.Enemy`.
  - Extends `Character`.
  - Owns enemy intent text, attack pattern, enemy attack timing, and Skelly Steve bone gag.

- `js/Deck.js`
  - Exports `window.Deck`.
  - Owns deterministic-enough draw/discard behavior for the current demo, but uses `Math.random()` and is not deterministic for benchmarks yet.
  - Shuffles arrays, draws cards, recycles discard pile into draw pile, and reports pile counts.

- `js/Card.js`
  - Exports `window.Card`.
  - Creates card DOM from a definition and image asset.
  - Tracks card state: `idle`, `hover`, `drag`, `played`, and `returning`.
  - Interpolates position, rotation, and scale every frame.
  - Handles hover lift, drag follow, played movement, return-to-hand completion, z-index priority, and CSS transform rendering.

- `js/InputManager.js`
  - Exports `window.InputManager`.
  - Owns global pointer and blur listeners.
  - Tracks pointer position in viewport and game coordinates.
  - Determines hovered card through `GameManager.getTopCardAt()`.
  - Starts drags, releases cards, and cancels drags safely.

- `js/GameManager.js`
  - Exports `window.GameManager`.
  - Main coordinator for the current demo.
  - Owns player/enemy construction, card definitions, deck/hand arrays, energy, turn state, busy state, hand layout, card release validation, card effect timing, attack/defense/heal resolution, discard behavior, enemy turn flow, UI updates, and the animation frame loop.
  - Current line count is above the preferred 300-line limit and this file is the largest architecture debt.

### Assets

- `Assets/background.png`
  - Generated 16:9 mystical wizard study/arena background.
  - Used by `.scene-bg` in `index.html`.

- `Assets/player.png`
  - Generated transparent PNG sprite for Archmage Brolo.
  - Used by `#playerSprite`.

- `Assets/enemy_01.png`
  - Generated transparent PNG sprite for Skelly Steve.
  - Used by `#enemySprite`.

- `Assets/card_attack.png`
  - Generated transparent PNG card art for `I Cast Fireball`.

- `Assets/card_defend.png`
  - Generated transparent PNG card art for `Probably Shield`.

- `Assets/card_heal.png`
  - Generated transparent PNG card art for `Suspicious Potion`.

- `Assets/card_magic.png`
  - Generated transparent PNG card art for `Static Shock`.

- `Assets/card_special.png`
  - Generated transparent PNG card art for `Summon Doom`.

## Data And State

- Card definitions currently live inline in `GameManager.createCardDefinitions()`.
- Runtime card instances are separate from card definitions.
- `Deck.drawPile` and `Deck.discardPile` store card definition objects.
- `GameManager.hand` stores active `Card` instances.
- `GameManager.cards` stores all active card instances that need frame updates.
- Character HP/block state lives in `Character` and `Enemy`.
- UI values are updated imperatively through DOM IDs in `GameManager.updateUI()` and character update methods.

## Interaction And Animation Model

- All active cards update each animation frame.
- Cards never teleport during normal hand, hover, drag, return, or discard movement.
- `Card.updateTarget()` chooses target values from card state.
- `Card.update()` lerps current values toward target values.
- `Card.render()` applies a single CSS transform per frame.
- Dragging target cards activates a canvas targeting line from the card toward the pointer.
- Magical particles and projectiles render on `#effectsCanvas`.
- Some sparkles and floating text are short-lived DOM nodes created by `AnimationManager`.

## Current Verification

- JavaScript syntax can be checked with `node --check js/<file>.js`.
- Browser visual verification has been done with a local static server and headless Chrome screenshots.
- There is no committed test runner.
- There is no committed benchmark runner.
- There is no full build command because the game currently has no build step.

## Known Architecture Debt

- `js/GameManager.js` has too many responsibilities and should eventually split into smaller systems:
  - card definitions/catalog
  - hand layout
  - turn flow
  - effect resolution
  - UI binding
  - combat sequencing
- `css/style.css` is too large and should eventually split by responsibility:
  - base/layout
  - top/bottom UI
  - combatants
  - cards
  - effects
  - responsive rules
- The deck and effect systems are not deterministic yet, which limits benchmark repeatability.
- There is no feature flag registry.
- There is no debug menu.
- There are no always-visible performance stats.
- There are no unit tests.
- There are no performance benchmark scripts.
- There is no `specs/` folder or numbered spec workflow yet.
