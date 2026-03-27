(function () {
  'use strict';

  // ─── Search index ────────────────────────────────────────────────────────────
  const SEARCH_INDEX = [
    { title: 'Overview', url: '/', desc: 'What is a Third-Party Preissuance Submission? The patent system\'s crowdsourcing window.' },
    { title: '3PPS 101: The Workflow', url: '/101', desc: 'How to submit prior art to the USPTO. 4-step process, required documents, fees.' },
    { title: 'Deadline Calculator', url: '/calculator', desc: 'Is the 3PPS filing window still open? Calculate your statutory deadline under 35 U.S.C. § 122(e).' },
    { title: 'Drafting Guide', url: '/drafting', desc: 'How to write a compliant Concise Description. Factual only — no legal arguments.' },
    { title: 'Filing Checklist', url: '/checklist', desc: '22-item checklist covering timing, document prep, fees, and Patent Center submission.' },
    { title: 'Strategic Risks', url: '/strategy', desc: 'Should you file a 3PPS or hold art for IPR? The double-edged sword explained.' },
    { title: 'International Comparison', url: '/international', desc: 'US Third-Party Observations vs EPO and PCT. Cost, timing, and content rules compared.' },
    { title: 'Glossary', url: '/glossary', desc: 'Patent law terms defined: Prior Art, Notice of Allowance, IPR, estoppel, and more.' },
    { title: 'FAQ', url: '/faq', desc: 'How much does a 3PPS cost? Can I remain anonymous? What happens after I file?' },
    // Glossary terms
    { title: 'America Invents Act (AIA)', url: '/glossary#term-aia', desc: 'Federal statute (2011) that created the 3PPS mechanism under 35 U.S.C. § 122(e).' },
    { title: 'Notice of Allowance (NOA)', url: '/glossary#term-noa', desc: 'When the USPTO intends to grant a patent. Closes the 3PPS window immediately.' },
    { title: 'Prior Art', url: '/glossary#term-prior-art', desc: 'Existing public knowledge relevant to patentability under §§ 102–103.' },
    { title: 'Concise Description of Relevance', url: '/glossary#term-concise-desc', desc: 'Required factual document pointing to specific parts of each reference. No arguments.' },
    { title: 'Inter Partes Review (IPR)', url: '/glossary#term-ipr', desc: 'Post-grant adversarial proceeding at the PTAB. Costs $30k+, requires named party.' },
    { title: 'File Wrapper', url: '/glossary#term-file-wrapper', desc: 'Complete official record of all documents in a patent application.' },
    { title: 'Claim', url: '/glossary#term-claim', desc: 'Numbered sentences defining the legal scope of patent rights under 35 U.S.C. § 112.' },
    { title: 'Office Action', url: '/glossary#term-office-action', desc: 'USPTO examiner document accepting or rejecting claims. First OA date affects 3PPS deadline.' },
    { title: 'Estoppel', url: '/glossary#term-estoppel', desc: 'Legal doctrine preventing re-arguing prior positions. Practical estoppel risk in 3PPS filings.' },
    // FAQ items
    { title: 'FAQ: Cost of submitting prior art', url: '/faq#faq-cost', desc: 'Free for first 3 items on first submission. $180 small entity / $360 large entity thereafter.' },
    { title: 'FAQ: Can I remain anonymous?', url: '/faq#faq-anonymity', desc: 'Yes. Anonymous filing is explicitly permitted under 37 CFR 1.290.' },
    { title: 'FAQ: 3PPS deadline', url: '/faq#faq-timing', desc: 'Earlier of NOA or the later of 6 months post-publication / first Office Action date.' },
    { title: 'FAQ: 3PPS vs IPR', url: '/faq#faq-outcome', desc: 'Pre-grant vs post-grant. $0–$180 vs $30k+. Anonymous vs named party. Facts only vs full arguments.' },
  ];

  // ─── Search UI ────────────────────────────────────────────────────────────────
  const input = document.getElementById('siteSearch') || document.getElementById('headerSearch');
  const dropdown = document.getElementById('searchDropdown');
  if (!input || !dropdown) return;

  let activeIdx = -1;

  function search(q) {
    if (!q || q.length < 2) { hide(); return; }
    const terms = q.toLowerCase().split(/\s+/);
    const results = SEARCH_INDEX.filter(item => {
      const hay = (item.title + ' ' + item.desc).toLowerCase();
      return terms.every(t => hay.includes(t));
    }).slice(0, 7);

    if (!results.length) { hide(); return; }

    dropdown.innerHTML = results.map((r, i) =>
      `<a class="search-result" href="${r.url}" data-idx="${i}">
        <span class="sr-title">${highlight(r.title, q)}</span>
        <span class="sr-desc">${highlight(r.desc, q)}</span>
      </a>`
    ).join('');
    activeIdx = -1;
    dropdown.removeAttribute('hidden');
  }

  function highlight(text, q) {
    const terms = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(/\s+/).filter(Boolean);
    return text.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>');
  }

  function hide() {
    dropdown.setAttribute('hidden', '');
    activeIdx = -1;
  }

  input.addEventListener('input', e => search(e.target.value.trim()));

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.search-result');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, -1);
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      items[activeIdx].click();
    } else if (e.key === 'Escape') {
      hide(); input.blur();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.header-search-wrap')) hide();
  });

  // Keyboard shortcut: / to focus search
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      input.focus();
    }
  });

  // ─── Dark mode ────────────────────────────────────────────────────────────────
  const btn = document.getElementById('darkModeBtn');
  const root = document.documentElement;

  function applyDark(on) {
    root.classList.toggle('dark', on);
    if (btn) btn.querySelector('.dm-icon').textContent = on ? '○' : '◑';
  }

  // Persist preference
  applyDark(localStorage.getItem('3pps-dark') === '1');

  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('3pps-dark', isDark ? '1' : '0');
      btn.querySelector('.dm-icon').textContent = isDark ? '○' : '◑';
    });
  }

})();
