# Triniti Digital Donation Site

A small static website for **Rumah Kanak-Kanak Triniti**, a children's home in Malaysia: what the home is, and the four ways a stranger can help it without phoning the office first.

It is built for two kinds of people. Donors get a fast, honest page that still works on an old phone with a weak connection. The people who look after the home get a site they never type into: every word on it comes from one configuration file, and nothing on the site is entered through the site itself.

**Live site:** https://demons00041-bit.github.io/triniti-donation-wishlist/ — published from branch `main` by GitHub Pages. The address follows the repository name, so rename the repository only if you also update this line.

---

## What the site does

- **Six pages, one story** — the home, the four ways to help, and a page for each of three of them.
- **A four-card block on the home page** — titled *Lend a Hand*: **Sponsor A Child**, **Volunteer**, **Gift Of Love**, **Donate for us**. Each card is a link to its own page.
- **A gift grid** — the Gift Of Love page shows nine gifts in a grid. Each cell opens the donate page, or the donate page with that gift's amount already selected.
- **A sponsor page** — one large picture slot for a child, a short note, and a message box for someone who wants to sponsor.
- **Two languages** — English (default) and Bahasa Melayu, switched from the header and remembered in the browser. That choice is the only thing the site stores on a visitor's device: `localStorage`, key `triniti.lang`.
- **An About section** — the home's own words, one image, and two optional facts (the year it was founded, how many children live there). All of it stays empty until the home fills it in; nothing is invented.
- **Zero hosting cost** — plain files on GitHub Pages. No server, no database, no monthly bill.
- **No build step** — no npm, no bundler, no framework, no CDN, no external fonts. What is in the repository is what the browser runs.

---

## The six pages

The site is six pages and two languages — English and Bahasa Melayu — and every page shares the same header, footer and language buttons.

| Page | What it is for |
| --- | --- |
| `index.html` | The home page. A hero, the four *Lend a Hand* cards, an About block, two program blocks, and a donation band with preset amounts. |
| `donate.html` | Ways to give. An amount bar, three payment methods (QR code, online payment page, bank transfer with a copy button), an optional details form, what to drop off and where, and a contact strip. |
| `volunteer.html` | Volunteering. Three roles, three steps, and a call to action. |
| `contact.html` | How to reach the home. Address, phone, WhatsApp, email, opening hours, a map slot, and two rows of extra details. |
| `sponsor.html` | Sponsoring a child. A subtitle, one picture slot suggested at 1200x800, a note, and a message box. |
| `gift-of-love.html` | Nine gifts in a grid. Each cell leads to the donate page. |

---

## Architecture in one screen

Everything is static, and the browser does all the work. Each page loads plain classic scripts from the repository — no modules, no build step, no CDN, and no network request of its own.

```
index.html runs these, in this order, at the end of <body>:
  assets/js/config.js   -> the content: NGO facts, every editable string and image
  assets/js/i18n.js     -> the English and Bahasa Melayu dictionaries
  assets/js/site.js     -> renders the shared header and footer, applies declarative content
  assets/js/app.js      -> the home donation band: the amount tiles, the "Other amount" input,
                           the DONATE NOW link and the hero button

donate.html       runs config.js, i18n.js, site.js, then donate.js.
sponsor.html      runs config.js, i18n.js, site.js, then sponsor.js.
gift-of-love.html runs config.js, i18n.js, site.js, then gift.js.
volunteer.html and contact.html run config.js, i18n.js, site.js, and no page script.

assets/js/config.js  = the only code file a caretaker should need to edit
```

`assets/js/app.js` does one thing now: it drives the donation band on the home page. There is no list to load, no data file, no background timer and no polling anywhere on the site — every page is complete the moment the HTML, the CSS and the scripts arrive.

`assets/js/sponsor.js` fills the sponsor page: the picture slot, the note, and the message box. The box is visible from the start, but while `config.api.baseUrl` is empty its send button stays disabled, and nothing typed into it is stored — no `localStorage`, no cookie, no change to the page address, no request.

`assets/js/gift.js` builds the nine gift cells from `config.content.gifts`, in config order. A cell links to `donate.html`, or to `donate.html?amount=N` when that gift's amount is filled in. A gift with no amount shows no amount line at all.

---

## How placeholder content works

Every editable value in `assets/js/config.js` ships as an empty string, and `assets/js/site.js` decides what to draw on the page.

| In `assets/js/config.js` | On the page |
| --- | --- |
| A non-empty string | the text, or the image |
| `""` | a dashed box carrying the hint "To be filled in" |
| `null` in a text slot | that node is removed from the page entirely |

- `placeholders: "hint"` writes the hint words. `placeholders: "blank"` keeps the dashed box but leaves it empty, so the layout keeps its height.
- Images are always dashed and labelled until a path is filled in. The label reads "Image · Suggested size", followed by the size the page asks for in the element's `data-ph-size` attribute — 1200x800 on the sponsor page, 400x300 in the gift grid.
- An empty list — `content.footer.col1Links`, `content.donation.itemList` — draws two dashed rows.
- The hint words are dictionary entries (`placeholder.todo`, `placeholder.image`, `placeholder.size`), so they appear in the visitor's language.
- A link whose `href` value is empty is disabled: no `href`, `aria-disabled="true"`, and no keyboard tab stop.

