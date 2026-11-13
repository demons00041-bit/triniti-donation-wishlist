# Triniti Digital Donation Wishlist

A small static website that shows what **Rumah Kanak-Kanak Triniti**, a children's home in Malaysia, needs right now — and how much of each item has already been donated.

It is built for two kinds of people. Donors get a clear, honest, fast list that still works on an old phone with a weak connection. Caretakers get a Google Sheet: they type numbers into a spreadsheet and the website updates itself. Nobody has to touch the code after handover.

**Live site:** <https://demons00041-bit.github.io/triniti-donation-wishlist/>

---

## What the site does

- **Live needs list** — every item the home needs, one card each, with the quantity still missing.
- **Progress you can read at a glance** — each item is **Needed**, **Partial** or **Fulfilled**, with a progress bar and an amount such as `12 / 40 bags`. A donor sees instantly what is still short and what is already covered.
- **Two languages** — English (default) and Bahasa Melayu, switched from the header and remembered in the browser. That choice is the only thing the page stores on a visitor’s device: `localStorage`, key `triniti.lang`.
- **An About section** — the home’s own words, one image, and two optional facts (the year it was founded, how many children live there). All of it stays empty until the home fills it in; nothing is invented.
- **Zero hosting cost** — plain files on GitHub Pages. No server, no database, no monthly bill.
- **No build step** — no npm, no bundler, no framework, no CDN, no external fonts. What is in the repository is what the browser runs.

---

## The four pages

The site is four pages and two languages — English and Bahasa Melayu — and every page shares the same header, footer and language buttons.

| Page | What it is for |
| --- | --- |
| `index.html` | The home page. A hero, five cards leading to the other pages and to the wishlist, an About block, two program blocks, the live wishlist, and a donation band with preset amounts. |
| `donate.html` | Ways to give. An amount bar, three payment methods (QR code, online payment page, bank transfer with a copy button), an optional details form, what to drop off and where, and a contact strip. |
| `volunteer.html` | Volunteering. Three roles, three steps, and a call to action. |
| `contact.html` | How to reach the home. Address, phone, WhatsApp, email, opening hours, a map slot, and two rows of extra details. |

---

## Architecture in one screen

Everything is static, and the browser does all the work. Each page loads plain classic scripts from the repository — no modules, no build step, no CDN.

```
index.html runs these, in this order, at the end of <body>:
  assets/js/config.js   → the content: sheet link, NGO facts, every editable string and image
  assets/js/i18n.js     → the English and Bahasa Melayu dictionaries
  assets/js/site.js     → renders the shared header and footer, applies declarative content
  assets/js/data.js     → fetches the CSV, parses it, computes needed / fulfilled / percent
  assets/js/app.js      → draws the wishlist cards, filters and counters, builds the donation band

donate.html runs config.js, i18n.js, site.js, then donate.js.
volunteer.html and contact.html run config.js, i18n.js, site.js, and no page script.

assets/js/config.js             = the only code file a caretaker should need to edit
Google Sheet (published as CSV) = the single source of truth for the item list
assets/data/sample-items.json   = bundled fallback used when the sheet cannot be read
```

The wishlist fetches the published CSV with caching switched off. If the link is empty, the fetch fails, or the sheet yields no usable rows, the page falls back to `assets/data/sample-items.json`, so it still shows a list — the bundled sample items — instead of an empty page.

---

## How placeholder content works

Every editable value in `assets/js/config.js` ships as an empty string, and `assets/js/site.js` decides what to draw on the page.

| In `assets/js/config.js` | On the page |
| --- | --- |
| A non-empty string | the text, or the image |
| `""` | a dashed box carrying the hint "To be filled in" |
| `null` in a text slot | that node is removed from the page entirely |

- `placeholders: "hint"` writes the hint words. `placeholders: "blank"` keeps the dashed box but leaves it empty, so the layout keeps its height.
- Images are always dashed and labelled until a path is filled in. The label reads "Image · Suggested size 1200x900", and the size comes from the `data-ph-size` attribute on the element in the page.
- An empty list — `content.footer.col1Links`, `content.donation.itemList` — draws two dashed rows.
- The hint words are dictionary entries (`placeholder.todo`, `placeholder.image`, `placeholder.size`), so they appear in the visitor’s language.
- A link whose `href` value is empty is disabled: no `href`, `aria-disabled="true"`, and no keyboard tab stop.

The markup hooks are `data-cfg` (text), `data-cfg-href` (link target), `data-cfg-img` plus `data-cfg-alt` and `data-ph-size` (image slot), and `data-cfg-list` (footer link columns).

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

   Save, reload the page. The cards then come from your sheet instead of the bundled sample items.

---

## Deploy on GitHub Pages

1. Put the project in a GitHub repository, branch `main`, with the site files at the **repository root** (`index.html` at the top level, not inside a subfolder).
2. In the repository open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: **main**. Folder: **/ (root)**. Save.
5. Wait a minute or two. GitHub shows the published address at the top of the Pages screen.
6. Put that address on the **Live site:** line near the top of this README.

