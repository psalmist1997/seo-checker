/* =====================================================
   APP CONTROLLER
===================================================== */
const App = {
  state: { checks: [], score: 0, grade: {}, url: '', busy: false },

  show(v) {
    document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === v));
    // Show/hide the why section + footer (landing only)
    const landingExtras = ['whySection', 'siteFooter'];
    landingExtras.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = v === 'vLanding' ? '' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  norm(raw) {
    let u = raw.trim().replace(/^https?:\/\//i, '').replace(/^\/\//, '');
    if (!u) return null;
    try {
      const p = new URL('https://' + u);
      return /\.[a-z]{2,}$/i.test(p.hostname) ? 'https://' + u : null;
    } catch {
      return null;
    }
  },

  async scan(rawUrl) {
    if (this.state.busy) return;
    const url = this.norm(rawUrl);
    const hint = document.getElementById('searchHint');
    if (!url) {
      if (hint) hint.textContent = 'Enter a valid domain - e.g. "yoursite.com"';
      document.getElementById('urlInput')?.focus();
      return;
    }
    if (hint) hint.textContent = '';
    this.state.busy = true;

    // Button loading
    const btn = document.getElementById('scanBtn');
    const lbl = document.getElementById('btnLabel');
    const ico = document.getElementById('btnIcon');
    if (btn) {
      btn.disabled = true;
      lbl.textContent = 'Scanning...';
      ico.innerHTML = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="20 40" style="animation:spin .8s linear infinite;transform-origin:center"/>';
    }

    this.show('vScanning');
    Renderer.initScan(url);

    try {
      const checks = await Scanner.scan(url, (idx, total, label) => Renderer.updateScan(idx, total, label));
      this.state.checks = checks;
      this.state.url = url;
      this.state.score = Scorer.compute(checks);
      this.state.grade = Scorer.grade(this.state.score);

      // Save to history
      ScanHistory.add(url, this.state.score, this.state.grade.label);

      this.show('vResults');
      Renderer.render(checks, url);

      // Reset filters
      document.querySelectorAll('.fb-tab').forEach(t => t.classList.toggle('active', t.dataset.f === 'all'));
      const search = document.getElementById('fbSearch');
      if (search) search.value = '';
    } catch (e) {
      console.error('[App]', e);
      this.show('vLanding');
      Renderer.showError(e.message || 'Scan failed. Please try again.');
    } finally {
      this.state.busy = false;
      if (btn) {
        btn.disabled = false;
        lbl.textContent = 'Audit Site';
        ico.innerHTML = '<path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5"/>';
      }
    }
  },

  quickScan(domain) {
    const inp = document.getElementById('urlInput');
    if (inp) inp.value = domain;
    this.scan(domain);
  },

  // Share results URL (copies shareable link to clipboard)
  async shareResults() {
    const url = this.state.url;
    if (!url) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?scan=${encodeURIComponent(url.replace('https://', ''))}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      Renderer.showSuccess('Share link copied to clipboard!');
    } catch (_e) {
      Renderer.showError('Could not copy share link. Please copy from the address bar.');
    }
  },

  // Check for ?scan= parameter on load
  checkAutoScan() {
    const params = new URLSearchParams(window.location.search);
    const scanUrl = params.get('scan');
    if (scanUrl) {
      const inp = document.getElementById('urlInput');
      if (inp) inp.value = scanUrl;
      // Small delay so page renders first
      setTimeout(() => this.scan(scanUrl), 300);
    }
  },

  initMobileMenu() {
    const menuBtn = document.querySelector('.hdr-mobile-menu');
    const overlay = document.getElementById('mobileNavOverlay');
    const closeBtn = document.querySelector('.mobile-nav-close');
    if (!menuBtn || !overlay) return;

    menuBtn.addEventListener('click', () => overlay.classList.add('open'));
    closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  },

  initScrollToTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  init() {
    // URL input
    const inp = document.getElementById('urlInput');
    const btn = document.getElementById('scanBtn');
    inp?.addEventListener('keydown', e => { if (e.key === 'Enter') this.scan(inp.value); });
    inp?.addEventListener('input', () => {
      const hint = document.getElementById('searchHint');
      if (hint && hint.textContent) hint.textContent = '';
    });
    inp?.addEventListener('paste', () => setTimeout(() => {
      inp.value = inp.value.replace(/^https?:\/\//i, '');
    }, 10));
    btn?.addEventListener('click', () => this.scan(inp?.value || ''));
    inp?.focus();

    // Back
    document.getElementById('backBtn')?.addEventListener('click', () => {
      this.show('vLanding');
      // Refresh history on landing
      const histSection = document.getElementById('historySection');
      if (histSection) ScanHistory.render(histSection);
      if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 80); }
    });

    // Filter tabs
    document.querySelector('.fb-tabs')?.addEventListener('click', e => {
      const tab = e.target.closest('.fb-tab');
      if (!tab) return;
      Renderer.applyFilter(tab.dataset.f);
      const s = document.getElementById('fbSearch');
      if (s) s.value = '';
    });

    // Search
    document.getElementById('fbSearch')?.addEventListener('input', e => {
      Renderer.applySearch(e.target.value);
      document.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
    });

    // Export report as .txt file
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      const report = Renderer.buildReport(this.state.checks, this.state.score, this.state.url, this.state.grade);
      const blob = new Blob([report], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const domain = (this.state.url || 'report').replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').substring(0, 40);
      a.download = `seo-audit-${domain}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Export JSON
    document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
      const json = Renderer.buildJSON(this.state.checks, this.state.score, this.state.url, this.state.grade);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const domain = (this.state.url || 'report').replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').substring(0, 40);
      a.download = `seo-audit-${domain}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Print
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());

    // Copy report
    document.getElementById('copyBtn')?.addEventListener('click', async () => {
      const copyBtn = document.getElementById('copyBtn');
      const report = Renderer.buildReport(this.state.checks, this.state.score, this.state.url, this.state.grade);
      try {
        await navigator.clipboard.writeText(report);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Report';
          copyBtn.classList.remove('copied');
        }, 2600);
      } catch (_e) {
        Renderer.showError('Clipboard access denied. Please copy manually.');
      }
    });

    // Share
    document.getElementById('shareBtn')?.addEventListener('click', () => this.shareResults());

    // Mobile menu
    this.initMobileMenu();

    // Scroll to top
    this.initScrollToTop();

    // Render scan history
    const histSection = document.getElementById('historySection');
    if (histSection) ScanHistory.render(histSection);

    // History clear
    document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
      ScanHistory.clear();
      if (histSection) ScanHistory.render(histSection);
    });

    // Check auto-scan from URL params
    this.checkAutoScan();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
