import Head from 'next/head';
import Script from 'next/script';

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    background: linear-gradient(135deg, #0d0000 0%, #1a0000 50%, #0d0000 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #fff;
    padding: 0 16px 80px;
  }
  .header { text-align: center; padding: 52px 0 32px; }
  .tag {
    display: inline-block;
    background: rgba(255,30,30,0.12);
    border: 1px solid rgba(255,30,30,0.3);
    border-radius: 100px;
    padding: 4px 14px;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ff3c3c;
    margin-bottom: 20px;
  }
  h1 {
    font-size: clamp(30px, 8vw, 56px);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 14px;
    background: linear-gradient(135deg, #fff 40%, #ff3c3c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle { font-size: 16px; color: rgba(255,255,255,0.5); max-width: 460px; margin: 0 auto; line-height: 1.55; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px 20px; max-width: 580px; margin: 0 auto 14px; }
  .card-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px; display: block; }
  .optional { color: rgba(255,255,255,0.2); font-weight: 400; }
  input[type="text"], textarea { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 14px; color: #fff; font-size: 15px; outline: none; font-family: inherit; }
  textarea { resize: vertical; min-height: 130px; line-height: 1.5; }
  textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.28); }
  #analyze-btn { display: block; width: 100%; max-width: 580px; margin: 0 auto; background: linear-gradient(135deg, #cc0000 0%, #ff3c3c 100%); border: none; border-radius: 14px; padding: 16px; color: #fff; font-size: 17px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
  #analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg { color: #ff6b6b; font-size: 14px; text-align: center; margin-top: 12px; max-width: 580px; margin-left: auto; margin-right: auto; display: none; }
  #preview-section { display: none; max-width: 580px; margin: 20px auto 0; }
  .preview-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; }
  .score-teaser { padding: 28px 24px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .score-number { font-size: 64px; font-weight: 900; line-height: 1; margin-bottom: 8px; }
  .score-verdict { font-size: 18px; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px; }
  .score-flag-count { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
  .score-track { height: 8px; background: rgba(255,255,255,0.1); border-radius: 100px; overflow: hidden; max-width: 280px; margin: 0 auto; }
  .score-fill { height: 100%; border-radius: 100px; transition: width 0.8s ease; }
  .pay-gate { padding: 20px 24px 24px; text-align: center; }
  .pay-title { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
  .pay-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 18px; }
  .pay-btn { display: block; width: 100%; background: linear-gradient(135deg, #cc0000 0%, #ff3c3c 100%); border: none; border-radius: 12px; padding: 14px; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; margin-bottom: 16px; font-family: inherit; }
  .already-paid { font-size: 11px; color: rgba(255,255,255,0.28); margin-bottom: 10px; }
  .unlock-row { display: flex; gap: 8px; }
  .unlock-input { flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 13px; color: #fff; font-size: 14px; outline: none; font-family: monospace; }
  .unlock-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 10px 16px; color: #fff; font-size: 14px; cursor: pointer; white-space: nowrap; font-family: inherit; }
  .unlock-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  #unlocked-section { display: none; max-width: 580px; margin: 20px auto 0; }
  .result-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; margin-bottom: 12px; }
  .result-score-row { text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 20px; }
  .full-score-num { font-size: 72px; font-weight: 900; line-height: 1; }
  .full-verdict-text { font-size: 20px; font-weight: 800; letter-spacing: 1px; margin: 8px 0 4px; }
  .full-summary { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5; max-width: 400px; margin: 0 auto 14px; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin: 18px 0 10px; }
  .flag-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .flag-item:last-child { border-bottom: none; }
  .flag-sev { font-size: 9px; font-weight: 800; letter-spacing: 1px; border: 1px solid; border-radius: 6px; padding: 3px 7px; white-space: nowrap; margin-top: 2px; }
  .flag-text { flex: 1; font-size: 14px; }
  .flag-text strong { display: block; margin-bottom: 2px; color: #fff; }
  .flag-text span { color: rgba(255,255,255,0.55); font-size: 13px; line-height: 1.4; }
  #green-flags-list { list-style: none; padding: 0; }
  #green-flags-list li { padding: 6px 0 6px 20px; position: relative; font-size: 14px; color: rgba(255,255,255,0.75); }
  #green-flags-list li::before { content: "✓"; position: absolute; left: 0; color: #00cc88; font-weight: 700; }
  .verdict-box { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px 16px; font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.65; margin-top: 8px; }
  .action-row { display: flex; gap: 10px; margin-top: 4px; }
  .action-btn { flex: 1; border-radius: 10px; padding: 11px; font-size: 14px; cursor: pointer; font-family: inherit; text-align: center; border: none; }
  .new-btn { background: rgba(255,30,30,0.12); border: 1px solid rgba(255,30,30,0.3) !important; color: #ff3c3c; border-style: solid; }
  .footer { text-align: center; padding: 44px 0 0; font-size: 12px; color: rgba(255,255,255,0.18); line-height: 1.9; }
`;

const bodyHTML = `
<div class="header">
  <div class="tag">AI-Powered · Brutally Honest</div>
  <h1>Red Flag Rater 🚩</h1>
  <p class="subtitle">Paste their texts, dating profile, or describe their behavior.<br>AI rates the red flags 1–10 with a full breakdown.</p>
</div>

<div class="card">
  <label class="card-label">Who or what are we rating? <span class="optional">(optional)</span></label>
  <input type="text" id="inp-subject" placeholder="e.g. guy I've been texting, Hinge match, my ex…" />
</div>

<div class="card">
  <label class="card-label">Paste their texts, profile, or describe the situation</label>
  <textarea id="inp-content" placeholder="e.g. He always takes 3 days to reply but posts on Instagram constantly. When I bring it up he says I'm 'too needy'..."></textarea>
</div>

<button id="analyze-btn">🚩&nbsp; Rate the Red Flags</button>
<p class="error-msg" id="error-msg"></p>

<div id="preview-section">
  <div class="preview-card">
    <div class="score-teaser">
      <div class="score-number" id="preview-score">—</div>
      <div class="score-verdict" id="preview-verdict">—</div>
      <div class="score-flag-count" id="preview-flag-count"></div>
      <div class="score-track"><div class="score-fill" id="score-bar-fill" style="width:0%"></div></div>
    </div>
    <div class="pay-gate">
      <div class="pay-title">See the full breakdown 🔍</div>
      <div class="pay-sub">Every red flag explained · One-time $3</div>
      <button class="pay-btn" id="pay-btn">💳&nbsp; Pay $3 to Unlock</button>
      <div class="already-paid">Already paid? Enter your order ID from your Gumroad confirmation email</div>
      <div class="unlock-row">
        <input class="unlock-input" id="order-input" placeholder="Your Gumroad order ID…" />
        <button class="unlock-btn" id="unlock-btn">Unlock</button>
      </div>
      <p class="error-msg" id="unlock-error" style="margin-top:10px;"></p>
    </div>
  </div>
</div>

<div id="unlocked-section">
  <div class="result-card">
    <div class="result-score-row">
      <div class="full-score-num" id="full-score">—</div>
      <div class="full-verdict-text" id="full-verdict">—</div>
      <p class="full-summary" id="full-summary"></p>
      <div class="score-track" style="max-width:300px;margin:0 auto;">
        <div class="score-fill" id="full-score-bar" style="width:0%"></div>
      </div>
    </div>
    <div class="section-label">Red Flags Detected 🚩</div>
    <div id="flags-list"></div>
    <div id="green-section">
      <div class="section-label">Green Flags ✅</div>
      <ul id="green-flags-list"></ul>
    </div>
    <div class="section-label">Overall Verdict</div>
    <div class="verdict-box" id="verdict-detail"></div>
  </div>
  <div class="action-row">
    <button class="action-btn new-btn" id="new-btn">🚩&nbsp; Rate someone else</button>
  </div>
</div>

<div class="footer">
  <div>Made with Claude AI · Red Flag Rater</div>
  <div>Trust your gut, but let AI confirm it 🚩</div>
</div>
`;

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>🚩 Red Flag Rater</title>
        <meta name="description" content="Paste their texts, dating profile, or describe their behavior. AI rates the red flags 1-10 with a full breakdown." />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
