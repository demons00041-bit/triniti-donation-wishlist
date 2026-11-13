# Backend setup — the donation details endpoint

The website is a static site: it cannot run server-side code, so it cannot give a donor a
reference number on its own. This one small service does that. It is a single file
(`backend/worker.js`) that runs on Cloudflare's free plan, and it stores submitted donation
details in Cloudflare KV.

Two rules worth reading before you start:

- **Everything payment-related still works without this.** The QR code, the bank account and
  the hosted payment page are static page content. If this service is down, switched off or
  never deployed, donors can still transfer money. Only the optional "send my details" form
  stops working.
- **Anonymous donors never reach this service.** When a donor ticks *anonymous*, the page sends
  no request at all. Nothing is transmitted, nothing is stored, no reference number is made.

First time: about 20 minutes. You need one free Cloudflare account.

---

## The six steps

### Step 1 — Create the Cloudflare account and the Worker

1. Open <https://dash.cloudflare.com/sign-up> and register a free account. No credit card is
   needed for the free plan.
2. In the left sidebar choose **Workers & Pages** → **Create** → **Worker**.
3. Name it exactly `triniti-donations`. Click **Deploy**.

You now have a Worker that does nothing useful yet.

### Step 2 — Paste the code

1. In the Worker, click **Edit code**.
2. Select everything in the editor and delete it.
3. Open `backend/worker.js` from this repository, copy the whole file, and paste it in.
4. Click **Deploy**.

Do not change anything inside the file. Everything you might want to adjust is a setting in
step 4, not code.

### Step 3 — Create the KV namespace and bind it

1. In the sidebar choose **Storage & Databases** → **KV** → **Create a namespace**.
2. Name it `DONATIONS`. Create it.
3. Go back to your Worker → **Settings** → **Bindings** → **Add** → **KV namespace**.
4. **Variable name:** `DONATIONS` — exactly this, all capitals. This is the name the code
   looks for.
5. **KV namespace:** pick the `DONATIONS` namespace you just made.
6. Save.

If the variable name is wrong, every submission answers `500 {"ok":false,"error":"config"}`.
That error means "the Worker is not wired up", not "the donor did something wrong".

### Step 4 — Set the variables

Still in the Worker → **Settings** → **Variables and Secrets**, add two variables:

| Name | Value | Secret? |
| --- | --- | --- |
| `ALLOWED_ORIGIN` | `https://demons00041-bit.github.io` | No |
| `SALT` | a long random string you make up | **Yes** — click **Encrypt** |

`ALLOWED_ORIGIN` is the site allowed to call this Worker. It is the origin only: scheme plus
host, no trailing slash, no path. If the site ever moves to its own domain, change this value
to the new origin, otherwise the browser will block every submission.

`SALT` is mixed into the IP hash so that the stored hash cannot be reversed by brute force.
Generate it once with something like 40 random characters, for example by mashing the keyboard
or running `openssl rand -hex 32` on any computer. Never reuse a password, never publish it,
never put it in this repository.

Optional, for exporting records from step 7:

| Name | Value | Secret? |
| --- | --- | --- |
| `ADMIN_TOKEN` | a long random string | **Yes** — click **Encrypt** |

Leave `ADMIN_TOKEN` unset and the export endpoint does not exist at all (it answers
`404`). That is the safe default.

### Step 5 — Deploy and copy the address

1. Click **Deploy** once more so the variables take effect.
2. At the top of the Worker page you will see an address like
   `https://triniti-donations.your-subdomain.workers.dev`. Copy it.

Test it in a browser: open that address. You should see `{"ok":false,"error":"notfound"}`.
That is the correct answer — it proves the Worker is live.

### Step 6 — Put the address into the site and publish

1. Open `assets/js/config.js`.
2. Find `api: { baseUrl: "" , ... }` and paste your address between the quotes:

   ```js
   api: { baseUrl: "https://triniti-donations.your-subdomain.workers.dev", submitPath: "/donations", timeoutMs: 8000 },
   ```

3. Save, commit and push. The live site updates within a minute.

