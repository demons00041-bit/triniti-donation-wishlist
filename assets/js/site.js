/* Triniti - shared renderer for all four pages.
 *
 * Classic script, no modules, no dependencies, ES5 syntax.
 * Load order at the end of <body>: config.js -> i18n.js -> site.js -> page script.
 *
 * Public API (window.Site):
 *   cfg, get(path), t(key, vars), renderHeader(), renderFooter(),
 *   applyContent(root), init()
 *
 * #site-header and #site-footer are empty containers in every page; this file
 * owns their contents. Nothing here writes a fact: every value comes from
 * config.js, and an empty value renders as a placeholder box.
 */
(function (window, document) {
  "use strict";

  var cfg = window.WISHLIST_CONFIG || {};
  var PLACEHOLDER_MODE = cfg.placeholders === "blank" ? "blank" : "hint";

  /* ---------- small helpers ---------- */

  function t(key, vars) {
    if (window.I18N && typeof window.I18N.t === "function") { return window.I18N.t(key, vars); }
    return key;
  }

  function get(path) {
    if (typeof path !== "string" || path === "") { return undefined; }
    var parts = path.split(".");
    var value = cfg;
    for (var i = 0; i < parts.length; i++) {
      if (value === null || typeof value === "undefined") { return undefined; }
      value = value[parts[i]];
    }
    return value;
  }

  function isFilled(value) {
    return typeof value === "string" && value.replace(/^\s+|\s+$/g, "") !== "";
  }

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    return node;
  }

  function addClass(node, name) {
    if (!node || !node.className) { if (node) { node.className = name; } return; }
    var list = String(node.className).split(/\s+/);
    for (var i = 0; i < list.length; i++) {
      if (list[i] === name) { return; }
    }
    node.className = (String(node.className) + " " + name).replace(/^\s+|\s+$/g, "");
  }

  function removeClass(node, name) {
    if (!node || !node.className) { return; }
    var list = String(node.className).split(/\s+/);
    var kept = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] !== "" && list[i] !== name) { kept.push(list[i]); }
    }
    node.className = kept.join(" ");
  }

  function disableLink(node) {
    if (!node) { return; }
    node.removeAttribute("href");
    node.setAttribute("aria-disabled", "true");
    node.setAttribute("tabindex", "-1");
    addClass(node, "is-disabled");
  }

  function enableLink(node, href) {
    if (!node) { return; }
    node.setAttribute("href", href);
    node.removeAttribute("aria-disabled");
    node.removeAttribute("tabindex");
    removeClass(node, "is-disabled");
  }

  /* ---------- placeholders ---------- */

  /* Text placeholder: "hint" writes the words, "blank" writes nothing.
   * Both modes add is-missing, and the stylesheet gives that class a
   * min-height so the box never collapses. */
  function markMissing(node) {
    if (!node) { return; }
    addClass(node, "is-missing");
    node.textContent = PLACEHOLDER_MODE === "blank" ? "" : t("placeholder.todo");
  }

  function clearMissing(node) {
    if (!node) { return; }
    removeClass(node, "is-missing");
  }

  /* A slot whose data-ph-size declares both dimensions at 64px or less is an
   * icon, not a picture: it gets ph--icon (which drops the picture padding and
   * minimum height) and its caption is hidden. Its own box then comes from the
   * declared dimensions through --ph-icon-w/--ph-icon-h, so a slot without any
   * layout rule of its own is still square instead of collapsing. */
  var ICON_MAX_PX = 64;

  function iconDims(size) {
    var match = /^\s*(\d+)\s*x\s*(\d+)\s*$/i.exec(String(size));
    if (!match) { return null; }
    var w = Number(match[1]);
    var h = Number(match[2]);
    if (w > ICON_MAX_PX || h > ICON_MAX_PX) { return null; }
    return { w: w, h: h };
  }

  /* Image slot: always dashed, always labelled, in both placeholder modes. */
  function renderImageSlot(node) {
    var path = node.getAttribute("data-cfg-img");
    var src = get(path);
    var altPath = node.getAttribute("data-cfg-alt");
    var alt = altPath ? get(altPath) : "";
    var size = node.getAttribute("data-ph-size") || "";
    var icon = iconDims(size);

    node.innerHTML = "";
    addClass(node, "ph");
    addClass(node, "ph--image");
    if (icon) {
      addClass(node, "ph--icon");
      node.style.setProperty("--ph-icon-w", icon.w + "px");
      node.style.setProperty("--ph-icon-h", icon.h + "px");
    }

    if (isFilled(src)) {
      var img = el("img");
      img.setAttribute("src", src);
      img.setAttribute("alt", isFilled(alt) ? alt : "");
      node.appendChild(img);
      addClass(node, "ph--filled");
      return;
    }

    removeClass(node, "ph--filled");
    var label = el("span", icon ? "ph__size sr-only" : "ph__size");
    var words = t("placeholder.image");
    if (size) { words = words + " \u00b7 " + t("placeholder.size", { size: size }); }
    label.textContent = words;
    node.appendChild(label);
  }

  /* ---------- declarative content ---------- */

  function applyTextNodes(root) {
    var nodes = root.querySelectorAll("[data-cfg]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var value = get(node.getAttribute("data-cfg"));
      if (value === null) {
        if (node.parentNode) { node.parentNode.removeChild(node); }
        continue;
      }
      if (isFilled(value)) {
        clearMissing(node);
        node.textContent = value;
      } else {
        markMissing(node);
      }
    }
  }

  function applyHrefNodes(root) {
    var nodes = root.querySelectorAll("[data-cfg-href]");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var href = get(node.getAttribute("data-cfg-href"));
      if (isFilled(href)) { enableLink(node, href); } else { disableLink(node); }
    }
  }

  function applyImageNodes(root) {
    var nodes = root.querySelectorAll("[data-cfg-img]");
    for (var i = 0; i < nodes.length; i++) { renderImageSlot(nodes[i]); }
  }

  function placeholderRow() {
    var row = el("li", "ph ph--text");
    addClass(row, "is-missing");
    row.textContent = PLACEHOLDER_MODE === "blank" ? "" : t("placeholder.todo");
    return row;
  }

  function applyListNodes(root) {
    var nodes = root.querySelectorAll("[data-cfg-list]");
    for (var i = 0; i < nodes.length; i++) {
      var host = nodes[i];
      var links = get(host.getAttribute("data-cfg-list"));
      host.innerHTML = "";
      if (!links || !links.length) {
        host.appendChild(placeholderRow());
        host.appendChild(placeholderRow());
        continue;
      }
      for (var j = 0; j < links.length; j++) {
        var entry = links[j] || {};
        var row = el("li");
        if (isFilled(entry.href)) {
          var anchor = el("a");
          anchor.setAttribute("href", entry.href);
          anchor.textContent = isFilled(entry.label) ? entry.label : t("placeholder.todo");
          if (!isFilled(entry.label)) { addClass(anchor, "is-missing"); }
          row.appendChild(anchor);
        } else {
          var slot = el("span", "is-missing");
          slot.textContent = isFilled(entry.label) ? entry.label : (PLACEHOLDER_MODE === "blank" ? "" : t("placeholder.todo"));
          row.appendChild(slot);
        }
        host.appendChild(row);
      }
    }
  }

  function applyContent(root) {
    var scope = root || document;
    if (!scope || !scope.querySelectorAll) { return; }
    applyTextNodes(scope);
    applyHrefNodes(scope);
    applyImageNodes(scope);
    applyListNodes(scope);
  }

  /* ---------- header ---------- */

  var NAV = [
    { href: "index.html#about", key: "nav.about", page: "" },
    { href: "volunteer.html", key: "nav.getInvolved", page: "volunteer" },
    { href: "contact.html", key: "nav.contact", page: "contact" }
  ];

  function currentPage() {
    if (!document.body || !document.body.getAttribute) { return ""; }
    return document.body.getAttribute("data-page") || "";
  }

  function navList(page) {
    var html = "";
    for (var i = 0; i < NAV.length; i++) {
      var active = NAV[i].page !== "" && NAV[i].page === page;
      html = html + '<li><a class="site-nav__link" href="' + NAV[i].href + '"' +
        (active ? ' aria-current="page"' : "") +
        ' data-i18n="' + NAV[i].key + '"></a></li>';
    }
    return html;
  }

  function langButtons(id) {
    return '<div class="lang" id="' + id + '" role="group" data-i18n-aria="lang.label">' +
      '<button class="lang__btn" type="button" data-locale="en" aria-pressed="false" data-i18n="lang.en"></button>' +
      '<button class="lang__btn" type="button" data-locale="ms" aria-pressed="false" data-i18n="lang.ms"></button>' +
      '</div>';
  }

  function headerMarkup(page) {
    return '<header class="site-header">' +
      '<div class="site-header__inner shell">' +
        '<a class="brand" href="index.html">' +
          '<div class="ph ph--image brand__mark" data-cfg-img="content.logo" data-ph-size="48x48"></div>' +
          '<span class="brand__text">' +
            '<span class="brand__name" data-i18n="site.name"></span>' +
            '<span class="brand__tagline" data-i18n="site.tagline"></span>' +
          '</span>' +
        '</a>' +
        '<nav class="site-nav" data-i18n-aria="nav.label">' +
          '<ul class="site-nav__list">' + navList(page) + '</ul>' +
        '</nav>' +
        langButtons("lang-switcher") +
        '<a class="btn btn--primary site-header__donate" href="donate.html"' +
          (page === "donate" ? ' aria-current="page"' : "") +
          ' data-i18n="nav.donate"></a>' +
      '</div>' +
    '</header>';
  }

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) { return; }
    var page = currentPage();
    host.setAttribute("data-page", page);
    host.innerHTML = headerMarkup(page);
    applyContent(host);
  }

  /* ---------- footer ---------- */

  function footerColumn(index) {
    var n = String(index);
    return '<div class="footer__col">' +
      '<h2 class="footer__col-title" data-cfg="content.footer.col' + n + 'Title"></h2>' +
      '<ul class="footer__links" data-cfg-list="content.footer.col' + n + 'Links"></ul>' +
    '</div>';
  }

  function footerMarkup() {
    return '<footer class="site-footer">' +
      '<div class="footer__inner shell">' +
        '<div class="footer__cols">' +
          footerColumn(1) + footerColumn(2) + footerColumn(3) + footerColumn(4) +
        '</div>' +
        '<div class="footer__bottom">' +
          '<p class="footer__meta">' +
            '<span class="footer__meta-item">&copy; <span id="year"></span> ' +
              '<span data-i18n="site.name"></span></span>' +
            '<span class="footer__sep" aria-hidden="true">&middot;</span>' +
            '<span class="footer__meta-item"><span data-i18n="footer.lastUpdated"></span> ' +
              '<span id="last-updated">&mdash;</span></span>' +
          '</p>' +
          langButtons("lang-switcher-footer") +
        '</div>' +
      '</div>' +
    '</footer>';
  }

  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) { return; }
    host.innerHTML = footerMarkup();
    applyContent(host);
    setYear();
    syncLangPressed();
  }

  /* ---------- language ---------- */

  function syncLangPressed() {
    if (!document.querySelectorAll) { return; }
    var locale = window.I18N && window.I18N.getLocale ? window.I18N.getLocale() : "en";
    var groups = ["lang-switcher", "lang-switcher-footer"];
    for (var g = 0; g < groups.length; g++) {
      var group = document.getElementById(groups[g]);
      if (!group || !group.querySelectorAll) { continue; }
      var buttons = group.querySelectorAll("[data-locale]");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-pressed",
          buttons[i].getAttribute("data-locale") === locale ? "true" : "false");
      }
    }
  }

  /* ---------- init ---------- */

  function setYear() {
    var node = document.getElementById("year");
    if (node) { node.textContent = String(new Date().getFullYear()); }
  }

  function applyI18n(root) {
    if (window.I18N && typeof window.I18N.apply === "function") {
      window.I18N.apply(root || document);
    }
  }

  function onLocaleChanged() {
    renderHeader();
    renderFooter();
    applyContent(document);
    applyI18n(document);
    setYear();
    syncLangPressed();
  }

  function init() {
    renderHeader();
    renderFooter();
    applyContent(document);
    applyI18n(document);
    setYear();
    window.addEventListener("i18n:changed", onLocaleChanged);
    syncLangPressed();
  }

  window.Site = {
    cfg: cfg,
    get: get,
    t: t,
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    applyContent: applyContent,
    init: init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
