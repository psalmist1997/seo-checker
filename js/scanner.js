/* =====================================================
   SCANNER
===================================================== */
const Scanner = {
  PROXIES: [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://thingproxy.freeboard.io/fetch/${u}`,
    u => `https://cors-anywhere.herokuapp.com/${u}`,
  ],

  STEPS: [
    'Connecting to server...',
    'Fetching page content...',
    'Parsing HTML document...',
    'Analysing meta & title tags...',
    'Checking Open Graph & Twitter...',
    'Scanning heading structure...',
    'Measuring readability...',
    'Auditing images & alt text...',
    'Evaluating technical SEO...',
    'Checking accessibility...',
    'Measuring performance signals...',
    'Computing final score...',
  ],

  _timeout(ms) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    return { signal: ctrl.signal, clear: () => clearTimeout(id) };
  },

  async fetch(url) {
    const errors = [];
    for (const proxyFn of this.PROXIES) {
      const { signal, clear } = this._timeout(15000);
      try {
        const r = await fetch(proxyFn(url), { signal });
        clear();
        if (!r.ok) { errors.push(`HTTP ${r.status}`); continue; }
        const ct = r.headers.get('content-type') || '';
        let html = '';
        if (ct.includes('application/json')) {
          const d = await r.json();
          html = d.contents || d.body || d.data || '';
        } else {
          html = await r.text();
          // allorigins wraps in JSON sometimes
          if (html.trim().startsWith('{')) {
            try { const d = JSON.parse(html); html = d.contents || d.body || html; } catch (_e) { /* keep raw */ }
          }
        }
        if (typeof html === 'string' && html.length > 500) return html;
        errors.push('Empty response');
      } catch (err) {
        clear();
        errors.push(err.name === 'AbortError' ? 'Timeout' : err.message || 'Network error');
        console.warn('[Scanner] proxy failed:', err.message);
      }
    }
    throw new Error('Could not fetch the URL after trying multiple proxies. The site may block external requests, require authentication, or be unavailable. Try wikipedia.org or bbc.com to verify the tool works. (' + errors.join(' / ') + ')');
  },

  async scan(url, onStep) {
    const S = this.STEPS;
    let s = 0;
    const tick = async (ms = 250) => {
      onStep(s, S.length, S[s] || '');
      s++;
      await new Promise(r => setTimeout(r, ms));
    };

    await tick(150);
    const html = await this.fetch(url);

    await tick(120);
    const doc = new DOMParser().parseFromString(html, 'text/html');

    await tick(100);
    const checks = [];

    // Meta tags
    await tick(80);
    checks.push(
      Analyzers.chkTitle(doc), Analyzers.chkMetaDesc(doc), Analyzers.chkViewport(doc),
      Analyzers.chkCanonical(doc), Analyzers.chkRobots(doc), Analyzers.chkCharset(doc),
      Analyzers.chkLang(doc), Analyzers.chkMetaKeywords(doc)
    );

    // Social
    await tick(80);
    checks.push(Analyzers.chkOG(doc), Analyzers.chkOGImage(doc), Analyzers.chkTwitter(doc));

    // Content structure
    await tick(80);
    checks.push(Analyzers.chkH1(doc), Analyzers.chkHeadings(doc), Analyzers.chkContent(doc), Analyzers.chkLinks(doc));

    // Readability
    await tick(80);
    checks.push(Analyzers.chkReadingLevel(doc));

    // Images
    await tick(80);
    checks.push(Analyzers.chkImgAlt(doc), Analyzers.chkImgLazy(doc));

    // Technical SEO
    await tick(80);
    checks.push(
      Analyzers.chkHTTPS(url), Analyzers.chkSchema(doc), Analyzers.chkFavicon(doc),
      Analyzers.chkHreflang(doc), Analyzers.chkThemeColor(doc), Analyzers.chkNofollowLinks(doc)
    );

    // Accessibility
    await tick(80);
    checks.push(Analyzers.chkAriaLandmarks(doc), Analyzers.chkFormLabels(doc), Analyzers.chkColorContrast(doc));

    // Performance
    await tick(80);
    checks.push(Analyzers.chkScripts(doc), Analyzers.chkCSS(doc), Analyzers.chkPreconnect(doc), Analyzers.chkPageSize(doc));

    await tick(300);
    return checks;
  }
};
