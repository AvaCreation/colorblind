# colorblind

A tool that improves the game for colorblind players. It applies a color-correction filter to the game screen, which players can set up with a quick guided questionnaire or tune by hand.

Made by [AVA Creation](https://avacreation.com/).

## Features

- **Guided setup**: 15 dot plates that suggest the most suitable correction (protanopia, deuteranopia, tritanopia or none).
- **Custom adjustment**: sliders for red/green, blue/yellow and saturation, with a live before/after preview and color pairs to check the result.
- **Persistent**: the chosen mode is saved per player (KVP) and reapplied on every connection.
- **Translatable**: one JSON file per language, English and French included.
- **Scriptable**: client exports and an event for other resources.

## Requirements

- [Bun](https://bun.sh/docs/installation) (Linux and Windows), only to build the UI.

## Installation

1. Put the folder in your `resources/` directory.
2. Build the UI (it is not shipped prebuilt):
   ```
   cd web
   bun install
   bun run build
   ```
3. Add this to your `server.cfg`:
   ```
   ensure colorblind
   ```
4. Run `/colorblind` in game to open the menu.

## Configuration

`config.lua`:

| Key | Default | Purpose |
|-----|---------|---------|
| `command` | `'colorblind'` | Command that opens the menu |
| `lang` | `'en'` | UI language (`en`, `fr`, or any file in `web/src/locales/`) |

## Usage from other resources

All exports are client-side.

| Export | Description |
|--------|-------------|
| `open()` / `close()` | Open or close the menu |
| `isOpen()` | Returns `true` while the menu is open |
| `getMode()` | Returns the saved mode |
| `setMode(mode, persist)` | Apply a mode, and save it if `persist` is true. Returns `false` on an invalid mode |
| `setCustom(redGreen, blueYellow, saturation, persist)` | Same as `setMode` with custom values |
| `reset()` | Save `none` and remove the filter |

```lua
exports.colorblind:setMode('deuteranopia', true)
exports.colorblind:setCustom(-0.1, 0, 0.2, false)
```

Modes: `none`, `protanopia`, `deuteranopia`, `tritanopia`, or `custom:<redGreen>:<blueYellow>:<saturation>`.

Event: `colorblind:changed` (client) is triggered with the mode every time one is saved.

## Translations

One JSON file per language in `web/src/locales/`. To add a language:

1. Copy `en.json` to `xx.json`.
2. Translate the values, not the keys.
3. Rebuild the UI and set `lang = 'xx'` in `config.lua`.

Missing keys fall back to English.

## Development

The UI is React + Vite in `web/` and builds into `html/`.

```
cd web
bun run start    # dev server
bun run watch    # rebuild on change
```
