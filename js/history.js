/* =====================================================
   SCAN HISTORY - localStorage-based recent scans
===================================================== */
const ScanHistory = {
  KEY: 'auditlens_history',
  MAX: 10,

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch (_e) {
      return [];
    }
  },

  _save(items) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
    } catch (_e) { /* quota exceeded or private browsing */ }
  },

  getAll() {
    return this._load();
  },

  add(url, score, grade) {
    const items = this._load();
    // Remove duplicate of same URL
    const filtered = items.filter(i => i.url !== url);
    filtered.unshift({
      url: url,
      score: score,
      grade: grade,
      date: new Date().toISOString()
    });
    // Trim to max
    this._save(filtered.slice(0, this.MAX));
  },

  remove(url) {
    const items = this._load().filter(i => i.url !== url);
    this._save(items);
  },

  clear() {
    try {
      localStorage.removeItem(this.KEY);
    } catch (_e) { /* no-op */ }
  },

  render(container) {
    const items = this.getAll();
    if (!items.length) {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';
    const list = container.querySelector('.history-list');
    if (!list) return;

    list.innerHTML = items.map(item => {
      const domain = item.url.replace(/^https?:\/\//, '').split('/')[0];
      const color = item.score >= 75 ? 'var(--pass)' : item.score >= 50 ? 'var(--warn)' : 'var(--fail)';
      const dateStr = new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `<div class="history-item" data-url="${item.url}" onclick="App.quickScan('${domain}')">
        <span class="hi-score" style="color:${color}">${item.score}</span>
        <span class="hi-url">${domain}</span>
        <span class="hi-date">${dateStr}</span>
        <button class="hi-remove" onclick="event.stopPropagation();ScanHistory.remove('${item.url}');ScanHistory.render(this.closest('.history-section'));" title="Remove">&times;</button>
      </div>`;
    }).join('');
  }
};
