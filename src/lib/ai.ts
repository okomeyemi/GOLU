/** Kimi is the only AI provider used by GOLU. Keep this key server-side. */
export type KimiContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };
export type KimiMessage = { role: 'system' | 'user' | 'assistant'; content: string | KimiContentPart[] };

export async function askKimi(messages: KimiMessage[]) {
  const key = process.env.KIMI_API_KEY;
  if (!key) throw new Error('KIMI_API_KEY is missing. Add it to your Netlify server environment variables.');
  const base = (process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.KIMI_MODEL || 'kimi-k3.1-pro',
      messages,
      max_completion_tokens: 12000,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      stream: false
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Kimi request failed (${response.status})`);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('Kimi returned an empty response. Please try again.');
  return content;
}
