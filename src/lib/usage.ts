import { adminDb, FieldValue } from './admin';
import { getPlan, PLANS } from './plans';

const monthKey = () => new Date().toISOString().slice(0,7);
export async function consume(uid:string, kind:'changes'|'generations', amount=1) {
  const db = adminDb(), ref = db.collection('usage').doc(`${uid}_${monthKey()}`);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref), current = snap.data() || {};
    const user = await db.collection('users').doc(uid).get();
    const plan = getPlan(user.data()?.plan);
    const limit = kind === 'changes' ? PLANS[plan].monthlyChanges : PLANS[plan].monthlyGenerations;
    const used = Number(current[kind] || 0);
    if (used + amount > limit) throw new Error(`Monthly ${kind} allowance used. Your ${plan} plan allows ${limit} per month.`);
    tx.set(ref, { uid, month:monthKey(), [kind]:used+amount, updatedAt:FieldValue.serverTimestamp() }, {merge:true});
    return {used:used+amount, limit, remaining:limit-used-amount};
  });
}
