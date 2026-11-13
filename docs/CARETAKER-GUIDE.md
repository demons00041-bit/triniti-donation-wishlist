# Caretaker guide — the Triniti donation site

For the people who look after the children's home. No computer knowledge needed. Short sentences, in plain English.

---

## The one idea behind this site

**The site is a set of finished pages, and nothing on it is typed from the site itself.**

There is no login, no dashboard and no data-entry screen. Every word, picture and gift comes from one file on the computer that holds the project: `assets/js/config.js`. Someone changes a value in that file, saves it, and the site shows the change the next time a page is loaded.

So the caretaker's job is not typing numbers in. It is knowing what the site says, and knowing who to ask when a word, a picture, a phone number or a gift has to change.

---

## What is on the site

The site is six pages, in two languages: English and Bahasa Melayu.

| Page | What it is for |
| --- | --- |
| `index.html` | The home page. A hero picture, a block of four cards under the heading "Lend a Hand", the home's own words, two program sections, and a donation band with preset amounts. |
| `donate.html` | Ways to give: an amount, a QR code, an online payment page, a bank transfer, and what to drop off. |
| `volunteer.html` | Volunteering: three roles and three steps. |
| `contact.html` | How to reach the home: address, phone, WhatsApp, email, opening hours. |
| `sponsor.html` | Sponsoring a child: one picture, a short note, and a message box. |
| `gift-of-love.html` | Nine gifts in a grid. Choosing a gift opens the donation page. |

The four cards on the home page are the way into the rest of the site: **Sponsor A Child**, **Volunteer**, **Gift Of Love**, **Donate for us**. Each one is a link to its own page.

The two buttons at the top of every page switch between English and Bahasa Melayu. They switch the whole page, not only the menu.

---

## Where things are changed

Four places. Nothing else needs touching.

| What you want to change | Where it lives |
| --- | --- |
| The home's own facts and pictures — name, address, phone, WhatsApp, email, opening hours, map link, photographs, the About text | `org` and `content` in `assets/js/config.js` |
| The four Lend a Hand cards — the sentence on each card, and where each one leads | `content.cards` in `assets/js/config.js` |
| The nine gifts — the name, the picture, the alt text, and the amount each one opens with | `content.gifts` in `assets/js/config.js` |
| The sponsor page — the subtitle, the big picture, its alt text, the note above the message box | `content.sponsorPage` in `assets/js/config.js` |
| Buttons, headings, status words and form messages | `dict` in `assets/js/i18n.js`, under `en` for English and `ms` for Bahasa Melayu |
| What happens when a donor sends the message box or the donation form | `api` in `assets/js/config.js` and `backend/worker.js` — ask whoever looks after the code |

An empty value in `config.js` is not a mistake. The page shows a dashed box with the words "To be filled in" where a fact or a picture is still missing, so the gap stays visible instead of being guessed. An empty value never means zero, and never means "not needed".

Each gift is one entry with four parts: name, picture, alt text and amount. Write the amount as plain digits — `50`, not `RM50` — because the currency comes from the donation settings. Leave the amount empty and the gift still works: it opens the donation page without an amount chosen.

---

## Before the day — 10 minutes, not part of the script

- Open the site once on the laptop you will use, and once on your phone.
- Walk the four cards once. Open the Gift Of Love page on the phone, and choose one gift.
- Print the one-page card at the end of this guide.
- Write the address of the site on the printed card.

---

## The handover script — 21 November, 10 minutes

Keep to the minutes. Let the caretaker touch the screen from 2:00 onwards; watching is not learning.

| Minutes | Length | What happens |
| --- | --- | --- |
| 0–2 | 2 min | What the site is, and why donors need it |
| 2–5 | 3 min | The four Lend a Hand cards, and where each one leads |
| 5–7 | 2 min | The gift grid, and how one gift opens the donation page |
| 7–9 | 2 min | The sponsor page, and the message box that is switched off for now |
| 9–10 | 1 min | Who to contact when something is wrong |
| **Total** | **10 min** | |

### 0–2 min · What the site is, and why donors need it

Open the site on the big screen. Scroll slowly once, top to bottom, then stop.

Say this, in your own words:

> This is the home's page. Four ways to help us sit in the middle of the first screen.
>
> A donor picks one: sponsor a child, volunteer some time, buy one gift, or give money. Each one opens its own page with the details.
>
> Everything is in English and Bahasa Melayu — the two buttons at the top. The same page, two languages.

