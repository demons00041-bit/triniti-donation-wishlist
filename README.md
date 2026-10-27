# Triniti Digital Donation Wishlist

A small static website that shows what **Rumah Kanak-Kanak Triniti**, a children's home in Malaysia, needs right now — and how much of each item has already been donated.

It is built for two kinds of people. Donors get a clear, honest, fast list that still works on an old phone with a weak connection. Caretakers get a Google Sheet: they type numbers into a spreadsheet and the website updates itself. Nobody has to touch the code after handover.

**Live site:** <https://demons00041-bit.github.io/triniti-donation-wishlist/>

---

## What the site does

- **Live needs list** — every item the home needs, one card each, with the quantity still missing.
- **Progress you can read at a glance** — each item is **Needed**, **Partial** or **Fulfilled**, with a progress bar and an amount such as `12 / 40 bag`. A donor sees instantly what is still short and what is already covered.
- **Three languages** — English (default), 简体中文 (Simplified Chinese) and Bahasa Melayu, switched at runtime from the header and remembered in the browser.
- **Zero hosting cost** — plain files on GitHub Pages. No server, no database, no monthly bill.
- **No build step** — no npm, no bundler, no framework, no CDN, no external fonts. What is in the repository is what the browser runs.

---

## Architecture in one screen

Everything is static. The browser does all the work.

```
index.html
 └── runs these, in this order, at the end of <body>:
      assets/js/config.js   → the sheet link, contact details, default language
      assets/js/data.js     → fetches the CSV, parses it, computes needed / fulfilled / percent
      assets/js/i18n.js     → the EN / ZH / MS dictionaries
      assets/js/app.js      → draws the cards, filters, counters and progress bars

assets/js/config.js            = the only code file anyone should need to edit
Google Sheet (published as CSV) = the single source of truth for the item list
assets/data/sample-items.json   = bundled fallback used when the sheet cannot be read
```

On load the page fetches the published CSV with caching switched off. If the link is empty, the fetch fails, or the sheet yields no usable rows, the page falls back to `assets/data/sample-items.json` and says so in the banner. The site therefore always shows something — a demo list rather than an empty page.

---

## Local preview

You need Python 3 (or Node.js). Open a terminal in the project folder:

```bat
cd "D:\Project for Everything\Project management\triniti-wishlist"
python -m http.server 8080
```

Then open <http://localhost:8080> in a browser. Stop the server with Ctrl+C.

If `python` is not recognised, use the Windows launcher:

```bat
py -m http.server 8080
```

Node.js is an alternative, no install needed:

```bat
npx serve .
```

`npx` prints the address to open — usually <http://localhost:3000>.

**Do not double-click `index.html`.** Opened straight from disk the page runs under `file://`, browsers block the fetch that reads the sheet, and you will only ever see the sample data. Always use one of the two servers above.

---

## Connecting the sheet in 3 steps

The first two steps happen in Google Sheets, the third in one line of code. The full walkthrough — exact header row, publishing, privacy — is in [docs/SHEET-SETUP.md](docs/SHEET-SETUP.md).

1. **Create the spreadsheet.** One tab, one header row copied exactly from docs/SHEET-SETUP.md, then one row per item.
2. **Publish it as CSV.** File → Share → Publish to web → pick the sheet → Comma-separated values (.csv) → Publish. Copy the published link.
3. **Paste the link into the config.** Open `assets/js/config.js` and set `sheetCsvUrl` to that link:

   ```js
   sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv"
   ```

   Save, reload the page. The banner switches from demo data to live data.

---

## Deploy on GitHub Pages

1. Put the project in a GitHub repository, branch `main`, with the site files at the **repository root** (`index.html` at the top level, not inside a subfolder).
2. In the repository open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: **main**. Folder: **/ (root)**. Save.
5. Wait a minute or two. GitHub shows the published address at the top of the Pages screen.
6. Put that address on the `**Live site:**` line at the top of this README.

Notes:

- The repository contains an empty file named `.nojekyll` at its root. It tells GitHub Pages to serve the files exactly as they are, without Jekyll processing. Keep it.
- The site is **public and read-only**. Anyone with the link can read it; nobody can change the list or the code through the page. Only people you share the spreadsheet with can edit the data.
- Any other static host works too — Netlify, Cloudflare Pages, a folder on a school web server. Nothing in this project depends on GitHub.

---

## Troubleshooting

| What you see | Why | Fix |
| --- | --- | --- |
| The list shows sample items (rice, cooking oil, milk powder …) and the banner says it is demo data | The sheet was never connected, the link is wrong, or the sheet is no longer published | Paste the published CSV link into `sheetCsvUrl` in `assets/js/config.js`; then open that link in a new browser tab — you should get a CSV file or a wall of plain text, not a sign-in page |
| Sheet edits do not appear on the site | Google caches the published CSV for a few minutes, or the page in your browser is old | Wait about 5 minutes, then reload with Ctrl+F5. Still stale after that? File → Share → Publish to web in the sheet, and republish |
| The page loads but there are no cards at all | The file was opened directly from disk (`file://`), so the fetch was blocked | Serve the folder: `python -m http.server 8080`, then open <http://localhost:8080> |
| A card shows `0 / 40` and looks finished although the sheet says 12 | The number was typed as text (`12 bags`), so it was read as 0 | Put plain digits in `quantity_needed` and `quantity_fulfilled`; keep the word in the `unit` column |
| Chinese or Malay text shows as boxes or `????` | The file was saved in a legacy encoding instead of UTF-8 | Re-save as **UTF-8** (Excel: "CSV UTF-8 (Comma delimited)"; Google Sheets already exports UTF-8). Never save these files from a plain-text editor set to ANSI |
| A 404 page on GitHub Pages | `index.html` is not at the repository root, or Pages points at the wrong branch | Move the site files to the root of `main`; Settings → Pages → Deploy from a branch → main / (root) |

---

## Repo layout

```
triniti-wishlist/
├── index.html                   page structure and the DOM contract
├── .nojekyll                    tells GitHub Pages to serve files as they are
├── favicon.svg                  the little icon in the browser tab
├── README.md                    this file
├── assets/
│   ├── css/
│   │   └── style.css            all styling; no external fonts
│   ├── js/
│   │   ├── config.js            ← the file you edit: sheet link, contacts, language
│   │   ├── data.js              fetch + CSV parsing + sample fallback
│   │   ├── i18n.js              EN / ZH / MS dictionaries
│   │   └── app.js               rendering, filtering, counters
│   └── data/
│       └── sample-items.json    fallback data shown when the sheet is unreachable
└── docs/
    ├── BUILD-CONTRACT.md        frozen interface between the modules
    ├── SHEET-SETUP.md           how to build and publish the spreadsheet
    └── CARETAKER-GUIDE.md       the 10-minute handover script for the home
```

---

## Changing the words and the contact details

- **Contact details** — address, phone, WhatsApp, email, opening hours — live in `window.WISHLIST_CONFIG.org` in `assets/js/config.js`. They ship as `[TODO: ...]` placeholders; replace them with the home's real details before the site is public.
- **All other visible text** is in the `dict` object in `assets/js/i18n.js`, under three locales: `en`, `zh` and `ms`. The three sets use identical keys, so one change means three edits; a missing key falls back to printing the raw key name on the page.

---

## Built by

Built by [TODO: team name] as a student project, and handed over to Rumah Kanak-Kanak Triniti on 21 November.

The site is deliberately boring to maintain: one spreadsheet to edit, one config file to change, no build tools to install.
