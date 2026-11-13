/* Triniti - index page controller.
 * Builds the donation band on index.html: the amount tiles, the custom amount
 * field, and the link that carries the chosen amount on to donate.html.
 * No dependencies, no build step, ES5 only.
 */
(function () {
  "use strict";

  var CFG = window.TRINITI_CONFIG || {};

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

  /* ---------- donation band ---------- */

  function donationCfg() {
    return (CFG.content && CFG.content.donation) || {};
  }

  function tiers() {
    var list = donationCfg().amounts || [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var n = Number(list[i]);
      if (isFinite(n) && n > 0) { out.push(n); }
    }
    return out;
  }

  function renderAmounts() {
    var box = byId("amounts");
    if (!box) { return; }
    var list = tiers();
    box.innerHTML = "";
    for (var i = 0; i < list.length; i++) {
      var link = document.createElement("a");
      link.className = "amount";
      link.textContent = fmtNumber(list[i]);
      link.setAttribute("href", "donate.html?amount=" + String(list[i]));
      box.appendChild(link);
    }
    var panel = byId("other-amount");
    var open = !!(panel && panel.parentNode && !panel.parentNode.hidden);
    var toggle = document.createElement("button");
    toggle.className = "amount amount--other";
    toggle.id = "other-amount-toggle";
    toggle.textContent = t("donate.customAmount");
    toggle.setAttribute("type", "button");
    toggle.setAttribute("aria-controls", "other-amount");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    box.appendChild(toggle);
  }

  function typedAmount() {
    var input = byId("other-amount");
    if (!input) { return 0; }
    var raw = String(input.value || "").replace(/[^0-9.]/g, "");
    var n = Number(raw);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function updateDonateLink() {
    var link = byId("donate-now");
    if (!link) { return; }
    var list = tiers();
    var amount = typedAmount() || (list.length ? list[0] : 0);
    link.setAttribute("href", amount ? "donate.html?amount=" + String(amount) : "donate.html");
  }

  function wireOtherAmount() {
    var toggle = byId("other-amount-toggle");
    var input = byId("other-amount");
    var box = input ? input.parentNode : null;
    if (toggle) {
      toggle.addEventListener("click", function () {
        var shown = box ? !!box.hidden : true;
        if (box) { box.hidden = !shown; }
        toggle.setAttribute("aria-expanded", shown ? "true" : "false");
        if (shown && input && input.focus) { input.focus(); }
        updateDonateLink();
      });
    }
    on("other-amount", "input", updateDonateLink);
    on("other-amount", "change", updateDonateLink);
    updateDonateLink();
  }

  /* The hero carries exactly one call to action. Its href ships in the markup
   * as donate.html so the link works before any script runs; a configured
   * content.hero.ctaHref replaces it when one is given. */
  function wireHeroCta() {
    var cta = byId("hero-cta");
    if (!cta || !window.Site || typeof window.Site.get !== "function") { return; }
    var href = window.Site.get("content.hero.ctaHref");
    if (typeof href === "string" && href.replace(/^\s+|\s+$/g, "") !== "") {
      cta.setAttribute("href", href);
    }
  }

  /* ---------- wiring ---------- */

  function on(id, type, handler) {
    var node = byId(id);
    if (node) { node.addEventListener(type, handler); }
  }

  function init() {
    renderAmounts();
    wireOtherAmount();
    wireHeroCta();
  }

  /* The toggle is rebuilt with the tiles, so the handlers go back on after
   * every re-render, not before the first one. */
  window.addEventListener("i18n:changed", function () {
    renderAmounts();
    wireOtherAmount();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
