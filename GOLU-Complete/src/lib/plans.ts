export const PLANS = {
  basic: { name: 'Basic', referenceImages: 3, monthlyChanges: 10, monthlyGenerations: 2 },
  pro: { name: 'Pro', referenceImages: 6, monthlyChanges: 50, monthlyGenerations: 10 }
} as const;
export type PlanId = keyof typeof PLANS;
export function getPlan(value: unknown): PlanId {
  return value === 'pro' ? 'pro' : 'basic';
}
