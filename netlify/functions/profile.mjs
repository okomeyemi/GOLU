
import { admin, userFrom, json } from './_shared.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const user = await userFrom(request);
    const data = await request.json();

    const businessName = String(data.businessName || '').trim();
    const phone = String(data.phone || '').trim();

    if (businessName.length < 2) {
      return json(400, {
        error: 'Please enter a valid company name.'
      });
    }

    if (phone.length < 7 || phone.length > 20) {
      return json(400, {
        error: 'Please enter a valid phone number.'
      });
    }

    const { db } = admin();

    await db.collection('users').doc(user.uid).set({
      displayName: businessName,
      businessName,
      phone,
      email: user.email || '',
      updatedAt: new Date()
    }, {
      merge: true
    });

    return json(200, {
      ok: true,
      message: 'Business profile saved successfully.'
    });

  } catch (error) {
    console.error('Profile function error:', error);

    return json(error.statusCode || 500, {
      error: error.message || 'Unable to save your business profile.'
    });
  }
}
