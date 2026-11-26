import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Public Kimi configuration.
// These are not secrets and should not be Netlify environment variables.
const KIMI_BASE_URL = 'https://api.moonshot.ai/v1';
const KIMI_MODEL = 'kimi-k3.1-pro';

export function admin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!raw) {
      throw new Error(
        'Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON in Netlify.'
      );
    }

    const service = JSON.parse(raw);

    initializeApp({
      credential: cert(service),
      ...(process.env.FIREBASE_STORAGE_BUCKET
        ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET }
        : {})
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore()
  };
}

export async function userFrom(event) {
  const headers = event.headers || {};
  const authorization =
    headers.authorization || headers.Authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    throw Object.assign(
      new Error('Sign in to continue.'),
      { statusCode: 401 }
    );
  }

  return admin().auth.verifyIdToken(
    authorization.slice(7)
  );
}

export const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

export const parse = event =>
  JSON.parse(event.body || '{}');

export const plans = {
  basic: {
    referenceImages: 3,
    monthlyChanges: 10,
    monthlyGenerations: 2
  },
  pro: {
    referenceImages: 6,
    monthlyChanges: 50,
    monthlyGenerations: 10
  }
};

export const planOf = value =>
  value === 'pro' ? 'pro' : 'basic';

export async function consume(uid, kind, amount = 1) {
  const { db } = admin();

  const month = new Date().toISOString().slice(0, 7);
  const usageRef = db.collection('usage').doc(`${uid}_${month}`);
  const userRef = db.collection('users').doc(uid);

  return db.runTransaction(async transaction => {
    const usageSnapshot = await transaction.get(usageRef);
    const userSnapshot = await transaction.get(userRef);

    const plan = planOf(userSnapshot.data()?.plan);

    const limit =
      kind === 'changes'
        ? plans[plan].monthlyChanges
        : plans[plan].monthlyGenerations;

    const used = Number(
      usageSnapshot.data()?.[kind] || 0
    );

    if (used + amount > limit) {
      throw new Error(
        `Monthly ${kind} allowance used. Your ${plan} plan allows ${limit} per month.`
      );
    }

    transaction.set(
      usageRef,
      {
        uid,
        month,
        [kind]: used + amount,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return {
      used: used + amount,
      limit,
      remaining: limit - used - amount
    };
  });
}

export async function kimi(messages) {
  const apiKey = process.env.KIMI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'KIMI_API_KEY is missing. Add it to Netlify environment variables.'
    );
  }

  const response = await fetch(
    `${KIMI_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages,
        max_completion_tokens: 12000,
        reasoning_effort: 'low',
        response_format: {
          type: 'json_object'
        },
        stream: false
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      `Kimi request failed (${response.status})`
    );
  }

  const content =
    data?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Kimi returned an empty response.');
  }

  return content;
}

export function safeJson(raw) {
  return JSON.parse(
    raw
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim()
  );
}