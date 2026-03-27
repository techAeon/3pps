// Scroll spy for sidebar nav
document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('section[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
  if (!sections.length || !sidebarLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.sidebar-nav a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
});

// Checklist logic
function toggleCheck(el) {
  if (event.target.tagName === 'A') return;
  const cb = el.querySelector('input[type="checkbox"]');
  cb.checked = !cb.checked;
  el.classList.toggle('checked', cb.checked);
  updateProgress();
}

function updateProgress() {
  const total = document.querySelectorAll('.check-item').length;
  if (!total) return;
  const checked = document.querySelectorAll('.check-item input:checked').length;
  const pct = Math.round((checked / total) * 100);
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${checked} of ${total} items checked (${pct}%)`;
}

// Glossary filter
function filterGlossary(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.term-entry').forEach(entry => {
    entry.classList.toggle('hidden', q.length > 0 && !entry.textContent.toLowerCase().includes(q));
  });
}

// Deadline calculator
document.addEventListener('DOMContentLoaded', function () {
  const noaCb = document.getElementById('noaIssued');
  if (!noaCb) return;

  noaCb.addEventListener('change', function () {
    const form = document.getElementById('calcForm');
    const result = document.getElementById('calc-result');
    if (this.checked) {
      form.style.opacity = '0.4';
      form.style.pointerEvents = 'none';
      result.className = 'show';
      document.getElementById('result-header').className = 'result-header closed';
      document.getElementById('result-header').textContent = '✗ Window Closed';
      document.getElementById('result-rows').innerHTML = `
        <tr><td>Status</td><td>NOA has been issued</td></tr>
        <tr><td>Action</td><td>No 3PPS can be filed after a Notice of Allowance</td></tr>`;
      document.getElementById('result-note').textContent =
        'Consider whether an Inter Partes Review (IPR) post-grant is appropriate. See the Strategic Risks section.';
    } else {
      form.style.opacity = '';
      form.style.pointerEvents = '';
      result.className = '';
    }
  });
});

function calculateDeadline() {
  const pubVal = document.getElementById('pubDate').value;
  const rejVal = document.getElementById('rejDate').value;
  if (!pubVal) { alert('Please enter the publication date.'); return; }

  const pub = new Date(pubVal);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixMonths = new Date(pub);
  sixMonths.setMonth(sixMonths.getMonth() + 6);

  let deadline = sixMonths;
  let logic = '6 months after publication date.';

  if (rejVal) {
    const rej = new Date(rejVal);
    if (rej > sixMonths) {
      deadline = rej;
      logic = 'First Office Action date (later than 6-month post-publication deadline).';
    } else {
      logic = '6 months after publication (First OA was within the 6-month window — no extension).';
    }
  }

  const daysRemaining = Math.floor((deadline - today) / (1000 * 60 * 60 * 24));
  const isOpen = daysRemaining >= 0;
  const fmt = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const resultEl = document.getElementById('calc-result');
  const headerEl = document.getElementById('result-header');
  const rowsEl = document.getElementById('result-rows');
  const noteEl = document.getElementById('result-note');

  resultEl.className = 'show';

  if (isOpen) {
    headerEl.className = 'result-header open';
    headerEl.textContent = `✓ Window Open — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
    rowsEl.innerHTML = `
      <tr><td>Publication Date</td><td>${fmt(pub)}</td></tr>
      <tr><td>6-Month Deadline</td><td>${fmt(sixMonths)}</td></tr>
      ${rejVal ? `<tr><td>First OA Date</td><td>${fmt(new Date(rejVal))}</td></tr>` : ''}
      <tr><td>Filing Deadline</td><td style="color:var(--compliant);font-weight:600;">${fmt(deadline)}</td></tr>
      <tr><td>Days Remaining</td><td style="font-weight:600;">${daysRemaining}</td></tr>`;
    noteEl.textContent = `Logic: ${logic} Note: This deadline can be cut short at any time by a Notice of Allowance. Monitor the file wrapper.`;
  } else {
    headerEl.className = 'result-header closed';
    headerEl.textContent = `✗ Window Closed — ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} ago`;
    rowsEl.innerHTML = `
      <tr><td>Deadline Was</td><td>${fmt(deadline)}</td></tr>
      <tr><td>Status</td><td style="color:var(--fail);">Filing window has passed</td></tr>`;
    noteEl.textContent = 'The statutory deadline has passed. Post-grant options (IPR, PGR) may still be available.';
  }
}
