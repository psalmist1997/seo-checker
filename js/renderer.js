/* =====================================================
   RENDERER
===================================================== */
const Renderer = {
  CAT_META: {
    'Meta Tags':          { icon: '\uD83C\uDFF7', bg: 'rgba(0,212,170,.09)',    br: 'rgba(0,212,170,.2)' },
    'Open Graph':         { icon: '\uD83D\uDCD8', bg: 'rgba(99,102,241,.09)',   br: 'rgba(99,102,241,.2)' },
    'Twitter Cards':      { icon: '\uD835\uDD4F', bg: 'rgba(148,163,184,.08)', br: 'rgba(148,163,184,.18)' },
    'Content Structure':  { icon: '\uD83D\uDCCB', bg: 'rgba(245,158,11,.09)',   br: 'rgba(245,158,11,.2)' },
    'Technical SEO':      { icon: '\u2699\uFE0F', bg: 'rgba(167,139,250,.09)', br: 'rgba(167,139,250,.2)' },
    'Image Optimization': { icon: '\uD83D\uDDBC', bg: 'rgba(34,197,94,.09)',    br: 'rgba(34,197,94,.2)' },
    'Performance':        { icon: '\u26A1',       bg: 'rgba(239,68,68,.09)',    br: 'rgba(239,68,68,.2)' },
    'Accessibility':      { icon: '\u267F',       bg: 'rgba(96,165,250,.09)',   br: 'rgba(96,165,250,.2)' },
  },
  SI: { pass: '\u2713', warn: '!', fail: '\u2715', info: 'i' },
  SL: { pass: 'Pass', warn: 'Warning', fail: 'Failed', info: 'Info' },

  // Scanning UI
  initScan(url) {
    document.getElementById('scanUrlLabel').textContent = url;
    const el = document.getElementById('scanSteps');
    el.innerHTML = Scanner.STEPS.map((s, i) => `<div class="ss-row" id="ss${i}"><span class="ss-dot"></span>${s}</div>`).join('');
  },

  updateScan(idx, total, label) {
    const pct = Math.round((idx + 1) / total * 100);
    document.getElementById('scanBar').style.width = pct + '%';
    document.getElementById('hexPct').textContent = pct + '%';
    document.getElementById('scanStepText').textContent = label;
    for (let i = 0; i < idx; i++) {
      const e = document.getElementById(`ss${i}`);
      if (e) { e.classList.remove('active'); e.classList.add('done'); }
    }
    const cur = document.getElementById(`ss${idx}`);
    if (cur) cur.classList.add('active');
  },

  // Full results render
  render(checks, url) {
    const score = Scorer.compute(checks);
    const grade = Scorer.grade(score);
    const counts = Scorer.counts(checks);
    const catSc = Scorer.catScore(checks);
    const groups = Scorer.group(checks);

    // Topbar
    document.getElementById('resUrl').textContent = url;

    // Score ring
    this._animScore(score, grade);

    // Quick stats
    document.getElementById('qsFail').textContent = counts.fail;
    document.getElementById('qsWarn').textContent = counts.warn;
    document.getElementById('qsPass').textContent = counts.pass;

    // Filter badges
    document.getElementById('fbAll').textContent = counts.total;
    document.getElementById('fbFail').textContent = counts.fail;
    document.getElementById('fbWarn').textContent = counts.warn;
    document.getElementById('fbPass').textContent = counts.pass;

    // Category breakdown
    this._renderCatBreakdown(catSc);

    // Page snapshot
    this._renderSnapshot(checks, url, score);

    // Audit list
    this._renderAuditList(groups, catSc);
  },

  _animScore(score, grade) {
    const numEl = document.getElementById('scNum');
    const gradeEl = document.getElementById('scGrade');
    const fill = document.getElementById('scFill');
    const circ = 345.4; // 2*pi*55
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + Math.ceil(score / 45), score);
      numEl.textContent = cur;
      if (cur >= score) clearInterval(t);
    }, 22);
    setTimeout(() => {
      fill.style.strokeDashoffset = circ - (score / 100) * circ;
      fill.style.stroke = grade.color;
      fill.style.filter = `drop-shadow(0 0 10px ${grade.color})`;
    }, 150);
    gradeEl.textContent = grade.label;
    gradeEl.style.color = grade.color;
    document.getElementById('scMeta').textContent = `Scanned on ${new Date().toLocaleString()}`;
  },

  _renderCatBreakdown(catSc) {
    const el = document.getElementById('cbRows');
    el.innerHTML = Object.entries(catSc).map(([name, sc], i) => {
      const col = Scorer.catColor(sc);
      return `<div class="cb-row">
        <span class="cb-name" title="${name}">${name}</span>
        <div class="cb-track"><div class="cb-bar" id="cbar${i}" style="background:${col}"></div></div>
        <span class="cb-pct">${sc}%</span>
      </div>`;
    }).join('');
    // Animate bars
    Object.entries(catSc).forEach(([, sc], i) => {
      setTimeout(() => {
        const b = document.getElementById(`cbar${i}`);
        if (b) b.style.width = sc + '%';
      }, 350 + i * 60);
    });
  },

  _renderSnapshot(checks, url, score) {
    const el = document.getElementById('psRows');
    const g = id => checks.find(c => c.id === id);
    const http = g('https'), schema = g('schema'), img = g('imgAlt'), title = g('title');
    const rows = [
      { k: 'Domain', v: url.replace(/^https?:\/\//, '').split('/')[0] || url, c: '' },
      { k: 'Protocol', v: http?.status === 'pass' ? 'HTTPS OK' : 'HTTP Warning', c: http?.status === 'pass' ? 'good' : 'bad' },
      { k: 'Score', v: `${score}/100`, c: score >= 75 ? 'good' : score < 45 ? 'bad' : 'meh' },
      { k: 'Title', v: title?.status === 'pass' ? 'Optimised' : title?.status === 'fail' ? 'Missing' : 'Needs work', c: title?.status === 'pass' ? 'good' : title?.status === 'fail' ? 'bad' : 'meh' },
      { k: 'Schema', v: schema?.status === 'pass' ? 'Detected' : 'None found', c: schema?.status === 'pass' ? 'good' : '' },
      { k: 'Images', v: img?.status === 'info' ? 'None' : img?.status === 'pass' ? 'Alt OK' : 'Issues', c: img?.status === 'pass' ? 'good' : img?.status === 'fail' ? 'bad' : '' },
    ];
    el.innerHTML = rows.map(r => `<div class="ps-row"><span class="ps-key">${r.k}</span><span class="ps-val ${r.c}">${this._e(r.v)}</span></div>`).join('');
  },

  _renderAuditList(groups, catSc) {
    const container = document.getElementById('auditList');
    container.innerHTML = '';
    Object.entries(groups).forEach(([cat, checks], idx) => {
      const meta = this.CAT_META[cat] || { icon: '\uD83D\uDCCC', bg: 'rgba(148,163,184,.08)', br: 'rgba(148,163,184,.18)' };
      const sc = catSc[cat] || 0;
      const col = Scorer.catColor(sc);
      const c = Scorer.counts(checks);
      const subtxt = c.fail > 0 ? `<span style="color:var(--fail)">${c.fail} failed</span>` : c.warn > 0 ? `<span style="color:var(--warn)">${c.warn} warnings</span>` : `<span style="color:var(--pass)">All passed</span>`;

      // Heading tree extra
      const hCheck = checks.find(c => c.id === 'headings');
      const headingTree = hCheck?.extra?.headings?.length ? this._buildTree(hCheck.extra.headings) : '';

      const block = document.createElement('div');
      block.className = 'acat';
      block.dataset.cat = cat;
      block.style.animationDelay = `${idx * .07}s`;
      block.innerHTML = `
        <div class="acat-head" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="acat-icon" style="background:${meta.bg};border:1px solid ${meta.br}">${meta.icon}</div>
          <div class="acat-info">
            <div class="acat-name">${cat}</div>
            <div class="acat-sub">${subtxt} - ${checks.length} checks</div>
          </div>
          <span class="acat-score" style="color:${col}">${sc}%</span>
          <span class="acat-chevron">&#9662;</span>
        </div>
        <div class="acat-body">
          ${headingTree}
          ${checks.map(c => this._buildRow(c)).join('')}
        </div>`;
      container.appendChild(block);
    });
  },

  _buildTree(headings) {
    const shown = headings.slice(0, 14);
    const more = headings.length - shown.length;
    return `<div class="heading-tree">
      <div class="ht-title">Heading Structure</div>
      ${shown.map((h, i) => {
        const level = parseInt(h.tag.replace('H', ''));
        return `<div class="ht-item ht-${h.tag.toLowerCase()}" style="padding-left:${(level - 1) * 16}px;animation-delay:${i * .03}s">
          <span class="ht-tag">${h.tag}</span>
          <span class="ht-text">${this._e(h.text)}</span>
        </div>`;
      }).join('')}
      ${more > 0 ? `<div class="ht-more">+${more} more headings...</div>` : ''}
    </div>`;
  },

  _buildRow(check) {
    const val = check.value ? `<div class="cr-value">${this._e(String(check.value))}</div>` : '';
    return `<div class="check-row" data-s="${check.status}" data-name="${this._e(check.name).toLowerCase()}" data-id="${check.id}">
      <div class="cr-icon ${check.status}">${this.SI[check.status] || '?'}</div>
      <div class="cr-body">
        <div class="cr-name">${check.name}</div>
        ${val}
        <div class="cr-rec">${check.rec || ''}</div>
      </div>
      <span class="cr-pill ${check.status}">${this.SL[check.status]}</span>
    </div>`;
  },

  // Filter
  applyFilter(f) {
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.toggle('active', t.dataset.f === f));
    document.querySelectorAll('.check-row').forEach(r => { r.classList.toggle('hidden', f !== 'all' && r.dataset.s !== f); });
    document.querySelectorAll('.acat').forEach(a => { a.style.display = a.querySelectorAll('.check-row:not(.hidden)').length ? '' : 'none'; });
  },

  applySearch(q) {
    const s = q.toLowerCase().trim();
    document.querySelectorAll('.check-row').forEach(r => {
      r.classList.toggle('hidden', !!s && !r.dataset.name.includes(s) && !r.textContent.toLowerCase().includes(s));
    });
    document.querySelectorAll('.acat').forEach(a => { a.style.display = a.querySelectorAll('.check-row:not(.hidden)').length ? '' : 'none'; });
  },

  // Copy report
  buildReport(checks, score, url, grade) {
    const bar = n => '#'.repeat(Math.round(n / 5)) + '-'.repeat(20 - Math.round(n / 5));
    const c = Scorer.counts(checks);
    const lines = [
      '======================================================',
      '         AuditLens -- SEO Audit Report',
      '======================================================',
      '', `  URL     : ${url}`,
      `  Score   : ${score}/100  [${grade.label.toUpperCase()}]`,
      `  Date    : ${new Date().toLocaleString()}`,
      '', `  [${bar(score)}] ${score}%`,
      '', `  Passed: ${c.pass}  |  Warnings: ${c.warn}  |  Failed: ${c.fail}  |  Total: ${c.total}`, '',
    ];
    Object.entries(Scorer.group(checks)).forEach(([cat, items]) => {
      lines.push(`-- ${cat} ` + '-'.repeat(Math.max(2, 46 - cat.length)));
      items.forEach(ch => {
        const ic = { pass: 'OK', warn: '!!', fail: 'XX', info: 'ii' }[ch.status] || '??';
        lines.push(`  [${ic}] ${ch.name}`);
        if (ch.value) lines.push(`      Value  : ${ch.value}`);
        const rec = (ch.rec || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&code;/g, '');
        lines.push(`      Advice : ${rec}`, '');
      });
    });
    lines.push('----------------------------------------------', 'AuditLens - Free SEO Readiness Checker by Contentika');
    return lines.join('\n');
  },

  // JSON report export
  buildJSON(checks, score, url, grade) {
    return JSON.stringify({
      tool: 'AuditLens SEO Checker',
      url: url,
      score: score,
      grade: grade.label,
      date: new Date().toISOString(),
      summary: Scorer.counts(checks),
      categories: Scorer.catScore(checks),
      checks: checks.map(c => ({
        id: c.id,
        name: c.name,
        category: c.cat,
        status: c.status,
        value: c.value || null,
        recommendation: (c.rec || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      }))
    }, null, 2);
  },

  showError(msg) {
    document.getElementById('toastMsg').textContent = msg;
    const t = document.getElementById('toast');
    t.classList.remove('success');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 7000);
  },

  showSuccess(msg) {
    document.getElementById('toastMsg').textContent = msg;
    const t = document.getElementById('toast');
    t.classList.add('success', 'show');
    setTimeout(() => t.classList.remove('show', 'success'), 4000);
  },

  _e(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
};
