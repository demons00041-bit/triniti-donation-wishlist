/* Triniti Digital Donation Wishlist - site configuration.
 *
 * This is the only file a non-developer ever needs to touch.
 * 1. Publish the caretakers Google Sheet as CSV (see docs/SHEET-SETUP.md).
 * 2. Paste the published CSV link between the quotes of sheetCsvUrl.
 * 3. Save, commit, push. The live site picks it up within a minute.
 * Leave sheetCsvUrl empty and the site shows the bundled sample list instead.
 */
window.WISHLIST_CONFIG = {
  sheetCsvUrl: "",
  defaultLocale: "en",
  refreshSeconds: 300,
  org: {
    name: "Rumah Kanak-Kanak Triniti",
    address: "[TODO: full postal address]",
    phone: "[TODO: office phone number]",
    whatsapp: "[TODO: WhatsApp number, e.g. +60 12-345 6789]",
    email: "[TODO: contact email address]",
    hours: "[TODO: visiting hours, e.g. Mon-Sat 9am-5pm]",
    mapsUrl: ""
  }
};