**Until this line is filled in, the details form is deliberately unusable.** The fields open
and can be typed into, but the submit button stays disabled and the page says the backend is
not configured yet. This is on purpose: the site must never pretend a donation was recorded
when nothing was sent anywhere.

---

## Checking that it works

Replace `$URL` with your Worker address (no trailing slash). These are the four checks from
the plan's acceptance list; run them in Git Bash, WSL or any terminal with `curl`.

**35 — a normal submission returns a real reference number:**

```bash
curl -i -X POST "$URL/donations" \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.co","amount":25,"agree":true}'
```

Expect `HTTP/1.1 201` and a body like `{"ok":true,"ref":"DON-20261113-8F3A"}`.

**36 — a hand-built anonymous request is refused and stores nothing:**

```bash
curl -i -X POST "$URL/donations" \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.co","anonymous":true,"name":"Ali","phone":"0123","agree":true}'
```

Expect `HTTP/1.1 400` and `{"ok":false,"error":"anonymous"}`. Then look at the KV namespace
(step 7): the record count must be **unchanged**. The site itself never sends this request —
the server refuses it as a second line of defence, in case somebody builds the request by hand.

**37 — the browser preflight is answered:**

```bash
curl -i -X OPTIONS "$URL/donations" \
  -H "Origin: https://demons00041-bit.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

Expect `HTTP/1.1 204` and the headers

```
access-control-allow-origin: https://demons00041-bit.github.io
access-control-allow-methods: GET,POST,OPTIONS
access-control-allow-headers: Content-Type
```

If `access-control-allow-origin` is empty, `ALLOWED_ORIGIN` is missing or misspelled.

**38 — bad input is refused, and the bot trap stays silent:**

```bash
# invalid email -> 400
curl -i -X POST "$URL/donations" -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","agree":true}'

# honey pot filled -> 201, but nothing is stored
curl -i -X POST "$URL/donations" -H "Content-Type: application/json" \
  -d '{"email":"a@b.co","agree":true,"hp":"i-am-a-bot"}'
