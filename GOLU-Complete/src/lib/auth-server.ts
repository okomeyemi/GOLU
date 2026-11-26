import { NextRequest } from 'next/server';
import { adminAuth } from './admin';
export async function requireUser(req: NextRequest) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new Error('Sign in to continue.');
  return adminAuth().verifyIdToken(token);
}
