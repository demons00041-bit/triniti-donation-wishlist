/* Rumah Kanak-Kanak Triniti - donate page wizard.
   ES5 on purpose: variables and functions only, so the page runs in any browser
   from the last decade. Nothing typed into the details form is kept: no browser
   storage of any kind, no cookies, no rewritten URL, no history entry. Payment
   happens on the bank own page or app; this file moves no money and invents no
   reference number. The page always opens on step one. */
(function (window, document) {
  "use strict";

  var FALLBACK_TIMEOUT = 8000;
  var COPY_LABEL_MS = 2000;
  var MAX_NAME = 120;
  var MAX_MESSAGE = 1000;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var STEPS = ["method", "amount", "info", "pay", "done"];
  var METHODS = ["qr", "hosted", "transfer"];
  var PAY_PANELS = ["pay-qr", "pay-hosted", "pay-bank"];

  /* step: the open panel. method: "" until one is chosen. amount: a positive
     number or null. source: "" | "tier" | "other" - where that amount came
     from. Nothing here survives a reload on purpose. */
  var state = { step: "method", method: "", amount: null, source: "" };

  var detailsTried = false;
  var detailsFailed = false;
  var statusKind = "idle";
  var statusKey = "";
  var statusVars = null;

  /* ---------- small helpers ---------- */

  function get(path) {
    if (window.Site && typeof window.Site.get === "function") {
      return window.Site.get(path);
    }
    var parts = String(path).split(".");
    var node = window.TRINITI_CONFIG || {};
    var i;
    for (i = 0; i < parts.length; i += 1) {
      if (node === null || typeof node !== "object") { return undefined; }
      node = node[parts[i]];
    }
    return node;
  }

  function say(key, vars) {
    if (window.Site && typeof window.Site.t === "function") { return window.Site.t(key, vars); }
    if (window.I18N && typeof window.I18N.t === "function") { return window.I18N.t(key, vars); }
    return key;
  }

  function el(id) { return document.getElementById(id); }

  function on(id, type, handler) {
    var node = el(id);
    if (node && node.addEventListener) { node.addEventListener(type, handler); }
  }

  function filled(value) {
    return typeof value === "string" && value.replace(/^\s+|\s+$/g, "") !== "";
  }

  function trimmed(value) {
    return (typeof value === "string" ? value : "").replace(/^\s+|\s+$/g, "");
  }

  /* named controls only: form.name is the form own property, not the input */
  function field(form, name) {
    if (!form || !form.elements) { return null; }
    return form.elements[name] || null;
  }

  function valueOf(form, name) {
    var node = field(form, name);
    return node && typeof node.value === "string" ? node.value : "";
  }

  function donation() { return get("content.donation") || {}; }

  function hasBackend() { return filled(get("api.baseUrl")); }

  function numberText(value) {
    if (window.I18N && typeof window.I18N.number === "function") { return window.I18N.number(value); }
    return String(value);
  }

  /* ---------- amounts ---------- */

  /* The tiers are whatever config.js lists; nothing is added here. */
  function tiers() {
    var list = donation().amounts || [];
    var out = [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      var n = Number(list[i]);
      if (isFinite(n) && n > 0 && out.indexOf(n) === -1) { out.push(n); }
    }
    return out;
  }

  function parseAmount(text) {
    var raw = typeof text === "string" ? text.replace(/[^0-9.]/g, "") : "";
    if (raw === "") { return null; }
    var n = Number(raw);
    if (!isFinite(n) || !(n > 0)) { return null; }
    return n;
  }

  /* The ?amount= parameter is read once, to seed the wizard. It is never
     written back, so a reload always starts from nothing. */
  function readAmount() {
    var search = "";
    try { search = window.location.search || ""; } catch (e) { search = ""; }
    var hit = /[?&]amount=([^&]*)/.exec(search);
    if (!hit) { return null; }
    var raw = hit[1].replace(/\+/g, " ");
    var text = raw;
    try { text = decodeURIComponent(raw); } catch (err) { text = raw; }
    return parseAmount(text);
  }

  /* ---------- the wizard ---------- */

  function stepIndex(name) {
    var i;
    for (i = 0; i < STEPS.length; i += 1) {
      if (STEPS[i] === name) { return i; }
    }
    return -1;
  }

  function syncPanels() {
    var i;
    for (i = 0; i < STEPS.length; i += 1) {
      var panel = el("panel-" + STEPS[i]);
      if (panel) { panel.hidden = STEPS[i] !== state.step; }
    }
  }

  function syncStepper() {
    var nav = el("steps-nav");
    if (!nav || !nav.querySelectorAll) { return; }
    var items = nav.querySelectorAll(".steps-nav__item");
    var current = stepIndex(state.step);
    var i;
    for (i = 0; i < items.length; i += 1) {
      var at = stepIndex(items[i].getAttribute("data-step"));
      var cls = "steps-nav__item";
      if (at === current) {
        cls = cls + " is-current";
        items[i].setAttribute("aria-current", "step");
      } else {
        if (at !== -1 && at < current) { cls = cls + " is-done"; }
        items[i].removeAttribute("aria-current");
      }
      items[i].className = cls;
    }
  }

  function goStep(name) {
    if (stepIndex(name) === -1) { return; }
    state.step = name;
    syncPanels();
    syncStepper();
    renderAmountTexts();
    if (name === "pay") { renderPay(); }
    if (name === "done") { renderPay(); maybeSendDetails(); }
  }

  function completePayment() {
    goStep("done");
  }

  /* ---------- step 1: how to give ---------- */

  function methodTitle(key) {
    if (key === "qr") { return say("pay.qrTitle"); }
    if (key === "hosted") { return say("pay.hostedTitle"); }
    if (key === "transfer") { return say("otherWays.bankTitle"); }
    return "";
  }

  function syncMethodCards() {
    if (!document.querySelectorAll) { return; }
    var cards = document.querySelectorAll(".method-card");
    var i;
    for (i = 0; i < cards.length; i += 1) {
      var key = cards[i].getAttribute("data-method");
      cards[i].setAttribute("aria-pressed", key === state.method ? "true" : "false");
    }
    var next = el("flow-method-next");
    if (next) { next.disabled = METHODS.indexOf(state.method) === -1; }
  }

  function selectMethod(key) {
    if (METHODS.indexOf(key) === -1) { return; }
    state.method = key;
    syncMethodCards();
  }

  function wireMethods() {
    if (!document.querySelectorAll) { return; }
    var cards = document.querySelectorAll(".method-card");
    var i;
    for (i = 0; i < cards.length; i += 1) {
      (function (card) {
        card.addEventListener("click", function () {
          selectMethod(card.getAttribute("data-method"));
        });
      })(cards[i]);
    }
  }

  /* ---------- step 2: how much ---------- */

  function syncTierSelection() {
    var grid = el("tier-grid");
    if (!grid || !grid.querySelectorAll) { return; }
    var buttons = grid.querySelectorAll(".tier");
    var i;
    for (i = 0; i < buttons.length; i += 1) {
      var raw = buttons[i].getAttribute("data-tier");
      var base = "tier";
      var chosen = false;
      if (raw === "other") {
        base = "tier tier--other";
        chosen = state.source === "other";
      } else {
        chosen = state.source === "tier" && state.amount !== null && Number(raw) === state.amount;
      }
      buttons[i].setAttribute("aria-pressed", chosen ? "true" : "false");
      buttons[i].className = chosen ? base + " is-selected" : base;
    }
  }

  function syncOtherBox() {
    var box = el("tier-other");
    if (box) { box.hidden = state.source !== "other"; }
  }

  function renderTiers() {
    var grid = el("tier-grid");
    if (!grid) { return; }
    var list = tiers();
    var i;
    grid.innerHTML = "";
    for (i = 0; i < list.length; i += 1) {
      var button = document.createElement("button");
      button.className = "tier";
      button.setAttribute("type", "button");
      button.setAttribute("data-tier", String(list[i]));
      button.setAttribute("aria-pressed", "false");
      button.textContent = numberText(list[i]);
      grid.appendChild(button);
    }
    var other = document.createElement("button");
    other.className = "tier tier--other";
    other.setAttribute("type", "button");
    other.setAttribute("data-tier", "other");
    other.setAttribute("aria-pressed", "false");
    other.setAttribute("data-i18n", "donate.other");
    other.textContent = say("donate.other");
    grid.appendChild(other);
    syncTierSelection();
  }

  function selectTier(raw) {
    var box = el("tier-other");
    var input = el("tier-input");
    if (raw === "other") {
      state.source = "other";
      if (box) { box.hidden = false; }
      state.amount = input ? parseAmount(input.value) : null;
      if (input && typeof input.focus === "function") { input.focus(); }
    } else {
      var n = Number(raw);
      if (!isFinite(n) || !(n > 0)) { return; }
      state.source = "tier";
      state.amount = n;
      if (box) { box.hidden = true; }
    }
    renderAmountTexts();
    syncTierSelection();
  }

  function renderAmountTexts() {
    var cur = el("amount-currency");
    if (cur) { cur.hidden = !filled(get("content.donation.currency")); }
    var node = el("amount-number");
    if (node) {
      node.textContent = state.amount === null ? say("placeholder.notSelected") : numberText(state.amount);
    }
    var next = el("flow-amount-next");
    if (next) { next.disabled = !(state.amount !== null && state.amount > 0); }
  }

  /* ?amount=N seeds the step: a known tier is picked, anything else fills the
     other-amount box. Either way the visitor can change it afterwards. */
  function applyInitialAmount() {
    var initial = readAmount();
    if (initial === null) { return; }
    var list = tiers();
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i] === initial) {
        state.amount = initial;
        state.source = "tier";
        return;
      }
    }
    state.amount = initial;
    state.source = "other";
    var input = el("tier-input");
    if (input) { input.value = String(initial); }
  }

  function wireTiers() {
    var grid = el("tier-grid");
    if (grid && grid.addEventListener) {
      grid.addEventListener("click", function (event) {
        var node = event.target;
        while (node && node !== grid && !(node.getAttribute && node.getAttribute("data-tier"))) {
          node = node.parentNode;
        }
        if (!node || node === grid || !node.getAttribute) { return; }
        selectTier(node.getAttribute("data-tier"));
      });
    }
    var input = el("tier-input");
    if (input && input.addEventListener) {
      var onTyped = function () {
        state.source = "other";
        state.amount = parseAmount(input.value);
        syncOtherBox();
        renderAmountTexts();
        syncTierSelection();
      };
      input.addEventListener("input", onTyped);
      input.addEventListener("change", onTyped);
    }
  }

  /* ---------- step 4: the payment panel for the chosen method ---------- */

  function renderPay() {
    var cur = filled(get("content.donation.currency"));
    var name = el("pay-method-name");
    if (name) { name.textContent = methodTitle(state.method); }
    var payCur = el("pay-currency");
    if (payCur) { payCur.hidden = !cur; }
    var number = el("pay-amount-number");
    if (number) {
      number.textContent = state.amount === null ? say("placeholder.notSelected") : numberText(state.amount);
    }
    var i;
    for (i = 0; i < PAY_PANELS.length; i += 1) {
      var panel = el(PAY_PANELS[i]);
      if (panel) { panel.hidden = METHODS[i] !== state.method; }
    }
  }

  /* ---------- status region ---------- */

  function setStatus(kind, text) {
    var node = el("form-status");
    if (!node) { return; }
    node.className = "status status--" + (kind || "idle") + " form-row--wide";
    node.textContent = text || "";
  }

  function note(kind, key, vars) {
    statusKind = kind;
    statusKey = key || "";
    statusVars = vars || null;
    setStatus(kind, statusKey ? say(statusKey, statusVars || undefined) : "");
  }

  function setFieldError(name, key) {
    var node = el("err-" + name);
    if (node) { node.textContent = key ? say(key) : ""; }
  }

  function clearErrors() {
    var names = ["name", "email", "phone", "message", "agree"];
    var i;
    for (i = 0; i < names.length; i += 1) {
      setFieldError(names[i], "");
      var node = el("f-" + names[i]);
      if (node) { node.removeAttribute("aria-invalid"); }
    }
  }

  function problemKey(problem) {
    if (problem === "email") { return "form.errEmail"; }
    if (problem === "agree") { return "form.errAgree"; }
    if (problem === "anonymous") { return "form.errAnonymous"; }
    return "form.errRequired";
  }

  function failureKey(code) {
    if (code === "backendMissing") { return "form.backendMissing"; }
    if (code === "timeout") { return "form.errTimeout"; }
    if (code === "network") { return "form.errNetwork"; }
    if (code === "rate") { return "form.errRate"; }
    if (code === "email") { return "form.errEmail"; }
    if (code === "anonymous") { return "form.errAnonymous"; }
    return "form.errServer";
  }

  function showDoneNote() {
    var node = el("done-note");
    if (!node) { return; }
    node.textContent = say("done.detailsNotSent");
    node.hidden = false;
  }

  function hideDoneNote() {
    var node = el("done-note");
    if (!node) { return; }
    node.textContent = "";
    node.hidden = true;
  }

  /* ---------- hosted bank page panel ---------- */

  function renderHosted() {
    var link = el("hosted-link");
    var unavailable = el("hosted-unavailable");
    var url = get("content.donation.onlineUrl");
    var bank = get("content.donation.bankName");
    if (link) {
      link.textContent = say("pay.hostedCta", {
        bank: filled(bank) ? bank : say("placeholder.todo")
      });
      if (filled(url)) {
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
        link.removeAttribute("aria-disabled");
        link.removeAttribute("tabindex");
        link.className = "btn btn--primary btn--block";
      } else {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("tabindex", "-1");
        link.className = "btn btn--primary btn--block is-disabled";
      }
    }
    if (unavailable) { unavailable.hidden = filled(url); }
  }

  /* ---------- copy the account number ---------- */

  function legacyCopy(text) {
    var ok = false;
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.setAttribute("aria-hidden", "true");
    area.className = "sr-only";
    document.body.appendChild(area);
    try {
      area.focus();
      area.select();
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function copyText(text, done) {
    var nav = window.navigator || {};
    if (nav.clipboard && typeof nav.clipboard.writeText === "function") {
      nav.clipboard.writeText(text).then(function () {
        done(true);
      }, function () {
        done(legacyCopy(text));
      });
      return;
    }
    done(legacyCopy(text));
  }

  function syncCopy() {
    var button = el("copy-account");
    if (!button) { return; }
    button.disabled = !filled(get("content.donation.accountNumber"));
    button.textContent = say("otherWays.copy");
  }

  function wireCopy() {
    var button = el("copy-account");
    if (!button) { return; }
    syncCopy();
    button.addEventListener("click", function () {
      var text = get("content.donation.accountNumber");
      if (!filled(text) || button.disabled) { return; }
      copyText(text, function (ok) {
        if (!ok) { return; }
        button.textContent = say("otherWays.copied");
        window.setTimeout(function () { button.textContent = say("otherWays.copy"); }, COPY_LABEL_MS);
      });
    });
  }

  /* ---------- step 3: the optional details ---------- */

  function onAnonymousChange(form) {
    var box = field(form, "anonymous");
    var on = !!(box && box.checked);
    var names = ["name", "email", "phone", "message", "agree"];
    var clearing = ["name", "email", "phone", "message"];
    var i;
    for (i = 0; i < names.length; i += 1) {
      var control = field(form, names[i]);
      if (control) { control.disabled = on; }
    }
    if (on) {
      for (i = 0; i < clearing.length; i += 1) {
        var input = field(form, clearing[i]);
        if (input) { input.value = ""; }
      }
      var agree = field(form, "agree");
      if (agree) { agree.checked = false; }
      clearErrors();
      statusKind = "idle";
      statusKey = "";
      statusVars = null;
      setStatus("idle", "");
    }
    var privacy = el("form-privacy");
    if (privacy) { privacy.hidden = on; }
    var anonNote = el("form-anon-note");
    if (anonNote) { anonNote.hidden = !on; }
    if (!hasBackend() && !on) { note("idle", "form.backendMissing"); }
  }

  function buildPayload(form) {
    var agree = field(form, "agree");
    return {
      amount: state.amount,
      currency: trimmed(get("content.donation.currency")),
      name: trimmed(valueOf(form, "name")),
      email: trimmed(valueOf(form, "email")),
      phone: trimmed(valueOf(form, "phone")),
      message: trimmed(valueOf(form, "message")),
      agree: !!(agree && agree.checked),
      locale: (window.I18N && typeof window.I18N.getLocale === "function")
        ? window.I18N.getLocale()
        : (get("defaultLocale") || "en"),
      hp: valueOf(form, "hp"),
      ts: new Date().toISOString()
    };
  }

  function validate(form) {
    var box = field(form, "anonymous");
    if (box && box.checked) { return "anonymous"; }
    var email = trimmed(valueOf(form, "email"));
    var agree = field(form, "agree");
    if (email === "" || !EMAIL_RE.test(email)) { return "email"; }
    if (trimmed(valueOf(form, "name")).length > MAX_NAME) { return "name"; }
    if (trimmed(valueOf(form, "message")).length > MAX_MESSAGE) { return "message"; }
    if (!agree || !agree.checked) { return "agree"; }
    return "";
  }

  function submitDetails(payload) {
    return new Promise(function (resolve) {
      var base = trimmed(get("api.baseUrl"));
      var path = get("api.submitPath");
      var timeoutMs = get("api.timeoutMs");
      var settled = false;
      var controller = null;
      var timer = 0;
      if (base === "") { resolve({ ok: false, error: "backendMissing" }); return; }
      base = base.replace(/\/+$/, "");
      if (!filled(path)) { path = "/donations"; }
      if (typeof timeoutMs !== "number" || !(timeoutMs > 0)) { timeoutMs = FALLBACK_TIMEOUT; }

      function finish(result) {
        if (settled) { return; }
        settled = true;
        if (timer) { window.clearTimeout(timer); }
        resolve(result);
      }

      if (typeof window.fetch !== "function") { finish({ ok: false, error: "network" }); return; }

      if (typeof window.AbortController === "function") { controller = new window.AbortController(); }
      timer = window.setTimeout(function () {
        if (controller && typeof controller.abort === "function") { controller.abort(); }
        finish({ ok: false, error: "timeout" });
      }, timeoutMs);

      var options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        credentials: "omit"
      };
      if (controller) { options.signal = controller.signal; }

      window.fetch(base + path, options).then(function (response) {
        var code = response.status;
        return response.json().then(function (data) {
          return { code: code, data: data };
        }, function () {
          return { code: code, data: null };
        });
      }).then(function (result) {
        var data = result.data || {};
        if (result.code === 201 && data.ok === true && filled(data.ref)) {
          finish({ ok: true, ref: data.ref });
          return;
        }
        if (result.code === 429) { finish({ ok: false, error: "rate" }); return; }
        if (result.code === 400 && data.error === "email") { finish({ ok: false, error: "email" }); return; }
        if (result.code === 400 && data.error === "anonymous") { finish({ ok: false, error: "anonymous" }); return; }
        finish({ ok: false, error: "server" });
      }).then(null, function (error) {
        var name = error && error.name ? error.name : "";
        finish({ ok: false, error: name === "AbortError" ? "timeout" : "network" });
      });
    });
  }

  /* The details go out at most once per page load, and only when there is a
     backend, the visitor is not anonymous and every field checks out. A
     failure is a note on the thank-you card, never a wall: the wizard still
     reaches its last step. */
  function maybeSendDetails() {
    if (detailsTried) { return; }
    var form = el("details-form");
    if (!form) { return; }
    if (!hasBackend()) { return; }
    var box = field(form, "anonymous");
    if (box && box.checked) { return; }
    clearErrors();
    var problem = validate(form);
    if (problem) {
      if (problem !== "anonymous") { setFieldError(problem, problemKey(problem)); }
      return;
    }
    detailsTried = true;
    note("busy", "form.sending");
    submitDetails(buildPayload(form)).then(function (result) {
      if (result && result.ok) {
        note("ok", "form.success", { ref: result.ref });
        return;
      }
      detailsFailed = true;
      if (result && result.error === "email") { setFieldError("email", "form.errEmail"); }
      note("err", failureKey(result && result.error));
      showDoneNote();
    });
  }

  function advanceFromInfo() {
    maybeSendDetails();
    goStep("pay");
  }

  function wireForm() {
    var form = el("details-form");
    if (!form) { return; }
    var box = field(form, "anonymous");
    if (box) {
      box.addEventListener("change", function () { onAnonymousChange(form); });
    }
    form.addEventListener("submit", function (event) {
      if (event && typeof event.preventDefault === "function") { event.preventDefault(); }
      if (state.step === "info") { advanceFromInfo(); }
    });
  }

  /* ---------- navigation ---------- */

  function wireFlow() {
    on("flow-method-next", "click", function () {
      if (state.method !== "") { goStep("amount"); }
    });
    on("flow-amount-back", "click", function () { goStep("method"); });
    on("flow-amount-next", "click", function () {
      if (state.amount !== null && state.amount > 0) { goStep("info"); }
    });
    on("flow-info-back", "click", function () { goStep("amount"); });
    on("flow-info-next", "click", advanceFromInfo);
    on("flow-pay-back", "click", function () { goStep("info"); });
    on("flow-pay-done", "click", completePayment);
  }

  /* ---------- locale switch ---------- */

  function onLocaleChanged() {
    renderTiers();
    renderAmountTexts();
    renderPay();
    renderHosted();
    syncCopy();
    syncOtherBox();
    setStatus(statusKind, statusKey ? say(statusKey, statusVars || undefined) : "");
    if (detailsFailed) { showDoneNote(); } else { hideDoneNote(); }
  }

  function init() {
    renderTiers();
    applyInitialAmount();
    syncOtherBox();
    syncTierSelection();
    renderAmountTexts();
    syncMethodCards();
    syncPanels();
    syncStepper();
    renderPay();
    renderHosted();
    wireCopy();
    wireForm();
    wireMethods();
    wireTiers();
    wireFlow();
    if (!hasBackend()) { note("idle", "form.backendMissing"); }
    window.addEventListener("i18n:changed", onLocaleChanged);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
