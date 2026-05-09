import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const systemPrompt = `You are a brutally honest relationship analyst who rates red flags. You analyze texts, dating profiles, or behavior descriptions and give a red flag score. Be specific, sharp, and entertaining — but accurate. Don't sugarcoat.

Respond in valid JSON only, no markdown:
{
  "score": <number 1-10, where 1=totally fine, 10=run immediately>,
  "verdict": "<2-4 word dramatic verdict e.g. 'MAJOR RED FLAGS', 'PROCEED WITH CAUTION', 'WALK AWAY NOW', 'SURPRISINGLY CLEAN'>",
  "summary": "<2 sentences: what this person/situation is giving>",
  "flags": [
    { "flag": "<red flag name>", "severity": "low" | "medium" | "high", "detail": "<one sentence explanation>" }
  ],
  "green_flags": ["<any positive signs, or empty array if none>"],
  "verdict_detail": "<2-3 sentences of honest overall assessment and recommendation>"
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, subject } = req.body || {};
  if (!content || !content.trim()) return res.status(400).json({ error: 'Nothing to analyze.' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server misconfiguration.' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://red-flag-rater.vercel.app',
        'X-Title': 'Red Flag Rater',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze this' + (subject ? ` (about: ${subject})` : '') + ':\n\n' + content.slice(0, 3000) },
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

    // Store full result in Redis — expires in 2 hours
    const rateId = randomUUID();
    await redis.set(`rate:${rateId}`, JSON.stringify(result), { ex: 7200 });

    // Send only a teaser preview to the browser
    const preview = {
      score: result.score,
      verdict: result.verdict,
      flagCount: (result.flags || []).length,
    };

    return res.status(200).json({ preview, rateId });
  } catch (e) {
    console.error('Rate error:', e);
    return res.status(500).json({ error: e.message || 'Analysis failed. Try again.' });
  }
}
