/*!
 * Triniti Digital Donation Wishlist - data layer.
 * Classic script (no modules, no dependencies, ES2017). Exposes window.Wishlist.
 *
 *   window.Wishlist = { load, parseCsv, computeItem, buildSheetCsvUrl, SAMPLE_URL }
 *
 * Source of truth: docs/BUILD-CONTRACT.md section 4. Pure functions, no DOM access.
 * load() never rejects: it resolves sample data instead so the page always renders.
 */
(function (global) {
  'use strict';

  var SAMPLE_URL = 'assets/data/sample-items.json';

  var CATEGORIES = ['staples', 'food', 'hygiene', 'household', 'school', 'baby', 'medical', 'other'];

  /* Header aliases per contract section 4. Every alias maps to one canonical Item field. */
  var HEADER_ALIASES = {
    id: ['id'],
    name: ['name', 'item', 'item_name', 'itemname', 'item_description'],
    category: ['category', 'type'],
    unit: ['unit', 'uom'],
    needed: ['quantity_needed', 'needed', 'qty_needed', 'target', 'needed_quantity', 'required', 'quantity'],
    fulfilled: ['quantity_fulfilled', 'fulfilled', 'received', 'qty_fulfilled', 'donated', 'fulfilled_quantity', 'quantity_received', 'received_quantity', 'collected'],
    urgent: ['urgent', 'priority'],
    notes: ['notes', 'note', 'remarks', 'comment'],
    updated: ['updated', 'updated_at', 'last_updated']
  };

  /* Values that mean "urgent". Compared case-insensitively after trimming. */
  var URGENT_WORDS = ['yes', 'true', '1', 'y', 'high', 'urgent'];

  /* Loose category spellings a caretaker may type into the sheet. */
  var CATEGORY_SYNONYMS = {
    grocery: 'food',
    groceries: 'food',
    dry_goods: 'staples',
    dry_good: 'staples',
    staple: 'staples',
    toiletries: 'hygiene',
    toiletry: 'hygiene',
    personal_care: 'hygiene',
    cleaning: 'household',
    cleaning_supplies: 'household',
    house: 'household',
    stationery: 'school',
    school_supplies: 'school',
    education: 'school',
    infant: 'baby',
    baby_care: 'baby',
    babies: 'baby',
    health: 'medical',
    medicine: 'medical',
    first_aid: 'medical',
    misc: 'other'
  };

  var ALIAS_INDEX = (function () {
    var index = {};
    var fields = Object.keys(HEADER_ALIASES);
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      var aliases = HEADER_ALIASES[field];
      for (var a = 0; a < aliases.length; a++) {
        index[aliases[a]] = field;
      }
    }
    return index;
  })();

  var warned = {};

  /* ---------------------------------------------------------------- helpers */

  function toStr(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function trimStr(value) {
    return toStr(value).trim();
  }

  function toNumber(value) {
    if (typeof value === 'number') {
      return isFinite(value) ? value : 0;
    }
    var raw = trimStr(value);
    if (!raw) {
      return 0;
    }
    /* Tolerate "1,200" and "1 200" but not letters. */
    var cleaned = raw.replace(/[\s,]/g, '');
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) {
      return 0;
    }
    var parsed = Number(cleaned);
    return isFinite(parsed) ? parsed : 0;
  }

  /* First non-blank value among the given keys, else undefined. */
  function pick(source, keys) {
    for (var i = 0; i < keys.length; i++) {
      var value = source[keys[i]];
      if (value !== undefined && value !== null && trimStr(value) !== '') {
        return value;
      }
    }
    return undefined;
  }

  function errMessage(err) {
    if (!err) {
      return 'unknown error';
    }
    if (typeof err === 'string') {
      return err;
    }
    return trimStr(err.message) || 'unknown error';
  }

  function warnOnce(topic, message) {
    if (warned[topic]) {
      return;
    }
    warned[topic] = true;
    if (global.console && typeof global.console.warn === 'function') {
      global.console.warn(message);
    }
  }

  function slugify(value) {
    var slug = trimStr(value).toLowerCase().replace(/[^0-9a-z\u00c0-\uffff]+/g, '-');
    slug = slug.replace(/^-+/, '').replace(/-+$/, '');
    return slug || 'item';
  }

  function parseUrgent(value) {
    if (value === true) {
      return true;
    }
    if (value === false) {
      return false;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    var word = trimStr(value).toLowerCase();
    for (var i = 0; i < URGENT_WORDS.length; i++) {
      if (word === URGENT_WORDS[i]) {
        return true;
      }
    }
    return false;
  }

  function normaliseCategory(value) {
    var key = trimStr(value).toLowerCase().replace(/[\s\-]+/g, '_');
    if (!key) {
      return 'other';
    }
    if (CATEGORIES.indexOf(key) !== -1) {
      return key;
    }
    if (CATEGORY_SYNONYMS[key]) {
      return CATEGORY_SYNONYMS[key];
    }
    /* "baby food" -> baby, "school stuff" -> school, ... */
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (key.indexOf(CATEGORIES[i]) === 0) {
        return CATEGORIES[i];
      }
    }
    return 'other';
  }

  /* -------------------------------------------------------------- parseCsv */

  /**
   * RFC4180 parser: returns string[][] (rows of fields).
   * Handles quoted fields, embedded commas, embedded newlines, doubled quotes
   * ("" -> "), CRLF / LF / CR line endings and a leading UTF-8 BOM.
   * A trailing line break does not produce an extra empty row.
   */
  function parseCsv(text) {
    var rows = [];
    if (typeof text !== 'string' || text.length === 0) {
      return rows;
    }

    var source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    var length = source.length;
    var row = [];
    var field = '';
    var inQuotes = false;
    var i = 0;
    var ch;

    while (i < length) {
      ch = source.charAt(i);

      if (inQuotes) {
        if (ch === '"') {
          if (source.charAt(i + 1) === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i += 1;
          continue;
        }
        field += ch;
        i += 1;
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }
      if (ch === ',') {
        row.push(field);
        field = '';
        i += 1;
        continue;
      }
      if (ch === '\r' || ch === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i += ch === '\r' && source.charAt(i + 1) === '\n' ? 2 : 1;
        continue;
      }
      field += ch;
      i += 1;
    }

    /* Last line with no trailing newline. */
    if (field !== '' || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }

  /* ------------------------------------------------------------- sheet rows */

  function normaliseHeader(value) {
    return trimStr(value).toLowerCase().replace(/[\s\-]+/g, '_');
  }

  function isBlankRow(row) {
    for (var i = 0; i < row.length; i++) {
      if (trimStr(row[i]) !== '') {
        return false;
      }
    }
    return true;
  }

  /* Column index -> canonical field. Unknown columns are ignored; the first
     column claiming a field wins, so duplicate normalised headers keep the first. */
  function buildHeaderMap(headerRow) {
    var map = {};
    var claimed = {};
    for (var c = 0; c < headerRow.length; c++) {
      var field = ALIAS_INDEX[normaliseHeader(headerRow[c])];
      if (!field || claimed[field]) {
        continue;
      }
      claimed[field] = true;
      map[c] = field;
    }
    return map;
  }

  /**
   * Header-mapped, row-level parse of a sheet CSV: string[][] -> raw rows.
   * Blank-name rows are dropped here. Returns [] when no usable header/rows exist.
   */
  function parseSheet(text) {
    var rows = parseCsv(text);
    var out = [];
    if (rows.length === 0) {
      return out;
    }

    var headerIndex = -1;
    var headerMap = null;
    for (var r = 0; r < rows.length; r++) {
      if (isBlankRow(rows[r])) {
        continue;
      }
      headerMap = buildHeaderMap(rows[r]);
      headerIndex = r;
      break;
    }
    if (headerIndex === -1 || !headerMap || !hasField(headerMap, 'name')) {
      return out;
    }

    var columns = Object.keys(headerMap);
    for (var i = headerIndex + 1; i < rows.length; i++) {
      var row = rows[i];
      if (isBlankRow(row)) {
        continue;
      }
      var raw = {};
      for (var k = 0; k < columns.length; k++) {
        var col = Number(columns[k]);
        raw[headerMap[col]] = col < row.length ? trimStr(row[col]) : '';
      }
      if (trimStr(raw.name) === '') {
        continue;
      }
      out.push(raw);
    }
    return out;
  }

  function hasField(map, field) {
    var columns = Object.keys(map);
    for (var i = 0; i < columns.length; i++) {
      if (map[columns[i]] === field) {
        return true;
      }
    }
    return false;
  }

  /* ------------------------------------------------------------ computeItem */

  /**
   * Raw row / sample object -> full Item. Every Item field is always present.
   * Contract rules: non-numeric -> 0, negatives clamped, remaining never < 0,
   * percent capped at 100 (100 when needed is 0), urgent from yes|true|1|y|high|urgent.
   */
  function computeItem(raw, index) {
    var source = raw && typeof raw === 'object' ? raw : {};

    var name = trimStr(pick(source, ['name', 'item']));
    var category = normaliseCategory(pick(source, ['category', 'type']));
    var unit = trimStr(pick(source, ['unit', 'uom']));

    var needed = toNumber(pick(source, ['needed', 'quantity_needed', 'qty_needed', 'target']));
    if (needed < 0) {
      needed = 0;
    }
    var fulfilled = toNumber(pick(source, ['fulfilled', 'quantity_fulfilled', 'received', 'qty_fulfilled', 'donated']));
    if (fulfilled < 0) {
      fulfilled = 0;
    }

    var remaining = needed - fulfilled;
    if (remaining < 0) {
      remaining = 0;
    }
    var percent = needed > 0 ? Math.round(fulfilled / needed * 100) : 100;
    if (percent > 100) {
      percent = 100;
    }
    if (percent < 0) {
      percent = 0;
    }

    var status = 'partial';
    if (needed <= 0 || fulfilled >= needed) {
      status = 'fulfilled';
    } else if (fulfilled <= 0) {
      status = 'needed';
    }

    var id = trimStr(source.id);
    if (!id) {
      id = slugify(name) + '-' + (typeof index === 'number' && index >= 0 ? index : 0);
    }

    return {
      id: id,
      name: name,
      category: category,
      unit: unit,
      needed: needed,
      fulfilled: fulfilled,
      remaining: remaining,
      percent: percent,
      status: status,
      urgent: parseUrgent(pick(source, ['urgent', 'priority'])),
      notes: trimStr(pick(source, ['notes', 'note', 'remarks', 'comment'])),
      /* Extra (non-contract) audit field: the sheet's updated stamp for this row. */
      updated: trimStr(pick(source, ['updated', 'updated_at', 'last_updated']))
    };
  }

  /* Raw rows / JSON items -> normalised Item[], ids forced unique. */
  function toItems(list) {
    var items = [];
    if (!list || typeof list.length !== 'number') {
      return items;
    }
    for (var i = 0; i < list.length; i++) {
      var item = computeItem(list[i], i);
      if (!trimStr(item.name)) {
        continue;
      }
      items.push(item);
    }
    return ensureUniqueIds(items);
  }

  function ensureUniqueIds(items) {
    var seen = {};
    for (var i = 0; i < items.length; i++) {
      var base = items[i].id;
      var id = base;
      var n = 1;
      while (Object.prototype.hasOwnProperty.call(seen, id)) {
        id = base + '-' + n;
        n += 1;
      }
      seen[id] = true;
      items[i].id = id;
    }
    return items;
  }

  /* Newest parseable "updated" stamp among items, as the original string. */
  function newestUpdated(items) {
    var best = null;
    var bestTime = -Infinity;
    var lastRaw = null;
    for (var i = 0; i < items.length; i++) {
      var value = trimStr(items[i].updated);
      if (!value) {
        continue;
      }
      lastRaw = value;
      var time = Date.parse(value);
      if (isFinite(time) && time >= bestTime) {
        bestTime = time;
        best = value;
      }
    }
    return best !== null ? best : lastRaw;
  }

  /* -------------------------------------------------------- sheet csv url */

  function buildSheetCsvUrl(sheetId, gid) {
    var id = trimStr(sheetId);
    if (!id) {
      return '';
    }
    var tab = trimStr(gid);
    if (!tab) {
      tab = '0';
    }
    return 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=csv&gid=' + tab;
  }

  /* -------------------------------------------------------------- fetching */

  function httpOk(response) {
    if (!response) {
      return false;
    }
    if (typeof response.status === 'number' && (response.status < 200 || response.status >= 300)) {
      return false;
    }
    return response.ok !== false;
  }

  function contentTypeOf(response) {
    try {
      if (response && response.headers && typeof response.headers.get === 'function') {
        return trimStr(response.headers.get('content-type')).toLowerCase();
      }
    } catch (err) {
      return '';
    }
    return '';
  }

  function requireFetch() {
    if (typeof global.fetch !== 'function') {
      throw new Error('fetch is not available');
    }
    return global.fetch;
  }

  /**
   * Fetch and parse the published sheet CSV.
   * Failure signals: missing fetch, network reject, non-2xx, an HTML body
   * (by content-type or a leading '<'), an empty body, or zero valid rows.
   */
  function fetchSheet(url) {
    return Promise.resolve()
      .then(function () {
        return requireFetch()(url, { cache: 'no-store', credentials: 'omit' });
      })
      .then(function (response) {
        if (!httpOk(response)) {
          throw new Error('HTTP ' + toStr(response && response.status));
        }
        var type = contentTypeOf(response);
        if (type.indexOf('html') !== -1) {
          throw new Error('unexpected content-type "' + type + '"');
        }
        if (typeof response.text !== 'function') {
          throw new Error('response body is not readable');
        }
        return response.text();
      })
      .then(function (body) {
        var text = toStr(body).trim();
        if (!text) {
          throw new Error('empty response');
        }
        if (text.charAt(0) === '<') {
          throw new Error('response is HTML, not CSV');
        }
        var raws = parseSheet(text);
        if (raws.length === 0) {
          throw new Error('no valid rows');
        }
        var items = toItems(raws);
        return { items: items, updatedAt: newestUpdated(items) };
      });
  }

  function loadSample(sheetError) {
    return Promise.resolve()
      .then(function () {
        return requireFetch()(SAMPLE_URL, { cache: 'no-store' });
      })
      .then(function (response) {
        if (!httpOk(response)) {
          throw new Error('HTTP ' + toStr(response && response.status));
        }
        return response.text();
      })
      .then(function (body) {
        var parsed = JSON.parse(toStr(body));
        var list = [];
        if (Object.prototype.toString.call(parsed) === '[object Array]') {
          list = parsed;
        } else if (parsed && Object.prototype.toString.call(parsed.items) === '[object Array]') {
          list = parsed.items;
        }
        var items = toItems(list);
        return {
          items: items,
          meta: { source: 'sample', updatedAt: newestUpdated(items), error: sheetError || null }
        };
      })
      .catch(function (err) {
        warnOnce('sample', 'Wishlist: sample data failed (' + errMessage(err) + ').');
        return {
          items: [],
          meta: { source: 'sample', updatedAt: null, error: sheetError || errMessage(err) }
        };
      });
  }

  function load() {
    var config = global.WISHLIST_CONFIG;
    var url = config && typeof config === 'object' ? trimStr(config.sheetCsvUrl) : '';

    var work;
    if (!url) {
      work = loadSample(null);
    } else {
      work = fetchSheet(url).then(
        function (result) {
          return {
            items: result.items,
            meta: { source: 'sheet', updatedAt: result.updatedAt, error: null }
          };
        },
        function (err) {
          var message = errMessage(err);
          warnOnce('sheet', 'Wishlist: sheet data failed (' + message + '); using sample data.');
          return loadSample(message);
        }
      );
    }

    /* Belt and braces: load() must never reject, or the page breaks. */
    return work.then(null, function (err) {
      var message = errMessage(err);
      warnOnce('sheet', 'Wishlist: data load failed (' + message + ').');
      return { items: [], meta: { source: 'sample', updatedAt: null, error: message } };
    });
  }

  var api = {
    load: load,
    parseCsv: parseCsv,
    computeItem: computeItem,
    buildSheetCsvUrl: buildSheetCsvUrl,
    SAMPLE_URL: SAMPLE_URL,
    /* Extra helpers, additive to the contract surface (used by tests / app.js). */
    parseSheet: parseSheet,
    toItems: toItems,
    CATEGORIES: CATEGORIES
  };

  global.Wishlist = api;
})(typeof window !== 'undefined' ? window : this);
