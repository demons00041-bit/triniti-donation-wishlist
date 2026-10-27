/* Triniti Digital Donation Wishlist - site configuration.
 *
 * This is the only file a non-developer ever needs to touch.
 * 1. Publish the caretakers Google Sheet as CSV (see docs/SHEET-SETUP.md).
 * 2. Paste the published CSV link between the quotes of sheetCsvUrl.
 * 3. Save, commit, push. The live site picks it up within a minute.
 * Leave sheetCsvUrl empty and the site shows the bundled sample list instead.
 *
 * Contact details: fill in the real values as plain strings, for example
 *   address: "No. 12, Jalan Contoh, 43300 Seri Kembangan, Selangor"
 *   phone:   "+60 3-8945 1234"
 *   whatsapp:"+60 12-345 6789"
 *   email:   "hello@example.org"
 *   hours:   "Mon-Sat, 9am-5pm"
 * Anything left as "" renders as a muted dash, and the note under the contact
 * list tells the visitor those details are still being confirmed.
 */
window.WISHLIST_CONFIG = {
  sheetCsvUrl: "",
  defaultLocale: "en",
  refreshSeconds: 300,
  org: {
    name: "Rumah Kanak-Kanak Triniti",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    hours: "",
    mapsUrl: ""
  }
};
