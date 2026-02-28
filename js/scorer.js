/* =====================================================
   SCORER
===================================================== */
const Scorer = {
  compute(checks) {
    const sc = checks.filter(c => c.status !== 'info');
    if (!sc.length) return 0;
    const max = sc.reduce((s, c) => s + c.w, 0);
    const earned = sc.reduce((s, c) => c.status === 'pass' ? s + c.w : c.status === 'warn' ? s + c.w * .4 : s, 0);
    return Math.round(earned / max * 100);
  },

  grade(n) {
    if (n >= 90) return { label: 'Excellent', color: '#22c55e' };
    if (n >= 75) return { label: 'Good', color: '#4ade80' };
    if (n >= 55) return { label: 'Fair', color: '#f59e0b' };
    if (n >= 35) return { label: 'Poor', color: '#f97316' };
    return { label: 'Critical', color: '#ef4444' };
  },

  counts(checks) {
    return {
      pass: checks.filter(c => c.status === 'pass').length,
      warn: checks.filter(c => c.status === 'warn').length,
      fail: checks.filter(c => c.status === 'fail').length,
      info: checks.filter(c => c.status === 'info').length,
      total: checks.length
    };
  },

  group(checks) {
    return checks.reduce((g, c) => { (g[c.cat] = g[c.cat] || []).push(c); return g; }, {});
  },

  catScore(checks) {
    const groups = this.group(checks);
    return Object.fromEntries(Object.entries(groups).map(([c, items]) => [c, this.compute(items)]));
  },

  catColor(n) { return n >= 75 ? '#22c55e' : n >= 50 ? '#f59e0b' : '#ef4444'; }
};
