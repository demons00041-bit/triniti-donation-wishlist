# BUILD CONTRACT — Triniti Digital Donation Wishlist

Frozen interface. Every module is written against this file; do not change it.
Repo root: D:\Project for Everything\Project management\triniti-wishlist

## 0. Non-negotiables
- Pure static site. No build step, no bundler, no frameworks, no CDN, no external fonts, no npm dependencies.
- Four pages, all at the repository root: `index.html` (home, wishlist, donation band), `donate.html` (amount bar, three payment methods, details form, drop-off), `volunteer.html` (roles, steps, call to action), `contact.html` (address, phone, hours, map slot, two detail rows).
- Two UI languages only: English (default) and Bahasa Melayu. Both dictionaries live in `assets/js/i18n.js`; there is no third locale, no locale file on disk, and no language-specific page.
- Must work on any static host (GitHub Pages, `main` branch, repository root) and under `python -m http.server`.
- Accessible: semantic landmarks, visible focus, AA contrast, aria-* on progress bars and the language switcher, honours `prefers-reduced-motion` and `prefers-color-scheme`.
- No invented facts about the orphanage. Every `org` and `content` value in `window.WISHLIST_CONFIG` ships as `""`; `site.js` turns an empty value into a placeholder box. Nothing is guessed, and no bank name, account number, address, phone, email, founding year or resident count is written into the code.

## 1. File ownership
- index.html, donate.html, volunteer.html, contact.html, assets/css/style.css  -> pages and shell
- assets/js/site.js               -> shared header and footer, declarative content, placeholder rendering
- assets/js/i18n.js               -> en + ms dictionaries, runtime switching, `document.documentElement.lang`
- assets/js/data.js, assets/data/sample-items.json -> data-layer
- assets/js/app.js                -> wishlist controller, filters, counters, home donation band
- assets/js/donate.js             -> amount bar, payment cards, copy-to-clipboard, details form
- assets/js/config.js             -> every editable string, image and NGO fact (single source of page text)
- backend/worker.js               -> Cloudflare Worker that receives the details form (see docs/BACKEND-SETUP.md)
- README.md, docs/BUILD-CONTRACT.md, docs/CARETAKER-GUIDE.md, docs/SHEET-SETUP.md, docs/BACKEND-SETUP.md -> docs

Classic scripts, no modules, loaded in this order at the end of `<body>`:
- index.html: config.js -> i18n.js -> site.js -> data.js -> app.js
- donate.html: config.js -> i18n.js -> site.js -> donate.js
- volunteer.html, contact.html: config.js -> i18n.js -> site.js

A page whose own script is missing must still render its static text, because `i18n.js` and `site.js` do the shared work.

## 2. DOM contract

### 2.1 Interface strings
Static text carries `data-i18n="key"` (textContent), `data-i18n-html="key"` (innerHTML), `data-i18n-aria="key"` (aria-label), `data-i18n-placeholder="key"` (placeholder attribute). All four kinds are applied by `I18N.apply(root)`.

### 2.2 Language switcher
- `#lang-switcher` in the header and `#lang-switcher-footer` in the footer are both rendered by `site.js`, never hand-written in the HTML.
- Each holds exactly two `<button type="button">` elements, `data-locale="en"` and `data-locale="ms"`, inside a wrapper with `role="group"` and `data-i18n-aria="lang.label"`.
- The current language's button carries `aria-pressed="true"`. There is no third button.

### 2.3 Declarative content
Markup hooks read by `site.js`; the value comes from `config.js`:
- `data-cfg="path.to.value"` — text. Non-empty string -> textContent. `null` -> the node is removed from the DOM. Empty string -> the node keeps its place, gains `is-missing`, and shows the hint.
- `data-cfg-href="path.to.value"` — link target. Empty or null -> `disableLink`: `href` removed, `aria-disabled="true"`, `tabindex="-1"`.
- `data-cfg-img="path"` with `data-cfg-alt="path"` and `data-ph-size="1200x900"` — image slot. Always starts as a dashed `ph ph--image` box; when the path is filled it becomes an `<img>` and gains `ph--filled`; until then it shows `placeholder.image` and `placeholder.size` with the suggested size from `data-ph-size`.
- `data-cfg-list="path.to.array"` — footer link columns. An empty array draws two placeholder rows.
- `placeholders: "hint"` writes the hint words (`placeholder.todo`, "To be filled in"); `placeholders: "blank"` keeps the dashed box but leaves it empty so the layout keeps its height.

