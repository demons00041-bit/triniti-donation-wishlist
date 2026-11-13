# BUILD CONTRACT — Triniti Donation Site

Frozen interface. Every module is written against this file; do not change it.
Repo root: the folder that holds `index.html` and the other five pages.

## 0. Non-negotiables
- Pure static site. No build step, no bundler, no frameworks, no CDN, no external fonts, no npm dependencies.
- Six pages, all at the repository root: `index.html` (hero, the four-card "Lend a Hand" block, about, two program sections, donation band), `donate.html` (amount bar, three payment methods, details form, drop-off), `volunteer.html` (roles, steps, call to action), `contact.html` (address, phone, hours, map slot, two detail rows), `sponsor.html` (subtitle, one 1200x800 picture slot, note, message box), `gift-of-love.html` (nine-cell gift grid).
- Two UI languages only: English (default) and Bahasa Melayu. Both dictionaries live in `assets/js/i18n.js`; there is no third locale, no locale file on disk, and no language-specific page.
- No data layer. Nothing is fetched: no JSON data file, no remote list, no polling timer. Every string, image path and the nine gifts come from `assets/js/config.js`.
- Must work on any static host (GitHub Pages, `main` branch, repository root) and under `python -m http.server`.
- Accessible: semantic landmarks, visible focus, AA contrast, aria-* on the language switcher and on the two forms' status regions, honours `prefers-reduced-motion` and `prefers-color-scheme`.
- No invented facts about the orphanage. Every `org` and `content` value in the config object ships as `""`; `site.js` turns an empty value into a placeholder box. Nothing is guessed, and no bank name, account number, address, phone, email, gift name or gift amount is written into the code.

## 1. File ownership
- index.html, donate.html, volunteer.html, contact.html, sponsor.html, gift-of-love.html, assets/css/style.css  -> pages and shell
- assets/js/site.js               -> shared header and footer, declarative content, placeholder rendering
- assets/js/i18n.js               -> en + ms dictionaries, runtime switching, `document.documentElement.lang`
- assets/js/app.js                -> the home donation band only: amount tiles, the "Other amount" input, the DONATE NOW link, the hero CTA. No list rendering, no filter, no counter.
- assets/js/donate.js             -> amount bar, payment cards, copy-to-clipboard, details form
- assets/js/sponsor.js            -> sponsor page picture slot, note, message box, send-button state
- assets/js/gift.js               -> the nine gift cells, built from `content.gifts`
- assets/js/config.js             -> every editable string, image and NGO fact (single source of page text)
- backend/worker.js               -> Cloudflare Worker that receives both forms: `POST /donations`, `POST /sponsorships` (see docs/BACKEND-SETUP.md)
- README.md, docs/BUILD-CONTRACT.md, docs/CARETAKER-GUIDE.md, docs/BACKEND-SETUP.md -> docs

Classic scripts, no modules, loaded in this order at the end of `<body>`:
- index.html: config.js -> i18n.js -> site.js -> app.js
- donate.html: config.js -> i18n.js -> site.js -> donate.js
- sponsor.html: config.js -> i18n.js -> site.js -> sponsor.js
- gift-of-love.html: config.js -> i18n.js -> site.js -> gift.js
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
- `data-cfg-img="path"` with `data-cfg-alt="path"` and `data-ph-size="1200x800"` — image slot. Always starts as a dashed `ph ph--image` box; when the path is filled it becomes an `<img>` and gains `ph--filled`; until then it shows `placeholder.image` and `placeholder.size` with the suggested size from `data-ph-size` (1200x800 on the sponsor page, 400x300 in the gift grid).
- `data-cfg-list="path.to.array"` — footer link columns. An empty array draws two placeholder rows.
- `placeholders: "hint"` writes the hint words (`placeholder.todo`, "To be filled in"); `placeholders: "blank"` keeps the dashed box but leaves it empty so the layout keeps its height.

