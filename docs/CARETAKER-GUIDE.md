# Caretaker guide — the Triniti wishlist page

For the people who look after the children's home. No computer knowledge needed. Written in short sentences, in plain English.

---

## The one idea behind this page

**The spreadsheet is the website.**

You open a Google Sheet. You change the numbers. The website reads the sheet and shows the new list.

You never edit the website itself. You do not need to design anything, upload anything or log in to anything else. One spreadsheet, nine columns, from any phone or computer.

---

## Before the day — 10 minutes, not part of the script

- Open the site once on the laptop you will use, and once on your phone.
- Open the spreadsheet once, and find row 2 (the first item).
- Print the cheat sheet at the end of this guide. One page.
- Write down the address of the site on the printed sheet.

---

## The handover script — 21 November, 10 minutes

Keep to the minutes. Let the caretaker touch the keyboard from 2:00 onwards; watching is not learning.

| Minutes | Length | What happens |
| --- | --- | --- |
| 0–2 | 2 min | What the page is, and why donors need it |
| 2–5 | 3 min | Editing a quantity and watching the page update |
| 5–7 | 2 min | Adding a new item |
| 7–9 | 2 min | Marking something fulfilled, and undoing a mistake |
| 9–10 | 1 min | Who to contact if something breaks |
| **Total** | **10 min** | |

### 0–2 min · What the page is, and why donors need it

Open the site on the big screen. Scroll slowly once, top to bottom, then stop.

Say this, in your own words:

> This is the home's wish list. Every card is one thing we need — rice, milk powder, toothpaste.
>
> The bar shows how much we already have. Green and full means people already donated it. Half full means we still need more.
>
> Donors look at this list before they buy anything. So nobody brings us forty bottles of detergent while we have no rice. And nobody has to phone the office to ask what we need this week.
>
> The list is available in English, Chinese and Malay — the buttons at the top. Same list, three languages.

Point at two things only: one progress bar, and the language buttons. Do not explain the design.

### 2–5 min · Editing a quantity and watching the page update

The caretaker does this, not you. Give over the laptop.

1. Open the spreadsheet. Find the row for rice.
2. Tell them: "Someone just donated five bags of rice. Where do you write that?"
3. They edit `quantity_fulfilled`: from `12` to `17`. Press Enter.
4. The sheet saves by itself — there is no Save button in Google Sheets.
5. Say: "Now we wait a few minutes, because Google keeps an old copy for a while. Then we reload the page."
6. Reload the site. The rice card now reads `17 / 40`, and the bar is longer.

Then make the point out loud:

> You changed the sheet. You did not touch the website. That is the whole job.

### 5–7 min · Adding a new item

Still their keyboard. Add one row at the very bottom of the sheet, and fill all nine columns:

| Column | Example |
| --- | --- |
| id | `item-013` |
| name | `Milk powder (1 kg)` |
| category | `food` |
| unit | `tin` |
| quantity_needed | `30` |
| quantity_fulfilled | `0` |
| urgent | `no` |
| notes | `For the toddlers` |
| updated | today's date, e.g. `2025-11-21` |

Two warnings while they type:

- `category` must be one of these exact words: `staples`, `food`, `hygiene`, `household`, `school`, `baby`, `medical`, `other`.
- `quantity_needed` and `quantity_fulfilled` hold plain digits: `30`, never `30 tins`.

### 7–9 min · Marking something fulfilled, and undoing a mistake

**Fulfilled.** Pick an item where people donated everything. Set `quantity_fulfilled` the same as `quantity_needed`. After the next reload the card turns into a full bar and says it is fulfilled.

**Undo.** The fastest fix for any mistake: press **Ctrl+Z** in the spreadsheet (on a Mac, Cmd+Z). That undoes the last change, and the sheet saves the corrected version by itself. If Ctrl+Z has already been pressed too often, just type the right number back into the cell.

Then say the two rules that prevent most mistakes:

> Numbers go in number columns. Words go in the `unit` column.
>
> Never delete the top row. The top row is the names of the columns, and the page uses those names to read the sheet.

### 9–10 min · Who to contact if something breaks

Write this on the printed cheat sheet, in front of them:

> Student team contact: **[TODO: student team contact]**

Say:

> The page looking wrong is almost never an emergency. The sheet is safe — nothing you type can damage it.
>
> If the page does not change after ten minutes, first reload it once. If it still looks wrong, send a message with three things: the address of the page, a photo of the screen, and what you typed and when.
>
> If the spreadsheet itself will not open, that is Google, not us — try again in an hour.

---

## Three common mistakes, and the fix

### 1. Typing numbers as text

**What it looks like:** you type `12 bags` into `quantity_needed`, or `12 pcs` into `quantity_fulfilled`. The card then shows `0 / 40` and looks finished, or shows a full bar when nothing was donated.

**Why:** the page can only count digits. `12 bags` is a word, and a word counts as 0.

**The fix:** put plain digits in `quantity_needed` and `quantity_fulfilled` — `12` — and put the word in the `unit` column: `bag`. In Google Sheets, a real number sits on the right side of its cell and a text value sits on the left. A quick look at which side is a quick check.

### 2. Deleting the header row

**What it looks like:** the whole page goes empty, or falls back to sample items, after someone sorted, deleted or pasted over row 1.

**Why:** row 1 is the list of column names. Without it the page cannot tell which column is which.

**The fix:** press Ctrl+Z immediately. If that is too late, type the header row back into A1 to I1:

```
id, name, category, unit, quantity_needed, quantity_fulfilled, urgent, notes, updated
```

One value per cell, row 1 only. Then reload the page.

### 3. Renaming a column

**What it looks like:** someone "improves" a column name to `How Many Left` or `Qty Required`. That column is then ignored and every card shows 0.

**Why:** the page looks for specific names. A few older spellings still work — `needed`, `fulfilled`, `donated`, `received`, `note`, `remarks`, `priority` — but a brand-new name does not.

**The fix:** press Ctrl+Z, or type the original name back. When in doubt, use the exact header row printed in this guide.

---

## One-page cheat sheet

Cut this out or keep it beside the computer.

**"About 5 minutes" below means: save the sheet, wait about five minutes, then reload the page.** Reloading on its own never hurts.

| I want to… | Do this | The page updates in about |
| --- | --- | --- |
| Show that something was donated | Find the row, add the amount to `quantity_fulfilled`, press Enter | 5 minutes |
| Add a new item we need | Add a row at the bottom, fill all nine columns | 5 minutes |
| Say an item is finished | Set `quantity_fulfilled` the same as `quantity_needed` | 5 minutes |
| Make an item stand out | Type `yes` in `urgent` | 5 minutes |
| Stop asking for an item for a while | Clear the `name` cell — the row is then ignored | 5 minutes |
| Bring a hidden item back | Type its name in again | 5 minutes |
| Remove an item for good | Delete the whole row, not just the text in it | 5 minutes |
| Fix a mistake | Ctrl+Z in the sheet, or type the old value back | 5 minutes |
| Check the list from my phone | Open the site address in the browser — no app needed | immediately |
| Change the phone number or the page text | That is a code change. Contact the student team | not automatic |

Two rules for every row you touch:

1. **Digits in number columns.** `12`, never `12 bags`. The word goes in `unit`.
2. **Never delete the top row.** It holds the column names.

---

## If something breaks

**[TODO: student team contact]**

When you write, include: the address of the page, a photo of the screen, and what you typed and when. Three sentences is enough.
