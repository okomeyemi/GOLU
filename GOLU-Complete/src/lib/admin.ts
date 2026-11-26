import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function adminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON.');
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}
export function adminDb() { return getFirestore(adminApp()); }
export function adminAuth() { return getAuth(adminApp()); }
export { FieldValue };
