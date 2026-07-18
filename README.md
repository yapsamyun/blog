Updated to include a small build script that generates entries/index.json from the markdown filenames.

Usage:

- Run locally: npm run build-index
  This will scan the `entries/` folder for files named `YYYY-MM-DD.md` and write `entries/index.json` sorted in chronological (oldest → newest) order.

- Each entry now has its own URL via the hash. Examples:
  - /index.html#2026-06-12
  - /#2026-06-12

- The previous button was adjusted so it sits above the left sidebar and is nudged right slightly to avoid accidental overlap. If you'd prefer the button to move behind the sidebar or be shifted more, I can adjust the CSS.