```

The first prints `400 {"ok":false,"error":"email"}`. The second prints `201` with a reference
number, exactly like a real submission — that is deliberate, so a bot cannot tell it was
caught — but no record appears in KV.

---

## 7 — Exporting the donation records

Two ways. Both are read-only.

**Option A, the dashboard (no command line).**

1. Cloudflare dashboard → **Storage & Databases** → **KV** → `DONATIONS`.
2. Every key starting with `donation:` is one submitted record. Click a key to read its value.
   Values are JSON, one per record.
3. To take everything at once, use Option B — the dashboard lists keys but does not download
   them in bulk.

**Option B, the export endpoint (needs `ADMIN_TOKEN`).**

Only works while `ADMIN_TOKEN` is set in step 4:

```bash
curl -s "$URL/donations?token=YOUR_ADMIN_TOKEN" > donations-export.json
```

or, without putting the token in the address bar history:

```bash
curl -s -H "Authorization: Bearer YOUR_ADMIN_TOKEN" "$URL/donations" > donations-export.json
```

The reply is `{"ok":true,"count":N,"records":[ ... ]}` and each record has exactly this
shape (the values below are invented examples, not real donors):

```json
{
  "ref": "DON-20261113-8F3A",
  "amount": 25,
  "currency": "RM",
  "name": "Ali bin Ahmad",
  "email": "ali@example.com",
  "phone": "0123456789",
  "message": "For the school books",
  "locale": "en",
  "ua": "Mozilla/5.0 ...",
  "ip_hash": "3f9a1c0d5e7b2a48",
  "created_at": "2026-11-13T19:51:31.000Z"
}
```

There is no `anonymous` field and no raw IP: anonymous submissions never arrive, and the IP is
reduced to a salted hash before anything is written.

A wrong or missing token answers `401 {"ok":false,"error":"unauthorized"}`. When
`ADMIN_TOKEN` is unset the address answers `404` — from the outside it looks like the endpoint
was never there. Remove the variable when you are done exporting if you would rather not leave
a door standing open.

The record key itself is `donation:<ISO timestamp>:<8 random characters>`, so the keys sort
by time. Records are kept indefinitely; delete old keys in the dashboard when you no longer
need them.

---

## 8 — Rotating the salt

Changing `SALT` changes every future `ip_hash`, which is the point: old hashes can no longer be
matched against new ones. Existing records keep the old hash — nothing is rewritten.

Do it when: the salt is ever exposed (a screenshot, a paste into a chat, a shared screen), or
once a year as routine hygiene.

1. Worker → **Settings** → **Variables and Secrets** → edit `SALT` → **Encrypt** → save.
2. **Deploy** again. Variables only reach a running Worker on the next deploy.
3. Check with curl 35 above: a new submission must still answer `201`.
4. Existing records are untouched. If you also want the export door closed, delete
   `ADMIN_TOKEN` in the same screen.

Rotating the salt does **not** reset the rate limit: the counter keys are built from the hash,
so a new salt starts every visitor on a fresh count. That is acceptable, and it is why a
leaked salt is worth rotating even though it is only a hashing pepper.

---

## 9 — What each answer means

| Status | Body `error` | What happened | What to do |
| --- | --- | --- | --- |
| `201` | — | Stored. The `ref` is the donor's reference number. | Nothing. |
| `201` | — | The hidden field was filled, so this was a bot. Nothing was stored. | Nothing. |
| `400` | `email` | The e-mail is missing or does not look like an address. | Ask the donor to correct it. |
| `400` | `name` | The name is longer than 120 characters. | Shorten it. |
| `400` | `message` | The message is longer than 1000 characters. | Shorten it. |
| `400` | `amount` | The amount is not a number between 0 and 100000. | Pick an amount again. |
| `400` | `agree` | The consent box was not ticked. | Tick it. |
| `400` | `anonymous` | A hand-built request claimed to be anonymous. Refused, nothing stored, no quota spent. | Nothing — the real site never sends this. |
| `429` | `rate` | More than 5 accepted submissions from one connection in one hour. | Wait, or donate without the form. Money can always be transferred. |
| `500` | `config` | `SALT` or the `DONATIONS` binding is missing, so the Worker refuses to store an unhashed record. | Redo step 3 and step 4, then deploy. |
| `500` | `server` | An unexpected error inside the Worker. | Try again; if it repeats, check the Worker's logs in the dashboard. |
| `401` | `unauthorized` | Export called with a wrong token. | Use the exact `ADMIN_TOKEN`. |
| `404` | `notfound` | Wrong path, or the export endpoint while `ADMIN_TOKEN` is unset. | Check the address ends in `/donations`. |

If the browser reports a network error or a CORS error instead of any of the above, the
`ALLOWED_ORIGIN` value does not match the site's origin exactly. Check the scheme, the host and
that there is no trailing slash.

---

## Privacy — what the server receives and stores

This table is the whole promise, stated plainly.

| Did the donor tick *anonymous*? | What the server receives | What the server stores |
| --- | --- | --- |
| **No** | amount, currency, name, e-mail, phone, message, language, time, browser user agent, salted IP hash | all of the above (the IP only as a hash) |
| **Yes** | **nothing at all — no request is sent** | **nothing** |

What is never collected: card numbers, CVV, bank logins, national ID numbers. The endpoint has
no field for them and no field beyond the documented list.

The cost of the anonymous option, said out loud: the home sees only a line on the bank
statement. It cannot match that line to any form, cannot confirm the transfer, and cannot send
a receipt. Two transfers of the same amount in the same hour are indistinguishable. That is the
direct consequence of "keep nothing", and it is the behaviour the page describes to donors.

---

## If something is wrong

| Symptom | Likely cause |
| --- | --- |
| The submit button is greyed out on the site | `api.baseUrl` in `assets/js/config.js` is still `""`. Step 6. |
| Browser console says the request was blocked by CORS | `ALLOWED_ORIGIN` is wrong or missing, or the change was not deployed. |
| Every submission answers `500 config` | The KV binding is not named exactly `DONATIONS`, or `SALT` is missing. |
| `201` but nothing appears in KV | The record may be a caught bot (`hp` filled). Check the request body. |
| Everything answers `404 notfound` | The address is missing `/donations`, or the Worker was never deployed. |
| `429 rate` while testing | The limit is 5 per hour per connection. Wait an hour, or test from another connection. |
