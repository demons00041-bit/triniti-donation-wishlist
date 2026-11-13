/* Triniti - translations and locale switching.
 *
 * Classic script, no modules, no dependencies, ES5 syntax.
 * Load order at the end of <body>: config.js -> i18n.js -> site.js -> page script.
 *
 * Languages: English and Bahasa Melayu. Nothing else.
 *
 * Public API (window.I18N):
 *   locales, defaultLocale, dict, t(key, vars), getLocale(), setLocale(code),
 *   apply(root), intlLocale(), number(n), date(iso), init()
 */
(function (window, document) {
  "use strict";

  var STORAGE_KEY = "triniti.lang";
  var DEFAULT_LOCALE = "en";
  var LOCALES = ["en", "ms"];
  var INTL_LOCALES = { en: "en-MY", ms: "ms-MY" };
  var HTML_LANGS = { en: "en", ms: "ms" };
  var APPLY_ATTRS = [
    ["data-i18n", "text"],
    ["data-i18n-html", "html"],
    ["data-i18n-aria", "aria"],
    ["data-i18n-placeholder", "placeholder"]
  ];

  var en = {
    "site.name": "Rumah Kanak-Kanak Triniti",
    "site.tagline": "A children's home in Malaysia",

    "nav.about": "About",
    "nav.getInvolved": "Get involved",
    "nav.contact": "Contact",
    "nav.donate": "Donate",
    "nav.label": "Main",

    "about.title": "About us",
    "about.founded": "Founded",
    "about.serves": "Serves",

    "placeholder.todo": "To be filled in",
    "placeholder.image": "Image",
    "placeholder.size": "Suggested size {size}",
    "placeholder.customAmount": "Enter an amount",
    "placeholder.notSelected": "Not selected",

    "section.lendHand": "Lend a Hand",
    "card.sponsorChild": "Sponsor A Child",
    "card.volunteer": "Volunteer",
    "card.giftOfLove": "Gift Of Love",
    "card.donateForUs": "Donate for us",

    "sponsorPage.title": "Sponsor a Child",
    "sponsorPage.messageLabel": "Your message",
    "sponsorPage.messagePlaceholder": "Write your message here",
    "sponsorPage.send": "Send message",
    "sponsorPage.notConnected": "This form is not connected yet.",
    "sponsorPage.privacy": "Nothing you type is saved, and nothing is sent while the form is not connected.",
    "giftPage.title": "Gift of Love",
    "giftPage.subtitle": "Choose a gift, then pay on the next page.",
    "giftPage.item": "Gift {n}",
    "giftPage.choose": "Choose this gift",

    "donate.customAmount": "Other amount",
    "donate.now": "Donate now",

    "donatePage.title": "Ways to donate",
    "donatePage.amountLabel": "You are donating",
    "donatePage.changeAmount": "Change amount",

    "pay.qrTitle": "E-wallet QR",
    "pay.hostedTitle": "Pay on the bank's page",
    "pay.hostedCta": "Open the secure payment page ({bank})",
    "pay.hostedUnavailable": "Not open yet",
    "pay.afterNote": "After you pay, you can tell us about it below. That part is optional.",

    "otherWays.bankTitle": "Bank transfer",
    "otherWays.bankName": "Bank",
    "otherWays.accountName": "Account name",
    "otherWays.accountNo": "Account number",
    "otherWays.swift": "SWIFT",
    "otherWays.copy": "Copy account number",
    "otherWays.copied": "Copied",
    "otherWays.itemsTitle": "Donate items instead",
    "otherWays.map": "Open map",
    "otherWays.dropoff": "Drop-off address",
    "otherWays.itemContact": "Contact",
    "otherWays.itemHours": "Hours",
    "otherWays.itemList": "What we need",

    "form.summary": "Tell us about your donation (optional)",
    "form.fullName": "Full name",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.message": "Message",
    "form.anonymous": "Donate anonymously",
    "form.anonymousNote": "You chose to stay anonymous. Nothing you type here is sent or stored - not your name, not your email, not even a message. There is no reference number, because no record exists. Please pay with the details above.",
    "form.agree": "I agree to be contacted about this donation",
    "form.privacy": "We save the name and contact details you enter here, and use them only to talk to you about this donation.",
    "form.send": "Send details",
    "form.sending": "Sending...",
    "form.success": "Received. Your reference is {ref}.",
    "form.errRequired": "Please fill in this field.",
    "form.errEmail": "Please enter a valid email address.",
    "form.errAgree": "Please tick this box so we may contact you.",
    "form.errAnonymous": "Nothing is sent while anonymous is ticked.",
    "form.errRate": "Too many attempts. Please wait a while and try again.",
    "form.errServer": "We could not save your details. Please try again later.",
    "form.errNetwork": "We could not reach the server. Check your connection and try again.",
    "form.errTimeout": "That took too long. Please try again.",
    "form.backendMissing": "Sending details is not switched on yet. Please pay with the details above.",
    "form.noDraftNote": "This form is not saved. Refreshing the page clears it.",

    "contactPage.title": "Contact us",
    "contactPage.address": "Address",
    "contactPage.phone": "Phone",
    "contactPage.whatsapp": "WhatsApp",
    "contactPage.email": "Email",
    "contactPage.hours": "Visiting hours",
    "contactPage.col1": "General enquiries",
    "contactPage.col2": "Donations",
    "contactPage.col3": "Volunteering",
    "contactPage.questions": "Questions?",
    "contactPage.fullPage": "See the full contact page",

    "volunteer.title": "Volunteer with us",
    "volunteer.role1": "Help at the home",
    "volunteer.role2": "Share a skill",
    "volunteer.role3": "Help from a distance",
    "volunteer.step1": "Get in touch",
    "volunteer.step2": "Meet the team",
    "volunteer.step3": "Start helping",
    "volunteer.ctaButton": "Contact us to volunteer",

    "footer.copyright": "\u00a9 {year} Rumah Kanak-Kanak Triniti",
    "footer.lastUpdated": "Last updated",

    "lang.label": "Change language",
    "lang.en": "English",
    "lang.ms": "Malay",

    "a11y.skip": "Skip to main content"
  };

  var ms = {
    "site.name": "Rumah Kanak-Kanak Triniti",
    "site.tagline": "Sebuah rumah kebajikan kanak-kanak di Malaysia",

    "nav.about": "Tentang",
    "nav.getInvolved": "Libatkan diri",
    "nav.contact": "Hubungi",
    "nav.donate": "Derma",
    "nav.label": "Utama",

    "about.title": "Tentang kami",
    "about.founded": "Ditubuhkan",
    "about.serves": "Menampung",

    "placeholder.todo": "Akan diisi kemudian",
    "placeholder.image": "Imej",
    "placeholder.size": "Saiz disyorkan {size}",
    "placeholder.customAmount": "Masukkan jumlah",
    "placeholder.notSelected": "Belum dipilih",

    "section.lendHand": "Hulurkan Bantuan",
    "card.sponsorChild": "Taja Seorang Anak",
    "card.volunteer": "Sukarelawan",
    "card.giftOfLove": "Hadiah Kasih",
    "card.donateForUs": "Derma untuk kami",

    "sponsorPage.title": "Taja Seorang Kanak-Kanak",
    "sponsorPage.messageLabel": "Mesej anda",
    "sponsorPage.messagePlaceholder": "Tulis mesej anda di sini",
    "sponsorPage.send": "Hantar mesej",
    "sponsorPage.notConnected": "Borang ini belum disambungkan.",
    "sponsorPage.privacy": "Apa yang anda taip tidak disimpan, dan tiada apa dihantar selagi borang ini belum disambungkan.",
    "giftPage.title": "Hadiah Kasih",
    "giftPage.subtitle": "Pilih hadiah, kemudian bayar di halaman seterusnya.",
    "giftPage.item": "Hadiah {n}",
    "giftPage.choose": "Pilih hadiah ini",

    "donate.customAmount": "Jumlah lain",
    "donate.now": "Derma sekarang",

    "donatePage.title": "Cara untuk menderma",
    "donatePage.amountLabel": "Anda menderma",
    "donatePage.changeAmount": "Tukar jumlah",

    "pay.qrTitle": "QR e-dompet",
    "pay.hostedTitle": "Bayar di halaman bank",
    "pay.hostedCta": "Buka halaman pembayaran yang selamat ({bank})",
    "pay.hostedUnavailable": "Belum dibuka",
    "pay.afterNote": "Selepas anda membayar, anda boleh memberitahu kami di bawah. Bahagian itu pilihan.",

    "otherWays.bankTitle": "Pindahan bank",
    "otherWays.bankName": "Bank",
    "otherWays.accountName": "Nama akaun",
    "otherWays.accountNo": "Nombor akaun",
    "otherWays.swift": "SWIFT",
    "otherWays.copy": "Salin nombor akaun",
    "otherWays.copied": "Disalin",
    "otherWays.itemsTitle": "Derma barangan",
    "otherWays.map": "Buka peta",
    "otherWays.dropoff": "Alamat penghantaran",
    "otherWays.itemContact": "Hubungi",
    "otherWays.itemHours": "Waktu",
    "otherWays.itemList": "Apa yang kami perlukan",

    "form.summary": "Beritahu kami tentang derma anda (pilihan)",
    "form.fullName": "Nama penuh",
    "form.email": "E-mel",
    "form.phone": "Telefon",
    "form.message": "Mesej",
    "form.anonymous": "Derma tanpa nama",
    "form.anonymousNote": "Anda memilih untuk kekal tanpa nama. Tiada apa yang anda taip di sini dihantar atau disimpan - bukan nama anda, bukan e-mel anda, bukan juga mesej. Tiada nombor rujukan kerana tiada rekod wujud. Sila bayar dengan butiran di atas.",
    "form.agree": "Saya bersetuju untuk dihubungi mengenai derma ini",
    "form.privacy": "Kami menyimpan nama dan butiran hubungan yang anda isi di sini, dan menggunakannya hanya untuk berbual dengan anda tentang derma ini.",
    "form.send": "Hantar butiran",
    "form.sending": "Sedang menghantar...",
    "form.success": "Diterima. Rujukan anda ialah {ref}.",
    "form.errRequired": "Sila isi ruangan ini.",
    "form.errEmail": "Sila masukkan alamat e-mel yang sah.",
    "form.errAgree": "Sila tandakan kotak ini supaya kami boleh menghubungi anda.",
    "form.errAnonymous": "Tiada apa dihantar semasa tanpa nama ditanda.",
    "form.errRate": "Terlalu banyak percubaan. Sila tunggu sebentar dan cuba lagi.",
    "form.errServer": "Kami tidak dapat menyimpan butiran anda. Sila cuba lagi nanti.",
    "form.errNetwork": "Kami tidak dapat menghubungi pelayan. Semak sambungan anda dan cuba lagi.",
    "form.errTimeout": "Permintaan itu mengambil masa terlalu lama. Sila cuba lagi.",
    "form.backendMissing": "Penghantaran butiran belum dihidupkan. Sila bayar dengan butiran di atas.",
    "form.noDraftNote": "Borang ini tidak disimpan. Memuat semula halaman akan mengosongkannya.",

    "contactPage.title": "Hubungi kami",
    "contactPage.address": "Alamat",
    "contactPage.phone": "Telefon",
    "contactPage.whatsapp": "WhatsApp",
    "contactPage.email": "E-mel",
    "contactPage.hours": "Waktu melawat",
    "contactPage.col1": "Pertanyaan umum",
    "contactPage.col2": "Sumbangan",
    "contactPage.col3": "Sukarelawan",
    "contactPage.questions": "Ada soalan?",
    "contactPage.fullPage": "Lihat halaman hubungan penuh",

    "volunteer.title": "Sertai kami sebagai sukarelawan",
    "volunteer.role1": "Membantu di rumah",
    "volunteer.role2": "Kongsi kemahiran",
    "volunteer.role3": "Membantu dari jauh",
    "volunteer.step1": "Hubungi kami",
    "volunteer.step2": "Berjumpa dengan pasukan",
    "volunteer.step3": "Mula membantu",
    "volunteer.ctaButton": "Hubungi kami untuk menjadi sukarelawan",

    "footer.copyright": "\u00a9 {year} Rumah Kanak-Kanak Triniti",
    "footer.lastUpdated": "Kemas kini terakhir",

    "lang.label": "Tukar bahasa",
    "lang.en": "Bahasa Inggeris",
    "lang.ms": "Bahasa Melayu",

    "a11y.skip": "Langkau ke kandungan utama"
  };

  var dict = { en: en, ms: ms };
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

  function classHas(node, name) {
    if (!node || !node.className) { return false; }
    var list = String(node.className).split(/\s+/);
    for (var i = 0; i < list.length; i++) {
      if (list[i] === name) { return true; }
    }
    return false;
  }

  /* Every language group on the page, header and footer alike, keeps
   * aria-pressed on the one button whose locale is current. */
  function markActive() {
    if (typeof document === "undefined" || !document.querySelectorAll) { return; }
    var groups = document.querySelectorAll(".lang");
    for (var g = 0; g < groups.length; g++) {
      if (!groups[g].querySelectorAll) { continue; }
      var buttons = groups[g].querySelectorAll("[data-locale]");
      for (var i = 0; i < buttons.length; i++) {
        var pressed = buttons[i].getAttribute("data-locale") === current ? "true" : "false";
        buttons[i].setAttribute("aria-pressed", pressed);
      }
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
    markActive();
    return current;
  }

  /* Walk up from the click target to a [data-locale] button that sits inside
   * a .lang group; anything else on the page is ignored. */
  function switcherButton(target) {
    var node = target;
    var button = null;
    while (node && node !== document) {
      if (!button && node.getAttribute && node.getAttribute("data-locale")) { button = node; }
      if (classHas(node, "lang")) { return button; }
      node = node.parentNode;
    }
    return null;
  }

  /* Delegation on document, bound once. Both language groups are re-rendered
   * from scratch on every locale change, so a listener on the group node would
   * die with it; document outlives every render. */
  function bindSwitcher() {
    if (switcherBound || typeof document === "undefined" || !document.addEventListener) { return; }
    document.addEventListener("click", function (event) {
      var button = switcherButton(event.target);
      if (!button) { return; }
      var code = button.getAttribute("data-locale");
      if (!isLocale(code)) { return; }
      setLocale(code);
    });
    switcherBound = true;
  }

  function resolveLocale() {
    var stored = readStored();
    if (stored) { return stored; }

    var config = window.TRINITI_CONFIG;
    if (config && isLocale(config.defaultLocale)) { return config.defaultLocale; }

    var navigator = window.navigator;
    var list = (navigator && navigator.languages) || [];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      if (tag.indexOf("ms") === 0) { return "ms"; }
      if (tag.indexOf("en") === 0) { return "en"; }
    }

    var single = (navigator && navigator.language) || "";
    single = String(single).toLowerCase();
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
    bindSwitcher();
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
