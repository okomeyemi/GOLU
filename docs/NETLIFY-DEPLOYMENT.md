# Netlify deployment

## Build settings

This project uses the Netlify Next.js runtime. The repository includes `netlify.toml` with:

- Build command: `npm run build`
- Publish directory: `.next`
- Node.js: 22
- Plugin: `@netlify/plugin-nextjs`

Do not deploy this project as a plain static export. Its API routes require the Next.js server runtime.

## Required environment variables

Set these in Netlify Site configuration → Environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `KIMI_API_KEY`
- `KIMI_BASE_URL` (normally `https://api.moonshot.ai/v1`)
- `KIMI_MODEL` (normally `kimi-k3.1-pro`)
- `APP_BASE_URL` (the deployed site origin)

Keep `KIMI_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` server-side. Never prefix them with `NEXT_PUBLIC_`.

## Build procedure

Netlify installs dependencies and runs `npm run build`. The build runs Next.js production compilation and TypeScript validation. A successful compile alone does not verify external Firebase or Kimi credentials; test sign-in, image upload, generation, editing, and publishing after deployment.

If Netlify is connected to a Git repository, it builds the selected branch and commit. Changes in a downloaded ZIP do not affect that repository until those files are copied into the repository and committed.
