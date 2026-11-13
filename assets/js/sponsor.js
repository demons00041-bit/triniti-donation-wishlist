/* Triniti - sponsor page controller.
   ES5 on purpose: variables and functions only, so the page runs in any browser
   from the last decade. Nothing typed into the message box is ever stored: no
   local storage, no session storage, no cookies, no rewritten URL. While the
   backend is not configured the send button stays disabled and no request is
   made at all. */
(function (window, document) {
  "use strict";

  var FALLBACK_TIMEOUT = 8000;
  var MAX_MESSAGE = 1000;
  var NOTICE_ID = "sponsor-notconnected";

  var statusKind = "idle";
  var statusKey = "";
  var statusVars = null;
  var sending = false;

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

  function hasBackend() { return filled(get("api.baseUrl")); }

  function currentLocale() {
    if (window.I18N && typeof window.I18N.getLocale === "function") { return window.I18N.getLocale(); }
    var fallback = get("defaultLocale");
    return typeof fallback === "string" && fallback !== "" ? fallback : "en";
  }

  /* ---------- status region ---------- */

  function setStatus(kind, text) {
    var node = el("sponsor-status");
    if (!node) { return; }
    node.className = "status status--" + (kind || "idle") + " form-row--wide";
    node.textContent = text || "";
  }

  function note(kind, key, vars) {
    statusKind = kind;
    statusKey = key || "";
    statusVars = vars || null;
    setStatus(statusKind, statusKey ? say(statusKey, statusVars || undefined) : "");
  }

  function failureKey(code) {
    if (code === "timeout") { return "form.errTimeout"; }
    if (code === "network") { return "form.errNetwork"; }
    if (code === "rate") { return "form.errRate"; }
    if (code === "backendMissing") { return "form.backendMissing"; }
    return "form.errServer";
  }

  /* ---------- button and standing notices ---------- */

  function syncControls() {
    var send = el("sponsor-send");
    if (send) { send.disabled = sending || !hasBackend(); }
    var notice = el(NOTICE_ID);
    if (notice) { notice.hidden = hasBackend(); }
  }

  /* Idle rendering, run at load and again on every language switch: the two
   * notices and the button state are the only things this page owns outside
   * a submit. */
  function render() {
    syncControls();
    if (!hasBackend()) {
      statusKind = "idle";
      statusKey = "sponsorPage.notConnected";
      statusVars = null;
    }
    setStatus(statusKind, statusKey ? say(statusKey, statusVars || undefined) : "");
  }

  /* ---------- the message ---------- */

  function buildPayload() {
    var area = el("sponsor-message");
    var hp = el("sponsor-hp");
    return {
      kind: "sponsorship",
      message: trimmed(area && typeof area.value === "string" ? area.value : ""),
      hp: hp && typeof hp.value === "string" ? hp.value : "",
      locale: currentLocale(),
      ts: new Date().toISOString()
    };
  }

  function post(body) {
    return new Promise(function (resolve) {
      var base = trimmed(get("api.baseUrl"));
      var path = get("api.sponsorPath");
      var timeoutMs = get("api.timeoutMs");
      var settled = false;
      var controller = null;
      var timer = 0;

      if (base === "") { resolve({ ok: false, error: "backendMissing" }); return; }
      base = base.replace(/\/+$/, "");
      if (!filled(path)) { path = "/sponsorships"; }
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
        body: JSON.stringify(body),
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
        if (result.code === 201 && data.ok === true) {
          finish({ ok: true, ref: data.ref });
          return;
        }
        if (result.code === 429) { finish({ ok: false, error: "rate" }); return; }
        finish({ ok: false, error: "server" });
      }).then(null, function (error) {
        var name = error && error.name ? error.name : "";
        finish({ ok: false, error: name === "AbortError" ? "timeout" : "network" });
      });
    });
  }

  function onSubmit(event) {
    if (event && typeof event.preventDefault === "function") { event.preventDefault(); }
    if (sending) { return; }

    var body = buildPayload();
    var area = el("sponsor-message");

    /* No backend: nothing is sent and nothing is stored. */
    if (!hasBackend()) {
      note("err", "form.backendMissing");
      return;
    }

    if (body.message === "") {
      note("err", "form.errRequired");
      if (area && typeof area.focus === "function") { area.focus(); }
      return;
    }

    if (body.message.length > MAX_MESSAGE) { body.message = body.message.slice(0, MAX_MESSAGE); }

    sending = true;
    syncControls();
    note("busy", "form.sending");

    post(body).then(function (result) {
      sending = false;
      syncControls();
      if (result && result.ok) {
        if (area) { area.value = ""; }
        note("ok", "form.success", { ref: filled(result.ref) ? result.ref : "\u2014" });
        return;
      }
      note("err", failureKey(result && result.error));
    });
  }

  function wire() {
    var form = el("sponsor-form");
    if (!form) { return; }
    form.addEventListener("submit", onSubmit);
  }

  function init() {
    wire();
    render();
    window.addEventListener("i18n:changed", render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
