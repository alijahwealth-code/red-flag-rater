let token = '';
let fullResult = null;

const PAYMENT_LINK = 'https://wealthyquest67.gumroad.com/l/xesgo';

document.getElementById('analyze-btn').addEventListener('click', analyze);

async function analyze() {
  const content = document.getElementById('inp-content').value.trim();
  const subject = document.getElementById('inp-subject').value.trim();
  if (!content) { showError('error-msg', 'Paste something to analyze first.'); return; }

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.textContent = '🚩  Analyzing…';
  hideError('error-msg');
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('unlocked-section').style.display = 'none';

  try {
    const resp = await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, subject }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Analysis failed.');

    token = data.token;
    showPreview(data.preview);

  } catch (e) {
    showError('error-msg', e.message || 'Something went wrong. Try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = '🚩  Rate the Red Flags';
  }
}

document.getElementById('pay-btn').addEventListener('click', () => {
  window.open(PAYMENT_LINK, '_blank');
});

document.getElementById('unlock-btn').addEventListener('click', unlock);
document.getElementById('order-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') unlock();
});

async function unlock() {
  const orderId = document.getElementById('order-input').value.trim();
  if (!orderId) { alert('Paste your order ID from the Gumroad confirmation email.'); return; }

  const btn = document.getElementById('unlock-btn');
  btn.textContent = 'Checking…';
  btn.disabled = true;
  hideError('unlock-error');

  try {
    const resp = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, token }),
    });

    const data = await resp.json();
    if (!resp.ok || !data.result) throw new Error(data.error || 'Verification failed.');

    fullResult = data.result;
    showUnlocked(data.result);

  } catch (e) {
    showError('unlock-error', e.message || 'Could not verify. Check your order ID and try again.');
    btn.textContent = 'Unlock';
    btn.disabled = false;
  }
}

document.getElementById('new-btn').addEventListener('click', () => {
  token = ''; fullResult = null;
  document.getElementById('inp-content').value = '';
  document.getElementById('inp-subject').value = '';
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('unlocked-section').style.display = 'none';
  document.getElementById('order-input').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function showPreview(preview) {
  const score = preview.score;
  document.getElementById('preview-score').textContent = score + '/10';
  document.getElementById('preview-score').style.color = scoreColor(score);
  document.getElementById('preview-verdict').textContent = preview.verdict;
  document.getElementById('preview-verdict').style.color = scoreColor(score);
  document.getElementById('preview-flag-count').textContent = preview.flagCount + ' red flag' + (preview.flagCount !== 1 ? 's' : '') + ' detected';
  const bar = document.getElementById('score-bar-fill');
  bar.style.width = (score * 10) + '%';
  bar.style.background = scoreColor(score);
  document.getElementById('preview-section').style.display = 'block';
  document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });
}

function showUnlocked(r) {
  document.getElementById('full-score').textContent = r.score + '/10';
  document.getElementById('full-score').style.color = scoreColor(r.score);
  document.getElementById('full-verdict').textContent = r.verdict;
  document.getElementById('full-verdict').style.color = scoreColor(r.score);
  document.getElementById('full-summary').textContent = r.summary;
  const bar2 = document.getElementById('full-score-bar');
  bar2.style.width = (r.score * 10) + '%';
  bar2.style.background = scoreColor(r.score);

  const flagsEl = document.getElementById('flags-list');
  flagsEl.innerHTML = '';
  (r.flags || []).forEach(f => {
    const div = document.createElement('div');
    div.className = 'flag-item';
    const sevColor = f.severity === 'high' ? '#ff3c3c' : f.severity === 'medium' ? '#ffaa00' : '#ffdd57';
    div.innerHTML = '<span class="flag-sev" style="background:' + sevColor + '22;color:' + sevColor + ';border-color:' + sevColor + '">' + f.severity.toUpperCase() + '</span><div class="flag-text"><strong>' + f.flag + '</strong><span>' + f.detail + '</span></div>';
    flagsEl.appendChild(div);
  });

  const greenEl = document.getElementById('green-flags-list');
  greenEl.innerHTML = '';
  if (r.green_flags && r.green_flags.length > 0) {
    document.getElementById('green-section').style.display = 'block';
    r.green_flags.forEach(g => {
      const li = document.createElement('li');
      li.textContent = g;
      greenEl.appendChild(li);
    });
  } else {
    document.getElementById('green-section').style.display = 'none';
  }

  document.getElementById('verdict-detail').textContent = r.verdict_detail;
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('unlocked-section').style.display = 'block';
  document.getElementById('unlocked-section').scrollIntoView({ behavior: 'smooth' });
}

function scoreColor(score) {
  if (score <= 3) return '#00cc88';
  if (score <= 6) return '#ffaa00';
  return '#ff3c3c';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(id) {
  document.getElementById(id).style.display = 'none';
}
