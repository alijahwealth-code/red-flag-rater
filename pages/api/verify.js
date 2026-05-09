import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, rateId } = req.body || {};
  if (!orderId || !rateId) return res.status(400).json({ error: 'Missing order ID or session.' });

  try {
    const saleValid = await redis.get(`sale:${orderId.trim()}`);
    if (!saleValid) {
      return res.status(403).json({ error: 'Order ID not found. Check your Gumroad confirmation email.' });
    }

    const stored = await redis.get(`rate:${rateId}`);
    if (!stored) {
      return res.status(404).json({ error: 'Session expired. Please analyze again.' });
    }

    await redis.del(`rate:${rateId}`);

    const result = JSON.parse(stored);
    return res.status(200).json({ result });
  } catch (e) {
    console.error('Verify error:', e);
    return res.status(500).json({ error: 'Server error. Try again.' });
  }
}