The markup hooks are `data-cfg` (text), `data-cfg-href` (link target), `data-cfg-img` plus `data-cfg-alt` and `data-ph-size` (image slot), and `data-cfg-list` (footer link columns).

---

## Local preview

You need Python 3 (or Node.js). Open a terminal in the project folder — the folder that holds `index.html` — and run:

```bat
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

Serving the folder is the closest thing to the real host, so use it when you want to check a link between pages. Because no page fetches anything, opening a page straight from disk also renders it; only `donate.html` reads `?amount=N` from the address, and that needs a served address to be worth testing.

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
- The site is **public and read-only**. Anyone with the link can read it; nobody can change the words or the pictures through the page. Only someone with write access to the repository can change them.
- Any other static host works too — Netlify, Cloudflare Pages, a folder on a school web server. Nothing in this project depends on GitHub.

---

## Troubleshooting

| What you see | Why | Fix |
| --- | --- | --- |
| Dashed boxes with "To be filled in" everywhere | That content has not been supplied yet | Fill the value in `assets/js/config.js`. This is the normal state of a fresh copy |
| The Gift Of Love page shows nine empty cells | `content.gifts` ships as nine entries with an empty name, picture and amount | Fill name, image, alt text and amount for each gift |
| A gift cell opens the donate page but no amount is selected | That gift's `amount` is empty, so the cell links to `donate.html` alone | Put a plain number in that gift's `amount` |
| The sponsor page's send button is greyed out | `api.baseUrl` is empty, so the message box has nowhere to send | Leave it: every page and every payment method works without a backend. To switch it on, follow `docs/BACKEND-SETUP.md` |
| A link does nothing and cannot be reached with Tab | Its `href` is empty, so the page disabled it on purpose | Fill the `href` in `assets/js/config.js` |
| A word still shows in English after switching to Bahasa Melayu | That text has no dictionary entry, or only one dictionary was edited | Check `assets/js/i18n.js`: both dictionaries carry the same keys |
| Malay text shows as boxes or `????` | The file was saved in a legacy encoding instead of UTF-8 | Re-save as **UTF-8**. Never save these files from a plain-text editor set to ANSI |
| A 404 page on GitHub Pages | `index.html` is not at the repository root, or Pages points at the wrong branch | Move the site files to the root of `main`; Settings → Pages → Deploy from a branch → main / (root) |

---

## Repo layout

```
├── index.html                   home: hero, four Lend a Hand cards, about, two programs, donation band
├── donate.html                  ways to give: amounts, payment methods, details form, drop-off, contact strip
├── volunteer.html               volunteering: three roles, three steps, call to action
├── contact.html                 address, phone, email, hours, map slot, two detail rows
├── sponsor.html                 sponsoring: one 1200x800 picture slot, a note, a message box
├── gift-of-love.html            nine gifts in a grid, each leading to the donate page
├── .nojekyll                    tells GitHub Pages to serve files as they are
├── favicon.svg                  the little icon in the browser tab
├── README.md                    this file
├── assets/
│   ├── css/
│   │   └── style.css            all styling; no external fonts
│   └── js/
│       ├── config.js            the file you edit: NGO facts, images, editable text
│       ├── i18n.js              English and Bahasa Melayu dictionaries
│       ├── site.js              shared header and footer, declarative content
│       ├── app.js               the home donation band only
│       ├── donate.js            amount bar, payment cards, copy button, details form
│       ├── sponsor.js           the sponsor page picture slot and message box
│       └── gift.js              the nine gift cells
├── backend/
│   └── worker.js                Cloudflare Worker that receives the two forms
└── docs/
    ├── BUILD-CONTRACT.md        the interface every module is written against
    ├── REDESIGN-PLAN.md         the rebuild specification
    ├── BACKEND-SETUP.md         how to deploy and operate the Worker
    └── CARETAKER-GUIDE.md       the handover script for the home
```

---

## Changing the words and the contact details

There are four places, and nothing else needs editing.

| I want to change | Where it lives |
| --- | --- |
| NGO facts — name, address, phone, WhatsApp, email, opening hours, map link | `org` in `assets/js/config.js` |
| Page wording, images, footer link columns, the four Lend a Hand cards and where they lead | `content` in `assets/js/config.js` |
| The sponsor page and the gift grid — subtitle, picture, note, the nine gifts | `content.sponsorPage` and `content.gifts` in `assets/js/config.js` |
| Interface labels — buttons, headings, form messages | `dict` in `assets/js/i18n.js`, under `en` and `ms` |

- The `org` and `content` values ship empty on purpose. An empty value is a dashed "to be filled in" box, not a guess, and nothing about the home is invented here.
- The two dictionaries carry identical key sets, so one wording change means two edits. A key missing from a dictionary prints its own name on the page.
- Each gift is one entry in `content.gifts`: `name`, `image`, `alt`, `amount`. There are nine of them, and the page shows them in that order.
- The details form on the donate page, and the message box on the sponsor page, write nothing to the browser and nothing into the page address. With the "anonymous" box ticked the details form is fully disabled and sends no request at all, and while `api.baseUrl` is empty the message box sends nothing either.

---

The site is deliberately boring to maintain: one config file to change, two dictionaries to keep in step, and no build tools to install.
