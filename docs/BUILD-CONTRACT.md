# BUILD CONTRACT — Triniti Digital Donation Wishlist

Frozen interface. Every module is written against this file; do not change it.
Repo root: D:\Project for Everything\Project management\triniti-wishlist

## 0. Non-negotiables
- Pure static site. No build step, no bundler, no frameworks, no CDN, no external fonts, no npm dependencies.
- Must work on any static host (GitHub Pages) and under `python -m http.server`.
- English is the default UI language; zh (Simplified Chinese) and ms (Bahasa Melayu) switch at runtime.
- Accessible: semantic landmarks, visible focus, AA contrast, aria-* on progress bars and switcher, honours prefers-reduced-motion and prefers-color-scheme.
- No invented facts about the orphanage. Contact values come only from window.WISHLIST_CONFIG.org, and those are [TODO: ...] placeholders.

## 1. File ownership
- index.html, assets/css/style.css  -> site-shell
- assets/js/i18n.js               -> i18n
- assets/js/data.js, assets/data/sample-items.json -> data-layer
- README.md, docs/CARETAKER-GUIDE.md, docs/SHEET-SETUP.md -> docs
- assets/js/config.js, assets/js/app.js, .nojekyll -> coordinator (DO NOT create these)

Scripts load in this order at the end of <body>: config.js -> data.js -> i18n.js -> app.js

## 2. Required DOM contract in index.html
Static text carries data-i18n="key" (textContent), data-i18n-html="key" (innerHTML), data-i18n-aria="key" (aria-label), data-i18n-placeholder="key" (placeholder attr).

Element ids app.js binds — all must exist:
- #lang-switcher: three <button type="button" data-locale="en|zh|ms">, wrapper role="group" + data-i18n-aria="lang.label".
- #status-banner containing #banner-text.
- #stats containing four number nodes carrying data-stat="items|remaining|fulfilled|urgent" (put data-stat on the node whose textContent is the number).
- #search-input (input[type=search]), #filter-category (select), #filter-status (select), #sort-select (select), #results-count.
- #wishlist-grid (empty container).
- #empty-state, #reset-filters, #loading-state, #error-state, #error-text, #retry-button, #last-updated, #year.
- Contact nodes carrying data-config="org.address", "org.phone", "org.whatsapp", "org.email", "org.hours".
- Anchor targets: #wishlist, #how-to-donate, #contact.
Selects ship empty (app.js populates them). app.js toggles #empty-state, #error-state and #loading-state through the hidden attribute; in HTML only #loading-state starts visible.

CSS classes app.js emits (site-shell must style every one):
.card, .card__head, .card__title, .card__category, .card__badges, .badge, .badge--urgent, .badge--partial, .badge--fulfilled, .progress, .progress__bar, .progress__fill, .progress__fill--done, .card__amount, .card__notes, .card--fulfilled, .card--urgent
Card structure: div.card(.card--urgent|.card--fulfilled) > div.card__head > h3.card__title + div.card__badges; then div.progress > div.progress__bar[role=progressbar] > div.progress__fill; then p.card__amount; then optional p.card__notes.

## 3. i18n contract (assets/js/i18n.js)
window.I18N exposes:
- locales = ["en","zh","ms"], defaultLocale = "en"
- dict = { en: {...}, zh: {...}, ms: {...} } with identical key sets
- t(key, vars): {name} interpolation; missing key returns the key
- getLocale(), setLocale(code)
- apply(root): walks the four data-i18n* attribute kinds
- intlLocale(): "en-MY" | "zh-CN" | "ms-MY"
Persistence: localStorage["triniti.lang"]. Initial locale = stored -> WISHLIST_CONFIG.defaultLocale -> navigator language -> "en".
setLocale sets document.documentElement.lang (en | zh-CN | ms), re-applies, then dispatches window CustomEvent "i18n:changed" with detail {locale}.

