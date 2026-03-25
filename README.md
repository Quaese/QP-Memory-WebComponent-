# `<qp-memory>` — Cover Memory Game

A memory/matching card game as a Web Component. Image sources are configurable:
either fetched from a server API (via the `url` attribute) or loaded from the
bundled local image set as fallback. Players flip pairs of cards to find matching images.

## Usage

```html
<!-- With bundled images (zodiac signs, traffic signs, card suits) -->
<qp-memory dimension="4"></qp-memory>

<!-- With server-fetched cover images -->
<qp-memory dimension="6" url="/media/covers"></qp-memory>
```

```html
<script type="module" src="/js/components-web/qp-memory/qp-memory.wc.js"></script>
```

## Attributes

| Attribute   | Type   | Default | Description |
|-------------|--------|---------|-------------|
| `dimension` | number | `4`     | Grid size (NxN). Allowed values: `2`, `4`, `6` (defined in `BOARD_SIZES`). |
| `url`       | string | —       | Optional API endpoint to fetch cover images (e.g. `/media/covers`). If omitted, the bundled `imageList` from `qp-memory.images.js` is used. |

## Internal Properties

| Property | Type   | Default | Description |
|----------|--------|---------|-------------|
| `_width` | string | `"60%"` | Board width as CSS value. Adjusted internally based on dimension. |

## Events

All events are `CustomEvent` with `bubbles: true` and `composed: true` (cross Shadow DOM).

| Event                    | detail                                                              | Description |
|--------------------------|---------------------------------------------------------------------|-------------|
| `qp-memory.game-start`  | `{}`                                                                | Fired when a new game starts. |
| `qp-memory.game-won`    | `{ time: number, formattedTime: string, moves: number }` | Fired when all pairs have been found. `time` is in ms, `formattedTime` is `"MM:SS"`. |

```js
document.querySelector('qp-memory').addEventListener('qp-memory.game-won', (e) => {
  console.log(`Won in ${e.detail.formattedTime} with ${e.detail.moves} moves`);
});
```

## Game Flow

1. Images are loaded once on connect (API fetch or local `imageList`).
2. `_startGame()` picks random images, duplicates & shuffles them ([Fisher-Yates](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)), renders the board, and disables the start button.
3. Players click cards to reveal images. After two clicks the pair is checked:
   - **Match:** cards stay visible and are marked as matched.
   - **No match:** cards are flipped back after `NEXT_ROUND_DELAY` ms.
4. `_onWin()` fires when all pairs are found, shows elapsed time and moves, and re-enables the start button. The solved board remains visible.

## UI Sections

- **Display bar** — headline (NxN), elapsed time, move counter
- **Board** — CSS grid of card elements with random rotation (-5° to +5°)
- **Button bar** — Start, Restart, Hint, board size selector

## Lifecycle

| Callback                   | Description |
|----------------------------|-------------|
| `connectedCallback`        | Loads images (from API if `url` is set, otherwise from bundled `imageList`), then starts the game. |
| `disconnectedCallback`     | Clears timers and removes all event listeners. |
| `attributeChangedCallback` | Re-renders when `dimension` changes. |

## Translations

All visible text is resolved via `_dict()` (Dictionary module) with a built-in
`_defaultDict()` fallback (de/en).

## File Structure

```
qp-memory/
  qp-memory.wc.js            — Web Component (main)
  qp-memory.styles.js        — Scoped styles (loaded via getStyles())
  qp-memory.dictionary.js    — i18n translations
  qp-memory.images.js        — Bundled image set with resolved URLs
  qp-memory-background.svg   — Card back background image
  images/                    — Image assets
    pisces.svg ... aquarius.svg       — Zodiac signs (12)
    stop.svg, yield.svg, ...          — Traffic signs (7)
    spades.png ... clubs.png          — Playing card suits (4)
```