Point at two things only: the Lend a Hand heading, and the language buttons. Do not explain the design.

### 2–5 min · The four Lend a Hand cards

The caretaker does this, not you. Give over the laptop or the phone.

1. Ask them to read the four card titles out loud: Sponsor A Child, Volunteer, Gift Of Love, Donate for us.
2. Ask: "A stranger wants to give money and does not know what we need. Which card do you open for them?" Any of them is a fair answer; the point is that each card goes somewhere different.
3. Let them open **Sponsor A Child**, then come back with the browser's back button.
4. Open **Volunteer**, and come back the same way.

Then make the point out loud:

> Four doors, one page. A donor does not have to phone the office to find out how to help.

### 5–7 min · The gift grid

1. Open **Gift Of Love**. Nine cells sit in a grid.
2. Choose a gift. The donation page opens, with that gift's amount already chosen when the amount was filled in.
3. Say: "When a gift has no amount yet, the cell still works. It opens the donation page and the donor chooses the amount."

Say:

> The gifts are not in a shop and nothing is paid on this page. A gift is a shortcut to the donation page.

### 7–9 min · The sponsor page, and the message box

Open **Sponsor a child**.

1. Point at the big picture, the note, and the box underneath.
2. Type a few words into the box. Then point at the send button: it is grey and it will not press.
3. Say: "This is on purpose. Nothing has been connected on the other side yet, so the button is switched off. Nothing you type is saved — leave the page and it is gone."
4. Reload the page and show that the box is empty again.

Say:

> The grey button means "not connected yet", not "broken".

### 9–10 min · Who to contact when something is wrong

Write this on the printed card, in front of them:

> Who to call when something is wrong: **[TODO: name and phone number]**

Say:

> The page looking odd is almost never an emergency, and nothing a visitor does on the site can damage it.
>
> If the page looks wrong, first reload it once. If it still looks wrong, send a message with three things: the address of the page, a photo of the screen, and what you expected to see.

---

## Three things that look like mistakes, and are not

### 1. A dashed box that says "To be filled in"

**What it looks like:** a rectangle with a dashed border, on its own or in place of a picture.

**Why:** that fact or picture has not been supplied yet. The site says so plainly instead of inventing an address or a photograph.

**What to do:** nothing, until the home has the real value. Then whoever looks after the code fills it in `assets/js/config.js`, and the box turns into the text or the picture.

### 2. A card or a link that does nothing

**What it looks like:** a card that cannot be clicked, or a link that Tab skips over.

**Why:** its address is empty in `config.js`, so the page disabled it on purpose rather than sending a donor to a page that does not exist.

**What to do:** fill in the address — `sponsor.html`, `volunteer.html`, `gift-of-love.html` or `donate.html` for the four cards.

### 3. The greyed-out send button on the sponsor page

**What it looks like:** a message box that accepts typing, and a send button that stays grey.

**Why:** no backend is configured, so there is nowhere to send a message. Nothing typed is stored — no cookie, no saved draft, nothing added to the page address.

**What to do:** leave it. Every page and every payment method works without a backend. To switch the box on, follow `docs/BACKEND-SETUP.md`.

---

## One-page card

Keep this beside the computer.

| I want to… | Do this | Who does it |
| --- | --- | --- |
| Change a phone number, an address, the opening hours, a picture | `org` or `content` in `assets/js/config.js` | whoever looks after the code |
| Change the sentence on one of the four cards, or where it leads | `content.cards` in `assets/js/config.js` | whoever looks after the code |
| Put a gift on the Gift Of Love page | `content.gifts`: name, picture, alt text, amount | whoever looks after the code |
| Change the sponsor page picture or note | `content.sponsorPage` in `assets/js/config.js` | whoever looks after the code |
| Change a button label or a form message | `dict` in `assets/js/i18n.js`, under `en` and `ms` | whoever looks after the code |
| Show the site to someone | open the address in any browser — no app needed, works on a phone | anyone |
| Switch language | the two buttons at the top of the page | anyone |
| Check that a gift works | open Gift Of Love, choose the gift, see the amount on the donation page | anyone |

Two rules for every change:

1. **Digits only in an amount.** `50`, never `RM50`. The currency is set once, in the donation settings.
2. **A label is changed twice.** Anything that appears in both languages lives in two dictionaries, `en` and `ms`. Change both, or one language keeps the old word.

---

## If something breaks

**[TODO: name and phone number]**

When you write, include: the address of the page, a photo of the screen, and what you expected to see. Three sentences is enough.
