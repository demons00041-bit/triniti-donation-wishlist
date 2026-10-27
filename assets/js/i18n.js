/* Triniti Digital Donation Wishlist - translations and locale switching.
 *
 * Contract: docs/BUILD-CONTRACT.md section 3. Classic script, no modules,
 * no dependencies, ES5 syntax so it runs on any 2019 browser.
 * Load order at the end of <body>: config.js -> data.js -> i18n.js -> app.js
 *
 * Public API (window.I18N):
 *   locales, defaultLocale, dict, t(key, vars), getLocale(), setLocale(code),
 *   apply(root), intlLocale(), number(n), date(iso), init()
 */
(function (window, document) {
  "use strict";

  var STORAGE_KEY = "triniti.lang";
  var DEFAULT_LOCALE = "en";
  var LOCALES = ["en", "zh", "ms"];
  var INTL_LOCALES = { en: "en-MY", zh: "zh-CN", ms: "ms-MY" };
  var HTML_LANGS = { en: "en", zh: "zh-CN", ms: "ms-MY" };
  var APPLY_ATTRS = [
    ["data-i18n", "text"],
    ["data-i18n-html", "html"],
    ["data-i18n-aria", "aria"],
    ["data-i18n-placeholder", "placeholder"]
  ];

  var en = {
    "site.name": "Rumah Kanak-Kanak Triniti",
    "site.tagline": "A donation wishlist for our children's home",
    "nav.wishlist": "Wishlist",
    "nav.howToDonate": "How to donate",
    "nav.contact": "Contact",

    "hero.eyebrow": "Donation wishlist",
    "hero.title": "What our children need right now",
    "hero.subtitle": "These are the things we use every week at the home. Pick an item and we will show you how much is still needed and how to get it to us.",
    "hero.ctaPrimary": "See the wishlist",
    "hero.ctaSecondary": "How to donate",

    "banner.demo": "Sample data: this page is showing example items, not our live list.",
    "banner.live": "Showing live needs from our spreadsheet.",
    "banner.updated": "Last synced {time}.",
    "banner.error": "We could not reach the live spreadsheet, so the sample list is shown below.",

    "stats.items": "Items listed",
    "stats.remaining": "Still needed",
    "stats.fulfilled": "Fully donated",
    "stats.urgent": "Urgent",

    "controls.searchPlaceholder": "Search items",
    "controls.filterCategory": "Category",
    "controls.filterStatus": "Status",
    "controls.sort": "Sort by",
    "controls.results": "{count} items shown",

    "status.needed": "Still needed",
    "status.partial": "Partly donated",
    "status.fulfilled": "Fully donated",
    "status.all": "All items",

    "sort.urgency": "Most urgent first",
    "sort.progress": "Least funded first",
    "sort.name": "Name (A to Z)",

    "category.staples": "Staples",
    "category.food": "Food",
    "category.hygiene": "Hygiene",
    "category.household": "Household",
    "category.school": "School",
    "category.baby": "Baby care",
    "category.medical": "Medical",
    "category.other": "Other",

    "item.amount": "{fulfilled} of {needed} {unit} donated",
    "item.notesAria": "Item notes",
    "item.urgent": "Urgent",
    "item.partial": "Partly donated",
    "item.done": "Fully donated",
    "item.progressAria": "{name}: {percent}% of the amount needed has been donated",

    "empty.title": "Nothing matches these filters",
    "empty.body": "Try another search word, or clear the filters to see every item on the list.",
    "empty.reset": "Clear filters",

    "loading": "Loading the wishlist...",
    "error.title": "The wishlist could not be loaded",
    "error.body": "Something went wrong on our side. Please try again, or contact us if it keeps happening.",
    "error.retry": "Try again",

    "donate.title": "How to donate",
    "donate.intro": "Thank you for helping. You can send items to the home, or give money and we will buy them. Either way, please message us first so we know your parcel is coming and can record it against the list.",
    "donate.step1.title": "Choose an item",
    "donate.step1.body": "Pick something from the wishlist. Each item shows how much is still needed, so you can see where your help matters most.",
    "donate.step2.title": "Message us before you buy",
    "donate.step2.body": "Send us a WhatsApp message with the item name and quantity. We will confirm the need and arrange the drop-off or delivery with you.",
    "donate.step3.title": "Send it or bring it",
    "donate.step3.body": "Post the items, or bring them to the home during visiting hours. If you post them, send us the tracking number so we can watch for the parcel.",
    "donate.shipping.title": "Donating by post or in person",
    "donate.shipping.body": "Any courier can deliver to us. Please write the item name on the label. If you come in person, message us first so someone is there to receive you.",
    "donate.money.title": "Donating money instead",
    "donate.money.body": "If money is easier, you can give cash and we will buy the item ourselves. Message us for the current bank details; we do not publish them on this page.",

    "contact.title": "Contact the home",
    "contact.intro": "These details are provided by the home. Please message us before visiting or sending anything.",
    "contact.address": "Address",
    "contact.phone": "Phone",
    "contact.whatsapp": "WhatsApp",
    "contact.email": "Email",
    "contact.hours": "Visiting hours",
    "contact.todoNote": "Some contact details are still placeholders and will be filled in by the home before this page is published.",

    "footer.builtBy": "Built for Rumah Kanak-Kanak Triniti by volunteers.",
    "footer.lastUpdated": "Last updated",
    "footer.langLabel": "Language",

    "lang.label": "Change language",
    "lang.en": "English",
    "lang.zh": "Chinese (Simplified)",
    "lang.ms": "Malay",

    "a11y.skip": "Skip to main content"
  };

  var zh = {
    "site.name": "Triniti 儿童之家",
    "site.tagline": "我们儿童之家的物资心愿单",
    "nav.wishlist": "心愿单",
    "nav.howToDonate": "如何捐助",
    "nav.contact": "联系我们",

    "hero.eyebrow": "物资心愿单",
    "hero.title": "孩子们现在需要什么",
    "hero.subtitle": "这些都是院里每星期都会用到的物资。挑一样，我们会告诉你还缺多少，以及怎么送到我们这里。",
    "hero.ctaPrimary": "查看心愿单",
    "hero.ctaSecondary": "如何捐助",

    "banner.demo": "这是示范数据：页面显示的是示例物资，不是我们的最新清单。",
    "banner.live": "正在显示线上表格中的最新需求。",
    "banner.updated": "最后更新于 {time}。",
    "banner.error": "我们暂时连不上线上表格，下方显示的是示例清单。",

    "stats.items": "清单物资",
    "stats.remaining": "尚缺数量",
    "stats.fulfilled": "已凑足",
    "stats.urgent": "急需",

    "controls.searchPlaceholder": "搜索物资",
    "controls.filterCategory": "类别",
    "controls.filterStatus": "状态",
    "controls.sort": "排序方式",
    "controls.results": "共显示 {count} 项",

    "status.needed": "仍然需要",
    "status.partial": "部分已捐",
    "status.fulfilled": "已凑足",
    "status.all": "全部物资",

    "sort.urgency": "最急需优先",
    "sort.progress": "完成度最低优先",
    "sort.name": "名称（A 到 Z）",

    "category.staples": "米粮主食",
    "category.food": "食品",
    "category.hygiene": "清洁卫生",
    "category.household": "家居用品",
    "category.school": "上学用品",
    "category.baby": "婴儿用品",
    "category.medical": "医疗用品",
    "category.other": "其他",

    "item.amount": "已捐 {fulfilled}，共需 {needed} {unit}",
    "item.notesAria": "物资备注",
    "item.urgent": "急需",
    "item.partial": "部分已捐",
    "item.done": "已凑足",
    "item.progressAria": "{name}：已捐达所需数量的 {percent}%",

    "empty.title": "没有符合筛选条件的物资",
    "empty.body": "可以换个搜索词，或者清除筛选，查看清单上的全部物资。",
    "empty.reset": "清除筛选",

    "loading": "正在加载心愿单……",
    "error.title": "心愿单加载失败",
    "error.body": "我们这边出了点问题，请再试一次；如果一直不行，请联系我们。",
    "error.retry": "再试一次",

    "donate.title": "如何捐助",
    "donate.intro": "谢谢你的帮忙。你可以把物资寄到院里，也可以捐款由我们代买。无论哪一种，请先给我们发个信息，好让我们知道包裹会到，也在清单上登记。",
    "donate.step1.title": "挑选物资",
    "donate.step1.body": "在心愿单上选一样。每一项都会显示还缺多少，你可以看看哪里最需要帮忙。",
    "donate.step2.title": "购买前先联系我们",
    "donate.step2.body": "用 WhatsApp 把物资名称和数量告诉我们。我们会确认这项需求，再和你约好送达或收取的方式。",
    "donate.step3.title": "寄来或送过来",
    "donate.step3.body": "可以把物资寄来，也可以在探访时间亲自送到院里。如果是邮寄，请把快递单号发给我们，方便我们留意包裹。",
    "donate.shipping.title": "邮寄或亲自送捐",
    "donate.shipping.body": "任何快递公司都可以送到。请在包裹上写明物资名称。如果亲自过来，请先给我们发信息，好让我们安排人接收。",
    "donate.money.title": "改为捐款",
    "donate.money.body": "如果捐款比较方便，也可以给现金由我们代买。请向我们索取最新的银行账户资料；我们不会在这页面公开。",

    "contact.title": "联系院里",
    "contact.intro": "以下资料由院里提供。来访或寄送物资之前，请先给我们发个信息。",
    "contact.address": "地址",
    "contact.phone": "电话",
    "contact.whatsapp": "WhatsApp",
    "contact.email": "电邮",
    "contact.hours": "探访时间",
    "contact.todoNote": "部分联系资料目前仍是待填的占位内容，会在页面发布前由院里补上。",

    "footer.builtBy": "由义工为 Triniti 儿童之家制作。",
    "footer.lastUpdated": "最后更新",
    "footer.langLabel": "语言",

    "lang.label": "切换语言",
    "lang.en": "英文",
    "lang.zh": "简体中文",
    "lang.ms": "马来文",

    "a11y.skip": "跳到主要内容"
  };

  var ms = {
    "site.name": "Rumah Kanak-Kanak Triniti",
    "site.tagline": "Senarai keperluan sumbangan untuk rumah kebajikan kami",
    "nav.wishlist": "Senarai keperluan",
    "nav.howToDonate": "Cara menderma",
    "nav.contact": "Hubungi kami",

    "hero.eyebrow": "Senarai keperluan sumbangan",
    "hero.title": "Apa yang anak-anak kami perlukan sekarang",
    "hero.subtitle": "Ini barangan yang kami gunakan setiap minggu di rumah ini. Pilih satu, dan kami akan tunjukkan berapa lagi yang diperlukan serta cara menghantarnya kepada kami.",
    "hero.ctaPrimary": "Lihat senarai keperluan",
    "hero.ctaSecondary": "Cara menderma",

    "banner.demo": "Ini data contoh: halaman ini memaparkan barangan contoh, bukan senarai sebenar kami.",
    "banner.live": "Memaparkan keperluan terkini daripada jadual hamparan kami.",
    "banner.updated": "Dikemas kini pada {time}.",
    "banner.error": "Kami tidak dapat membaca jadual hamparan, jadi senarai contoh dipaparkan di bawah.",

    "stats.items": "Barangan disenaraikan",
    "stats.remaining": "Masih diperlukan",
    "stats.fulfilled": "Sudah cukup",
    "stats.urgent": "Mendesak",

    "controls.searchPlaceholder": "Cari barangan",
    "controls.filterCategory": "Kategori",
    "controls.filterStatus": "Status",
    "controls.sort": "Susun mengikut",
    "controls.results": "{count} barangan dipaparkan",

    "status.needed": "Masih diperlukan",
    "status.partial": "Sebahagian disumbang",
    "status.fulfilled": "Sudah cukup",
    "status.all": "Semua barangan",

    "sort.urgency": "Paling mendesak dahulu",
    "sort.progress": "Paling kurang disumbang dahulu",
    "sort.name": "Nama (A hingga Z)",

    "category.staples": "Makanan ruji",
    "category.food": "Makanan",
    "category.hygiene": "Kebersihan diri",
    "category.household": "Barang rumah",
    "category.school": "Peralatan sekolah",
    "category.baby": "Keperluan bayi",
    "category.medical": "Perubatan",
    "category.other": "Lain-lain",

    "item.amount": "{fulfilled} daripada {needed} {unit} telah disumbangkan",
    "item.notesAria": "Nota barangan",
    "item.urgent": "Mendesak",
    "item.partial": "Sebahagian disumbang",
    "item.done": "Sudah cukup",
    "item.progressAria": "{name}: {percent}% daripada jumlah yang diperlukan telah disumbangkan",

    "empty.title": "Tiada barangan yang sepadan dengan tapisan ini",
    "empty.body": "Cuba kata carian lain, atau kosongkan tapisan untuk melihat semua barangan dalam senarai.",
    "empty.reset": "Kosongkan tapisan",

    "loading": "Sedang memuatkan senarai keperluan...",
    "error.title": "Senarai keperluan tidak dapat dimuatkan",
    "error.body": "Ada masalah pada pihak kami. Sila cuba lagi, atau hubungi kami jika ia berterusan.",
    "error.retry": "Cuba lagi",

    "donate.title": "Cara menderma",
    "donate.intro": "Terima kasih kerana membantu. Anda boleh menghantar barangan ke rumah ini, atau memberi sumbangan wang untuk kami membelinya. Apa pun pilihan anda, sila hubungi kami dahulu supaya kami tahu bungkusan akan tiba dan dapat merekodkannya dalam senarai.",
    "donate.step1.title": "Pilih barangan",
    "donate.step1.body": "Pilih sesuatu daripada senarai keperluan. Setiap barangan menunjukkan berapa lagi yang diperlukan, jadi anda boleh lihat di mana bantuan paling diperlukan.",
    "donate.step2.title": "Hubungi kami sebelum membeli",
    "donate.step2.body": "Hantar mesej WhatsApp kepada kami dengan nama barangan dan kuantiti. Kami akan sahkan keperluan itu dan mengatur cara penghantaran dengan anda.",
    "donate.step3.title": "Hantar atau serahkan sendiri",
    "donate.step3.body": "Pos barangan itu, atau bawa sendiri ke rumah ini pada waktu melawat. Jika anda mengepos, beritahu kami nombor surat cara supaya kami boleh menunggu bungkusan itu.",
    "donate.shipping.title": "Menderma melalui pos atau secara terus",
    "donate.shipping.body": "Bungkusan boleh dihantar melalui mana-mana kurier. Sila tulis nama barangan pada label. Jika anda datang sendiri, hubungi kami dahulu supaya ada orang menerima anda.",
    "donate.money.title": "Menderma dalam bentuk wang",
    "donate.money.body": "Jika lebih mudah, anda boleh memberi sumbangan wang dan kami akan membeli barangan itu sendiri. Hubungi kami untuk butiran bank terkini; kami tidak menyiarkannya di halaman ini.",

    "contact.title": "Hubungi rumah ini",
    "contact.intro": "Butiran ini disediakan oleh pihak rumah. Sila hubungi kami sebelum melawat atau menghantar apa-apa.",
    "contact.address": "Alamat",
    "contact.phone": "Telefon",
    "contact.whatsapp": "WhatsApp",
    "contact.email": "E-mel",
    "contact.hours": "Waktu melawat",
    "contact.todoNote": "Sesetengah butiran hubungan masih pemegang tempat dan akan dilengkapkan oleh pihak rumah sebelum halaman ini diterbitkan.",

    "footer.builtBy": "Dibina untuk Rumah Kanak-Kanak Triniti oleh sukarelawan.",
    "footer.lastUpdated": "Kemas kini terakhir",
    "footer.langLabel": "Bahasa",

    "lang.label": "Tukar bahasa",
    "lang.en": "Bahasa Inggeris",
    "lang.zh": "Bahasa Cina Ringkas",
    "lang.ms": "Bahasa Melayu",

    "a11y.skip": "Langkau ke kandungan utama"
  };

  var dict = { en: en, zh: zh, ms: ms };
  var current = DEFAULT_LOCALE;
  var switcherBound = false;
  var numberFormats = {};
  var dateFormats = {};

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isLocale(code) {
    return LOCALES.indexOf(code) !== -1;
  }

  function lookup(key) {
    var table = dict[current];
    if (table && has(table, key)) { return table[key]; }
    if (has(dict[DEFAULT_LOCALE], key)) { return dict[DEFAULT_LOCALE][key]; }
    return null;
  }

  function interpolate(text, vars) {
    if (!vars) { return text; }
    return text.replace(/\{(\w+)\}/g, function (match, name) {
      if (has(vars, name) && vars[name] !== null && typeof vars[name] !== "undefined") {
        return String(vars[name]);
      }
      return match;
    });
  }

  function t(key, vars) {
    if (typeof key !== "string") { return ""; }
    var text = lookup(key);
    if (text === null) { return key; }
    return interpolate(text, vars);
  }

  function getLocale() {
    return current;
  }

  function intlLocale() {
    return INTL_LOCALES[current] || INTL_LOCALES[DEFAULT_LOCALE];
  }

  function number(n) {
    var value = typeof n === "number" ? n : Number(n);
    if (!isFinite(value)) { return ""; }
    var tag = intlLocale();
    if (!has(numberFormats, tag)) {
      try {
        numberFormats[tag] = new Intl.NumberFormat(tag);
      } catch (e) {
        numberFormats[tag] = null;
      }
    }
    var formatter = numberFormats[tag];
    if (!formatter) { return String(value); }
    try {
      return formatter.format(value);
    } catch (e2) {
      return String(value);
    }
  }

  function date(iso) {
    if (!iso) { return ""; }
    var when = new Date(iso);
    if (isNaN(when.getTime())) { return ""; }
    var tag = intlLocale();
    if (!has(dateFormats, tag)) {
      try {
        dateFormats[tag] = new Intl.DateTimeFormat(tag, {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
      } catch (e) {
        dateFormats[tag] = null;
      }
    }
    var formatter = dateFormats[tag];
    if (formatter) {
      try {
        return formatter.format(when);
      } catch (e2) {
        /* fall through to the built-in formatter below */
      }
    }
    try {
      return when.toLocaleDateString(tag);
    } catch (e3) {
      return when.toISOString().slice(0, 10);
    }
  }

  function applyNode(node, mode, key) {
    if (!node || !key) { return; }
    var text = lookup(key);
    if (text === null) { return; }
    if (mode === "text") {
      node.textContent = text;
    } else if (mode === "html") {
      node.innerHTML = text;
    } else if (mode === "aria") {
      if (node.setAttribute) { node.setAttribute("aria-label", text); }
    } else if (mode === "placeholder") {
      if (node.setAttribute) { node.setAttribute("placeholder", text); }
    }
  }

  function apply(root) {
    var scope = root || (typeof document !== "undefined" ? document : null);
    if (!scope) { return; }
    for (var a = 0; a < APPLY_ATTRS.length; a++) {
      var attr = APPLY_ATTRS[a][0];
      var mode = APPLY_ATTRS[a][1];
      var nodes = scope.querySelectorAll ? scope.querySelectorAll("[" + attr + "]") : [];
      for (var i = 0; i < nodes.length; i++) {
        applyNode(nodes[i], mode, nodes[i].getAttribute(attr));
      }
      if (scope.getAttribute) {
        applyNode(scope, mode, scope.getAttribute(attr));
      }
    }
  }

  function markActive() {
    if (typeof document === "undefined" || !document.getElementById) { return; }
    var group = document.getElementById("lang-switcher");
    if (!group || !group.querySelectorAll) { return; }
    var buttons = group.querySelectorAll("[data-locale]");
    for (var i = 0; i < buttons.length; i++) {
      var pressed = buttons[i].getAttribute("data-locale") === current ? "true" : "false";
      buttons[i].setAttribute("aria-pressed", pressed);
    }
  }

  function persist(code) {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      /* storage can throw in private mode; the choice simply is not remembered */
    }
  }

  function readStored() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      return isLocale(stored) ? stored : null;
    } catch (e) {
      return null;
    }
  }

  function dispatchChanged(code) {
    if (!window || typeof window.dispatchEvent !== "function") { return; }
    var event = null;
    try {
      if (typeof window.CustomEvent === "function") {
        event = new window.CustomEvent("i18n:changed", { detail: { locale: code } });
      } else if (document && document.createEvent) {
        event = document.createEvent("CustomEvent");
        event.initCustomEvent("i18n:changed", false, false, { locale: code });
      }
    } catch (e) {
      event = null;
    }
    if (!event) { return; }
    try {
      window.dispatchEvent(event);
    } catch (e2) {
      /* a listener that throws must not break the language switch */
    }
  }

  function setLocale(code) {
    current = isLocale(code) ? code : DEFAULT_LOCALE;
    persist(current);
    if (typeof document !== "undefined") {
      if (document.documentElement) {
        document.documentElement.lang = HTML_LANGS[current];
      }
      apply(document);
      markActive();
    }
    dispatchChanged(current);
    return current;
  }

  function switcherButton(node, group) {
    while (node && node !== group) {
      if (node.getAttribute && node.getAttribute("data-locale")) { return node; }
      node = node.parentNode;
    }
    return null;
  }

  function bindSwitcher() {
    if (switcherBound || typeof document === "undefined" || !document.getElementById) { return; }
    var group = document.getElementById("lang-switcher");
    if (!group || !group.addEventListener) { return; }
    group.addEventListener("click", function (event) {
      var button = switcherButton(event.target, group);
      if (!button) { return; }
      setLocale(button.getAttribute("data-locale"));
    });
    switcherBound = true;
  }

  function resolveLocale() {
    var stored = readStored();
    if (stored) { return stored; }

    var config = window.WISHLIST_CONFIG;
    if (config && isLocale(config.defaultLocale)) { return config.defaultLocale; }

    var navigator = window.navigator;
    var list = (navigator && navigator.languages) || [];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      if (tag.indexOf("zh") === 0) { return "zh"; }
      if (tag.indexOf("ms") === 0) { return "ms"; }
      if (tag.indexOf("en") === 0) { return "en"; }
    }

    var single = (navigator && navigator.language) || "";
    single = String(single).toLowerCase();
    if (single.indexOf("zh") === 0) { return "zh"; }
    if (single.indexOf("ms") === 0) { return "ms"; }

    return DEFAULT_LOCALE;
  }

  function onReady() {
    bindSwitcher();
    if (typeof document !== "undefined") {
      apply(document);
      markActive();
    }
  }

  function init() {
    if (typeof document === "undefined") { return current; }
    setLocale(resolveLocale());
    if (document.readyState === "loading" && document.addEventListener) {
      document.addEventListener("DOMContentLoaded", onReady);
    } else {
      onReady();
    }
    return current;
  }

  window.I18N = {
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    dict: dict,
    t: t,
    getLocale: getLocale,
    setLocale: setLocale,
    apply: apply,
    intlLocale: intlLocale,
    number: number,
    date: date,
    init: init
  };

  init();
})(window, document);