### 2.4 Element ids each page must provide
- Every page: `#site-header`, `#main`, `#site-footer`, `#year`, `#last-updated`.
- index.html, bound by app.js: `#hero-cta`, `#donate`, `#amounts`, `#other-amount`, `#donate-now`.
- donate.html, bound by donate.js: `#amount-value`, `#amount-number`, `#hosted-link`, `#hosted-unavailable`, `#copy-account`, `#details-form` containing `#f-name`, `#f-email`, `#f-phone`, `#f-message`, `#f-agree`, `#f-anonymous`, `#f-hp` (honeypot), `#f-send`, plus `#form-privacy`, `#form-anon-note`, `#form-status`, `#map-link`.
- sponsor.html, bound by sponsor.js: `#sponsor-form`, `#sponsor-message`, `#sponsor-hp` (honeypot), `#sponsor-send`, `#sponsor-status`, `#sponsor-notconnected`, and the picture slot carrying `data-cfg-img="content.sponsorPage.image"` with `data-ph-size="1200x800"`.
- gift-of-love.html, bound by gift.js: `#gifts-grid` (empty container; the script fills it with nine cells).
- Content and anchor targets: `#hero-cta` (its `href` ships as donate.html, and `content.hero.ctaHref` replaces it), `#about`, `#donate`.

`donate.html` accepts `?amount=N` and preselects that preset; a gift cell on `gift-of-love.html` uses the same query when that gift's amount is filled in.

### 2.5 Details form behaviour (donate.html)
- While `api.baseUrl` is empty, the form is visible, `#f-send` is disabled, and `#form-status` shows `form.backendMissing`. Every other part of the site, including all three payment methods, works with no backend.
- The form writes nothing to the browser: no `localStorage`, no `sessionStorage`, no cookie, no rewrite of the page address.
- With `#f-anonymous` ticked, every control in the form is disabled and no network request is made at all.

### 2.6 Message box behaviour (sponsor.html)
- The box is visible at all times. While `api.baseUrl` is empty, `#sponsor-send` is disabled, `#sponsor-notconnected` is shown with `sponsorPage.notConnected`, and `#sponsor-status` carries the same idle line.
- Typing stores nothing: no `localStorage`, no `sessionStorage`, no cookie, no rewrite of the page address.
- Nothing is sent while the send button is disabled. Once `api.baseUrl` is filled, the form posts to `api.baseUrl` + `api.sponsorPath`.
- `#sponsor-hp` is visually hidden, unreachable by keyboard, and must be submitted empty; a non-empty value means a bot.
- Both scripts re-render their i18n-owned text on `i18n:changed`, so the language buttons work without a reload.

### 2.7 CSS classes the scripts emit (the shell must style every one)
`.ph`, `.ph--text`, `.ph--image`, `.ph__size`, `.ph--filled`, `.is-missing`, `.is-disabled`, `.gift`, `.gift__media`, `.gift__name`, `.gift__amount`, `.status` with one of `.status--idle`, `.status--busy`, `.status--ok`, `.status--err`.

Gift cell structure: `a.gift` > `div.gift__media.ph.ph--image` (carrying `data-cfg-img`, `data-cfg-alt`, `data-ph-size="400x300"`) > `div.gift__name` > optional `div.gift__amount`.

## 3. i18n contract (assets/js/i18n.js)

`window.I18N` exposes:
- `locales = ["en","ms"]`, `defaultLocale = "en"`
- `dict = { en: {...}, ms: {...} }` with identical key sets; a key missing from a dictionary renders as the key itself
- `t(key, vars)`: `{name}` interpolation
- `getLocale()`, `setLocale(code)`
- `apply(root)`: walks the four data-i18n* attribute kinds
- `intlLocale()`: `"en-MY"` for en, `"ms-MY"` for ms
- `number(value)` and `date(value)` formatted through `intlLocale()`

Persistence: `localStorage["triniti.lang"]` is the only thing the site stores on a visitor's device. Initial locale = stored -> `defaultLocale` -> navigator language -> `"en"`.

`setLocale` sets `document.documentElement.lang` to `"en"` or `"ms"`, re-applies, then dispatches `window` CustomEvent `"i18n:changed"` with `detail {locale}`.

Key convention: dotted, lowercase-camel segments grouped by owner — `site.*`, `nav.*`, `section.*`, `card.*`, `donatePage.*`, `pay.*`, `otherWays.*`, `form.*`, `contactPage.*`, `volunteer.*`, `sponsorPage.*`, `giftPage.*`, `placeholder.*`, `footer.*`, `lang.*`, `a11y.*`. Either dictionary is the list of record: do not copy a key list into this file, because a copied list drifts from the dictionaries and nobody notices until a label prints its own key.

