# GOLU product specification

## Product
A managed AI website platform for businesses, initially focused on Nigerian small and medium businesses.

## Core journey
1. Account creation: Google sign-in, followed by profile completion. No waitlist is required to create an account.
2. Website onboarding: structured business questionnaire plus free-form notes.
3. References: Basic maximum 3; Pro maximum 6. References inform the design but must not be copied.
4. Generation: Kimi K3.1 Pro creates an original website plan tailored to the business, using uploaded business images and their placement instructions.
5. Editing: owner requests changes through conversational chat; each successful change consumes a monthly credit.
6. Publishing: managed hosting/deployment, after a deployment provider adapter is connected.
7. Ongoing: project dashboard, usage tracking, plan management and SEO tools.

## Plans
| Feature | Basic (paid) | Pro (paid) |
|---|---:|---:|
| Reference images per generation | 3 | 6 |
| AI change credits / month | 10 | 50 |
| Website generations / month | 2 | 10 |
| Managed hosting | Planned | Planned |
| Basic SEO foundation | Planned | Planned |
| Google Search Console | — | Planned |
| Sitemap submission | — | Planned |
| Indexing monitoring | — | Planned |
| Search performance analytics | — | Planned |

Unused monthly allowances expire at the end of each monthly cycle. No rollover. Prices are intentionally unspecified pending confirmation.

## Architecture
- Frontend: Next.js App Router, React and Tailwind.
- Identity: Firebase Authentication.
- Data: Firestore.
- Image storage: Firebase Storage.
- AI: Kimi API, called only from server routes. Kimi is the only AI provider in scope.
- Server authorization: Firebase Admin verifies ID tokens and enforces ownership.
- Billing: provider integration required before paid plans can be activated.
- Deployment: provider adapter required before publishing is enabled.


## Business image assets

Customers can upload actual website images separately from visual design references. Each asset stores a name, description, placement target and optional instructions. The image is stored in the customer's Firebase Storage folder and supplied to Kimi as an image input alongside the structured placement brief. Kimi must preserve the provided URL and use the image in the requested section.

## Help centre

A public Help Me page at `/help` explains account setup, website creation, image uploads and placement, design references, AI chat editing, preview/publishing, plans/credits and account/billing support.
