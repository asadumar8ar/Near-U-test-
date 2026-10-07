/* ============================================================
   Near-U - js/app.js
   Pura app ek IIFE ke andar hai. Sab kuch ES5 style.
   Sections:
     A)  i18n helpers
     B)  General helpers (escape, clean, motion)
     C)  Inline SVG icons
     D)  Platform icons + link detection
     E)  Supabase setup
     F)  Categories
     G)  Businesses (fetch, sample, convert)
     H)  Smart search
     I)  Skeleton + card render
     J)  Header scroll
     K)  Placeholder rotation
     L)  Reveal animation
     M)  Toast
     N)  Auth (login, signup, google, forgot, delete)
     O)  Business form (add/edit + photo + links)
     P)  Categories panel
     Q)  Buttons / binds
     R)  Updates modal
     S)  Language change handler
     T)  Init
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     A) i18n helpers
     ============================================================ */

  // Safe wrapper around window.t(key).
  // Agar key dictionary me nahi hai ya i18n.js load nahi hua,
  // to fallback (default = key) return karta hai.
  function T(key, fallback) {
    var v = null;
    if (typeof window.t === 'function') {
      try { v = window.t(key); } catch (e) { v = null; }
    }
    if (v && v !== key) return v;
    return (fallback !== undefined) ? fallback : key;
  }

  function applyLangSafe() {
    if (typeof window.applyLang === 'function') {
      try { window.applyLang(); } catch (e) { /* ignore */ }
    }
  }

  /* ============================================================
     B) General helpers
     ============================================================ */

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Supabase se aane wale text se emoji/special pictographs hata deta hai
  var EMOJI_RE = null;
  try {
    EMOJI_RE = new RegExp('\\p{Extended_Pictographic}|\\uFE0F|\\u200D', 'gu');
  } catch (e) {
    EMOJI_RE = null;
  }

  function cleanText(s) {
    if (s === null || s === undefined) return '';
    var str = String(s);
    if (!EMOJI_RE) return str;
    try {
      return str.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
    } catch (e) {
      return str;
    }
  }

  var prefersReducedMotion = false;
  try {
    if (window.matchMedia) {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  } catch (e) {
    prefersReducedMotion = false;
  }

  function scrollBehavior() {
    return prefersReducedMotion ? 'auto' : 'smooth';
  }

  /* ============================================================
     C) Inline SVG icons
     ============================================================ */

  var ICO_USER = '<svg class="nu-ico" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<circle cx="12" cy="8" r="4"></circle>'
    + '<path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path>'
    + '</svg>';

  var ICO_CHECK = '<svg class="nu-ico" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<polyline points="5 12.5 10 17.5 19 7"></polyline>'
    + '</svg>';

  var ICO_STAR = '<svg class="nu-ico" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<polygon points="12 2.5 15 9 22 9.7 17 14.6 18.3 21.5 12 18.2 5.7 21.5 7 14.6 2 9.7 9 9"></polygon>'
    + '</svg>';

  var ICO_PIN = '<svg class="nu-ico" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"></path>'
    + '<circle cx="12" cy="10" r="2.6"></circle>'
    + '</svg>';

  var ICO_PHONE = '<svg class="nu-ico" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"></path>'
    + '</svg>';

  /* ============================================================
     D) Platform icons + link detection
     ============================================================ */

  var PLATFORM_META = {
    instagram: {
      label: 'Instagram',
      color: '#E1306C',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<rect x="3" y="3" width="18" height="18" rx="5"/>'
        + '<circle cx="12" cy="12" r="4"/>'
        + '<circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none"/>'
        + '</svg>'
    },
    facebook: {
      label: 'Facebook',
      color: '#1877F2',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">'
        + '<path d="M13.6 21v-7.4h2.5l.4-3h-2.9V8.7c0-.9.3-1.5 1.6-1.5h1.6V4.5c-.3 0-1.3-.2-2.4-.2-2.4 0-4 1.5-4 4.2v2.1H7.9v3h2.5V21z"/>'
        + '</svg>'
    },
    youtube: {
      label: 'YouTube',
      color: '#FF0000',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<rect x="2.5" y="6" width="19" height="12" rx="3"/>'
        + '<polygon points="10.5 9.5 15 12 10.5 14.5 10.5 9.5" fill="currentColor" stroke="none"/>'
        + '</svg>'
    },
    telegram: {
      label: 'Telegram',
      color: '#229ED9',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M21.5 4.5L2.5 11.5l5 2 2 5.5 3-4 5.5 3z"/>'
        + '<path d="M7.5 13.5l9.5-6"/>'
        + '</svg>'
    },
    whatsapp: {
      label: 'WhatsApp',
      color: '#25D366',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M21 11.5a8.4 8.4 0 01-8.5 8.4 8.5 8.5 0 01-4-1L3 21l1.9-5.5a8.4 8.4 0 01-1-4A8.4 8.4 0 0112.5 3 8.4 8.4 0 0121 11.5z"/>'
        + '<path d="M9 10c0 2.5 2.5 5 5 5"/>'
        + '</svg>'
    },
    x: {
      label: 'X',
      color: '#000000',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">'
        + '<path d="M17.8 4h2.7l-6 6.8L21.5 20h-5.5l-4.3-5.6L6.8 20H4l6.4-7.3L3.5 4h5.6l3.9 5.2L17.8 4zm-1 14.3h1.5L8.3 5.6H6.7l10.1 12.7z"/>'
        + '</svg>'
    },
    linkedin: {
      label: 'LinkedIn',
      color: '#0A66C2',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">'
        + '<path d="M5 4.5a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zM3.5 9.5h3v11h-3v-11zM9 9.5h2.9v1.5h.1c.4-.7 1.4-1.5 2.9-1.5 3 0 3.7 2 3.7 4.5v6.5h-3v-5.8c0-1.4-.3-2.4-1.7-2.4-1.3 0-1.8 1-1.8 2.3v5.9H9v-11z"/>'
        + '</svg>'
    },
    snapchat: {
      label: 'Snapchat',
      color: '#E5B800',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M12 3c-2.4 0-4 2-4 4.5v2.1c0 .7-.4 1.2-.9 1.5-.5.3-1.4.5-1.9.9.5.4 1.4.6 1.9.9.5.3.9.8.9 1.5-.3 1.2-1.3 1.9-1.9 2.2.7.6 1.9.9 2.9.9l.5 1.5c.5-.3 1.5-.5 2.5-.5s2 .2 2.5.5l.5-1.5c1 0 2.2-.3 2.9-.9-.6-.3-1.6-1-1.9-2.2 0-.7.4-1.2.9-1.5.5-.3 1.4-.5 1.9-.9-.5-.4-1.4-.6-1.9-.9-.5-.3-.9-.8-.9-1.5V7.5C16 5 14.4 3 12 3z"/>'
        + '</svg>'
    },
    pinterest: {
      label: 'Pinterest',
      color: '#E60023',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="9"/>'
        + '<path d="M11 8c-2 0-3.5 1.5-3.5 3.5 0 .8.3 1.5.8 2"/>'
        + '<path d="M11 8c1.5 0 2.5 1 2.5 2.5 0 .5-.1 1-.3 1.6l-1.7 6.4"/>'
        + '</svg>'
    },
    threads: {
      label: 'Threads',
      color: '#000000',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M12 21c-4.5 0-8-3-8-9s3.5-9 8-9c3.5 0 6 1.5 7 4"/>'
        + '<path d="M12 21c3.5 0 6-2 6-5s-2-4-4.5-4S9 13 9 15c0 1.5 1 2.5 2.5 2.5 2 0 3.5-1.5 3.5-4"/>'
        + '</svg>'
    },
    zomato: {
      label: 'Zomato',
      color: '#E23744',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M5 3v7a2 2 0 002 2h0a2 2 0 002-2V3"/>'
        + '<path d="M7 12v9"/>'
        + '<path d="M17 3c-2 0-3 2-3 4v4h3v10"/>'
        + '</svg>'
    },
    swiggy: {
      label: 'Swiggy',
      color: '#FC8019',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M5 8h14l-1.5 11a2 2 0 01-2 1.8h-7a2 2 0 01-2-1.8z"/>'
        + '<path d="M9 8V6a3 3 0 016 0v2"/>'
        + '</svg>'
    },
    justdial: {
      label: 'JustDial',
      color: '#0066CC',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="9"/>'
        + '<path d="M9 8h2v7a2 2 0 01-2 2"/>'
        + '<path d="M14 8v8"/>'
        + '</svg>'
    },
    maps: {
      label: 'Google Maps',
      color: '#4285F4',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z"/>'
        + '<circle cx="12" cy="11" r="2.2"/>'
        + '</svg>'
    },
    website: {
      label: 'Website',
      color: '#6B6F8D',
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="9"/>'
        + '<path d="M3 12h18"/>'
        + '<path d="M12 3a14 14 0 010 18 14 14 0 010-18z"/>'
        + '</svg>'
    }
  };

  function hostEndsWith(host, domain) {
    if (!host || !domain) return false;
    if (host === domain) return true;
    var suffix = '.' + domain;
    if (host.length <= suffix.length) return false;
    return host.indexOf(suffix, host.length - suffix.length) === host.length - suffix.length;
  }

  function detectPlatformKey(rawUrl) {
    var raw = String(rawUrl || '').toLowerCase().trim();
    if (!raw) return 'website';

    var s = raw.replace(/^https?:\/\//, '').replace(/^www\./, '');

    var cut = s.length;
    var seps = ['/', '?', '#'];
    for (var i = 0; i < seps.length; i++) {
      var idx = s.indexOf(seps[i]);
      if (idx !== -1 && idx < cut) cut = idx;
    }
    var host = s.slice(0, cut);
    var path = s.slice(cut);

    if (hostEndsWith(host, 'maps.app.goo.gl')) return 'maps';
    if (hostEndsWith(host, 'maps.google.com')) return 'maps';
    if ((hostEndsWith(host, 'google.com') || hostEndsWith(host, 'google.co.in')) && path.indexOf('/maps') === 0) return 'maps';
    if (hostEndsWith(host, 'goo.gl') && path.indexOf('/maps') === 0) return 'maps';

    if (hostEndsWith(host, 'instagram.com')) return 'instagram';
    if (hostEndsWith(host, 'facebook.com') || hostEndsWith(host, 'fb.com') || hostEndsWith(host, 'fb.me')) return 'facebook';
    if (hostEndsWith(host, 'youtube.com') || hostEndsWith(host, 'youtu.be')) return 'youtube';
    if (hostEndsWith(host, 't.me') || hostEndsWith(host, 'telegram.me')) return 'telegram';
    if (hostEndsWith(host, 'wa.me') || hostEndsWith(host, 'whatsapp.com')) return 'whatsapp';
    if (hostEndsWith(host, 'x.com') || hostEndsWith(host, 'twitter.com')) return 'x';
    if (hostEndsWith(host, 'linkedin.com')) return 'linkedin';
    if (hostEndsWith(host, 'snapchat.com')) return 'snapchat';
    if (hostEndsWith(host, 'pinterest.com')) return 'pinterest';
    if (hostEndsWith(host, 'threads.net')) return 'threads';
    if (hostEndsWith(host, 'zomato.com')) return 'zomato';
    if (hostEndsWith(host, 'swiggy.com')) return 'swiggy';
    if (hostEndsWith(host, 'justdial.com')) return 'justdial';

    return 'website';
  }

  function getLinkPlatform(url) {
    var key = detectPlatformKey(url);
    var meta = PLATFORM_META[key] || PLATFORM_META.website;
    return { key: key, label: meta.label };
  }

  /* ============================================================
     E) Supabase setup
     ============================================================ */

  var SUPABASE_URL = 'https://fuyhexxlxqsqtspkydil.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_lxiNGNL7BI-ywFvqajGbGw_cP38THcb';
  var client = null;

  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) {
    client = null;
  }

  /* ============================================================
     F) Categories
     ============================================================ */

  var FALLBACK_CATEGORIES = [
    { name: 'Restaurants & Food',          keywords: 'restaurant, hotel, dhaba, biryani' },
    { name: 'Sweets & Bakery',             keywords: 'sweets, mithai, cake, bakery' },
    { name: 'Grocery & Kirana',            keywords: 'kirana, grocery, atta, dal' },
    { name: 'Clothing & Tailors',          keywords: 'kapde, clothes, saree, tailor' },
    { name: 'Electronics & Mobile Repair', keywords: 'mobile, phone, repair, charger' },
    { name: 'Salon & Beauty',              keywords: 'salon, parlour, haircut, beauty' },
    { name: 'Clinics & Doctors',           keywords: 'doctor, clinic, dentist, hospital' },
    { name: 'Stationery & Books',          keywords: 'stationery, pen, pencil, copy, notebook' }
  ];

  var PRIORITY_CATEGORIES = [
    'Restaurants & Food',
    'Sweets & Bakery',
    'Grocery & Kirana',
    'Clothing & Tailors',
    'Electronics & Mobile Repair',
    'Salon & Beauty',
    'Clinics & Doctors',
    'Stationery & Books'
  ];

  var categories = FALLBACK_CATEGORIES.slice();

  function sortCategories(list) {
    var priority = [];
    var rest = [];
    var i;

    for (i = 0; i < list.length; i++) {
      var idx = PRIORITY_CATEGORIES.indexOf(list[i].name);
      if (idx !== -1) {
        priority.push({ item: list[i], order: idx });
      } else {
        rest.push(list[i]);
      }
    }

    priority.sort(function (a, b) { return a.order - b.order; });
    rest.sort(function (a, b) { return (a.id || 0) - (b.id || 0); });

    var sorted = [];
    for (i = 0; i < priority.length; i++) sorted.push(priority[i].item);
    for (i = 0; i < rest.length; i++) sorted.push(rest[i]);
    return sorted;
  }

  function fetchCategories() {
    if (!client) return;

    try {
      client.from('categories')
        .select('id, name, keywords')
        .order('id')
        .then(function (res) {
          if (res && res.error) {
            console.warn('Categories load nahi hui, fallback use ho raha hai.');
            return;
          }
          var rows = (res && res.data) ? res.data : [];
          if (!rows.length) return;

          categories = [];
          for (var i = 0; i < rows.length; i++) {
            categories.push({
              id: rows[i].id,
              name: cleanText(rows[i].name || ''),
              keywords: cleanText(rows[i].keywords || '')
            });
          }

          fillBizCategories();
          renderCatPanel();
          runSearch(currentQuery, false);
        })
        .catch(function () {
          console.warn('Categories fetch fail ho gaya.');
        });
    } catch (e) {
      console.warn('Categories fetch exception.');
    }
  }

  /* ============================================================
     G) Businesses
     ============================================================ */

  var SAMPLE_BUSINESSES = [
    { id: 's1', name: 'Sample Sweets & Namkeen', category: 'Sweets & Bakery',               area: 'Station Road, Gaya',    phone: '910000000001', rating: 4.6, verified: true, about: '', isReal: false },
    { id: 's2', name: 'Sample Book Depot',       category: 'Stationery & Books',           area: 'Kirana Pathak, Gaya',   phone: '910000000002', rating: 4.4, verified: true, about: '', isReal: false },
    { id: 's3', name: 'Sample City Clinic',      category: 'Clinics & Doctors',            area: 'Delha, Gaya',           phone: '910000000003', rating: 4.7, verified: true, about: '', isReal: false },
    { id: 's4', name: 'Sample Style Salon',      category: 'Salon & Beauty',               area: 'Gandhi Maidan, Gaya',   phone: '910000000004', rating: 4.3, verified: true, about: '', isReal: false },
    { id: 's5', name: 'Sample Mobile Zone',      category: 'Electronics & Mobile Repair',  area: 'Tekari Road, Gaya',     phone: '910000000005', rating: 4.5, verified: true, about: '', isReal: false },
    { id: 's6', name: 'Sample Bright Tuition',   category: 'Coaching & Tuition',           area: 'Bodh Gaya Road, Gaya',  phone: '910000000006', rating: 4.8, verified: true, about: '', isReal: false }
  ];

  var allBusinesses = [];
  var currentQuery = '';
  var bizFetchDone = false;
  var bizFetchStart = 0;
  var bizRealList = null;
  var bizRendered = false;
  var lastRenderedList = [];

  var trendingSubMode = 'sample';

  function catNameFromRow(row) {
    var c = row.categories;
    if (!c) return '';
    if (Object.prototype.toString.call(c) === '[object Array]') {
      return c.length ? (c[0].name || '') : '';
    }
    return c.name || '';
  }

  function convertRow(row) {
    var cat = cleanText(catNameFromRow(row));
    return {
      id: row.id,
      name: cleanText(row.name || ''),
      slug: row.slug || '',
      category: cat,
      area: cleanText(row.area || row.address || 'Gaya'),
      phone: row.phone || '',
      whatsapp: row.whatsapp || '',
      about: cleanText(row.about || ''),
      photo_url: row.photo_url || '',
      photo_path: row.photo_path || '',
      isReal: true
    };
  }

  function scheduleBusinessRender() {
    bizFetchDone = true;
    var elapsed = Date.now() - bizFetchStart;
    var wait = Math.max(0, 600 - elapsed);

    setTimeout(function () {
      if (bizRealList && bizRealList.length) {
        allBusinesses = bizRealList;
        trendingSubMode = 'real';
        updateTrendingSub();
      } else {
        if (!bizRendered) {
          allBusinesses = SAMPLE_BUSINESSES.slice();
          trendingSubMode = 'sample';
          updateTrendingSub();
        }
      }
      bizRendered = true;
      runSearch(currentQuery, false);
    }, wait);
  }

  function fetchBusinesses() {
    bizFetchStart = Date.now();

    if (!client) {
      bizRealList = null;
      scheduleBusinessRender();
      return;
    }

    try {
      client.from('businesses')
        .select('id, name, slug, about, address, area, phone, whatsapp, category_id, photo_url, photo_path, categories(name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(24)
        .then(function (res) {
          if (res && res.error) {
            console.warn('Businesses load nahi hue, sample dikha rahe hain.');
            bizRealList = null;
            scheduleBusinessRender();
            return;
          }
          var rows = (res && res.data) ? res.data : [];
          if (!rows.length) {
            bizRealList = null;
            scheduleBusinessRender();
            return;
          }
          var list = [];
          for (var i = 0; i < rows.length; i++) {
            list.push(convertRow(rows[i]));
          }
          bizRealList = list;
          scheduleBusinessRender();
        })
        .catch(function () {
          bizRealList = null;
          scheduleBusinessRender();
        });
    } catch (e) {
      bizRealList = null;
      scheduleBusinessRender();
    }
  }

  /* ============================================================
     H) Smart search
     ============================================================ */

  function getKeywordsForCategory(catName) {
    var found = '';
    var i;

    for (i = 0; i < categories.length; i++) {
      if (categories[i].name === catName) {
        found = categories[i].keywords || '';
        break;
      }
    }
    if (!found) {
      for (i = 0; i < FALLBACK_CATEGORIES.length; i++) {
        if (FALLBACK_CATEGORIES[i].name === catName) {
          found = FALLBACK_CATEGORIES[i].keywords || '';
          break;
        }
      }
    }
    if (catName === 'Coaching & Tuition') {
      found = found
        ? found + ', tuition, coaching, classes, study'
        : 'tuition, coaching, classes, study';
    }
    return found;
  }

  function getFiltered(query) {
    var q = (query || '').trim().toLowerCase();
    if (!q) return allBusinesses.slice();

    var out = [];
    for (var i = 0; i < allBusinesses.length; i++) {
      var b = allBusinesses[i];
      var name = (b.name || '').toLowerCase();
      var cat = (b.category || '').toLowerCase();
      var area = (b.area || '').toLowerCase();
      var about = (b.about || '').toLowerCase();

      if (name.indexOf(q) !== -1) { out.push(b); continue; }
      if (cat.indexOf(q) !== -1) { out.push(b); continue; }
      if (area.indexOf(q) !== -1 || about.indexOf(q) !== -1) { out.push(b); continue; }

      var kws = getKeywordsForCategory(b.category || '').split(',');
      var matched = false;
      for (var k = 0; k < kws.length; k++) {
        var kw = kws[k].trim().toLowerCase();
        if (!kw) continue;
        if (kw.indexOf(q) === 0 || q.indexOf(kw) === 0) {
          matched = true;
          break;
        }
      }
      if (matched) out.push(b);
    }
    return out;
  }

  var activeCategory = '';

  function filterByCategory(catName) {
    var out = [];
    for (var i = 0; i < allBusinesses.length; i++) {
      if ((allBusinesses[i].category || '') === catName) out.push(allBusinesses[i]);
    }
    return out;
  }

  function updateTrendingHeading() {
    var titleEl = document.getElementById('trendingTitle');
    var clearBtn = document.getElementById('nuCatClear');

    if (activeCategory) {
      // Category name DB se hai - translate nahi karte
      if (titleEl) titleEl.textContent = activeCategory;
      if (clearBtn) clearBtn.hidden = false;
    } else {
      // MISSING KEY: trending_title
      if (titleEl) titleEl.textContent = 'Gaya mein abhi trending';
      if (clearBtn) clearBtn.hidden = true;
    }
  }

  function updateTrendingSub() {
    var sub = document.getElementById('trendingSub');
    if (!sub) return;
    if (trendingSubMode === 'real') {
      // MISSING KEY: trending_sub_real
      sub.textContent = 'Gaya ke naye businesses - seedha call ya WhatsApp karo.';
    } else {
      // MISSING KEY: trending_sub_sample
      sub.textContent = 'Ye sample listings hain - asli data jald aayega.';
    }
  }

  function runSearch(query, scroll) {
    currentQuery = query || '';

    if (scroll) {
      var trending = document.getElementById('trending');
      if (trending) {
        try {
          trending.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
        } catch (e) {
          trending.scrollIntoView();
        }
      }
    }

    updateTrendingHeading();

    if (!bizRendered) return;

    var noRes = document.getElementById('noResults');
    var wrap = document.getElementById('trendingList');
    var list;

    if (activeCategory) {
      list = filterByCategory(activeCategory);
    } else {
      list = getFiltered(currentQuery);
    }

    if (list.length === 0) {
      lastRenderedList = [];
      if (wrap) wrap.innerHTML = '';
      if (noRes) {
        if (activeCategory) {
          noRes.textContent = T('no_results');
          noRes.hidden = false;
        } else if (currentQuery.trim() !== '') {
          noRes.textContent = T('no_results');
          noRes.hidden = false;
        } else {
          noRes.hidden = true;
        }
      }
      return;
    }

    if (noRes) noRes.hidden = true;
    lastRenderedList = list;
    renderBusinesses(list);
  }

  /* ============================================================
     I) Skeleton + card render
     ============================================================ */

  function renderSkeletons() {
    var wrap = document.getElementById('trendingList');
    if (!wrap) return;

    var html = '';
    for (var i = 0; i < 6; i++) {
      html += ''
        + '<div class="skeleton-card" aria-hidden="true">'
        +   '<div class="skeleton-media"></div>'
        +   '<div class="skeleton-body">'
        +     '<div class="skeleton-line w-70"></div>'
        +     '<div class="skeleton-line w-40"></div>'
        +     '<div class="skeleton-line w-100"></div>'
        +     '<div class="skeleton-btn-row">'
        +       '<div class="skeleton-btn"></div>'
        +       '<div class="skeleton-btn"></div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }
    wrap.innerHTML = html;
  }

  function toDigits(value) {
    var d = String(value || '').replace(/\D/g, '');
    if (d.length === 10) return '91' + d;
    if (d.length === 11 && d.charAt(0) === '0') return '91' + d.substring(1);
    if (d.length === 12 && d.indexOf('91') === 0) return d;
    return '';
  }

  function initialFromName(name) {
    var s = String(name || '').trim();
    if (!s) return '?';
    return s.charAt(0).toUpperCase();
  }

  // Public photo URL from stored path
  function publicPhotoUrl(path) {
    if (!path || !client) return '';
    try {
      var res = client.storage.from('businesses').getPublicUrl(path);
      return (res && res.data && res.data.publicUrl) ? res.data.publicUrl : '';
    } catch (e) {
      return '';
    }
  }

  // Photo URL from business object (photo_url preferred, path fallback)
  function photoUrlOf(b) {
    if (!b) return '';
    if (b.photo_url) return String(b.photo_url);
    if (b.photo_path) return publicPhotoUrl(b.photo_path);
    return '';
  }

  function businessCardHTML(b) {
    var name = escapeHTML(cleanText(b.name || ''));
    var cat = escapeHTML(cleanText(b.category || ''));
    var area = escapeHTML(cleanText(b.area || 'Gaya'));
    var about = b.about ? escapeHTML(cleanText(b.about)) : '';
    var initial = escapeHTML(initialFromName(cleanText(b.name)));

    var phoneDigits = toDigits(b.phone);
    var waDigits = toDigits(b.whatsapp || b.phone);

    // MISSING KEY: badge_approved / badge_verified
    var badgeText = b.isReal ? 'Approved' : 'Verified';

    var ratingHTML = '';
    if (b.rating !== undefined && b.rating !== null && b.rating !== '') {
      ratingHTML = '<span class="rating-chip">' + ICO_STAR + '<span>' + escapeHTML(b.rating) + '</span></span>';
    }

    var actionsHTML = '';
    var hasCall = phoneDigits !== '';
    var hasWa = waDigits !== '';
    if (hasCall || hasWa) {
      var callBtn = hasCall
        ? '<a class="btn-call" href="tel:+' + phoneDigits + '">' + ICO_PHONE + '<span>' + escapeHTML(T('call')) + '</span></a>'
        : '';
      var waBtn = hasWa
        ? '<a class="btn-wa" href="https://wa.me/' + waDigits + '" target="_blank" rel="noopener">' + escapeHTML(T('whatsapp')) + '</a>'
        : '';
      actionsHTML = '<div class="card-actions">' + callBtn + waBtn + '</div>';
    }

    var viewHTML = '';
    if (b.isReal === true && typeof b.slug === 'string' && b.slug !== '') {
      viewHTML = '<a class="btn-view" href="business.html?slug=' + encodeURIComponent(b.slug) + '">' + escapeHTML(T('full_details')) + ' \u2192</a>';
    }

    var aboutHTML = about ? '<p class="card-about">' + about + '</p>' : '';

    // Photo or initial
    var photoUrl = photoUrlOf(b);
    var mediaHTML = photoUrl
      ? '<img class="card-photo" src="' + escapeHTML(photoUrl) + '" alt="" loading="lazy" />'
      : '<span class="card-initial">' + initial + '</span>';

    return ''
      + '<article class="trending-card">'
      +   '<div class="card-media" aria-hidden="true">'
      +     mediaHTML
      +   '</div>'
      +   '<div class="card-body">'
      +     '<div class="card-head">'
      +       '<div>'
      +         '<h3 class="card-name">' + name + '</h3>'
      +         '<p class="card-cat">' + cat + '</p>'
      +       '</div>'
      +       '<span class="badge-verified">' + ICO_CHECK + '<span>' + badgeText + '</span></span>'
      +     '</div>'
      +     '<div class="card-meta">'
      +       '<span class="card-area">' + ICO_PIN + '<span>' + area + '</span></span>'
      +       ratingHTML
      +     '</div>'
      +     aboutHTML
      +     actionsHTML
      +     viewHTML
      +   '</div>'
      + '</article>';
  }

  function renderBusinesses(list) {
    var wrap = document.getElementById('trendingList');
    if (!wrap) return;

    var html = '';
    for (var i = 0; i < list.length; i++) {
      html += businessCardHTML(list[i]);
    }
    wrap.innerHTML = html;
  }

  /* ============================================================
     J) Header scroll
     ============================================================ */

  function handleScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* ============================================================
     K) Placeholder rotation
     ============================================================ */

  var PLACEHOLDER_WORDS = ['pen', 'dentist', 'biryani', 'mobile repair', 'tuition'];
  var placeholderIndex = 0;
  var typingTimer = null;
  var rotateTimer = null;

  function typePlaceholder(word) {
    var input = document.getElementById('searchInput');
    if (!input) return;
    if (document.activeElement === input || input.value.trim() !== '') return;

    // Localized prefix using search_button key
    var prefix = T('search_button') + ': ';

    if (prefersReducedMotion) {
      input.placeholder = prefix + word;
      return;
    }

    var i = 0;
    input.placeholder = prefix;

    function step() {
      var el = document.getElementById('searchInput');
      if (!el) return;
      if (document.activeElement === el || el.value.trim() !== '') return;
      if (i < word.length) {
        i++;
        el.placeholder = prefix + word.substring(0, i);
        typingTimer = setTimeout(step, 70);
      }
    }
    step();
  }

  function startPlaceholderRotation() {
    var input = document.getElementById('searchInput');
    if (!input) return;

    typePlaceholder(PLACEHOLDER_WORDS[0]);

    rotateTimer = setInterval(function () {
      var el = document.getElementById('searchInput');
      if (!el) return;
      if (document.activeElement === el || el.value.trim() !== '') return;
      placeholderIndex = (placeholderIndex + 1) % PLACEHOLDER_WORDS.length;
      typePlaceholder(PLACEHOLDER_WORDS[placeholderIndex]);
    }, 2500);
  }

  function restartPlaceholderRotation() {
    if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
    if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
    placeholderIndex = 0;
    startPlaceholderRotation();
  }

  /* ============================================================
     L) Reveal animation
     ============================================================ */

  function setupReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add('in-view');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('in-view');
          observer.unobserve(entries[j].target);
        }
      }
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    for (var k = 0; k < els.length; k++) {
      observer.observe(els[k]);
    }
  }

  /* ============================================================
     M) Toast
     ============================================================ */

  function showToast(message) {
    var el = document.getElementById('nearuToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'nearuToast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;

    void el.offsetWidth;

    el.classList.add('show');
    if (el._hideTimer) clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function () {
      el.classList.remove('show');
    }, 2400);
  }

  /* ============================================================
     N) Auth (login, signup, google, forgot, delete)
     ============================================================ */

  var currentUser = null;
  var authMode = 'login';
  var lastFocusedEl = null;
  var pendingIntent = null;

  var EYE_OPEN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12z"></path>'
    + '<circle cx="12" cy="12" r="3.2"></circle>'
    + '</svg>';

  var EYE_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.7 0-10.5-7-10.5-7a18.5 18.5 0 0 1 5.06-5.94"></path>'
    + '<path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.7 0 10.5 8 10.5 8a18.5 18.5 0 0 1-2.16 3.19"></path>'
    + '<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>'
    + '<line x1="2" y1="2" x2="22" y2="22"></line>'
    + '</svg>';

  function setEyeIcon(showOff) {
    var iconWrap = document.querySelector('#togglePassword .eye-icon');
    if (!iconWrap) return;
    iconWrap.innerHTML = showOff ? EYE_OFF_SVG : EYE_OPEN_SVG;
  }

  function resetPasswordToggle() {
    var pwd = document.getElementById('authPassword');
    if (pwd) pwd.type = 'password';

    var btn = document.getElementById('togglePassword');
    // MISSING KEY: auth_eye_show
    if (btn) btn.setAttribute('aria-label', T('auth_eye_show', 'Password dikhao'));

    setEyeIcon(false);
  }

  function clearEmailHint() {
    var hint = document.getElementById('authEmailHint');
    if (hint) {
      hint.hidden = true;
      hint.textContent = '';
    }
    var emailEl = document.getElementById('authEmail');
    if (emailEl) emailEl.classList.remove('field-error');
  }

  function showEmailHint(text, markError) {
    var hint = document.getElementById('authEmailHint');
    var emailEl = document.getElementById('authEmail');
    if (hint) {
      hint.textContent = text;
      hint.hidden = false;
    }
    if (markError && emailEl) {
      emailEl.classList.add('field-error');
    } else if (emailEl) {
      emailEl.classList.remove('field-error');
    }
  }

  var EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

  var EMAIL_TYPO_DOMAINS = {
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.con': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'yahho.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  function checkEmail(email) {
    // MISSING KEY: err_email_invalid
    var genericHint = T('err_email_invalid', 'Sahi email likho, jaise name@gmail.com');

    if (!email) return { ok: false, hint: genericHint };
    if (email.indexOf('..') !== -1) return { ok: false, hint: genericHint };
    if (!EMAIL_RE.test(email)) return { ok: false, hint: genericHint };

    var atIdx = email.lastIndexOf('@');
    var local = email.substring(0, atIdx);
    var domain = email.substring(atIdx + 1);

    if (EMAIL_TYPO_DOMAINS[domain]) {
      var correct = local + '@' + EMAIL_TYPO_DOMAINS[domain];
      // MISSING KEY: err_email_typo
      return { ok: false, hint: 'Kya aapka matlab ' + correct + ' tha?' };
    }

    return { ok: true };
  }

  function anyModalOpen() {
    var a = document.getElementById('authModal');
    var b = document.getElementById('businessModal');
    var c = document.getElementById('updates-modal');
    var aOpen = a && !a.hidden;
    var bOpen = b && !b.hidden;
    var cOpen = c && !c.hidden;
    return aOpen || bOpen || cOpen;
  }

  function syncBodyModalClass() {
    if (anyModalOpen()) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  /* ---------- Admin visibility ---------- */

  var adminCacheUserId = null;
  var adminCacheValue = false;

  function applyAdminVisibility(isAdmin) {
    var headerLink = document.getElementById('adminHeaderLink');
    var accountLink = document.getElementById('adminAccountLink');
    if (headerLink) headerLink.hidden = !isAdmin;
    if (accountLink) accountLink.hidden = !isAdmin;
  }

  function checkAdminAccess() {
    if (!currentUser) {
      adminCacheUserId = null;
      adminCacheValue = false;
      applyAdminVisibility(false);
      return;
    }

    if (!client) {
      applyAdminVisibility(false);
      return;
    }

    var uid = currentUser.id;

    if (adminCacheUserId !== uid) {
      adminCacheUserId = null;
      adminCacheValue = false;
    }

    if (adminCacheUserId === uid) {
      applyAdminVisibility(adminCacheValue === true);
      return;
    }

    applyAdminVisibility(false);

    try {
      client.rpc('is_admin')
        .then(function (res) {
          if (!currentUser || currentUser.id !== uid) return;

          var isAdmin = false;
          if (res && !res.error && res.data === true) {
            isAdmin = true;
          }
          adminCacheUserId = uid;
          adminCacheValue = isAdmin;
          applyAdminVisibility(isAdmin);
        })
        .catch(function () {
          if (!currentUser || currentUser.id !== uid) return;
          adminCacheUserId = uid;
          adminCacheValue = false;
          applyAdminVisibility(false);
        });
    } catch (e) {
      applyAdminVisibility(false);
    }
  }

  function updateAuthUI() {
    var btn = document.getElementById('loginBtn');
    if (!btn) return;

    if (currentUser && currentUser.email) {
      var local = cleanText(currentUser.email.split('@')[0] || '');
      if (local.length > 10) local = local.substring(0, 10) + '...';
      btn.innerHTML = ICO_USER + '<span>' + escapeHTML(local) + '</span>';
      btn.setAttribute('aria-label', local);
    } else {
      var loginText = T('login');
      btn.innerHTML = ICO_USER + '<span>' + escapeHTML(loginText) + '</span>';
      btn.setAttribute('aria-label', loginText);
    }

    var modal = document.getElementById('authModal');
    if (modal && !modal.hidden) {
      var formView = document.getElementById('authFormView');
      var accountView = document.getElementById('accountView');
      if (currentUser) {
        if (formView) formView.hidden = true;
        if (accountView) accountView.hidden = false;
        var ae = document.getElementById('accountEmail');
        if (ae) ae.textContent = cleanText(currentUser.email || '');
      } else {
        if (formView) formView.hidden = false;
        if (accountView) accountView.hidden = true;
        setAuthMode(authMode);
      }
    }

    checkAdminAccess();
  }

  function setAuthMode(mode) {
    authMode = (mode === 'signup') ? 'signup' : 'login';

    var tabLogin = document.getElementById('tabLogin');
    var tabSignup = document.getElementById('tabSignup');
    var submit = document.getElementById('authSubmit');
    var title = document.getElementById('authTitle');
    var pwd = document.getElementById('authPassword');
    var msg = document.getElementById('authMsg');
    var forgot = document.getElementById('forgotPasswordBtn');

    if (authMode === 'login') {
      if (tabLogin) { tabLogin.classList.add('active'); tabLogin.setAttribute('aria-selected', 'true'); }
      if (tabSignup) { tabSignup.classList.remove('active'); tabSignup.setAttribute('aria-selected', 'false'); }
      if (submit) submit.textContent = T('login');
      // MISSING KEY: auth_login_title
      if (title) title.textContent = 'Near-U mein login karo';
      if (pwd) pwd.setAttribute('autocomplete', 'current-password');
      if (forgot) forgot.style.display = 'inline-block';
    } else {
      if (tabSignup) { tabSignup.classList.add('active'); tabSignup.setAttribute('aria-selected', 'true'); }
      if (tabLogin) { tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-selected', 'false'); }
      if (submit) submit.textContent = T('signup');
      // MISSING KEY: auth_signup_title
      if (title) title.textContent = 'Naya account banao';
      if (pwd) pwd.setAttribute('autocomplete', 'new-password');
      if (forgot) forgot.style.display = 'none';
    }

    if (msg) {
      msg.hidden = true;
      msg.className = 'auth-msg';
      msg.textContent = '';
    }

    resetPasswordToggle();
    clearEmailHint();
  }

  function openAuthModal(options) {
    options = options || {};
    var modal = document.getElementById('authModal');
    if (!modal) return;

    var sub = document.getElementById('authSub');
    if (sub) {
      // MISSING KEY: auth_sub_default
      sub.textContent = options.message || 'Apna business add karne ke liye account chahiye.';
    }

    var formView = document.getElementById('authFormView');
    var accountView = document.getElementById('accountView');

    if (currentUser) {
      if (formView) formView.hidden = true;
      if (accountView) accountView.hidden = false;
      var ae = document.getElementById('accountEmail');
      if (ae) ae.textContent = cleanText(currentUser.email || '');
    } else {
      if (formView) formView.hidden = false;
      if (accountView) accountView.hidden = true;
      setAuthMode(options.mode || authMode || 'login');
    }

    lastFocusedEl = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');

    setTimeout(function () {
      if (currentUser) {
        var lo = document.getElementById('logoutBtn');
        if (lo) lo.focus();
      } else {
        var em = document.getElementById('authEmail');
        if (em) em.focus();
      }
    }, 50);
  }

  function closeAuthModal() {
    var modal = document.getElementById('authModal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    syncBodyModalClass();

    var msg = document.getElementById('authMsg');
    if (msg) {
      msg.hidden = true;
      msg.className = 'auth-msg';
      msg.textContent = '';
    }

    resetPasswordToggle();
    clearEmailHint();

    if (!currentUser) pendingIntent = null;

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      try { lastFocusedEl.focus(); } catch (e) {}
    }
    lastFocusedEl = null;
  }

  function friendlyAuthError(message) {
    var m = String(message || '').toLowerCase();
    // MISSING KEYS for all these error strings
    if (m.indexOf('invalid login credentials') !== -1) return 'Email ya password galat hai.';
    if (m.indexOf('email not confirmed') !== -1) return 'Pehle apna email confirm karo.';
    if (m.indexOf('already registered') !== -1) return 'Ye email pehle se registered hai, login karo.';
    if (m.indexOf('at least') !== -1 || m.indexOf('weak') !== -1) return 'Password kam se kam 6 akshar ka rakho.';
    if (m.indexOf('rate limit') !== -1) return 'Bahut koshish ho gayi, thodi der baad try karo.';
    if (m.indexOf('fetch') !== -1 || m.indexOf('network') !== -1) return 'Internet check karo aur dobara try karo.';
    return 'Kuch gadbad ho gayi, dobara try karo.';
  }

  function handleAuthSubmit(e) {
    e.preventDefault();

    var emailEl = document.getElementById('authEmail');
    var passEl = document.getElementById('authPassword');
    var msg = document.getElementById('authMsg');
    var submit = document.getElementById('authSubmit');

    var email = (emailEl ? emailEl.value : '').trim().toLowerCase();
    var password = passEl ? passEl.value : '';

    function setMsg(text, type) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'auth-msg ' + type;
      msg.hidden = false;
    }

    var emailCheck = checkEmail(email);
    if (!emailCheck.ok) {
      var isTypo = emailCheck.hint.indexOf('tha?') !== -1;
      showEmailHint(emailCheck.hint, !isTypo);
      return;
    }
    clearEmailHint();

    if (password.length < 6) {
      // MISSING KEY: err_password_short
      setMsg('Password kam se kam 6 akshar ka rakho.', 'error');
      return;
    }

    if (!client) {
      // MISSING KEY: err_auth_unavailable
      setMsg('Login abhi available nahi hai, thodi der baad try karo.', 'error');
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = T('loading');
    }

    function finish() {
      if (submit) {
        submit.disabled = false;
        submit.textContent = (authMode === 'login') ? T('login') : T('signup');
      }
    }

    if (authMode === 'login') {
      client.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res && res.error) {
            setMsg(friendlyAuthError(res.error.message), 'error');
            finish();
            return;
          }
          currentUser = (res && res.data) ? res.data.user : null;
          updateAuthUI();
          closeAuthModal();
          // MISSING KEY: toast_welcome_back
          showToast('Welcome back! Login ho gaya.');
          setTimeout(maybeShowUpdatesModal, 700);
          if (pendingIntent === 'business') {
            pendingIntent = null;
            openBusinessModal();
          }
          finish();
        })
        .catch(function () {
          // MISSING KEY: err_network
          setMsg('Internet check karo aur dobara try karo.', 'error');
          finish();
        });
    } else {
      client.auth.signUp({ email: email, password: password })
        .then(function (res) {
          if (res && res.error) {
            setMsg(friendlyAuthError(res.error.message), 'error');
            finish();
            return;
          }
          var data = (res && res.data) ? res.data : {};
          var user = data.user;

          if (user && Object.prototype.toString.call(user.identities) === '[object Array]' && user.identities.length === 0) {
            // MISSING KEY: err_email_registered
            setMsg('Ye email pehle se registered hai, login karo.', 'error');
            setAuthMode('login');
            finish();
            return;
          }

          if (data.session) {
            currentUser = user || null;
            updateAuthUI();
            closeAuthModal();
            // MISSING KEY: toast_account_created
            showToast('Account ban gaya, Near-U mein swagat hai!');
            setTimeout(maybeShowUpdatesModal, 700);
            if (pendingIntent === 'business') {
              pendingIntent = null;
              openBusinessModal();
            }
          } else {
            // MISSING KEY: msg_confirm_email
            setMsg('Email pe confirmation link bheja hai, use khol ke phir login karo.', 'success');
          }
          finish();
        })
        .catch(function () {
          // MISSING KEY: err_network
          setMsg('Internet check karo aur dobara try karo.', 'error');
          finish();
        });
    }
  }

  function initAuth() {
    if (!client) return;
    try {
      client.auth.getSession()
        .then(function (res) {
          var session = (res && res.data) ? res.data.session : null;
          currentUser = session ? session.user : null;
          updateAuthUI();
          if (currentUser) {
            setTimeout(maybeShowUpdatesModal, 900);
          }
        })
        .catch(function () {});

      client.auth.onAuthStateChange(function (event, session) {
        currentUser = session ? session.user : null;
        updateAuthUI();
        if (event === 'SIGNED_IN' && currentUser) {
          setTimeout(maybeShowUpdatesModal, 900);
        }
      });
    } catch (e) {
      // chup
    }
  }

  /* ---------- Google login ---------- */

  function handleGoogleLogin() {
    if (!client) {
      showToast(T('err_generic', 'Kuch gadbad ho gayi, dobara try karo.'));
      return;
    }
    var redirectTo = window.location.origin + window.location.pathname;
    try {
      client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo }
      }).catch(function () {
        // MISSING KEY: err_google_login
        showToast('Google login abhi kaam nahi kar raha.');
      });
    } catch (e) {
      showToast('Google login abhi kaam nahi kar raha.');
    }
  }

  /* ---------- Forgot password ---------- */

  function handleForgotPassword() {
    var emailEl = document.getElementById('authEmail');
    var msg = document.getElementById('authMsg');
    var email = (emailEl ? emailEl.value : '').trim().toLowerCase();

    function setMsg(text, type) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'auth-msg ' + (type || 'error');
      msg.hidden = false;
    }

    var check = checkEmail(email);
    if (!check.ok) {
      showEmailHint(check.hint, true);
      return;
    }
    clearEmailHint();

    if (!client) {
      setMsg(T('err_auth_unavailable', 'Login abhi available nahi hai, thodi der baad try karo.'), 'error');
      return;
    }

    client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    }).then(function (res) {
      if (res && res.error) {
        setMsg(friendlyAuthError(res.error.message), 'error');
        return;
      }
      // MISSING KEY: reset_email_sent (added via i18n key)
      setMsg(T('reset_email_sent', 'Reset link email par bhej diya hai. Inbox check karo.'), 'success');
    }).catch(function () {
      // MISSING KEY: err_network
      setMsg('Internet check karo aur dobara try karo.', 'error');
    });
  }

  /* ---------- Delete account ---------- */

  function handleDeleteAccount() {
    if (!currentUser) return;
    if (!client) return;

    // MISSING KEY: delete_account_confirm (added via i18n key)
    var confirmText = T('delete_account_confirm', 'Pakka delete karna hai? Ye wapas nahi hoga.');
    if (!window.confirm(confirmText)) return;

    var btn = document.getElementById('deleteAccountBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = T('loading');
    }

    function done() {
      currentUser = null;
      myBusiness = null;
      editMode = false;
      editBusinessId = null;
      updateAuthUI();
      closeAuthModal();
      // MISSING KEY: delete_account_done
      showToast(T('delete_account_done', 'Account delete ho gaya.'));
    }

    // 1) Business row delete
    client.from('businesses')
      .delete()
      .eq('owner_id', currentUser.id)
      .then(function () {
        // 2) Optional RPC (agar SQL function available ho)
        return client.rpc('delete_my_account').catch(function () { return null; });
      })
      .then(function () {
        // 3) Sign out
        return client.auth.signOut().catch(function () {});
      })
      .then(done)
      .catch(function () {
        client.auth.signOut().catch(function () {}).then(done);
      });
  }

  /* ============================================================
     O) Business form (add / edit + photo + links)
     ============================================================ */

  var myBusiness = null;
  var MAX_LINKS = 8;

  var editMode = false;
  var editBusinessId = null;

  /* ---------- Photo state ---------- */

  var PHOTO_BUCKET = 'businesses';
  var MAX_PHOTO_BYTES = 2 * 1024 * 1024;
  var ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  var pendingPhotoFile = null;
  var pendingPhotoRemoved = false;

  function setPhotoStatus(text, type) {
    var el = document.getElementById('bizPhotoStatus');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'biz-photo-status' + (type ? (' ' + type) : '');
  }

  function setPhotoPreview(url) {
    var preview = document.getElementById('bizPhotoPreview');
    var removeBtn = document.getElementById('bizPhotoRemove');
    if (!preview) return;
    if (url) {
      preview.innerHTML = '<img alt="" src="' + escapeHTML(url) + '" />';
      if (removeBtn) removeBtn.hidden = false;
    } else {
      preview.innerHTML = '<span>' + escapeHTML(T('add_photo', 'Add photo')) + '</span>';
      if (removeBtn) removeBtn.hidden = true;
    }
  }

  function resetPhotoUploader(initialUrl) {
    pendingPhotoFile = null;
    pendingPhotoRemoved = false;
    var input = document.getElementById('bizPhotoInput');
    if (input) input.value = '';
    setPhotoStatus('', '');
    setPhotoPreview(initialUrl || '');
  }

  function validatePhotoFile(file) {
    if (!file) return T('upload_failed', 'Photo upload nahi hui, dobara try karo.');
    if (ALLOWED_PHOTO_TYPES.indexOf(file.type) === -1) {
      return 'Sirf JPG, PNG, WEBP ya GIF chalega.';
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return 'Photo 2 MB se choti rakho.';
    }
    return '';
  }

  function uploadPhotoIfAny() {
    if (!pendingPhotoFile) return Promise.resolve(null);
    if (!client || !currentUser) return Promise.resolve(null);

    var file = pendingPhotoFile;
    var safeName = String(file.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-40);
    var path = currentUser.id + '/' + Date.now() + '-' + safeName;

    setPhotoStatus(T('uploading', 'Upload ho raha hai...'), '');

    return client.storage.from(PHOTO_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    }).then(function (res) {
      if (res && res.error) throw res.error;
      return publicPhotoUrl(path);
    });
  }

  /* ---------- Form views ---------- */

  function showOnlyBiz(viewId) {
    var ids = ['bizLoadingView', 'bizFormView', 'bizDoneView', 'bizStatusView'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.hidden = (ids[i] !== viewId);
    }
  }

  function fillBizCategories() {
    var sel = document.getElementById('bizCategory');
    if (!sel) return;

    var realCats = [];
    for (var i = 0; i < categories.length; i++) {
      var c = categories[i];
      if (c && typeof c.id === 'number' && !isNaN(c.id)) {
        realCats.push(c);
      }
    }

    sel.innerHTML = '';

    if (realCats.length === 0) {
      var od = document.createElement('option');
      od.value = '';
      od.textContent = T('loading');
      od.disabled = true;
      sel.appendChild(od);
      return;
    }

    realCats.sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = T('category');
    sel.appendChild(opt0);

    for (var j = 0; j < realCats.length; j++) {
      var o = document.createElement('option');
      o.value = String(realCats[j].id);
      // Category name DB se hai - translate nahi karte
      o.textContent = cleanText(realCats[j].name);
      sel.appendChild(o);
    }
  }

  /* ---------- Link rows ---------- */

  function isValidHttpUrl(url) {
    var m = String(url || '').match(/^https?:\/\/([^\s\/?#]+)/);
    if (!m) return false;
    var host = m[1];
    if (host.indexOf('.') === -1) return false;
    var parts = host.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) return false;
    }
    return true;
  }

  function updateAddLinkButtonState() {
    var btn = document.getElementById('biz-add-link');
    var list = document.getElementById('biz-links-list');
    if (!btn || !list) return;
    var count = list.querySelectorAll('.biz-link-row').length;
    if (count >= MAX_LINKS) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  }

  function createLinkRow(initialUrl) {
    var row = document.createElement('div');
    row.className = 'biz-link-row';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'field-input biz-link-input';
    input.placeholder = 'https://...';
    input.maxLength = 500;
    input.autocomplete = 'off';
    input.spellcheck = false;
    if (initialUrl) input.value = initialUrl;

    var badge = document.createElement('span');
    badge.className = 'biz-link-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.hidden = true;

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'biz-link-remove';
    // MISSING KEY: aria_remove_link
    removeBtn.setAttribute('aria-label', 'Link hatao');
    removeBtn.textContent = '\u00D7';

    var err = document.createElement('p');
    err.className = 'auth-msg error biz-link-error';
    err.hidden = true;

    function updateBadge() {
      var v = input.value.trim();
      if (!v) {
        badge.hidden = true;
        badge.innerHTML = '';
        return;
      }
      var p = getLinkPlatform(v);
      var meta = PLATFORM_META[p.key] || PLATFORM_META.website;
      badge.hidden = false;
      badge.title = p.label;
      badge.style.color = meta.color;
      badge.innerHTML = meta.svg;
    }

    input.addEventListener('input', function () {
      err.hidden = true;
      err.textContent = '';
      updateBadge();
    });

    removeBtn.addEventListener('click', function () {
      if (row.parentNode) row.parentNode.removeChild(row);
      updateAddLinkButtonState();
    });

    row.appendChild(input);
    row.appendChild(badge);
    row.appendChild(removeBtn);
    row.appendChild(err);

    if (initialUrl) updateBadge();

    return row;
  }

  function addLinkRow(url) {
    var list = document.getElementById('biz-links-list');
    if (!list) return;
    var count = list.querySelectorAll('.biz-link-row').length;
    if (count >= MAX_LINKS) return;
    var row = createLinkRow(url || '');
    list.appendChild(row);
    updateAddLinkButtonState();
    if (!url) {
      var inp = row.querySelector('.biz-link-input');
      if (inp) {
        try { inp.focus(); } catch (e) {}
      }
    }
  }

  function clearLinkRows() {
    var list = document.getElementById('biz-links-list');
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    updateAddLinkButtonState();
  }

  function collectLinks() {
    var list = document.getElementById('biz-links-list');
    if (!list) return { links: [], error: null };

    var inputs = list.querySelectorAll('.biz-link-input');
    var links = [];
    var seen = {};
    var firstError = null;

    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var row = inp.parentNode;
      var err = row ? row.querySelector('.biz-link-error') : null;
      if (err) { err.hidden = true; err.textContent = ''; }

      var v = String(inp.value || '').trim();
      if (!v) continue;

      if (v.indexOf('http://') !== 0 && v.indexOf('https://') !== 0) {
        v = 'https://' + v;
      }

      if (!isValidHttpUrl(v)) {
        if (err) {
          // MISSING KEY: err_link_invalid
          err.textContent = 'Sahi link likho, jaise https://instagram.com/...';
          err.hidden = false;
        }
        if (!firstError) {
          // MISSING KEY: err_links_invalid
          firstError = 'Kuch links sahi nahi hain. Theek karke dobara try karo.';
        }
        continue;
      }

      var key = v.toLowerCase();
      if (seen[key]) continue;
      seen[key] = true;

      links.push({ url: v });
    }

    return { links: links, error: firstError };
  }

  function applyAddLinkButtonStyles(btn) {
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.gap = '6px';
    btn.style.padding = '8px 14px';
    btn.style.border = '1px dashed #C4BCE8';
    btn.style.background = '#F5F3FF';
    btn.style.color = '#3730A3';
    btn.style.borderRadius = '10px';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '600';
    btn.style.cursor = 'pointer';
    btn.style.marginTop = '4px';
    btn.style.fontFamily = 'inherit';
    var svg = btn.querySelector('svg');
    if (svg) {
      svg.style.width = '16px';
      svg.style.height = '16px';
      svg.style.flexShrink = '0';
      svg.style.stroke = 'currentColor';
      svg.style.fill = 'none';
      svg.style.strokeWidth = '2';
      svg.style.strokeLinecap = 'round';
      svg.style.strokeLinejoin = 'round';
    }
  }

  function setupBizLinks() {
    var btn = document.getElementById('biz-add-link');
    if (!btn) return;

    applyAddLinkButtonStyles(btn);

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var list = document.getElementById('biz-links-list');
      if (!list) return;
      var count = list.querySelectorAll('.biz-link-row').length;
      if (count >= MAX_LINKS) return;
      addLinkRow('');
    });

    updateAddLinkButtonState();
  }

  /* ---------- Photo setup ---------- */

  function setupBizPhoto() {
    var preview = document.getElementById('bizPhotoPreview');
    var pickBtn = document.getElementById('bizPhotoPick');
    var removeBtn = document.getElementById('bizPhotoRemove');
    var input = document.getElementById('bizPhotoInput');

    function openPicker() {
      if (input) input.click();
    }

    if (pickBtn) pickBtn.addEventListener('click', openPicker);

    if (preview) {
      preview.addEventListener('click', openPicker);
      preview.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); }
      });
    }

    if (input) {
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        if (!f) return;
        var err = validatePhotoFile(f);
        if (err) {
          setPhotoStatus(err, 'error');
          input.value = '';
          return;
        }
        pendingPhotoFile = f;
        pendingPhotoRemoved = false;
        setPhotoStatus('', '');
        try {
          var url = URL.createObjectURL(f);
          setPhotoPreview(url);
        } catch (e) { /* ignore */ }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        pendingPhotoFile = null;
        pendingPhotoRemoved = true;
        if (input) input.value = '';
        setPhotoPreview('');
        setPhotoStatus('', '');
      });
    }
  }

  /* ---------- Form prep ---------- */

  function setBizSubmitLabel(text) {
    var labelEl = document.getElementById('biz-submit-label');
    if (labelEl) {
      labelEl.textContent = text;
    }
  }

  function setBizSubmitLoading(loading) {
    var submit = document.getElementById('bizSubmit');
    if (submit) submit.disabled = !!loading;
    if (loading) {
      setBizSubmitLabel(T('loading'));
    } else {
      setBizSubmitLabel(editMode ? T('save') : T('submit'));
    }
  }

  function setBizFormTitle(text) {
    var t = document.getElementById('biz-form-title');
    if (t) t.textContent = text;
  }

  function setBizCancelVisible(visible) {
    var c = document.getElementById('biz-edit-cancel');
    if (c) c.hidden = !visible;
  }

  function resetBizFormFields() {
    var f = document.getElementById('bizForm');
    if (f && typeof f.reset === 'function') f.reset();

    var about = document.getElementById('bizAbout');
    if (about) about.value = '';

    var cnt = document.getElementById('bizAboutCount');
    if (cnt) cnt.textContent = '0/300';

    var msg = document.getElementById('bizMsg');
    if (msg) {
      msg.hidden = true;
      msg.className = 'auth-msg';
      msg.textContent = '';
    }

    clearLinkRows();
  }

  function prepBizForm() {
    editMode = false;
    editBusinessId = null;

    setBizFormTitle(T('add_business'));
    setBizSubmitLabel(T('submit'));
    setBizCancelVisible(false);

    resetBizFormFields();
    resetPhotoUploader('');
    fillBizCategories();
    showOnlyBiz('bizFormView');

    setTimeout(function () {
      var n = document.getElementById('bizName');
      if (n) n.focus();
    }, 50);
  }

  function enterEditMode(bizData) {
    editMode = true;
    editBusinessId = bizData.id;

    setBizFormTitle(T('edit_business'));
    setBizSubmitLabel(T('save'));
    setBizCancelVisible(true);

    resetBizFormFields();
    resetPhotoUploader(photoUrlOf(bizData));
    fillBizCategories();

    var nameEl = document.getElementById('bizName');
    if (nameEl) nameEl.value = bizData.name || '';

    var catEl = document.getElementById('bizCategory');
    if (catEl && bizData.category_id != null) {
      catEl.value = String(bizData.category_id);
    }

    var areaEl = document.getElementById('bizArea');
    if (areaEl) areaEl.value = bizData.area || '';

    var addrEl = document.getElementById('bizAddress');
    if (addrEl) addrEl.value = bizData.address || '';

    var aboutEl = document.getElementById('bizAbout');
    if (aboutEl) aboutEl.value = bizData.about || '';
    var cnt = document.getElementById('bizAboutCount');
    if (cnt) {
      var aboutLen = (bizData.about ? String(bizData.about).length : 0);
      cnt.textContent = aboutLen + '/300';
    }

    var phoneEl = document.getElementById('bizPhone');
    if (phoneEl) phoneEl.value = bizData.phone || '';

    var waEl = document.getElementById('bizWhatsapp');
    if (waEl) waEl.value = bizData.whatsapp || '';

    var openEl = document.getElementById('biz-opening');
    if (openEl) openEl.value = bizData.opening_time || '';

    var closeEl = document.getElementById('biz-closing');
    if (closeEl) closeEl.value = bizData.closing_time || '';

    var offEl = document.getElementById('biz-weekly-off');
    if (offEl) offEl.value = bizData.weekly_off || '';

    var servEl = document.getElementById('biz-services');
    if (servEl) servEl.value = bizData.services || '';

    clearLinkRows();
    var links = bizData.links;
    if (Object.prototype.toString.call(links) === '[object Array]') {
      for (var i = 0; i < links.length && i < MAX_LINKS; i++) {
        var u = links[i];
        if (typeof u === 'string') {
          addLinkRow(u);
        } else if (u && typeof u.url === 'string') {
          addLinkRow(u.url);
        }
      }
    }

    var msg = document.getElementById('bizMsg');
    if (msg) {
      msg.hidden = true;
      msg.className = 'auth-msg';
      msg.textContent = '';
    }

    showOnlyBiz('bizFormView');

    setTimeout(function () {
      var n = document.getElementById('bizName');
      if (n) {
        try { n.focus(); } catch (e) {}
      }
    }, 50);
  }

  function exitEditMode() {
    if (!editMode) return;
    editMode = false;
    editBusinessId = null;

    setBizFormTitle(T('add_business'));
    setBizSubmitLabel(T('submit'));
    setBizCancelVisible(false);

    resetBizFormFields();
    resetPhotoUploader('');
  }

  function openEditBusiness() {
    if (!client || !currentUser || !myBusiness || !myBusiness.id) return;
    var id = myBusiness.id;

    showOnlyBiz('bizLoadingView');

    try {
      client.from('businesses')
        .select('id, category_id, name, about, address, area, phone, whatsapp, opening_time, closing_time, weekly_off, services, links, photo_url, photo_path')
        .eq('id', id)
        .maybeSingle()
        .then(function (res) {
          if (res && res.error) {
            // MISSING KEY: err_data_load
            showToast('Data load nahi hua, dobara try karo.');
            renderBizStatus();
            return;
          }
          if (!res || !res.data) {
            // MISSING KEY: err_business_missing
            showToast('Business nahi mila.');
            renderBizStatus();
            return;
          }
          enterEditMode(res.data);
        })
        .catch(function () {
          // MISSING KEY: err_data_load
          showToast('Data load nahi hua, dobara try karo.');
          renderBizStatus();
        });
    } catch (e) {
      showToast('Data load nahi hua, dobara try karo.');
      renderBizStatus();
    }
  }

  function openBusinessModal() {
    if (!client || !currentUser) {
      // MISSING KEY: err_login_required
      showToast('Pehle login karo.');
      return;
    }

    var modal = document.getElementById('businessModal');
    if (!modal) return;

    editMode = false;
    editBusinessId = null;

    lastFocusedEl = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');

    showOnlyBiz('bizLoadingView');

    try {
      client.from('businesses')
        .select('id, name, status')
        .eq('owner_id', currentUser.id)
        .maybeSingle()
        .then(function (res) {
          if (res && res.error) {
            console.warn('Business check fail hua, form dikha rahe hain.');
            prepBizForm();
            return;
          }
          if (res && res.data) {
            myBusiness = {
              id: res.data.id,
              name: cleanText(res.data.name || ''),
              status: res.data.status
            };
            renderBizStatus();
          } else {
            myBusiness = null;
            prepBizForm();
          }
        })
        .catch(function () {
          prepBizForm();
        });
    } catch (e) {
      prepBizForm();
    }
  }

  function renderBizStatus() {
    if (!myBusiness) return;

    var nameEl = document.getElementById('bizStatusName');
    var pill = document.getElementById('bizStatusPill');
    var textEl = document.getElementById('bizStatusText');
    var editBtn = document.getElementById('edit-business-btn');

    // Business name DB se hai - translate nahi karte
    if (nameEl) nameEl.textContent = cleanText(myBusiness.name || '');

    var status = myBusiness.status || 'pending';
    // MISSING KEY: status_pending
    var pillText = 'Review mein';
    var pillClass = 'status-pill pending';
    var text = T('pending_msg');

    if (status === 'published') {
      // MISSING KEY: status_live
      pillText = 'Live hai';
      pillClass = 'status-pill published';
      // MISSING KEY: status_live_text
      text = 'Aapka business Near-U pe live hai.';
    } else if (status === 'rejected') {
      // MISSING KEY: status_rejected
      pillText = 'Approve nahi hua';
      pillClass = 'status-pill rejected';
      // MISSING KEY: status_rejected_text
      text = 'Kuch details galat ho sakti hain. Aap edit karke dobara submit kar sakte hain.';
    } else if (status === 'suspended') {
      // MISSING KEY: status_suspended
      pillText = 'Roka gaya';
      pillClass = 'status-pill suspended';
      // MISSING KEY: status_suspended_text
      text = 'Aapka business abhi rok diya gaya hai. Aap edit kar sakte hain.';
    }

    if (pill) {
      pill.textContent = pillText;
      pill.className = pillClass;
    }
    if (textEl) textEl.textContent = text;

    if (editBtn) editBtn.hidden = false;

    showOnlyBiz('bizStatusView');
  }

  function closeBusinessModal() {
    var modal = document.getElementById('businessModal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    syncBodyModalClass();

    if (editMode) {
      exitEditMode();
    }

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      try { lastFocusedEl.focus(); } catch (e) {}
    }
    lastFocusedEl = null;
  }

  function cleanPhone(value) {
    var d = String(value || '').replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) {
      d = d.substring(2);
    } else if (d.length === 11 && d.charAt(0) === '0') {
      d = d.substring(1);
    }
    return d;
  }

  function isValidPhone(d) {
    return d.length === 10 && '6789'.indexOf(d.charAt(0)) !== -1;
  }

  function makeSlug(name) {
    var s = String(name || '').toLowerCase();
    s = s.replace(/[^a-z0-9]+/g, '-');
    s = s.replace(/^-+|-+$/g, '');
    s = s.substring(0, 40);
    if (!s) s = 'business';

    var chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    var suffix = '';
    for (var i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return s + '-' + suffix;
  }

  function timeOrNull(v) {
    var s = String(v || '').trim();
    if (!s) return null;
    return s;
  }

  function weeklyOffOrNull(v) {
    var s = String(v || '').trim();
    if (!s) return null;
    if (s === 'Koi off nahi') return null;
    return s;
  }

  function servicesOrNull(v) {
    var s = String(v || '').trim();
    if (!s) return null;
    var parts = s.split(',');
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      if (p) out.push(p);
    }
    if (!out.length) return null;
    return out.join(', ');
  }

  function handleBizSubmit(e) {
    e.preventDefault();

    var msg = document.getElementById('bizMsg');

    function setMsg(text, type) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'auth-msg ' + (type || 'error');
      msg.hidden = false;
    }
    function clearMsg() {
      if (!msg) return;
      msg.hidden = true;
      msg.className = 'auth-msg';
      msg.textContent = '';
    }

    clearMsg();

    var nameEl = document.getElementById('bizName');
    var catEl = document.getElementById('bizCategory');
    var areaEl = document.getElementById('bizArea');
    var addrEl = document.getElementById('bizAddress');
    var aboutEl = document.getElementById('bizAbout');
    var phoneEl = document.getElementById('bizPhone');
    var waEl = document.getElementById('bizWhatsapp');

    var name = (nameEl ? nameEl.value : '').trim();
    var catVal = catEl ? catEl.value : '';
    var area = (areaEl ? areaEl.value : '').trim();
    var address = (addrEl ? addrEl.value : '').trim();
    var about = (aboutEl ? aboutEl.value : '').trim();
    var phone = (phoneEl ? phoneEl.value : '').trim();
    var wa = (waEl ? waEl.value : '').trim();

    var openingEl = document.getElementById('biz-opening');
    var closingEl = document.getElementById('biz-closing');
    var weeklyOffEl = document.getElementById('biz-weekly-off');
    var servicesEl = document.getElementById('biz-services');

    var openingVal = timeOrNull(openingEl ? openingEl.value : '');
    var closingVal = timeOrNull(closingEl ? closingEl.value : '');
    var weeklyOffVal = weeklyOffOrNull(weeklyOffEl ? weeklyOffEl.value : '');
    var servicesVal = servicesOrNull(servicesEl ? servicesEl.value : '');

    var linkResult = collectLinks();
    if (linkResult.error) {
      setMsg(linkResult.error, 'error');
      return;
    }
    var linksVal = linkResult.links;

    // Validations
    if (name.length < 3 || name.length > 60) {
      // MISSING KEY: err_biz_name
      setMsg('Business ka naam 3 se 60 akshar ka likho.', 'error');
      return;
    }
    if (!catVal) {
      // MISSING KEY: err_biz_category
      setMsg('Category chuno.', 'error');
      return;
    }
    if (area.length < 2 || area.length > 40) {
      // MISSING KEY: err_biz_area
      setMsg('Area likho (jaise Station Road).', 'error');
      return;
    }
    var phoneDigits = cleanPhone(phone);
    if (!isValidPhone(phoneDigits)) {
      // MISSING KEY: err_biz_phone
      setMsg('Sahi 10 digit mobile number likho.', 'error');
      return;
    }
    var waDigits = '';
    if (wa) {
      waDigits = cleanPhone(wa);
      if (!isValidPhone(waDigits)) {
        // MISSING KEY: err_biz_whatsapp
        setMsg('WhatsApp ka sahi 10 digit number likho.', 'error');
        return;
      }
    } else {
      waDigits = phoneDigits;
    }

    var hasRealIds = false;
    for (var i = 0; i < categories.length; i++) {
      if (categories[i] && typeof categories[i].id === 'number' && !isNaN(categories[i].id)) {
        hasRealIds = true;
        break;
      }
    }
    if (!hasRealIds) {
      // MISSING KEY: err_categories_loading
      setMsg('Categories abhi load nahi hui, page refresh karo.', 'error');
      return;
    }

    if (!currentUser || !client) {
      // MISSING KEY: err_login_required
      setMsg('Pehle login karo.', 'error');
      return;
    }

    setBizSubmitLoading(true);

    function finish() {
      setBizSubmitLoading(false);
    }

    /* ---------- EDIT MODE ---------- */
    if (editMode && editBusinessId) {
      uploadPhotoIfAny().then(function (newPhotoUrl) {
        var updatePayload = {
          category_id: Number(catVal),
          name: name,
          about: about || null,
          address: address || null,
          area: area,
          phone: phoneDigits,
          whatsapp: waDigits,
          opening_time: openingVal,
          closing_time: closingVal,
          weekly_off: weeklyOffVal,
          services: servicesVal,
          links: linksVal
        };

        if (newPhotoUrl) {
          updatePayload.photo_url = newPhotoUrl;
        } else if (pendingPhotoRemoved) {
          updatePayload.photo_url = null;
        }

        return client.from('businesses')
          .update(updatePayload)
          .eq('id', editBusinessId)
          .then(function (res) {
            if (res && res.error) {
              var em = String(res.error.message || '').toLowerCase();
              var code = String(res.error.code || '');

              if (em.indexOf('row-level security') !== -1 || code === '42501') {
                // MISSING KEY: err_permission
                setMsg('Permission nahi mili. Logout karke dobara login karo.', 'error');
              } else if (em.indexOf('fetch') !== -1 || em.indexOf('network') !== -1) {
                // MISSING KEY: err_network
                setMsg('Internet check karo aur dobara try karo.', 'error');
              } else {
                // MISSING KEY: err_generic
                setMsg('Kuch gadbad ho gayi, dobara try karo.', 'error');
              }
              finish();
              return;
            }

            // MISSING KEY: toast_biz_saved
            showToast('Changes save ho gaye');

            client.from('businesses')
              .select('id, name, status')
              .eq('owner_id', currentUser.id)
              .maybeSingle()
              .then(function (r2) {
                if (r2 && r2.data) {
                  myBusiness = {
                    id: r2.data.id,
                    name: cleanText(r2.data.name || ''),
                    status: r2.data.status
                  };
                } else {
                  myBusiness = myBusiness || {};
                  myBusiness.name = name;
                }
                exitEditMode();
                renderBizStatus();
                finish();
              })
              .catch(function () {
                myBusiness = myBusiness || {};
                myBusiness.name = name;
                exitEditMode();
                renderBizStatus();
                finish();
              });
          })
          .catch(function () {
            // MISSING KEY: err_network
            setMsg('Internet check karo aur dobara try karo.', 'error');
            finish();
          });
      }).catch(function () {
        // MISSING KEY: upload_failed
        setMsg(T('upload_failed', 'Photo upload nahi hui, dobara try karo.'), 'error');
        finish();
      });
      return;
    }

    /* ---------- ADD MODE ---------- */
    function doInsert(attempt) {
      uploadPhotoIfAny().then(function (photoUrl) {
        var payload = {
          owner_id: currentUser.id,
          category_id: Number(catVal),
          name: name,
          slug: makeSlug(name),
          about: about || null,
          address: address || null,
          area: area,
          phone: phoneDigits,
          whatsapp: waDigits,
          status: 'pending',
          opening_time: openingVal,
          closing_time: closingVal,
          weekly_off: weeklyOffVal,
          services: servicesVal,
          links: linksVal
        };
        if (photoUrl) payload.photo_url = photoUrl;

        client.from('businesses').insert(payload).then(function (res) {
          if (res && res.error) {
            var em = String(res.error.message || '').toLowerCase();
            var code = String(res.error.code || '');

            if (em.indexOf('businesses_slug_key') !== -1 && attempt < 2) {
              doInsert(attempt + 1);
              return;
            }

            if (em.indexOf('one_business_per_owner') !== -1 ||
                (em.indexOf('duplicate key') !== -1 && em.indexOf('owner') !== -1)) {
              client.from('businesses')
                .select('id, name, status')
                .eq('owner_id', currentUser.id)
                .maybeSingle()
                .then(function (r2) {
                  if (r2 && r2.data) {
                    myBusiness = { id: r2.data.id, name: cleanText(r2.data.name || ''), status: r2.data.status };
                    renderBizStatus();
                  } else {
                    // MISSING KEY: err_generic
                    setMsg('Kuch gadbad ho gayi, dobara try karo.', 'error');
                  }
                  finish();
                })
                .catch(function () {
                  setMsg('Kuch gadbad ho gayi, dobara try karo.', 'error');
                  finish();
                });
              return;
            }

            if (em.indexOf('row-level security') !== -1 || code === '42501') {
              setMsg('Permission nahi mili. Logout karke dobara login karo.', 'error');
              finish();
              return;
            }

            if (em.indexOf('fetch') !== -1 || em.indexOf('network') !== -1) {
              setMsg('Internet check karo aur dobara try karo.', 'error');
              finish();
              return;
            }

            setMsg('Kuch gadbad ho gayi, dobara try karo.', 'error');
            finish();
            return;
          }

          myBusiness = { name: name, status: 'pending' };
          showOnlyBiz('bizDoneView');
          finish();
        }).catch(function () {
          setMsg('Internet check karo aur dobara try karo.', 'error');
          finish();
        });
      }).catch(function () {
        setMsg(T('upload_failed', 'Photo upload nahi hui, dobara try karo.'), 'error');
        finish();
      });
    }

    doInsert(0);
  }

  /* ============================================================
     P) Categories panel
     ============================================================ */

  function renderCatPanel() {
    var grid = document.getElementById('nuCatGrid');
    if (!grid) return;

    var sorted = sortCategories(categories);
    var html = '';

    for (var i = 0; i < sorted.length; i++) {
      // Category name DB se hai - translate nahi karte
      var name = cleanText(sorted[i].name || '');
      var active = (activeCategory === name) ? ' active' : '';
      html += ''
        + '<button class="nu-cat-tile' + active + '" type="button" data-cat="' + escapeHTML(name) + '">'
        +   '<span class="nu-cat-tile-name">' + escapeHTML(name) + '</span>'
        + '</button>';
    }
    grid.innerHTML = html;
  }

  function positionCatSheet() {
    var sheet = document.getElementById('nuCatSheet');
    var btn = document.getElementById('nuCatOpen');
    if (!sheet || !btn) return;

    var isDesktop = window.innerWidth >= 768;

    if (!isDesktop) {
      sheet.style.left = '';
      sheet.style.top = '';
      sheet.style.width = '';
      sheet.style.maxHeight = '';
      return;
    }

    var rect = btn.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var sheetWidth = 460;
    if (sheetWidth > vw - 32) sheetWidth = vw - 32;

    var left = rect.right - sheetWidth;
    if (left < 16) left = 16;
    if (left + sheetWidth > vw - 16) left = vw - 16 - sheetWidth;

    var top = rect.bottom + 8;
    var maxH = vh - top - 16;
    if (maxH > vh * 0.64) maxH = vh * 0.64;
    if (maxH < 160) {
      top = 16;
      maxH = vh * 0.64;
    }

    sheet.style.left = left + 'px';
    sheet.style.top = top + 'px';
    sheet.style.width = sheetWidth + 'px';
    sheet.style.maxHeight = maxH + 'px';
  }

  function openCatPanel() {
    var panel = document.getElementById('nuCatPanel');
    var btn = document.getElementById('nuCatOpen');
    if (!panel || !btn) return;

    renderCatPanel();
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');

    positionCatSheet();

    if (window.innerWidth < 768) {
      document.body.classList.add('nu-cat-lock');
    }

    setTimeout(function () {
      var closeBtn = document.getElementById('nuCatClose');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function closeCatPanel() {
    var panel = document.getElementById('nuCatPanel');
    var btn = document.getElementById('nuCatOpen');
    if (!panel || panel.hidden) return;

    panel.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');

    document.body.classList.remove('nu-cat-lock');

    var sheet = document.getElementById('nuCatSheet');
    if (sheet) {
      sheet.style.left = '';
      sheet.style.top = '';
      sheet.style.width = '';
      sheet.style.maxHeight = '';
    }
  }

  function selectCategory(name) {
    activeCategory = name || '';
    currentQuery = '';

    var input = document.getElementById('searchInput');
    if (input) input.value = '';

    closeCatPanel();
    runSearch('', true);
  }

  /* ============================================================
     Q) Buttons / binds
     ============================================================ */

  function handleAddBusinessClick() {
    if (!currentUser) {
      pendingIntent = 'business';
      openAuthModal({
        mode: 'signup',
        // MISSING KEY: auth_intent_business
        message: 'Apna business add karne ke liye pehle account banao ya login karo.'
      });
      return;
    }
    openBusinessModal();
  }

  function bindBottomNav() {
    var nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var btn = e.target;
      while (btn && btn !== nav) {
        if (btn.classList && btn.classList.contains('bottom-nav-item')) break;
        btn = btn.parentNode;
      }
      if (!btn || btn === nav) return;

      var items = nav.querySelectorAll('.bottom-nav-item');
      for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
      btn.classList.add('active');

      var action = btn.getAttribute('data-nav');

      if (action === 'home') {
        try {
          window.scrollTo({ top: 0, behavior: scrollBehavior() });
        } catch (err) {
          window.scrollTo(0, 0);
        }
      } else if (action === 'categories') {
        openCatPanel();
      } else if (action === 'business') {
        handleAddBusinessClick();
      } else if (action === 'profile') {
        openAuthModal({ mode: 'login' });
        var homeBtn = nav.querySelector('[data-nav="home"]');
        if (homeBtn) {
          for (var j = 0; j < items.length; j++) items[j].classList.remove('active');
          homeBtn.classList.add('active');
        }
      }
    });
  }

  function bindSearchEvents() {
    var btn = document.getElementById('searchBtn');
    var input = document.getElementById('searchInput');

    if (btn) {
      btn.addEventListener('click', function () {
        activeCategory = '';
        runSearch(input ? input.value : '', true);
      });
    }
    if (input) {
      input.addEventListener('keydown', function (e) {
        var key = e.key || '';
        if (key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          activeCategory = '';
          runSearch(input.value, true);
        }
      });
    }
  }

  function bindCatPanelEvents() {
    var openBtn = document.getElementById('nuCatOpen');
    var closeBtn = document.getElementById('nuCatClose');
    var overlay = document.getElementById('nuCatOverlay');
    var grid = document.getElementById('nuCatGrid');
    var clearBtn = document.getElementById('nuCatClear');

    if (openBtn) {
      openBtn.addEventListener('click', function () {
        var panel = document.getElementById('nuCatPanel');
        if (!panel) return;
        if (panel.hidden) {
          openCatPanel();
        } else {
          closeCatPanel();
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeCatPanel);
    if (overlay) overlay.addEventListener('click', closeCatPanel);

    if (grid) {
      grid.addEventListener('click', function (e) {
        var t = e.target;
        while (t && t !== grid) {
          if (t.classList && t.classList.contains('nu-cat-tile')) break;
          t = t.parentNode;
        }
        if (!t || t === grid) return;

        var name = t.getAttribute('data-cat') || '';
        if (!name) return;
        selectCategory(name);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        activeCategory = '';
        currentQuery = '';
        var input = document.getElementById('searchInput');
        if (input) input.value = '';
        runSearch('', true);
      });
    }

    window.addEventListener('resize', function () {
      var panel = document.getElementById('nuCatPanel');
      if (panel && !panel.hidden) positionCatSheet();
    });
  }

  function bindBusinessButtons() {
    var addBtn = document.getElementById('addBusinessBtn');
    if (addBtn) addBtn.addEventListener('click', handleAddBusinessClick);

    var listBtn = document.getElementById('listBusinessBtn');
    if (listBtn) listBtn.addEventListener('click', handleAddBusinessClick);
  }

  function bindAuthModalEvents() {
    var close = document.getElementById('authClose');
    if (close) close.addEventListener('click', closeAuthModal);

    var backdrop = document.getElementById('authBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeAuthModal);

    var tabLogin = document.getElementById('tabLogin');
    if (tabLogin) tabLogin.addEventListener('click', function () { setAuthMode('login'); });

    var tabSignup = document.getElementById('tabSignup');
    if (tabSignup) tabSignup.addEventListener('click', function () { setAuthMode('signup'); });

    var toggle = document.getElementById('togglePassword');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var pwd = document.getElementById('authPassword');
        if (!pwd) return;
        if (pwd.type === 'password') {
          pwd.type = 'text';
          // MISSING KEY: auth_eye_hide
          toggle.setAttribute('aria-label', T('auth_eye_hide', 'Password chhupao'));
          setEyeIcon(true);
        } else {
          pwd.type = 'password';
          // MISSING KEY: auth_eye_show
          toggle.setAttribute('aria-label', T('auth_eye_show', 'Password dikhao'));
          setEyeIcon(false);
        }
      });
    }

    var emailInput = document.getElementById('authEmail');
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        clearEmailHint();
      });
    }

    var logout = document.getElementById('logoutBtn');
    if (logout) {
      logout.addEventListener('click', function () {
        if (!client) { closeAuthModal(); return; }
        client.auth.signOut()
          .then(function () {
            currentUser = null;
            myBusiness = null;
            editMode = false;
            editBusinessId = null;
            updateAuthUI();
            closeAuthModal();
            // MISSING KEY: toast_logout
            showToast('Logout ho gaya. Phir milenge!');
          })
          .catch(function () {
            closeAuthModal();
          });
      });
    }

    var loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        openAuthModal({ mode: 'login' });
      });
    }

    // Google login
    var googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) googleBtn.addEventListener('click', handleGoogleLogin);

    // Forgot password
    var forgotBtn = document.getElementById('forgotPasswordBtn');
    if (forgotBtn) forgotBtn.addEventListener('click', handleForgotPassword);

    // Delete account
    var deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteAccount);
  }

  function bindBusinessModalEvents() {
    var close = document.getElementById('bizClose');
    if (close) close.addEventListener('click', closeBusinessModal);

    var backdrop = document.getElementById('bizBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeBusinessModal);

    var doneBtn = document.getElementById('bizDoneBtn');
    if (doneBtn) doneBtn.addEventListener('click', closeBusinessModal);

    var statusClose = document.getElementById('bizStatusCloseBtn');
    if (statusClose) statusClose.addEventListener('click', closeBusinessModal);

    var about = document.getElementById('bizAbout');
    if (about) {
      about.addEventListener('input', function () {
        var cnt = document.getElementById('bizAboutCount');
        if (cnt) cnt.textContent = about.value.length + '/300';
      });
    }

    var editBtn = document.getElementById('edit-business-btn');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        openEditBusiness();
      });
    }

    var cancelBtn = document.getElementById('biz-edit-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        exitEditMode();
        renderBizStatus();
      });
    }
  }

  function bindUpdatesModalEvents() {
    var okBtn = document.getElementById('updates-ok-btn');
    if (okBtn) okBtn.addEventListener('click', closeUpdatesModal);

    var closeBtn = document.getElementById('updatesClose');
    if (closeBtn) closeBtn.addEventListener('click', closeUpdatesModal);

    var backdrop = document.getElementById('updatesBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeUpdatesModal);
  }

  function bindEscapeKey() {
    document.addEventListener('keydown', function (e) {
      var key = e.key || '';
      if (key !== 'Escape' && e.keyCode !== 27) return;

      var cp = document.getElementById('nuCatPanel');
      if (cp && !cp.hidden) { closeCatPanel(); return; }

      var um = document.getElementById('updates-modal');
      if (um && !um.hidden) { closeUpdatesModal(); return; }

      var bm = document.getElementById('businessModal');
      if (bm && !bm.hidden) { closeBusinessModal(); return; }

      var am = document.getElementById('authModal');
      if (am && !am.hidden) { closeAuthModal(); }
    });
  }

  function bindForms() {
    var authForm = document.getElementById('authForm');
    if (authForm) authForm.addEventListener('submit', handleAuthSubmit);

    var bizForm = document.getElementById('bizForm');
    if (bizForm) bizForm.addEventListener('submit', handleBizSubmit);
  }

  /* ============================================================
     R) Updates modal
     ============================================================ */

  var UPDATES_SEEN_KEY = 'nearu_updates_seen_v1';
  var updatesCheckInFlight = false;

  function hasSeenUpdates() {
    try {
      return localStorage.getItem(UPDATES_SEEN_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markUpdatesSeen() {
    try {
      localStorage.setItem(UPDATES_SEEN_KEY, '1');
    } catch (e) {
      // storage fail, chalta hai
    }
  }

  function showUpdatesModal() {
    var modal = document.getElementById('updates-modal');
    if (!modal || !modal.hidden) return;

    modal.hidden = false;
    document.body.classList.add('modal-open');

    setTimeout(function () {
      var okBtn = document.getElementById('updates-ok-btn');
      if (okBtn) {
        try { okBtn.focus(); } catch (e) {}
      }
    }, 50);
  }

  function closeUpdatesModal() {
    var modal = document.getElementById('updates-modal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    markUpdatesSeen();
    syncBodyModalClass();
  }

  function maybeShowUpdatesModal() {
    if (!currentUser) return;
    if (!client) return;
    if (updatesCheckInFlight) return;
    if (hasSeenUpdates()) return;

    updatesCheckInFlight = true;

    try {
      client.from('businesses')
        .select('id')
        .eq('owner_id', currentUser.id)
        .maybeSingle()
        .then(function (res) {
          updatesCheckInFlight = false;
          if (!currentUser) return;
          if (!res || !res.data) return;
          if (hasSeenUpdates()) return;
          showUpdatesModal();
        })
        .catch(function () {
          updatesCheckInFlight = false;
        });
    } catch (e) {
      updatesCheckInFlight = false;
    }
  }

  /* ============================================================
     S) Language change handler
     ============================================================ */

  function refreshModalTextsIfOpen() {
    // Auth modal: title, submit button, forgot link
    var am = document.getElementById('authModal');
    if (am && !am.hidden) {
      var formView = document.getElementById('authFormView');
      if (formView && !formView.hidden) {
        var submit = document.getElementById('authSubmit');
        var title = document.getElementById('authTitle');
        if (authMode === 'login') {
          if (submit && !submit.disabled) submit.textContent = T('login');
          if (title) title.textContent = 'Near-U mein login karo';
        } else {
          if (submit && !submit.disabled) submit.textContent = T('signup');
          if (title) title.textContent = 'Naya account banao';
        }
      }
    }

    // Business modal: status view
    var bm = document.getElementById('businessModal');
    if (bm && !bm.hidden && myBusiness) {
      var sv = document.getElementById('bizStatusView');
      if (sv && !sv.hidden) {
        renderBizStatus();
      }
    }
  }

  function refreshTexts() {
    updateAuthUI();
    updateTrendingHeading();
    updateTrendingSub();
    refreshModalTextsIfOpen();
    applyLangSafe();
  }

  // Re-render from in-memory data (no Supabase call)
  function rerenderFromMemory() {
    renderCatPanel();

    if (bizRendered) {
      // runSearch current state ke hisaab se dobara list render karta hai
      var noRes = document.getElementById('noResults');
      var wrap = document.getElementById('trendingList');
      var list;

      if (activeCategory) {
        list = filterByCategory(activeCategory);
      } else {
        list = getFiltered(currentQuery);
      }

      if (list.length === 0) {
        if (wrap) wrap.innerHTML = '';
        if (noRes) {
          if (activeCategory || currentQuery.trim() !== '') {
            noRes.textContent = T('no_results');
            noRes.hidden = false;
          } else {
            noRes.hidden = true;
          }
        }
      } else {
        if (noRes) noRes.hidden = true;
        renderBusinesses(list);
      }
    }

    refreshTexts();
  }

  window.addEventListener('nu-lang-changed', function () {
    restartPlaceholderRotation();
    rerenderFromMemory();
  });

  /* ============================================================
     T) Init
     ============================================================ */

  function init() {
    categories = FALLBACK_CATEGORIES.slice();
    renderCatPanel();

    renderSkeletons();
    startPlaceholderRotation();

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    setupReveal();
    setAuthMode('login');
    initAuth();

    bindAuthModalEvents();
    bindBusinessModalEvents();
    bindUpdatesModalEvents();
    bindEscapeKey();
    bindSearchEvents();
    bindCatPanelEvents();
    bindBusinessButtons();
    bindBottomNav();
    bindForms();
    setupBizLinks();
    setupBizPhoto();

    updateTrendingHeading();
    updateTrendingSub();

    fetchCategories();
    fetchBusinesses();

    setTimeout(function () {
      if (!bizFetchDone) {
        if (!bizRendered) {
          allBusinesses = SAMPLE_BUSINESSES.slice();
          trendingSubMode = 'sample';
          updateTrendingSub();
          bizRendered = true;
          runSearch(currentQuery, false);
        }
      }
    }, 4000);
  }

  init();

})();