Groups that exist for the restructured pages: `section.lendHand` (the four-card block heading), `card.sponsorChild` / `card.volunteer` / `card.giftOfLove` / `card.donateForUs` (card titles), `sponsorPage.*` (title, subtitle, message label and placeholder, send, notConnected, privacy), `giftPage.*` (title, subtitle, numbered cell label, choose). The retired groups have no counterpart and must not come back: the filter, sort, status, empty-state, error-state, item and category keys belong to a page that no longer exists.

Interpolation variables: `pay.hostedCta {bank}`; `form.success {ref}`; `placeholder.size {size}`; `footer.copyright {year}`; `giftPage.item {n}`.

## 4. Page script contracts (sponsor.js and gift.js)

### 4.1 sponsor.js
- Reads `content.sponsorPage`: `subtitle`, `image`, `imageAlt`, `note`. The picture slot is painted by `site.js` from the `data-cfg-img` hooks; an empty path leaves the dashed 1200x800 box.
- Owns exactly two things outside a submit: the send button's `disabled` state and the standing notices. `hasBackend()` is `filled(config.api.baseUrl)`.
- Payload: `{ kind: "sponsorship", message, hp, locale, ts }`. Posted to `api.baseUrl` + `api.sponsorPath` (falling back to `"/sponsorships"`), with `api.timeoutMs` as the timeout and `form.errTimeout` / `form.errNetwork` / `form.errRate` / `form.errServer` reported through `#sponsor-status`.
- Stores nothing, writes nothing into the page address, and makes no request at all while the send button is disabled.

### 4.2 gift.js
- Builds exactly nine cells from `content.gifts`, in config order. `COUNT = 9`; a missing, empty or non-object entry renders as `{}` and still produces a cell.
- Entry shape: `{ name, image, alt, amount }`. `name` empty -> the numbered label `giftPage.item {n}` ("Gift 1".. "Gift 9"); `image`/`alt` empty -> the dashed 400x300 slot; `amount` empty -> no amount line and `href="donate.html"`; `amount` filled -> a `gift__amount` line, prefixed with `content.donation.currency` when that is filled, and `href="donate.html?amount=<encoded amount>"`.
- re-renders the whole grid on `i18n:changed`. No fetch, no storage, no timer.

## 5. config.js (for reference)
The file assigns one global object that every module reads. Keys:
```js
{
  defaultLocale: "en",
  placeholders: "hint",       // "hint" | "blank"
  org:    { name, address, phone, whatsapp, email, hours, mapsUrl },
  api:    { baseUrl: "", submitPath: "/donations", sponsorPath: "/sponsorships", timeoutMs: 8000 },
  content:{ logo, hero{}, about{}, programs[2],
            cards[4],         // icon, body, href: sponsor.html, volunteer.html, gift-of-love.html, donate.html
            donation{}, volunteer{}, contactPage{},
            sponsorPage: { subtitle, image, imageAlt, note },
            gifts[9],         // { name, image, alt, amount }; amount is a string, "" means no amount
            footer{col1..col4} }
}
```
`org.name` is the only filled org value ("Rumah Kanak-Kanak Triniti"). Every other `org`, `content` and `gifts` value is `""` until the home supplies it. `api.baseUrl: ""` is what disables both forms. There is no remote data URL and no polling interval, and no data file ships with the site: those keys are gone and must not be reintroduced.

## 6. Visual direction
Warm, trustworthy, institutional — not a startup landing page. Deep navy `#0b2138`, institutional blue `#1d6fc4` (deeper `#12559b` for accents), ice `#f4f8fd` surfaces on ink `#0e1c2b`, with `color-scheme: light dark` and a hand-written dark palette on deep navy grounds `#0a1622` / `#0f2233` — never pure black. No photographs and no icon library: where an icon belongs the page ships an empty placeholder box until a real image is supplied. Shell max width 1120px, sticky header, fluid type with `clamp()`, the four-card block and the nine-cell gift grid collapsing to a single column on narrow screens, generous whitespace, motion removed under `prefers-reduced-motion: reduce`. A gift cell, a placeholder box and a disabled link must all be distinguishable at a glance.