### 2.4 Element ids each page must provide
- Every page: `#site-header`, `#main`, `#site-footer`, `#year`, `#last-updated`.
- index.html, bound by app.js: `#search-input` (input[type=search]), `#filter-category` (select), `#filter-status` (select), `#sort-select` (select), `#results-count`, `#wishlist-grid` (empty container), `#empty-state`, `#reset-filters`, `#loading-state`, `#error-state`, `#error-text`, `#retry-button`, `#donate`, `#amounts`, `#other-amount`, `#donate-now`.
- donate.html, bound by donate.js: `#amount-value`, `#amount-number`, `#hosted-link`, `#hosted-unavailable`, `#copy-account`, `#details-form` containing `#f-name`, `#f-email`, `#f-phone`, `#f-message`, `#f-agree`, `#f-anonymous`, `#f-hp` (honeypot), `#f-send`, plus `#form-privacy`, `#form-anon-note`, `#form-status`, `#map-link`.
- Content and anchor targets: `#hero-cta` (its `href` ships as donate.html, and `content.hero.ctaHref` replaces it), `#about`, `#wishlist`, `#donate`.

Selects ship empty (app.js populates them). app.js toggles `#empty-state`, `#error-state` and `#loading-state` through the `hidden` attribute; in HTML only `#loading-state` starts visible. `donate.html` accepts `?amount=N` and preselects that preset.

### 2.5 Details form behaviour
- While `WISHLIST_CONFIG.api.baseUrl` is empty, the form is visible, `#f-send` is disabled, and `#form-status` shows `form.backendMissing`. Every other part of the site, including all three payment methods, works with no backend.
- The form writes nothing to the browser: no `localStorage`, no `sessionStorage`, no cookie, no rewrite of the page address.
- With `#f-anonymous` ticked, every control in the form is disabled and no network request is made at all.

### 2.6 CSS classes the scripts emit (the shell must style every one)
`.card`, `.card__head`, `.card__title`, `.card__category`, `.card__badges`, `.badge`, `.badge--urgent`, `.badge--partial`, `.badge--fulfilled`, `.progress`, `.progress__bar`, `.progress__fill`, `.card__amount`, `.card__notes`, `.ph`, `.ph--text`, `.ph--image`, `.ph__size`, `.is-missing`, `.is-disabled`.

Card structure: `div.card` > `div.card__head` > `h3.card__title` + `div.card__badges`; then `div.progress` > `div.progress__bar[role=progressbar]` > `div.progress__fill`; then `p.card__amount`; then optional `p.card__notes`.

## 3. i18n contract (assets/js/i18n.js)

`window.I18N` exposes:
- `locales = ["en","ms"]`, `defaultLocale = "en"`
- `dict = { en: {...}, ms: {...} }` with identical key sets; a key missing from a dictionary renders as the key itself
- `t(key, vars)`: `{name}` interpolation
- `getLocale()`, `setLocale(code)`
- `apply(root)`: walks the four data-i18n* attribute kinds
- `intlLocale()`: `"en-MY"` for en, `"ms-MY"` for ms
- `number(value)` and `date(value)` formatted through `intlLocale()`

Persistence: `localStorage["triniti.lang"]` is the only thing the site stores on a visitor's device. Initial locale = stored -> `WISHLIST_CONFIG.defaultLocale` -> navigator language -> `"en"`.

`setLocale` sets `document.documentElement.lang` to `"en"` or `"ms"`, re-applies, then dispatches `window` CustomEvent `"i18n:changed"` with `detail {locale}`.

Keys (English text is authoritative; ms must be natural donor-facing Malay). 124 keys, identical in both dictionaries:
site.name, site.tagline, nav.wishlist, nav.about, nav.getInvolved, nav.contact, nav.donate, nav.label,
controls.searchPlaceholder, controls.filterCategory, controls.filterStatus, controls.sort, controls.results,
status.needed, status.partial, status.fulfilled, status.all,
sort.urgency, sort.progress, sort.name,
category.staples, category.food, category.hygiene, category.household, category.school, category.baby, category.medical, category.other,
item.amount, item.notesAria, item.urgent, item.partial, item.done, item.progressAria,
empty.title, empty.body, empty.reset,
loading, error.title, error.body, error.retry,
about.title, about.founded, about.serves,
placeholder.todo, placeholder.image, placeholder.size, placeholder.customAmount, placeholder.notSelected,
card.lendHand, card.sponsorChild, card.volunteer, card.giftOfLove, card.donateForUs,
donate.customAmount, donate.now,
donatePage.title, donatePage.amountLabel, donatePage.changeAmount,
pay.qrTitle, pay.hostedTitle, pay.hostedCta, pay.hostedUnavailable, pay.afterNote,
otherWays.bankTitle, otherWays.bankName, otherWays.accountName, otherWays.accountNo, otherWays.swift, otherWays.copy, otherWays.copied,
otherWays.itemsTitle, otherWays.map, otherWays.dropoff, otherWays.itemContact, otherWays.itemHours, otherWays.itemList,
form.summary, form.fullName, form.email, form.phone, form.message, form.anonymous, form.anonymousNote, form.agree, form.privacy,
form.send, form.sending, form.success, form.errRequired, form.errEmail, form.errAgree, form.errAnonymous, form.errRate, form.errServer, form.errNetwork, form.errTimeout, form.backendMissing, form.noDraftNote,
contactPage.title, contactPage.address, contactPage.phone, contactPage.whatsapp, contactPage.email, contactPage.hours, contactPage.col1, contactPage.col2, contactPage.col3, contactPage.questions, contactPage.fullPage,
volunteer.title, volunteer.role1, volunteer.role2, volunteer.role3, volunteer.step1, volunteer.step2, volunteer.step3, volunteer.ctaButton,
footer.copyright, footer.lastUpdated,
lang.label, lang.en, lang.ms,
a11y.skip.

