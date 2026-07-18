# Simple Journal

This is a very small static journal site added to the repository. It uses the Gaegu font from Google Fonts and includes three sample entries.

Files added:
- index.html
- styles.css
- script.js

If you prefer to host the Gaegu TTF locally instead of loading from Google Fonts, add the font files into a `fonts/` folder and update `styles.css` with an @font-face rule pointing to them. Example:

```css
@font-face{
  font-family: 'GaeguLocal';
  src: url('./fonts/Gaegu-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
body{ font-family: 'GaeguLocal', cursive; }
```

Open `index.html` in a browser to view the journal.
