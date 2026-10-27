# Sheet setup — building the wishlist spreadsheet

This spreadsheet is the only place the item list lives. The website reads it and nothing else. If the sheet is right, the site is right.

First time: about 15 minutes. Every week after that: about 5 minutes.

---

## 1. Create the spreadsheet

1. Open <https://sheets.new> (or Google Drive → New → Google Sheets).
2. Give it a clear name, for example `Triniti Wishlist`.
3. Keep **one tab only**. Put the items on the first tab and delete the others.
4. Row 1 holds the nine column names, one per cell: A1 to I1.
5. Row 2 downwards holds one item per row.

### The header row

Type these nine values into **A1 to I1**, one value per cell — do not paste the whole line into one cell:

| A1 | B1 | C1 | D1 | E1 | F1 | G1 | H1 | I1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id | name | category | unit | quantity_needed | quantity_fulfilled | urgent | notes | updated |

Written as a single line, the header row reads exactly:

```
id, name, category, unit, quantity_needed, quantity_fulfilled, urgent, notes, updated
```

Spaces after the commas are ignored when the page reads the sheet, and so is capitals, so `Quantity Fulfilled` still works. New names do not — see [What not to do](#what-not-to-do).

### What each column means, in plain words

| Column | What it means | 中文 | Bahasa Melayu |
| --- | --- | --- | --- |
| `id` | A short label for the row that no other row uses, for example `item-012`. Any text. | 编号 | ID |
| `name` | The item name the donor reads on the card, for example `Rice (10 kg bag)`. | 物品名称 | Nama barang |
| `category` | One of exactly these words: `staples`, `food`, `hygiene`, `household`, `school`, `baby`, `medical`, `other`. It drives the category filter on the page. | 类别 | Kategori |
| `unit` | The word shown after the number: `bag`, `tin`, `box`, `pack`, `bottle`, `set`. | 单位 | Unit |
| `quantity_needed` | How many the home needs in total. **Digits only.** | 需要数量 | Kuantiti diperlukan |
| `quantity_fulfilled` | **How many have already been donated.** Digits only. This is the number you update most often. | 已捐赠数量 | Kuantiti telah diderma |
| `urgent` | `yes` or `no`. `yes` shows a red urgent badge so donors see it first. The page also accepts `true`, `1`, `y`, `high`, `urgent`. | 紧急 | Segera |
| `notes` | One short sentence shown under the card, in any language. Optional. | 备注 | Catatan |
| `updated` | The date you last changed the row, for example `2025-11-01`. Optional, for your own records. | 更新日期 | Tarikh dikemas kini |

Never put a name, a phone number or anything private in this sheet: a published sheet is readable by anyone on the internet.

### How the numbers become the card

The page does the sum itself. It only needs `quantity_needed` and `quantity_fulfilled`:

| quantity_needed | quantity_fulfilled | What donors see |
| --- | --- | --- |
| 40 | 0 | Needed — 0%, `0 / 40 bag` |
| 40 | 12 | Partial — 30%, `12 / 40 bag`, 28 still missing |
| 40 | 40 | Fulfilled — 100%, `40 / 40 bag` |
| 40 | 55 | Fulfilled — still 100%, the extra is capped |

Two more rules worth knowing:

- A row whose `name` cell is empty is ignored. This is a handy way to hide an item for a while: clear the name, and type it back when you need it again.
- Anything that is not a number is read as 0. `12 bags` is not a number. Type `12`, and put the word "bags" in the `unit` column.

### One example data row

Row 2 of a brand-new sheet, filled in as an example (not real data for the home):

```
item-012, Rice (10 kg bag), staples, bag, 40, 12, no, Buy the same brand as before, 2025-11-01
```

In cells, that is:

| A | B | C | D | E | F | G | H | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| item-012 | Rice (10 kg bag) | staples | bag | 40 | 12 | no | Buy the same brand as before | 2025-11-01 |

If a value itself contains a comma, wrap that value in double quotes: `"Rice, 10 kg bag"`.

---

## 2. Publish the sheet as CSV

This is what turns the spreadsheet into something the website can read.

1. In the sheet: **File → Share → Publish to web**.
2. In the dialog, choose the **Link** tab.
3. First dropdown: pick the sheet you want — the tab holding the items (`Triniti Wishlist`), not "Entire document".
4. Second dropdown: **Comma-separated values (.csv)**.
5. Click **Publish**, then **OK** to confirm.
6. Copy the long link that appears. That link is now your data feed.

The link will look like this — the ID below is fake, yours is a long string Google generates:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vEXAMPLEfakeIDnotreal0000/pub?gid=0&single=true&output=csv
```

You can copy it again at any time from File → Share → Publish to web; the link never changes, so the site keeps working.

**Do not use the normal Share link.** `https://docs.google.com/spreadsheets/d/…/edit…` opens a web page for a person, not a CSV, and the site will quietly fall back to sample data.

---

## 3. Put the link into assets/js/config.js

Open `assets/js/config.js` in any plain text editor (Notepad is fine). Find the line that starts with `sheetCsvUrl` and put your link between the quotes.

Before:

```js
window.WISHLIST_CONFIG = {
  sheetCsvUrl: "",
  defaultLocale: "en",
  refreshSeconds: 300,
  org: { /* [TODO: ...] placeholders */ }
};
```

After:

```js
window.WISHLIST_CONFIG = {
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vEXAMPLEfakeIDnotreal0000/pub?gid=0&single=true&output=csv",
  defaultLocale: "en",
  refreshSeconds: 300,
  org: { /* [TODO: ...] placeholders */ }
};
```

Only the text between the quotes changes. Three things to check after saving:

- the quotes are still there, one at each end of the link;
- the link is on one line, with no space or line break inside it;
- the file is still called `config.js` — some editors add `.txt`, giving `config.js.txt`, which the page ignores.

Then open the site and reload it. The banner switches from demo data to live data, and the cards show what is in the sheet.

`refreshSeconds: 300` is how often the page re-reads the sheet: 300 seconds is five minutes. Reloading the tab always works too, whatever it is set to.

(For reference, `assets/js/data.js` can also build this link from a sheet id and tab id, which gives `https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=<gid>`. Pasting the published link is the path this guide uses, because it is the one you can re-copy from the dialog.)

---

## Keeping it semi-private

The item list is on a public page, so think of the sheet as public. These habits keep it that way on purpose:

- **Publish one sheet, not the document.** In the Publish dialog use the two dropdowns to select the items tab and CSV. Never "Entire document", which would publish every tab you ever add.
- **Never publish the whole Drive.** Publishing a single spreadsheet is not publishing your Drive, your other files or your account. Do not share a parent folder to "make it easier".
- **Only caretakers get edit access.** Use the normal **Share** button and add each caretaker's Google account as **Editor**. Everyone else — and the whole internet — stays read-only.
- **The published CSV is read-only for the public.** A reader can see the list and nothing else: no editing, no comments, no seeing who else has access, no access to the spreadsheet itself.
- **Keep private things out of it.** No children's names or photos, no family contact details, no donor names or amounts. If a fact should not be on a public web page, it does not belong in this sheet.
- **When a caretaker leaves,** remove them in the normal Share dialog. The site keeps working: the published CSV does not depend on who can edit.

---

## What to do each week

- [ ] Open the sheet and update `quantity_fulfilled` for everything that arrived. When an item is fully covered, set `quantity_fulfilled` equal to `quantity_needed` so it shows as Fulfilled.
- [ ] Check the numbers are digits only. No `pcs`, no `bags`, no stray letters in `quantity_needed` or `quantity_fulfilled`.
- [ ] Delete rows for needs that are finished with, and add a row for each new need — nine cells, every column filled.
- [ ] Open the website on a phone, wait a few minutes, reload, and confirm the list matches what the home actually has.

---

## What not to do

- **Do not delete or overwrite the header row.** Row 1 must keep the nine column names. If it disappears, undo with Ctrl+Z, or copy the header row above back into A1 to I1.
- **Do not rename columns to something new.** The page also recognises a few older spellings (`needed`, `target`, `fulfilled`, `received`, `donated`, `priority`, `note`, `remarks`, `comment`, `updated_at`, `last_updated`, `type`, `uom`, `item`), but anything else — `How Many Left`, `Qty Required` — is an unknown column and is ignored. When in doubt, use the exact header row.
- **Do not type text into the number columns.** `12 bags` becomes 0.
- **Do not unpublish to "tidy up".** If the published link is switched off, the site drops back to sample data.
