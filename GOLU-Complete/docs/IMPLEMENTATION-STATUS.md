# Implementation status

## Implemented in this source package
- Kimi-only server-side chat-completions integration.
- Firebase authentication and profile onboarding.
- Plan allowance checks for generation and chat changes.
- Website brief and generation request.
- Firebase Storage business-image uploads with name, optional collection, description, placement and notes.
- Image URLs and placement instructions are saved with the project and passed to Kimi as multimodal image inputs during generation and chat edits.
- Help Me page at `/help`.
- Basic visual website preview that renders generated pages and supplied image URLs.

## Still requires configuration or further implementation
- Add valid Firebase web config and Admin service-account credentials.
- Deploy Firestore and Storage rules to the existing Firebase project and verify Storage bucket settings.
- Add a valid Kimi API key and confirm the account's base URL/model identifier.
- The current preview is a basic schema renderer. A production-grade responsive site renderer, browser/device preview testing and export-ready site packaging still need to be completed.
- Managed Netlify publishing requires deployment credentials and end-to-end verification.
- OPay checkout and webhook processing require merchant credentials and testing.
- Pro Google Search Console workflows require implementation and verification.
- Production build and integration tests must be run in an environment with npm registry access and configured service credentials.

