
import { admin, userFrom, json } from './_shared.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const user = await userFrom(request);
    const { db } = admin();

    const snapshot = await db
      .collection('projects')
      .where('uid', '==', user.uid)
      .get();

    const projects = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort(
        (a, b) =>
          (b.updatedAt?._seconds || 0) -
          (a.updatedAt?._seconds || 0)
      );

    return json(200, { projects });
  } catch (error) {
    return json(error.statusCode || 500, {
      error: error.message || 'Unable to load projects.'
    });
  }
}
