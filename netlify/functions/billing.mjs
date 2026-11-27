
import { userFrom, json } from './_shared.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    await userFrom(request);

    return json(503, {
      ok: false,
      error: 'OPay payments are temporarily unavailable. Payment credentials and webhook configuration are not connected yet.'
    });
  } catch (error) {
    return json(error.statusCode || 401, {
      error: error.message || 'Authentication failed.'
    });
  }
}
