/* Triniti - site configuration.
 *
 * This is the only file a non-developer needs to touch. Every content string
 * below ships as "" and renders on the page as a placeholder box; paste the
 * real wording between the quotes and it appears in place of the box.
 *
 * placeholders: "hint" shows a dashed box with the words "To be filled in";
 *               "blank" shows the same box, empty, keeping its height.
 *
 * No address, phone number, e-mail address or bank account is written here on
 * purpose: those facts belong to the home, not to this repository.
 */
window.TRINITI_CONFIG = {
  defaultLocale: "en",
  org: {
    name: "Rumah Kanak-Kanak Triniti",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    hours: "",
    mapsUrl: ""
  },

  placeholders: "hint",

  api: {
    baseUrl: "",
    submitPath: "/donations",
    sponsorPath: "/sponsorships",
    timeoutMs: 8000
  },

  content: {
    logo: "",
    hero: {
      image: "",
      imageAlt: "",
      title: "",
      subtitle: "",
      ctaLabel: "",
      ctaHref: ""
    },
    about: {
      body: "",
      founded: "",
      residents: "",
      image: "",
      imageAlt: ""
    },
    programs: [
      { image: "", imageAlt: "", title: "", body: "", linkLabel: "", linkHref: "" },
      { image: "", imageAlt: "", title: "", body: "", linkLabel: "", linkHref: "" }
    ],
    cards: [
      { icon: "", body: "", href: "sponsor.html" },
      { icon: "", body: "", href: "volunteer.html" },
      { icon: "", body: "", href: "gift-of-love.html" },
      { icon: "", body: "", href: "donate.html" }
    ],
    sponsorPage: {
      subtitle: "",
      image: "",
      imageAlt: "",
      note: ""
    },
    /* Nine gifts for the Gift of Love page. The amount is optional: leave it
     * empty and the gift links to donate.html; fill it in and the gift links
     * to donate.html?amount=N. */
    gifts: [
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" },
      { name: "", image: "", alt: "", amount: "" }
    ],
    donation: {
      title: "",
      intro: "",
      amounts: [10, 25, 50, 100, 200],
      currency: "",
      pageSubtitle: "",
      qrImage: "",
      qrCaption: "",
      ewalletName: "",
      onlineLabel: "",
      onlineUrl: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      swift: "",
      itemDropoff: "",
      itemContact: "",
      itemHours: "",
      itemList: "",
      donateHref: "donate.html"
    },
    volunteer: {
      subtitle: "",
      image: "",
      imageAlt: "",
      body1: "",
      body2: "",
      roles: [
        { icon: "", body: "", commitment: "" },
        { icon: "", body: "", commitment: "" },
        { icon: "", body: "", commitment: "" }
      ],
      steps: ["", "", ""],
      ctaLine: ""
    },
    contactPage: {
      subtitle: "",
      mapImage: "",
      mapAlt: "",
      rows: [
        { a: "", b: "", c: "" },
        { a: "", b: "", c: "" }
      ]
    },
    footer: {
      col1Title: "",
      col1Links: [],
      col2Title: "",
      col2Links: [],
      col3Title: "",
      col3Links: [],
      col4Title: "",
      col4Links: []
    }
  }
};
