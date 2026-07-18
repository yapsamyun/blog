# Simple Journal

This is a very small static journal site added to the repository. The site now stores each diary entry as a separate Markdown file inside the `entries/` directory. The frontend loads `entries/index.json` and fetches individual markdown files on demand.

Files added/changed:

- index.html (unchanged)
- styles.css (unchanged)
- script.js (updated to load entries from entries/index.json)
- entries/index.json (list of entries)
- entries/2024-11-03.md
- entries/2025-02-17.md
- entries/2026-06-12.md

If you host via GitHub Pages or any HTTP server, the app will fetch the index and entry files correctly. If you open `index.html` via the file:// protocol, browsers may block fetch requests — run a local server to preview:

  python3 -m http.server 8000

License note for fonts
- If you add the Gaegu TTF files into `fonts/`, include the SIL Open Font License text (OFL.txt) alongside them.
