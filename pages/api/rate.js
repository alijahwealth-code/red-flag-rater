import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, subject } = req.body || {};
  if (!content || !content.trim()) return res.status(400).json({ error: 'Nothing to analyze.' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  const secret = process.env.ENCRYPTION_SECRET;
  if (!apiKey || !secret || secret.length !== 64) {
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  const systemPrompt = 'You are a brutally honest relationship analyst who rates red flags. You analyze texts, dating profiles, or behavior descriptions and give a red flag score. Be specific, sharp, and entertaining — but accurate. Respond in valid JSON only, no markdown: {"score": <number 1-10>, "verdict": "<2-4 word dramatic verdict>", "summary": "<2 sentences>", "flags": [{"flag": "<name>", "severity": "low"|"medium"|"high", "detail": "<one sentence>"}], "green_flags": ["<any positives or empty array>"], "verdict_detail": "<2-3 sentences overall assessment>"}';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://red-flag-rater.vercel.app',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze this' + (subject ? ' (about: ' + subject + ')' : '') + ':\n\n' + content.slice(0, 3000) }
        ],
        max_tokens: 800,
        temperature: 0.75,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI request failed.');

    const raw = data.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    const key = Buffer.from(secret, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(JSON.stringify(result), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    const token = iv.toString('hex') + '.' + encrypted + '.' + tag.toString('hex');

    const preview = {
      score: result.score,
      verdict: result.verdict,
      flagCount: (result.flags || []).length,
    };

    return res.status(200).json({ preview, token });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Analysis failed. Try again.' });
  }
}
