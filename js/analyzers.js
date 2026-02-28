/* =====================================================
   ANALYZERS - 31 checks across 9 categories
===================================================== */
const Analyzers = {

  /* META TAGS */
  chkTitle(doc) {
    const txt = doc.querySelector('title')?.textContent?.trim() || '';
    const n = txt.length;
    return {
      id: 'title', name: 'Title Tag', cat: 'Meta Tags', w: 15,
      status: !txt ? 'fail' : n < 30 || n > 60 ? 'warn' : 'pass',
      value: txt || '(missing)',
      rec: !txt
        ? 'No title tag found. Add <code>&lt;title&gt;Your Page Title&lt;/title&gt;</code> inside <code>&lt;head&gt;</code>. This is the single most important on-page SEO element.'
        : n < 30 ? `Title is too short (<strong>${n} chars</strong>). Target <strong>50-60 characters</strong> to maximise SERP real estate.`
        : n > 60 ? `Title is too long (<strong>${n} chars</strong>). Anything over ~60 chars gets truncated in search results. Trim it down.`
        : `Optimal title length at <strong>${n} characters</strong>. Well within the 50-60 char sweet spot.`
    };
  },

  chkMetaDesc(doc) {
    const txt = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const n = txt.length;
    return {
      id: 'desc', name: 'Meta Description', cat: 'Meta Tags', w: 10,
      status: !txt ? 'fail' : n < 70 || n > 160 ? 'warn' : 'pass',
      value: txt ? txt.substring(0, 110) + (txt.length > 110 ? '...' : '') : '(missing)',
      rec: !txt
        ? 'No meta description found. Without one Google auto-generates a snippet - often badly. Add a 150-160 char summary with a clear call-to-action.'
        : n < 70 ? `Too short (<strong>${n} chars</strong>). Expand to 150-160 chars. A longer, compelling description improves click-through rate.`
        : n > 160 ? `Too long (<strong>${n} chars</strong>). Truncated in SERPs beyond ~160 chars. Trim to keep the key message visible.`
        : `Good meta description at <strong>${n} characters</strong>.`
    };
  },

  chkViewport(doc) {
    const v = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const ok = v.includes('width=device-width') && v.includes('initial-scale=1');
    return {
      id: 'viewport', name: 'Viewport Meta Tag', cat: 'Meta Tags', w: 8,
      status: !v ? 'fail' : ok ? 'pass' : 'warn',
      value: v || '(missing)',
      rec: !v
        ? 'Missing viewport tag - your site will render incorrectly on mobile. Add: <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code>'
        : !ok ? 'Viewport tag is incomplete. Use exactly: <code>content="width=device-width, initial-scale=1"</code>'
        : 'Viewport correctly set for responsive, mobile-first rendering.'
    };
  },

  chkCanonical(doc) {
    const href = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || '';
    return {
      id: 'canonical', name: 'Canonical URL', cat: 'Meta Tags', w: 7,
      status: href ? 'pass' : 'warn',
      value: href || '(not declared)',
      rec: !href
        ? 'No canonical tag. Add <code>&lt;link rel="canonical" href="https://yoursite.com/page/"&gt;</code> to prevent duplicate content issues and consolidate link equity across similar URLs.'
        : 'Canonical set - tells Google which URL is the authoritative version.'
    };
  },

  chkRobots(doc) {
    const c = doc.querySelector('meta[name="robots"]')?.getAttribute('content')?.trim().toLowerCase() || '';
    const noindex = c.includes('noindex');
    return {
      id: 'robots', name: 'Robots Meta Tag', cat: 'Meta Tags', w: 6,
      status: !c ? 'info' : noindex ? 'warn' : 'pass',
      value: c || '(not set - defaults to index, follow)',
      rec: !c
        ? 'No robots meta tag. Pages default to <em>index, follow</em>. Only add one if you need to restrict indexing or link-following.'
        : noindex ? '<strong>This page is set to noindex!</strong> Search engines will NOT index it. If unintentional, remove the noindex directive immediately.'
        : `Robots directive: <strong>${c}</strong>. Looks correct.`
    };
  },

  chkCharset(doc) {
    const cs = doc.querySelector('meta[charset]')?.getAttribute('charset') || doc.querySelector('meta[http-equiv="Content-Type"]')?.getAttribute('content') || '';
    const ok = /utf-?8/i.test(cs);
    return {
      id: 'charset', name: 'Character Encoding', cat: 'Meta Tags', w: 4,
      status: !cs ? 'warn' : ok ? 'pass' : 'warn',
      value: cs || '(not declared)',
      rec: !cs
        ? 'No charset declared. Add <code>&lt;meta charset="UTF-8"&gt;</code> as the <em>very first</em> element in <code>&lt;head&gt;</code> to prevent mojibake encoding issues.'
        : ok ? 'UTF-8 encoding declared - correct for all international characters.'
        : `Non-UTF-8 charset (${cs}). UTF-8 is strongly recommended for global compatibility.`
    };
  },

  chkLang(doc) {
    const lang = doc.documentElement?.getAttribute('lang') || '';
    return {
      id: 'lang', name: 'HTML Lang Attribute', cat: 'Meta Tags', w: 5,
      status: lang ? 'pass' : 'warn',
      value: lang || '(not set)',
      rec: !lang
        ? 'No <code>lang</code> on <code>&lt;html&gt;</code>. Add it for WCAG accessibility compliance and to help search engines target the correct audience. E.g. <code>&lt;html lang="en"&gt;</code>'
        : `Language declared as <strong>"${lang}"</strong> - aids screen readers and geo-targeting.`
    };
  },

  chkMetaKeywords(doc) {
    const kw = doc.querySelector('meta[name="keywords"]')?.getAttribute('content')?.trim() || '';
    return {
      id: 'keywords', name: 'Meta Keywords', cat: 'Meta Tags', w: 2,
      status: kw ? 'info' : 'pass',
      value: kw ? kw.substring(0, 80) + (kw.length > 80 ? '...' : '') : '(not present - correct)',
      rec: kw
        ? 'Meta keywords are present but <strong>ignored by Google since 2009</strong>. They may give competitors insight into your target keywords. Consider removing them.'
        : 'No meta keywords tag - correct. Google and most modern search engines ignore this tag.'
    };
  },

  /* OPEN GRAPH */
  chkOG(doc) {
    const g = p => doc.querySelector(`meta[property="og:${p}"]`)?.getAttribute('content')?.trim() || '';
    const t = g('title'), d = g('description'), i = g('image'), u = g('url'), ty = g('type');
    const n = [t, d, i, u, ty].filter(Boolean).length;
    const missing = [!t && 'og:title', !d && 'og:description', !i && 'og:image', !u && 'og:url', !ty && 'og:type'].filter(Boolean);
    return {
      id: 'og', name: 'Open Graph Tags', cat: 'Open Graph', w: 8,
      status: n === 0 ? 'fail' : n < 4 ? 'warn' : 'pass',
      value: n > 0 ? `${n}/5 tags present${t ? ` - title: "${t.substring(0, 35)}${t.length > 35 ? '...' : ''}"` : ''}` : '(none found)',
      rec: n === 0
        ? 'No Open Graph tags found. Every shared link on Facebook, LinkedIn, and Slack will appear as plain text. Add <code>og:title</code>, <code>og:description</code>, <code>og:image</code>, <code>og:url</code> at minimum.'
        : n < 4 ? `Only <strong>${n}/5</strong> OG tags. Missing: <strong>${missing.join(', ')}</strong>. Add these for complete social sharing support.`
        : `All ${n} core OG tags present. Pages will generate rich social previews.`
    };
  },

  chkOGImage(doc) {
    const img = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const isAbs = img.startsWith('http');
    return {
      id: 'ogImg', name: 'OG Image', cat: 'Open Graph', w: 5,
      status: !img ? 'fail' : !isAbs ? 'warn' : 'pass',
      value: img || '(missing)',
      rec: !img
        ? 'No og:image. Posts without images receive ~3x fewer social media clicks. Use a 1200x630px image.'
        : !isAbs ? 'og:image must be an absolute URL (starting with https://). Relative paths fail on social platforms.'
        : 'og:image is set with an absolute URL. Ideal size: 1200x630px, under 8MB.'
    };
  },

  /* TWITTER CARDS */
  chkTwitter(doc) {
    const tw = n => doc.querySelector(`meta[name="twitter:${n}"]`)?.getAttribute('content')?.trim() || '';
    const card = tw('card'), title = tw('title'), desc = tw('description'), img = tw('image'), site = tw('site');
    const n = [card, title, desc, img].filter(Boolean).length;
    return {
      id: 'twitter', name: 'Twitter Card Tags', cat: 'Twitter Cards', w: 5,
      status: n === 0 ? 'warn' : !card ? 'warn' : 'pass',
      value: card ? `type="${card}" - ${n}/4 tags` : `(${n}/4 tags - no card type)`,
      rec: n === 0
        ? 'No Twitter Card tags. Add <code>twitter:card</code>, <code>twitter:title</code>, <code>twitter:description</code>, <code>twitter:image</code> for rich previews on X (Twitter).'
        : !card ? 'Missing <code>twitter:card</code> type. Add <code>content="summary_large_image"</code> for the best visual engagement on X.'
        : `Card type: <strong>${card}</strong>. ${n}/4 tags. ${site ? `Site handle: ${site}.` : ''} ${n < 4 ? 'Add missing tags for full coverage.' : ''}`
    };
  },

  /* CONTENT STRUCTURE */
  chkH1(doc) {
    const h1s = [...doc.querySelectorAll('h1')];
    return {
      id: 'h1', name: 'H1 Tag', cat: 'Content Structure', w: 12,
      status: h1s.length === 0 ? 'fail' : h1s.length > 1 ? 'warn' : 'pass',
      value: h1s.length === 0 ? '(none found)' : h1s.map(h => `"${h.textContent.trim().substring(0, 60)}"`).join(' / '),
      rec: h1s.length === 0
        ? 'No H1 tag found. Every page needs exactly one H1 - it is the primary heading signal for search engines. Make it match the page\'s core topic.'
        : h1s.length > 1 ? `<strong>${h1s.length} H1 tags found.</strong> Use exactly one H1 per page. Multiple H1s dilute heading hierarchy.`
        : 'Single, correctly-used H1. Strong on-page signal.'
    };
  },

  chkHeadings(doc) {
    const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const headings = [];
    tags.forEach(t => {
      doc.querySelectorAll(t).forEach(el => {
        const tx = el.textContent.trim();
        if (tx) headings.push({ tag: t.toUpperCase(), text: tx.substring(0, 75) });
      });
    });
    const counts = {};
    headings.forEach(h => { counts[h.tag] = (counts[h.tag] || 0) + 1; });
    const summary = Object.entries(counts).map(([t, n]) => `${t}(${n})`).join(' - ');
    let skipWarn = false;
    const usedLevels = tags.filter(t => counts[t.toUpperCase()]);
    for (let i = 1; i < usedLevels.length; i++) {
      if (parseInt(usedLevels[i][1]) - parseInt(usedLevels[i - 1][1]) > 1) { skipWarn = true; break; }
    }
    return {
      id: 'headings', name: 'Heading Hierarchy (H1-H6)', cat: 'Content Structure', w: 7,
      status: headings.length === 0 ? 'fail' : headings.length < 2 || skipWarn ? 'warn' : 'pass',
      value: summary || '(no headings found)',
      rec: headings.length === 0
        ? 'No heading tags found. Structure your content with H1-H6 headings so search engines and users can understand your content outline.'
        : headings.length < 2 ? `Only ${headings.length} heading found. Add H2/H3 subheadings to break up content into scannable sections.`
        : skipWarn ? 'Heading levels skip numbers (e.g. H1 then H3). Maintain sequential order for a clean, logical hierarchy.'
        : `Heading structure: ${summary}. Logical hierarchy found.`,
      extra: { headings: headings.slice(0, 18) }
    };
  },

  chkContent(doc) {
    const clone = doc.body?.cloneNode(true);
    if (!clone) return { id: 'content', name: 'Content Length', cat: 'Content Structure', w: 5, status: 'fail', value: '(no body)', rec: 'Page has no body content.' };
    clone.querySelectorAll('script,style,nav,header,footer,aside').forEach(el => el.remove());
    const words = (clone.textContent || '').replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 2).length;
    return {
      id: 'content', name: 'Content Length', cat: 'Content Structure', w: 6,
      status: words < 100 ? 'fail' : words < 300 ? 'warn' : 'pass',
      value: `~${words.toLocaleString()} words`,
      rec: words < 100 ? `<strong>Thin content</strong> (~${words} words). Pages with very little text rarely rank. Target at least 300 quality words.`
        : words < 300 ? `Moderate content (~${words} words). For competitive keywords, aim for 600+ words of substantive, helpful content.`
        : `Good content length (~${words.toLocaleString()} words).`
    };
  },

  chkLinks(doc) {
    const all = [...doc.querySelectorAll('a[href]')];
    // FIX: Correctly categorise protocol-relative URLs (//) as external
    const internal = all.filter(l => {
      const h = l.getAttribute('href') || '';
      return !h.startsWith('http') && !h.startsWith('//');
    });
    const external = all.filter(l => {
      const h = l.getAttribute('href') || '';
      return h.startsWith('http') || h.startsWith('//');
    });
    const emptyAnchor = all.filter(l => !l.textContent.trim() && !l.querySelector('img[alt]')).length;
    return {
      id: 'links', name: 'Link Analysis', cat: 'Content Structure', w: 4,
      status: all.length === 0 ? 'warn' : emptyAnchor > 3 ? 'warn' : 'pass',
      value: `${all.length} total - ${internal.length} internal - ${external.length} external - ${emptyAnchor} empty anchor`,
      rec: all.length === 0 ? 'No links found. Internal links are essential for crawlability and distributing PageRank across your site.'
        : emptyAnchor > 3 ? `${emptyAnchor} links have empty anchor text. Descriptive anchor text helps both users and search engines understand what a link leads to.`
        : `${internal.length} internal links, ${external.length} external links.`
    };
  },

  chkReadingLevel(doc) {
    const clone = doc.body?.cloneNode(true);
    if (!clone) return { id: 'readability', name: 'Readability', cat: 'Content Structure', w: 3, status: 'info', value: '(no body)', rec: '' };
    clone.querySelectorAll('script,style,nav,header,footer,aside,code').forEach(el => el.remove());
    const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const syllables = text.split(/\s+/).reduce((n, w) => {
      return n + Math.max(1, (w.toLowerCase().replace(/[^a-z]/g, '').match(/[aeiou]+/g) || []).length);
    }, 0);
    if (words < 50) return { id: 'readability', name: 'Readability', cat: 'Content Structure', w: 3, status: 'info', value: 'Not enough text to measure', rec: 'Add more content to enable readability analysis.' };
    const fk = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
    const score = Math.max(0, Math.min(100, fk));
    const grade = score >= 70 ? 'Easy to read (great for most audiences)' : score >= 50 ? 'Standard/moderate' : score >= 30 ? 'Difficult - consider simplifying' : 'Very difficult - academic level';
    return {
      id: 'readability', name: 'Readability (Flesch)', cat: 'Content Structure', w: 3,
      status: score >= 50 ? 'pass' : score >= 30 ? 'warn' : 'info',
      value: `Flesch score: ${score}/100 - ${grade}`,
      rec: score >= 60
        ? `Good readability (${score}/100). Content is accessible to a general audience.`
        : `Readability score is ${score}/100. Consider shorter sentences, simpler vocabulary, and more paragraph breaks to improve comprehension and time-on-page.`
    };
  },

  /* TECHNICAL SEO */
  chkHTTPS(url) {
    const secure = url.startsWith('https://');
    return {
      id: 'https', name: 'HTTPS / SSL', cat: 'Technical SEO', w: 10,
      status: secure ? 'pass' : 'fail',
      value: secure ? 'Secure (HTTPS)' : 'Insecure (HTTP)',
      rec: secure ? 'HTTPS confirmed - a Google ranking signal and trust baseline.'
        : '<strong>Critical: Site uses HTTP.</strong> Google penalises HTTP sites, browsers show "Not Secure" warnings. Migrate to HTTPS immediately.'
    };
  },

  chkSchema(doc) {
    const jld = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    const micro = doc.querySelectorAll('[itemscope]').length;
    const types = [];
    jld.forEach(s => {
      try {
        const d = JSON.parse(s.textContent);
        const t = d['@type'] || (d['@graph'] && d['@graph'].map(x => x['@type']).filter(Boolean).join(','));
        if (t) types.push(t);
      } catch (_e) { /* invalid JSON-LD */ }
    });
    const total = jld.length + micro;
    return {
      id: 'schema', name: 'Structured Data / Schema', cat: 'Technical SEO', w: 8,
      status: total === 0 ? 'warn' : 'pass',
      value: total === 0 ? '(none detected)' : `${jld.length} JSON-LD${micro > 0 ? `, ${micro} Microdata` : ''}${types.length ? ` - Types: ${types.join(', ')}` : ''}`,
      rec: total === 0
        ? 'No schema markup found. Structured data enables rich results in Google Search (ratings, FAQs, breadcrumbs) - a significant CTR booster. Use JSON-LD format.'
        : `Schema detected: <strong>${types.join(', ') || 'JSON-LD blocks'}</strong>. Validate at <code>schema.org/validator</code>.`
    };
  },

  chkFavicon(doc) {
    const fav = doc.querySelector('link[rel*="icon"]') || doc.querySelector('link[rel="shortcut icon"]');
    return {
      id: 'favicon', name: 'Favicon', cat: 'Technical SEO', w: 3,
      status: fav ? 'pass' : 'warn',
      value: fav ? fav.getAttribute('href') || '(declared)' : '(not declared)',
      rec: fav ? 'Favicon declared - improves brand recognition in tabs, bookmarks, and SERPs.'
        : 'Add a favicon: <code>&lt;link rel="icon" href="/favicon.ico"&gt;</code> and an Apple Touch Icon for iOS home screens.'
    };
  },

  chkHreflang(doc) {
    const tags = doc.querySelectorAll('link[rel="alternate"][hreflang]');
    return {
      id: 'hreflang', name: 'Hreflang Tags', cat: 'Technical SEO', w: 4,
      status: tags.length === 0 ? 'info' : 'pass',
      value: tags.length === 0 ? '(none - may not be needed)' : `${tags.length} hreflang tag(s)`,
      rec: tags.length === 0 ? 'No hreflang. If you target multiple countries or languages, add hreflang to prevent duplicate content penalties and ensure correct regional targeting.'
        : `${tags.length} hreflang tags. Ensure x-default is included and all alternate URLs return HTTP 200.`
    };
  },

  chkThemeColor(doc) {
    const tc = doc.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '';
    const appleIcon = doc.querySelector('link[rel="apple-touch-icon"]');
    return {
      id: 'pwa', name: 'Theme Color & Touch Icon', cat: 'Technical SEO', w: 3,
      status: !tc && !appleIcon ? 'info' : 'pass',
      value: [tc ? `theme-color: ${tc}` : '', appleIcon ? 'apple-touch-icon OK' : ''].filter(Boolean).join(' - ') || '(none set)',
      rec: !tc && !appleIcon
        ? 'No theme-color or apple-touch-icon. Add <code>&lt;meta name="theme-color" content="#yourcolor"&gt;</code> for PWA/mobile browser chrome tinting, and an Apple Touch Icon for iOS home screen bookmarks.'
        : `Mobile/PWA meta configured. ${tc ? `Browser chrome color: ${tc}.` : ''} ${appleIcon ? 'Apple Touch Icon declared for iOS.' : ''}`
    };
  },

  chkNofollowLinks(doc) {
    const ext = [...doc.querySelectorAll('a[href]')].filter(l => {
      const h = l.getAttribute('href') || '';
      return h.startsWith('http') || h.startsWith('//');
    });
    const nofollow = ext.filter(l => (l.getAttribute('rel') || '').includes('nofollow'));
    const sponsored = ext.filter(l => (l.getAttribute('rel') || '').includes('sponsored'));
    const ugc = ext.filter(l => (l.getAttribute('rel') || '').includes('ugc'));
    if (!ext.length) return { id: 'nofollow', name: 'Nofollow & Link Attributes', cat: 'Technical SEO', w: 3, status: 'info', value: '(no external links)', rec: 'No external links found.' };
    return {
      id: 'nofollow', name: 'Nofollow & Link Attributes', cat: 'Technical SEO', w: 3,
      status: nofollow.length || sponsored.length || ugc.length ? 'pass' : 'info',
      value: `${ext.length} external - ${nofollow.length} nofollow - ${sponsored.length} sponsored - ${ugc.length} ugc`,
      rec: nofollow.length || sponsored.length || ugc.length
        ? 'Link attributes in use. Ensure paid or UGC links use <code>rel="sponsored"</code> / <code>rel="ugc"</code> per Google\'s guidelines.'
        : `${ext.length} external links with no rel attributes. If any are paid/sponsored, add <code>rel="sponsored"</code> to avoid manual actions.`
    };
  },

  /* IMAGE OPTIMIZATION */
  chkImgAlt(doc) {
    const imgs = [...doc.querySelectorAll('img')];
    if (!imgs.length) return { id: 'imgAlt', name: 'Image Alt Text', cat: 'Image Optimization', w: 7, status: 'info', value: '(no images found)', rec: 'No images detected on this page.' };
    const missing = imgs.filter(i => !i.hasAttribute('alt'));
    const empty = imgs.filter(i => i.hasAttribute('alt') && !i.getAttribute('alt').trim());
    const withAlt = imgs.filter(i => i.getAttribute('alt')?.trim());
    return {
      id: 'imgAlt', name: 'Image Alt Text', cat: 'Image Optimization', w: 7,
      status: missing.length === 0 ? 'pass' : missing.length > imgs.length / 2 ? 'fail' : 'warn',
      value: `${imgs.length} total - ${withAlt.length} with alt - ${missing.length} missing - ${empty.length} decorative`,
      rec: missing.length === 0
        ? `All ${withAlt.length} informational images have alt text. ${empty.length > 0 ? `${empty.length} correctly marked decorative.` : ''}`
        : `<strong>${missing.length}/${imgs.length} images lack alt attributes.</strong> Alt text is required for WCAG accessibility and helps Google understand image content.`
    };
  },

  chkImgLazy(doc) {
    const imgs = [...doc.querySelectorAll('img[src]')];
    if (!imgs.length) return { id: 'imgLazy', name: 'Image Lazy Loading', cat: 'Image Optimization', w: 3, status: 'info', value: '(no images)', rec: 'No images found.' };
    const lazy = imgs.filter(i => i.getAttribute('loading') === 'lazy').length;
    const srcset = imgs.filter(i => i.hasAttribute('srcset')).length;
    return {
      id: 'imgLazy', name: 'Image Lazy Loading', cat: 'Image Optimization', w: 3,
      status: imgs.length > 2 && lazy === 0 ? 'warn' : lazy > 0 ? 'pass' : 'info',
      value: `${imgs.length} images - ${lazy} lazy-loaded - ${srcset} with srcset`,
      rec: lazy > 0 ? `${lazy}/${imgs.length} images use <code>loading="lazy"</code>. ${srcset > 0 ? `${srcset} use srcset for responsive delivery.` : ''}`
        : imgs.length > 2 ? 'Add <code>loading="lazy"</code> to below-fold images to defer loading and improve LCP. E.g. <code>&lt;img loading="lazy" src="..."&gt;</code>'
        : 'Too few images to evaluate.'
    };
  },

  /* PERFORMANCE */
  chkScripts(doc) {
    const all = [...doc.querySelectorAll('script[src]')];
    const blocking = all.filter(s => !s.hasAttribute('defer') && !s.hasAttribute('async') && !s.type?.includes('module'));
    const deferred = all.length - blocking.length;
    return {
      id: 'scripts', name: 'Render-Blocking Scripts', cat: 'Performance', w: 7,
      status: blocking.length > 4 ? 'fail' : blocking.length > 1 ? 'warn' : 'pass',
      value: `${all.length} scripts - ${deferred} deferred/async - ${blocking.length} blocking`,
      rec: blocking.length === 0 ? `All ${all.length} scripts are deferred or async - zero render blocking detected.`
        : blocking.length <= 2 ? `${blocking.length} potentially render-blocking script(s). Add <code>defer</code> or <code>async</code> to non-critical scripts.`
        : `<strong>${blocking.length} render-blocking scripts</strong> found. This directly delays First Contentful Paint and LCP. Add <code>defer</code> to all non-critical JS.`
    };
  },

  chkCSS(doc) {
    const ext = doc.querySelectorAll('link[rel="stylesheet"]').length;
    const inline = doc.querySelectorAll('style').length;
    const preload = doc.querySelectorAll('link[rel="preload"][as="style"]').length;
    return {
      id: 'css', name: 'CSS Stylesheets', cat: 'Performance', w: 4,
      status: ext > 8 ? 'warn' : 'pass',
      value: `${ext} external - ${inline} inline <style> - ${preload} preloaded`,
      rec: ext > 8 ? `${ext} external stylesheets = ${ext} HTTP requests. Combine CSS, use a bundler, or inline critical CSS.`
        : `${ext} external stylesheet(s) - reasonable. ${preload > 0 ? `${preload} preloaded for performance.` : 'Consider preloading critical CSS.'}`
    };
  },

  chkPageSize(doc) {
    const kb = Math.round((doc.documentElement?.outerHTML?.length || 0) / 1024);
    return {
      id: 'size', name: 'HTML Document Size', cat: 'Performance', w: 4,
      status: kb > 500 ? 'warn' : kb > 200 ? 'info' : 'pass',
      value: `~${kb.toLocaleString()} KB (HTML only, excludes assets)`,
      rec: kb > 500 ? `Large HTML (~${kb}KB). Remove inline scripts/styles, dead HTML. Ensure server GZIP/Brotli compression is enabled.`
        : kb > 200 ? `Moderate HTML (~${kb}KB). Server-side compression typically reduces transfer size by 70%.`
        : `Lean HTML document (~${kb}KB). Good starting point.`
    };
  },

  chkPreconnect(doc) {
    const preconnect = doc.querySelectorAll('link[rel="preconnect"]').length;
    const dnsPrefetch = doc.querySelectorAll('link[rel="dns-prefetch"]').length;
    return {
      id: 'preconnect', name: 'Preconnect & DNS Prefetch', cat: 'Performance', w: 3,
      status: preconnect > 0 || dnsPrefetch > 0 ? 'pass' : 'info',
      value: `${preconnect} preconnect - ${dnsPrefetch} dns-prefetch`,
      rec: preconnect > 0 || dnsPrefetch > 0
        ? `${preconnect} preconnect and ${dnsPrefetch} dns-prefetch hints found. These reduce connection latency for third-party resources.`
        : 'No preconnect or dns-prefetch hints. For third-party fonts, analytics, or CDN origins, add <code>&lt;link rel="preconnect" href="https://fonts.googleapis.com"&gt;</code> to reduce latency.'
    };
  },

  /* ACCESSIBILITY (NEW) */
  chkAriaLandmarks(doc) {
    const main = doc.querySelectorAll('main, [role="main"]').length;
    const nav = doc.querySelectorAll('nav, [role="navigation"]').length;
    const banner = doc.querySelectorAll('header, [role="banner"]').length;
    const contentinfo = doc.querySelectorAll('footer, [role="contentinfo"]').length;
    const total = main + nav + banner + contentinfo;
    return {
      id: 'landmarks', name: 'ARIA Landmarks', cat: 'Accessibility', w: 4,
      status: main === 0 ? 'warn' : total >= 3 ? 'pass' : 'info',
      value: `main(${main}) nav(${nav}) header(${banner}) footer(${contentinfo})`,
      rec: main === 0
        ? 'No <code>&lt;main&gt;</code> landmark found. Screen readers rely on landmarks to navigate content. Wrap your primary content in <code>&lt;main&gt;</code>.'
        : total >= 3 ? `Good landmark coverage with ${total} landmark regions.`
        : 'Consider adding more semantic landmarks (nav, header, footer) for better screen reader navigation.'
    };
  },

  chkFormLabels(doc) {
    const inputs = [...doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea')];
    if (!inputs.length) return { id: 'formLabels', name: 'Form Labels', cat: 'Accessibility', w: 3, status: 'info', value: '(no form fields)', rec: 'No form input elements found.' };
    const unlabeled = inputs.filter(i => {
      const id = i.getAttribute('id');
      const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
      const hasAria = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
      const hasPlaceholder = i.getAttribute('placeholder');
      const wrappedInLabel = i.closest('label');
      return !hasLabel && !hasAria && !wrappedInLabel && !hasPlaceholder;
    });
    return {
      id: 'formLabels', name: 'Form Labels', cat: 'Accessibility', w: 3,
      status: unlabeled.length === 0 ? 'pass' : unlabeled.length > inputs.length / 2 ? 'fail' : 'warn',
      value: `${inputs.length} fields - ${unlabeled.length} without labels`,
      rec: unlabeled.length === 0
        ? `All ${inputs.length} form fields have associated labels or aria attributes.`
        : `<strong>${unlabeled.length} form fields lack labels.</strong> Add <code>&lt;label for="id"&gt;</code> or <code>aria-label</code> for screen reader users.`
    };
  },

  chkColorContrast(doc) {
    // Heuristic: check if meta theme-color or dark background styles suggest potential contrast issues
    const darkBg = doc.querySelector('body')?.style?.backgroundColor || '';
    const lightText = doc.querySelector('body')?.style?.color || '';
    const hasDarkMode = doc.querySelector('meta[name="color-scheme"]')?.getAttribute('content') || '';
    return {
      id: 'contrast', name: 'Color Contrast (Heuristic)', cat: 'Accessibility', w: 2,
      status: 'info',
      value: hasDarkMode ? `color-scheme: ${hasDarkMode}` : '(run a full contrast audit with Lighthouse)',
      rec: 'Automated contrast testing requires rendering. Use Google Lighthouse or axe DevTools for a complete WCAG AA contrast audit. Aim for 4.5:1 ratio for normal text and 3:1 for large text.'
    };
  },

  runAll(doc, url) {
    return [
      this.chkTitle(doc), this.chkMetaDesc(doc), this.chkViewport(doc),
      this.chkCanonical(doc), this.chkRobots(doc), this.chkCharset(doc), this.chkLang(doc),
      this.chkMetaKeywords(doc),
      this.chkOG(doc), this.chkOGImage(doc),
      this.chkTwitter(doc),
      this.chkH1(doc), this.chkHeadings(doc), this.chkContent(doc), this.chkLinks(doc),
      this.chkReadingLevel(doc),
      this.chkHTTPS(url), this.chkSchema(doc), this.chkFavicon(doc), this.chkHreflang(doc),
      this.chkThemeColor(doc), this.chkNofollowLinks(doc),
      this.chkImgAlt(doc), this.chkImgLazy(doc),
      this.chkScripts(doc), this.chkCSS(doc), this.chkPreconnect(doc), this.chkPageSize(doc),
      this.chkAriaLandmarks(doc), this.chkFormLabels(doc), this.chkColorContrast(doc),
    ];
  }
};
