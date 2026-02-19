
// Route through the Vercel/Express backend proxy to avoid CORS issues.
// In development the dev server proxies /api → localhost:3001,
// in production Vercel routes /api → server.js automatically.
const N8N_WEBHOOK_URL = '/api/webhook/jarvis';

export interface WebhookResponse {
  response?: string;
  message?: string;
  data?: any;
  error?: string;
}

// Keywords that indicate an inventory / product query
const INVENTORY_KEYWORDS = [
  'sold', 'sell', 'sales', 'product', 'products', 'stock', 'inventory',
  'item', 'items', 'quantity', 'qty', 'available', 'remaining', 'left',
  'how many', 'total', 'report', 'sheet', 'list', 'current', 'price',
];

export function isInventoryQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return INVENTORY_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Sends the user's spoken query to the n8n webhook.
 * n8n reads your Google Sheet and returns the relevant inventory data.
 */
export async function queryJarvisWebhook(query: string): Promise<string | null> {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        intent: 'inventory',
        timestamp: new Date().toISOString(),
        source: 'jarvis-voice',
      }),
    });

    if (!res.ok) {
      console.error(`Webhook error: ${res.status} ${res.statusText}`);
      return null;
    }

    // n8n can return plain text or JSON — handle both
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json: WebhookResponse = await res.json();
      return json.response || json.message || (json.data ? JSON.stringify(json.data) : null);
    } else {
      const text = await res.text();
      return text.trim() || null;
    }
  } catch (err) {
    console.error('Webhook request failed:', err);
    return null;
  }
}
