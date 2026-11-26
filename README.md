# GOLU — Static Netlify edition

GOLU is a custom AI website creation platform for businesses. This edition uses a plain HTML/CSS/JavaScript frontend and Netlify Functions, with the existing Firebase project for authentication, Firestore and Storage. Kimi K3.1 Pro is the sole AI provider.

See `docs/NETLIFY-DEPLOYMENT.md` for setup. Set the Firebase web configuration in `public/firebase-config.js`; set Kimi and Firebase Admin secrets in Netlify environment variables. Never put secrets in browser JavaScript or commit `.env` files.

Basic plan: 3 reference images, 10 monthly AI changes, 2 monthly generations. Pro: 6 reference images, 50 monthly AI changes, 10 monthly generations. Monthly allowances expire without rollover. Billing and managed publishing are not activated until their provider integrations and credentials are implemented and tested.
