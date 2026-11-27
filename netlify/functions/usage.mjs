
import { admin, userFrom, json, plans, planOf } from './_shared.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const userAuth = await userFrom(request);
    const { db } = admin();

    const user = (await db.collection('users').doc(userAuth.uid).get()).data() || {};
    const plan = planOf(user.plan);
    const month = new Date().toISOString().slice(0, 7);

    const usage = (
      await db.collection('usage').doc(`${userAuth.uid}_${month}`).get()
    ).data() || {};

    const limits = plans[plan];

    return json(200, {
      plan,
      limits: {
        changes: limits.monthlyChanges,
        generations: limits.monthlyGenerations,
        referenceImages: limits.referenceImages
      },
      used: {
        changes: Number(usage.changes || 0),
        generations: Number(usage.generations || 0)
      },
      remaining: {
        changes: Math.max(0, limits.monthlyChanges - Number(usage.changes || 0)),
        generations: Math.max(0, limits.monthlyGenerations - Number(usage.generations || 0))
      },
      month
    });
  } catch (error) {
    console.error('Usage function error:', error);

    return json(error.statusCode || 500, {
      error: error.message || 'Unable to retrieve usage.'
    });
  }
}
