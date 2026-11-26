# GOLU Netlify Deployment

GOLU uses a static HTML, CSS and JavaScript frontend with Netlify Functions for server-side operations.

Firebase provides authentication, database and file storage. Kimi handles AI website generation and conversational editing.

## 1. Firebase setup

1. Open the existing GOLU Firebase project.
2. Enable Google sign-in under Authentication.
3. Add your Netlify domain to Authentication authorized domains.
4. Copy the Firebase Web App configuration.
5. Paste the configuration into:

   `public/firebase-config.js`

6. Deploy the supplied Firestore and Storage rules to the existing Firebase project.

## 2. Netlify environment variables

Open:

Netlify → Site configuration → Environment variables

Add these variables:

| Variable | Value |
|---|---|
| KIMI_API_KEY | Your Kimi API key |
| FIREBASE_SERVICE_ACCOUNT_JSON | Your Firebase Admin service-account JSON |
| FIREBASE_PROJECT_ID | Your existing Firebase project ID |
| FIREBASE_STORAGE_BUCKET | Your Firebase Storage bucket |

Do not add KIMI_BASE_URL or KIMI_MODEL.

The Kimi endpoint and model are configured inside:

`netlify/functions/_shared.mjs`

Never put the Kimi API key or Firebase service-account credentials in frontend files.

## 3. Build settings

Configure Netlify as follows:

- Base directory: `/`
- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

Netlify must install the dependencies listed in `package.json`.

## 4. Deploy

1. Save all updated files.
2. Commit and push the changes to the GitHub branch connected to Netlify.
3. Open Netlify.
4. Select Deploys.
5. Trigger a new deployment.
6. Check the deployment log.

## 5. Current implementation boundaries

Implemented in this package:

- Google sign-in
- Profile completion
- Dashboard
- Monthly usage allowance checks
- Website specification generation
- Business image uploads
- Reference image uploads
- Kimi conversational editing
- Basic generated website preview
- Help page

Not yet activated:

- Live managed website publishing
- OPay payment checkout and webhooks
- Google Search Console automation
- Automated sitemap submission
- Search performance analytics

Do not advertise these unavailable features as active.

## 6. Security

- Keep KIMI_API_KEY in Netlify environment variables.
- Keep Firebase Admin credentials server-side.
- Firebase web configuration is public client configuration.
- Enforce project ownership in server functions and Firebase rules.
- Add production rate limiting, upload validation and usage rollback before public launch.