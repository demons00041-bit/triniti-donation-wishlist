/* Rumah Kanak-Kanak Triniti - donate page controller.
   ES5 on purpose: variables and functions only, so the page runs in any browser
   from the last decade. Nothing typed into the details form is ever stored:
   no local storage, no session storage, no cookies, no rewritten URL. */
(function (window, document) {
  "use strict";

  var FALLBACK_TIMEOUT = 8000;
  var COPY_LABEL_MS = 2000;
  var MAX_NAME = 120;
  var MAX_MESSAGE = 1000;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var amount = null;
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

  /* ---------- amount ---------- */

  function readAmount() {
    var search = "";
    try { search = window.location.search || ""; } catch (e) { search = ""; }
    amount = null;
    var hit = /[?&]amount=([^&]*)/.exec(search);
    if (!hit) { return amount; }
    var raw = hit[1].replace(/\+/g, " ");
    var text = raw;
    try { text = decodeURIComponent(raw); } catch (err) { text = raw; }
    if (text.replace(/\s+/g, "") === "") { return amount; }
    var parsed = Number(text);
    if (isFinite(parsed) && parsed > 0) { amount = parsed; }
    return amount;
  }

  function renderAmountBar() {
    var wrap = el("amount-value");
    var node = el("amount-number");
    var cur = el("amount-currency");
    var value = readAmount();
    if (!node) { return; }
    if (cur) { cur.hidden = !filled(get("content.donation.currency")); }
    if (value === null) {
      node.textContent = say("placeholder.notSelected");
      if (wrap) { wrap.className = "amount-bar__value is-missing"; }
      return;
    }
    node.textContent = numberText(value);
    if (wrap) { wrap.className = "amount-bar__value"; }
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

  /* ---------- hosted bank page card ---------- */

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

  /* ---------- the optional details form ---------- */

  function onAnonymousChange(form) {
    var box = field(form, "anonymous");
    var on = !!(box && box.checked);
    var names = ["name", "email", "phone", "message", "agree", "send"];
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
    if (!hasBackend()) {
      var send = field(form, "send");
      if (send) { send.disabled = true; }
      if (!on) { note("idle", "form.backendMissing"); }
    }
  }

  function buildPayload(form) {
    var agree = field(form, "agree");
    return {
      amount: readAmount(),
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

  function wireForm() {
    var form = el("details-form");
    if (!form) { return; }
    var box = field(form, "anonymous");
    if (box) {
      box.addEventListener("change", function () { onAnonymousChange(form); });
    }
    form.addEventListener("submit", function (event) {
      if (event && typeof event.preventDefault === "function") { event.preventDefault(); }
      if (box && box.checked) { return; }
      if (!hasBackend()) { note("err", "form.backendMissing"); return; }
      clearErrors();
      var problem = validate(form);
      if (problem) {
        setFieldError(problem, problemKey(problem));
        note("err", problemKey(problem));
        var target = el("f-" + problem);
        if (target && typeof target.focus === "function") { target.focus(); }
        return;
      }
      var payload = buildPayload(form);
      var send = field(form, "send");
      if (send) {
        send.disabled = true;
        send.textContent = say("form.sending");
      }
      note("busy", "form.sending");
      submitDetails(payload).then(function (result) {
        if (send) {
          send.disabled = false;
          send.textContent = say("form.send");
        }
        if (result && result.ok) {
          form.reset();
          clearErrors();
          note("ok", "form.success", { ref: result.ref });
          return;
        }
        if (result && result.error === "email") { setFieldError("email", "form.errEmail"); }
        note("err", failureKey(result && result.error));
      });
    });
  }

  /* ---------- locale switch: re-write what came from config ---------- */

  function onLocaleChanged() {
    renderAmountBar();
    renderHosted();
    syncCopy();
    setStatus(statusKind, statusKey ? say(statusKey, statusVars || undefined) : "");
  }

  function init() {
    renderAmountBar();
    renderHosted();
    wireCopy();
    wireForm();

    var numbers = document.querySelectorAll(".pay-card__num");
    var i;
    for (i = 0; i < numbers.length; i += 1) { numbers[i].textContent = String(i + 1); }

    var form = el("details-form");
    var send = form ? field(form, "send") : null;
    if (!hasBackend()) {
      if (send) { send.disabled = true; }
      note("idle", "form.backendMissing");
    }

    window.addEventListener("i18n:changed", onLocaleChanged);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
