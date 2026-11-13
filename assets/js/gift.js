/* Triniti - gift of love page controller.
   ES5 on purpose: variables and functions only. Nine cells are built from
   content.gifts, in config order, and each cell is a link to the donation
   page. Nothing here stores anything and nothing calls the network: the two
   values that matter (name and amount) are read straight from config. */
(function (window, document) {
  "use strict";

  var COUNT = 9;
  var PH_SIZE = "400x300";

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

  function filled(value) {
    return typeof value === "string" && value.replace(/^\s+|\s+$/g, "") !== "";
  }

  function trimmed(value) {
    return (typeof value === "string" ? value : "").replace(/^\s+|\s+$/g, "");
  }

  /* An entry that is missing, empty or not an object reads as {}: the cell is
   * still rendered, with its placeholder slot and its numbered label. */
  function entry(index) {
    var items = get("content.gifts");
    if (!items || typeof items !== "object" || !items.length) { return {}; }
    var item = items[index];
    return item && typeof item === "object" ? item : {};
  }

  function giftHref(amount) {
    var value = trimmed(amount);
    if (value === "") { return "donate.html"; }
    return "donate.html?amount=" + encodeURIComponent(value);
  }

  function amountText(amount) {
    var value = trimmed(amount);
    if (value === "") { return ""; }
    var currency = trimmed(get("content.donation.currency"));
    return currency === "" ? value : currency + " " + value;
  }

  function line(cls, text) {
    var node = document.createElement("div");
    node.className = cls;
    node.textContent = text;
    return node;
  }

  function buildCell(index) {
    var item = entry(index);
    var anchor = document.createElement("a");
    anchor.className = "gift";
    anchor.setAttribute("href", giftHref(item.amount));

    /* The slot carries the config paths, so site.js paints it with its own
     * placeholder conventions (dashed box, "Image . Suggested size 400x300"). */
    var media = document.createElement("div");
    media.className = "gift__media ph ph--image";
    media.setAttribute("data-cfg-img", "content.gifts." + index + ".image");
    media.setAttribute("data-cfg-alt", "content.gifts." + index + ".alt");
    media.setAttribute("data-ph-size", PH_SIZE);

    anchor.appendChild(media);
    anchor.appendChild(line("gift__name",
      filled(item.name) ? trimmed(item.name) : say("giftPage.item", { n: String(index + 1) })));

    var amount = amountText(item.amount);
    if (amount !== "") { anchor.appendChild(line("gift__amount", amount)); }
    return anchor;
  }

  /* Used only when site.js is absent: the same caption site.js writes. */
  function paintFallback(grid) {
    var slots = grid.querySelectorAll(".gift__media");
    var caption = say("placeholder.image") + " \u00b7 " + say("placeholder.size", { size: PH_SIZE });
    var i;
    for (i = 0; i < slots.length; i += 1) {
      if (slots[i].children.length) { continue; }
      var span = document.createElement("span");
      span.className = "ph__size";
      span.textContent = caption;
      slots[i].appendChild(span);
    }
  }

  function render() {
    var grid = document.getElementById("gifts-grid");
    if (!grid) { return; }
    grid.innerHTML = "";
    var i;
    for (i = 0; i < COUNT; i += 1) { grid.appendChild(buildCell(i)); }
    if (window.Site && typeof window.Site.applyContent === "function") {
      window.Site.applyContent(grid);
    } else {
      paintFallback(grid);
    }
  }

  function init() {
    render();
    window.addEventListener("i18n:changed", render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