Keys (English text is authoritative; zh/ms must be natural donor-facing translations):
site.name, site.tagline, nav.wishlist, nav.howToDonate, nav.contact,
hero.eyebrow, hero.title, hero.subtitle, hero.ctaPrimary, hero.ctaSecondary,
banner.demo, banner.live, banner.updated, banner.error,
stats.items, stats.remaining, stats.fulfilled, stats.urgent,
controls.searchPlaceholder, controls.filterCategory, controls.filterStatus, controls.sort, controls.results,
status.needed, status.partial, status.fulfilled, status.all,
sort.urgency, sort.progress, sort.name,
category.staples, category.food, category.hygiene, category.household, category.school, category.baby, category.medical, category.other,
item.amount, item.notesAria, item.urgent, item.partial, item.done, item.progressAria,
empty.title, empty.body, empty.reset,
loading, error.title, error.body, error.retry,
donate.title, donate.intro, donate.step1.title, donate.step1.body, donate.step2.title, donate.step2.body, donate.step3.title, donate.step3.body, donate.shipping.title, donate.shipping.body, donate.money.title, donate.money.body,
contact.title, contact.intro, contact.address, contact.phone, contact.whatsapp, contact.email, contact.hours, contact.todoNote,
footer.builtBy, footer.lastUpdated, footer.langLabel,
lang.label, lang.en, lang.zh, lang.ms,
a11y.skip.

Interpolation variables: banner.updated {time}; controls.results {count}; item.amount {fulfilled} {needed} {unit}; item.progressAria {percent} {name}.

## 4. Data contract (assets/js/data.js)
window.Wishlist = { load, parseCsv, computeItem, buildSheetCsvUrl }.
load() resolves { items: Item[], meta: { source: "sheet"|"sample", updatedAt: string|null, error: string|null } }.
Source = window.WISHLIST_CONFIG.sheetCsvUrl fetched with cache:"no-store". Empty / throwing / zero valid rows -> fetch assets/data/sample-items.json (same Item shape), source:"sample", error = message when the sheet was configured but failed.
buildSheetCsvUrl(sheetId, gid) -> https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=<gid>

CSV header row, tolerant (case/space/underscore-insensitive, unknown columns ignored):
id, name, category, unit, quantity_needed, quantity_fulfilled, urgent, notes, updated
Aliases: name|item; quantity_needed|needed|qty_needed|target; quantity_fulfilled|fulfilled|received|qty_fulfilled|donated; urgent|priority; notes|note|remarks|comment; updated|updated_at|last_updated; category|type; unit|uom.

Item (every field always present): { id, name, category, unit, needed, fulfilled, remaining, percent, status:"needed"|"partial"|"fulfilled", urgent:boolean, notes }
Rules: non-numeric -> 0, negatives clamped; remaining = max(0, needed-fulfilled); percent = needed>0 ? min(100, round(fulfilled/needed*100)) : 100; blank-name rows dropped; urgent true for yes|true|1|y|high|urgent.
parseCsv must honour RFC4180 quoting (quoted commas, doubled-quote escapes, CRLF, BOM).

assets/data/sample-items.json: { "items": [ ... 10-12 ... ] } realistic for a Malaysian children home (rice, cooking oil, milk powder, detergent, stationery, diapers, toothpaste), mixed statuses, at least two urgent.

## 5. config.js (coordinator, for reference)
window.WISHLIST_CONFIG = { sheetCsvUrl:"", defaultLocale:"en", refreshSeconds:300, org:{ name, address, phone, whatsapp, email, hours, mapsUrl } } — org values are [TODO: ...] placeholders.

## 6. Visual direction (site-shell)
Warm, trustworthy, institutional — not a startup landing page. Deep green + warm sand palette, generous whitespace, body line-height 1.2-1.35, max width ~1120px, fluid type with clamp(), card grid collapsing to one column under 640px, sticky compact header, inline SVG only (no photos). Progress bar must read clearly at 0%, 40% and 100%.