Notes:

- The repository contains an empty file named `.nojekyll` at its root. It tells GitHub Pages to serve the files exactly as they are, without Jekyll processing. Keep it.
- The site is **public and read-only**. Anyone with the link can read it; nobody can change the list or the code through the page. Only people you share the spreadsheet with can edit the data.
- Any other static host works too — Netlify, Cloudflare Pages, a folder on a school web server. Nothing in this project depends on GitHub.

---

## Troubleshooting

| What you see | Why | Fix |
| --- | --- | --- |
| The list shows the bundled sample items (rice, cooking oil, milk powder …) instead of your sheet | The sheet was never connected, the link is wrong, or the sheet is no longer published | Paste the published CSV link into `sheetCsvUrl` in `assets/js/config.js`; then open that link in a new browser tab — you should get a CSV file or a wall of plain text, not a sign-in page |
| Sheet edits do not appear on the site | Google caches the published CSV for a few minutes, or the page in your browser is old | Wait about 5 minutes, then reload with Ctrl+F5. Still stale after that? File → Share → Publish to web in the sheet, and republish |
| The page loads but there are no cards at all | The file was opened directly from disk (`file://`), so the fetch was blocked | Serve the folder: `python -m http.server 8080`, then open <http://localhost:8080> |
| A card shows `0 / 40` and looks finished although the sheet says 12 | The number was typed as text (`12 bags`), so it was read as 0 | Put plain digits in `quantity_needed` and `quantity_fulfilled`; keep the word in the `unit` column |
| Malay text shows as boxes or `????` | The file was saved in a legacy encoding instead of UTF-8 | Re-save as **UTF-8** (Excel: "CSV UTF-8 (Comma delimited)"; Google Sheets already exports UTF-8). Never save these files from a plain-text editor set to ANSI |
| The details form shows, but its send button is greyed out and says the backend is not switched on | No API address is configured, so the form has nowhere to send | Leave it: every payment method and all page content work without a backend. To switch the form on, follow `docs/BACKEND-SETUP.md` |
| A 404 page on GitHub Pages | `index.html` is not at the repository root, or Pages points at the wrong branch | Move the site files to the root of `main`; Settings → Pages → Deploy from a branch → main / (root) |

---

## Repo layout

```
triniti-wishlist/
├── index.html                   home: hero, five cards, about, two programs, wishlist, donation band
├── donate.html                  ways to give: amounts, payment methods, details form, drop-off, contact strip
├── volunteer.html               volunteering: three roles, three steps, call to action
├── contact.html                 address, phone, email, hours, map slot, two detail rows
├── .nojekyll                    tells GitHub Pages to serve files as they are
├── favicon.svg                  the little icon in the browser tab
├── README.md                    this file
├── assets/
│   ├── css/
│   │   └── style.css            all styling; no external fonts
│   ├── js/
│   │   ├── config.js            ← the file you edit: NGO facts, images, editable text
│   │   ├── i18n.js              English and Bahasa Melayu dictionaries
│   │   ├── site.js              shared header and footer, declarative content
│   │   ├── data.js              fetch + CSV parsing + sample fallback
│   │   ├── app.js               wishlist rendering, filters, counters, donation band
│   │   └── donate.js            amount bar, payment cards, copy button, details form
│   └── data/
│       └── sample-items.json    fallback data shown when the sheet is unreachable
├── backend/
│   └── worker.js                Cloudflare Worker that receives the details form
└── docs/
    ├── BUILD-CONTRACT.md        the interface every module is written against
    ├── CONTRACT-SHARED.md       internal interface: tokens, class names, page contract
    ├── REDESIGN-PLAN.md         the rebuild specification
    ├── SHEET-SETUP.md           how to build and publish the spreadsheet
    ├── BACKEND-SETUP.md         how to deploy and operate the Worker
    └── CARETAKER-GUIDE.md       the 10-minute handover script for the home
```

---

## Changing the words and the contact details

There are four places, and nothing else needs editing.

| I want to change | Where it lives |
| --- | --- |
| NGO facts — name, address, phone, WhatsApp, email, opening hours, map link | `org` in `assets/js/config.js` |
| Page wording, section text, images, footer link columns | `content` in `assets/js/config.js` |
| Interface labels — buttons, headings, status words, form messages | `dict` in `assets/js/i18n.js`, under `en` and `ms` |
| The wishlist items, quantities and notes | the Google Sheet |

- The `org` and `content` values ship empty on purpose. An empty value is a dashed "to be filled in" box, not a guess, and nothing about the home is invented here.
- The two dictionaries carry identical key sets, so one wording change means two edits. A key missing from a dictionary prints its own name on the page.
- The details form writes nothing to the browser and nothing into the page address. With the "anonymous" box ticked it is fully disabled and sends no request at all.

---

The site is deliberately boring to maintain: one spreadsheet to edit, one config file to change, no build tools to install.
