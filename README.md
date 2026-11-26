# GOLU

GOLU is a custom AI website creation platform for businesses. The application uses **Kimi K3.1 Pro as its only AI provider** for website planning and conversational website changes.

## Current application features

- Firebase Google sign-in and profile completion.
- Basic and Pro plan allowance checks for website generations and AI changes.
- Business onboarding form and structured website brief.
- Separate design-reference images and actual business image uploads.
- Per-image name, optional collection, description, placement selection and extra instructions.
- Firebase Storage uploads with authenticated user paths and image size/type rules.
- Kimi receives image URLs as image inputs together with placement instructions.
- Project dashboard and conversational AI editing with assigned business images in context.
- Public Help Me page at `/help`.

## Configure environment

1. Copy `.env.example` to `.env.local`.
2. Add the Firebase web configuration and Firebase Admin service account JSON for the existing Firebase project.
3. Add `KIMI_API_KEY`. Keep it server-side; never use a `NEXT_PUBLIC_` prefix.
4. Set `KIMI_BASE_URL` and `KIMI_MODEL` to the endpoint and model enabled for your Kimi account. Defaults are `https://api.moonshot.ai/v1` and `kimi-k3.1-pro`.
5. Deploy the Firestore and Storage rules in this project to the existing Firebase project.
6. Install dependencies with `npm install`, then run `npm run dev` locally or `npm run build` before deploying to Netlify.

## Image uploads

Business images are uploaded under `users/{uid}/assets/` in Firebase Storage. Each image must be under 8 MB according to Storage rules. The onboarding form currently allows up to 30 business images per generation. The Basic/Pro reference-image allowance is separate: Basic allows 3 design references and Pro allows 6. Business images are passed to Kimi as image inputs, with their descriptions and placement instructions.

## Deployment and integrations

This repository is a working foundation, not a claim that every production integration is complete. Managed publishing still requires a configured deployment provider and end-to-end verification. Billing checkout is not active until OPay merchant credentials and webhook configuration are supplied and tested. Google Search Console Pro workflows also require implementation and verification. Do not tell customers a site is live until the deployment provider confirms success.

## Security notes

- Keep Kimi API keys, Firebase service-account JSON and deployment tokens in server-side environment variables.
- Never commit `.env.local`.
- Firebase Storage rules restrict uploads to the authenticated user's own folder.
- Server routes validate uploaded asset URLs against the signed-in user's Firebase Storage path.
