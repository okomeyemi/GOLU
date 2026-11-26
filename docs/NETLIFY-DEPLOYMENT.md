# GOLU static website + Netlify Functions deployment

This package replaces the Next.js/React frontend with plain HTML, CSS and browser JavaScript. Netlify Functions provide authenticated server endpoints. Firebase remains the existing identity, Firestore and Storage backend. Kimi is called only from a Netlify Function; the Kimi secret is never sent to the browser.

## Deploy
1. Upload/extract this ZIP so `index.html` is inside the `public` folder at the repository root.
2. In `public/firebase-config.js`, enter the Web App config from the existing Firebase project. Enable Google as a sign-in provider and add the deployed Netlify domain to Firebase Authentication authorized domains.
3. In Netlify, add environment variables: `KIMI_API_KEY`, `KIMI_BASE_URL` (normally `https://api.moonshot.ai/v1`), `KIMI_MODEL` (the model identifier enabled for your Kimi account), `FIREBASE_SERVICE_ACCOUNT_JSON` (complete service-account JSON as one value), `FIREBASE_PROJECT_ID`, and `FIREBASE_STORAGE_BUCKET`. Do not put secrets in `public/firebase-config.js`.
4. Deploy the Firestore and Storage rules in this package to the existing Firebase project. Confirm the Storage bucket matches the Firebase web config.
5. Build settings: Base directory `/`, Build command `npm run build`, Publish directory `public`, Functions directory `netlify/functions`. Netlify must install dependencies.
6. Redeploy and inspect function logs.

## Current implementation boundaries
- Implemented: Google sign-in, profile completion, dashboard, monthly allowance reads/enforcement, custom website specification generation, reference-image and business-image uploads, Kimi chat editing, basic generated-site preview, help page.
- Not activated: live managed site publishing (deployment provider adapter), OPay checkout/webhooks, Google Search Console automation/analytics. The UI must not claim these are live.
- The preview is a basic schema renderer, not yet a production-grade exportable website renderer.

## Security
- Firebase web config is public client configuration. Firebase Admin service account JSON and Kimi key are secrets and belong only in Netlify environment variables.
- Firebase rules must enforce user ownership. Server functions verify Firebase ID tokens and verify project ownership.
- For production, add rate limiting, stronger upload validation, audit logging and transactional rollback/refund of usage when Kimi fails.