Interpolation variables: `pay.hostedCta {bank}`; `controls.results {count}`; `item.amount {fulfilled} {needed} {unit}`; `item.progressAria {name} {percent}`; `form.success {ref}`; `placeholder.size {size}`; `footer.copyright {year}`.

## 4. Data contract (assets/js/data.js)
`window.Wishlist = { load, parseCsv, computeItem, buildSheetCsvUrl, SAMPLE_URL }`.
`load()` resolves `{ items: Item[], meta: { source: "sheet"|"sample", updatedAt: string|null, error: string|null } }`.
Source = `window.WISHLIST_CONFIG.sheetCsvUrl` fetched with `cache:"no-store"`. Empty / throwing / zero valid rows -> fetch `assets/data/sample-items.json` (same Item shape), `source:"sample"`, `error` = message when the sheet was configured but failed.
`buildSheetCsvUrl(sheetId, gid)` -> `https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=<gid>`

CSV header row, tolerant (case/space/underscore-insensitive, unknown columns ignored):
`id, name, category, unit, quantity_needed, quantity_fulfilled, urgent, notes, updated`
Aliases: `name`|`item`|`item_name`|`item_description`; `quantity_needed`|`needed`|`qty_needed`|`target`|`required`|`quantity`; `quantity_fulfilled`|`fulfilled`|`received`|`qty_fulfilled`|`donated`|`collected`; `urgent`|`priority`; `notes`|`note`|`remarks`|`comment`; `updated`|`updated_at`|`last_updated`; `category`|`type`; `unit`|`uom`.

Category synonyms are folded before display: grocery/groceries -> food, dry_goods -> staples, toiletries -> hygiene, cleaning -> household, stationery -> school, infant/baby_care/babies -> baby, health/medicine/first_aid -> medical, misc -> other. An unknown category falls to `other`.

Item (every field always present): `{ id, name, category, unit, needed, fulfilled, remaining, percent, status:"needed"|"partial"|"fulfilled", urgent:boolean, notes }`
Rules: non-numeric -> 0, negatives clamped; `remaining = max(0, needed-fulfilled)`; `percent = needed>0 ? min(100, round(fulfilled/needed*100)) : 100`; blank-name rows dropped; `urgent` true for yes|true|1|y|high|urgent.
`parseCsv` must honour RFC4180 quoting (quoted commas, doubled-quote escapes, CRLF, BOM).

`assets/data/sample-items.json`: `{ "items": [ ... 10-12 ... ] }` realistic for a Malaysian children's home (rice, cooking oil, milk powder, detergent, stationery, diapers, toothpaste), mixed statuses, at least two urgent. It is fetched with `cache:"no-store"` like the sheet, so under `file://` neither source loads and the page shows no cards at all.

## 5. config.js (for reference)
```js
window.WISHLIST_CONFIG = {
  sheetCsvUrl: "",            // published CSV link; "" -> sample items
  defaultLocale: "en",
  refreshSeconds: 300,        // polling interval for the sheet
  placeholders: "hint",       // "hint" | "blank"
  org:    { name, address, phone, whatsapp, email, hours, mapsUrl },
  api:    { baseUrl: "", submitPath: "/donations", timeoutMs: 8000 },
  content:{ logo, hero{}, about{}, programs[2], cards[5], donation{},
            volunteer{}, contactPage{}, footer{col1..col4} }
}
```
`org.name` is the only filled org value ("Rumah Kanak-Kanak Triniti"). Every other `org` and `content` string is `""` until the home supplies it. `api.baseUrl: ""` is what disables the details form.

## 6. Visual direction
Warm, trustworthy, institutional — not a startup landing page. Deep navy `#0b2138`, institutional blue `#1d6fc4` (deeper `#12559b` for accents), ice `#f4f8fd` surfaces on ink `#0e1c2b`, with `color-scheme: light dark` and a hand-written dark palette on deep navy grounds `#0a1622` / `#0f2233` — never pure black. No photographs and no icon library: where an icon belongs the page ships an empty placeholder box until a real image is supplied. Shell max width 1120px, sticky header, fluid type with `clamp()`, card grids collapsing to a single column on narrow screens, generous whitespace, motion removed under `prefers-reduced-motion: reduce`. The progress bar must read clearly at 0%, 40% and 100%.
