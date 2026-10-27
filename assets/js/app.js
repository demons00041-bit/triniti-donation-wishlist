/* Triniti Digital Donation Wishlist - view controller.
 * Binds the DOM contract in docs/BUILD-CONTRACT.md to window.Wishlist (data)
 * and window.I18N (translations). No dependencies, no build step.
 */
(function () {
  "use strict";

  var CFG = window.WISHLIST_CONFIG || {};
  var REVEAL = 150;
  var state = {
    items: [],
    meta: { source: "sample", updatedAt: null, error: null },
    query: "",
    category: "",
    status: "",
    sort: "urgency",
    timer: null
  };

  function byId(id) { return document.getElementById(id); }

  function t(key, vars) {
    if (window.I18N && typeof window.I18N.t === "function") { return window.I18N.t(key, vars); }
    return key;
  }

  function localeTag() {
    if (window.I18N && typeof window.I18N.intlLocale === "function") { return window.I18N.intlLocale(); }
    return "en-MY";
  }

  function fmtNumber(n) {
    try { return new Intl.NumberFormat(localeTag()).format(n); } catch (e) { return String(n); }
  }

  function fmtTime(iso) {
    if (!iso) { return ""; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return String(iso); }
    try {
      return new Intl.DateTimeFormat(localeTag(), { dateStyle: "medium", timeStyle: "short" }).format(d);
    } catch (e) {
      return d.toISOString().slice(0, 16).replace("T", " ");
    }
  }

  /* ---------- select population ---------- */

  var CATEGORY_ORDER = ["staples", "food", "hygiene", "household", "school", "baby", "medical", "other"];

  function option(value, label) {
    var el = document.createElement("option");
    el.value = value;
    el.textContent = label;
    return el;
  }

  function fillCategories() {
    var sel = byId("filter-category");
    if (!sel) { return; }
    var seen = {};
    state.items.forEach(function (item) { seen[item.category] = (seen[item.category] || 0) + 1; });
    var keys = Object.keys(seen).filter(function (k) { return CATEGORY_ORDER.indexOf(k) === -1; });
    var ordered = CATEGORY_ORDER.filter(function (k) { return seen[k]; }).concat(keys.sort());
    sel.innerHTML = "";
    sel.appendChild(option("", t("status.all")));
    ordered.forEach(function (key) {
      var label = t("category." + key);
      if (label === "category." + key) { label = key.charAt(0).toUpperCase() + key.slice(1); }
      sel.appendChild(option(key, label));
    });
    sel.value = state.category;
  }

  function fillStatus() {
    var sel = byId("filter-status");
    if (!sel) { return; }
    sel.innerHTML = "";
    ["", "needed", "partial", "fulfilled"].forEach(function (value) {
      sel.appendChild(option(value, t(value === "" ? "status.all" : "status." + value)));
    });
    sel.value = state.status;
  }

  function fillSort() {
    var sel = byId("sort-select");
    if (!sel) { return; }
    sel.innerHTML = "";
    [["urgency", "sort.urgency"], ["progress", "sort.progress"], ["name", "sort.name"]].forEach(function (pair) {
      sel.appendChild(option(pair[0], t(pair[1])));
    });
    sel.value = state.sort;
  }

  function fillSelects() { fillCategories(); fillStatus(); fillSort(); }

  /* ---------- filtering ---------- */

  function matches(item, q) {
    if (!q) { return true; }
    var hay = (item.name + " " + item.category + " " + item.unit + " " + (item.notes || "")).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function viewItems() {
    var q = state.query.trim().toLowerCase();
    var list = state.items.filter(function (item) {
      if (state.category && item.category !== state.category) { return false; }
      if (state.status && item.status !== state.status) { return false; }
      return matches(item, q);
    });
    var collator;
    try { collator = new Intl.Collator(localeTag()); } catch (e) { collator = null; }
    list.sort(function (a, b) {
      if (state.sort === "name") {
        return collator ? collator.compare(a.name, b.name) : a.name.localeCompare(b.name);
      }
      if (state.sort === "progress") {
        if (a.percent !== b.percent) { return a.percent - b.percent; }
      } else {
        if (a.status === "fulfilled" && b.status !== "fulfilled") { return 1; }
        if (b.status === "fulfilled" && a.status !== "fulfilled") { return -1; }
        if (a.urgent !== b.urgent) { return a.urgent ? -1 : 1; }
        if (a.percent !== b.percent) { return a.percent - b.percent; }
      }
      return collator ? collator.compare(a.name, b.name) : 0;
    });
    return list;
  }

  /* ---------- rendering ---------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined && text !== null) { node.textContent = text; }
    return node;
  }

  function badge(item) {
    if (item.status === "fulfilled") { return el("span", "badge badge--fulfilled", t("item.done")); }
    if (item.urgent) { return el("span", "badge badge--urgent", t("item.urgent")); }
    if (item.status === "partial") { return el("span", "badge badge--partial", t("item.partial")); }
    return null;
  }

  function card(item) {
    var root = el("div", "card");
    if (item.status === "fulfilled") { root.className = "card card--fulfilled"; }
    else if (item.urgent) { root.className = "card card--urgent"; }
    root.setAttribute("data-status", item.status);

    var head = el("div", "card__head");
    head.appendChild(el("h3", "card__title", item.name));
    head.appendChild(el("span", "card__category", t("category." + item.category)));
    root.appendChild(head);

    var badges = el("div", "card__badges");
    var b = badge(item);
    if (b) { badges.appendChild(b); }
    root.appendChild(badges);

    var progress = el("div", "progress");
    var bar = el("div", "progress__bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(item.percent));
    bar.setAttribute("aria-label", t("item.progressAria", { percent: item.percent, name: item.name }));
    var fill = el("div", item.status === "fulfilled" ? "progress__fill progress__fill--done" : "progress__fill");
    fill.style.width = item.percent + "%";
    bar.appendChild(fill);
    progress.appendChild(bar);
    root.appendChild(progress);

    root.appendChild(el("p", "card__amount", t("item.amount", {
      fulfilled: fmtNumber(item.fulfilled),
      needed: fmtNumber(item.needed),
      unit: item.unit
    })));

    if (item.notes) {
      var notes = el("p", "card__notes", item.notes);
      var notesLabel = t("item.notesAria");
      if (notesLabel && notesLabel !== "item.notesAria") { notes.setAttribute("aria-label", notesLabel); }
      root.appendChild(notes);
    }
    return root;
  }

  function renderStats() {
    var remaining = 0;
    var fulfilled = 0;
    var urgent = 0;
    state.items.forEach(function (item) {
      remaining += item.remaining;
      if (item.status === "fulfilled") { fulfilled += 1; }
      if (item.urgent && item.status !== "fulfilled") { urgent += 1; }
    });
    var map = { items: state.items.length, remaining: remaining, fulfilled: fulfilled, urgent: urgent };
    var nodes = document.querySelectorAll("[data-stat]");
    for (var i = 0; i < nodes.length; i += 1) {
      var key = nodes[i].getAttribute("data-stat");
      if (map[key] !== undefined) { nodes[i].textContent = fmtNumber(map[key]); }
    }
  }

  function renderBanner() {
    var text = byId("banner-text");
    var banner = byId("status-banner");
    if (!text) { return; }
    var message;
    if (state.meta.error) { message = t("banner.error"); }
    else if (state.meta.source === "sheet") { message = t("banner.live"); }
    else { message = t("banner.demo"); }
    var when = fmtTime(state.meta.updatedAt);
    if (when) {
      var note = t("banner.updated", { time: when });
      if (note && note !== "banner.updated") { message = message + " " + note; }
    }
    text.textContent = message;
    if (banner) { banner.setAttribute("data-source", state.meta.source); }
    var stamp = byId("last-updated");
    if (stamp) { stamp.textContent = when || "\u2014"; }
  }

  function render() {
    var grid = byId("wishlist-grid");
    var empty = byId("empty-state");
    var count = byId("results-count");
    if (!grid) { return; }
    var list = viewItems();
    grid.innerHTML = "";
    list.forEach(function (item) { grid.appendChild(card(item)); });
    if (empty) { empty.hidden = list.length !== 0; }
    if (count) {
      var label = t("controls.results", { count: list.length });
      count.textContent = label === "controls.results" ? String(list.length) : label;
    }
    renderStats();
    renderBanner();
  }

  /* ---------- states ---------- */

  function setLoading(on) {
    var node = byId("loading-state");
    if (node) { node.hidden = !on; }
  }

  function showError(message) {
    var box = byId("error-state");
    var text = byId("error-text");
    if (text) { text.textContent = message || t("error.body"); }
    if (box) { box.hidden = false; }
  }

  function hideError() {
    var box = byId("error-state");
    if (box) { box.hidden = true; }
  }

  /* ---------- data ---------- */

  function loadData() {
    if (!window.Wishlist || typeof window.Wishlist.load !== "function") {
      setLoading(false);
      showError(t("error.body"));
      return Promise.resolve();
    }
    setLoading(true);
    return window.Wishlist.load().then(function (result) {
      state.items = (result && result.items) || [];
      state.meta = (result && result.meta) || { source: "sample", updatedAt: null, error: null };
      setLoading(false);
      hideError();
      fillSelects();
      render();
      scheduleRefresh();
    }).catch(function (err) {
      setLoading(false);
      showError(t("error.body"));
      if (window.console && window.console.warn) { window.console.warn("Wishlist load failed", err); }
    });
  }

  function scheduleRefresh() {
    var seconds = Number(CFG.refreshSeconds);
    if (!isFinite(seconds) || seconds <= 0) { return; }
    if (state.timer) { window.clearInterval(state.timer); }
    state.timer = window.setInterval(function () {
      if (document.hidden) { return; }
      loadData();
    }, Math.max(60, seconds) * 1000);
  }

  /* ---------- config-driven contact details ---------- */

  function applyOrg() {
    var org = CFG.org || {};
    var nodes = document.querySelectorAll("[data-config]");
    var missing = 0;
    for (var i = 0; i < nodes.length; i += 1) {
      var path = nodes[i].getAttribute("data-config") || "";
      var parts = path.split(".");
      var value = CFG;
      for (var p = 0; p < parts.length; p += 1) {
        value = value ? value[parts[p]] : undefined;
      }
      if (typeof value === "string" && value.trim() !== "") {
        nodes[i].textContent = value;
        nodes[i].classList.remove("is-missing");
        if (nodes[i].tagName === "A") {
          if (path === "org.email") { nodes[i].setAttribute("href", "mailto:" + value); }
          else if (path === "org.phone" || path === "org.whatsapp") { nodes[i].setAttribute("href", "tel:" + value.replace(/[^0-9+]/g, "")); }
        }
      } else {
        missing += 1;
        nodes[i].textContent = "\u2014";
        nodes[i].classList.add("is-missing");
      }
    }
    var note = document.querySelector(".contact__note");
    if (note) {
      note.hidden = missing === 0;
      if (missing === 0) { note.textContent = ""; } else { note.textContent = t("contact.todoNote"); }
    }
  }

  /* ---------- wiring ---------- */

  function on(id, type, handler) {
    var node = byId(id);
    if (node) { node.addEventListener(type, handler); }
  }

  function resetFilters() {
    state.query = "";
    state.category = "";
    state.status = "";
    state.sort = "urgency";
    var search = byId("search-input");
    if (search) { search.value = ""; }
    fillSelects();
    render();
  }

  function wire() {
    on("search-input", "input", function (e) {
      state.query = e.target.value || "";
      render();
    });
    on("filter-category", "change", function (e) {
      state.category = e.target.value || "";
      render();
    });
    on("filter-status", "change", function (e) {
      state.status = e.target.value || "";
      render();
    });
    on("sort-select", "change", function (e) {
      state.sort = e.target.value || "urgency";
      render();
    });
    on("reset-filters", "click", function (e) {
      if (e && e.preventDefault) { e.preventDefault(); }
      resetFilters();
    });
    on("retry-button", "click", function (e) {
      if (e && e.preventDefault) { e.preventDefault(); }
      hideError();
      loadData();
    });
    window.addEventListener("i18n:changed", function () {
      fillSelects();
      applyOrg();
      render();
    });
  }

  function init() {
    var year = byId("year");
    if (year) { year.textContent = String(new Date().getFullYear()); }
    applyOrg();
    wire();
    fillSort();
    loadData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
