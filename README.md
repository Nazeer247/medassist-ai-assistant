# Curexplore Patient Concierge — Demonstration

Responsive patient-enquiry interface with server-side OpenAI chat integration and lead capture.

## Run locally
1. Install Node.js 20 or newer.
2. Clone this repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your private OpenAI API key to `OPENAI_API_KEY`.
6. Run `npm start` and open http://localhost:3000.

Without an API key, the interface loads but live AI replies are disabled with a clear message.

## Included
- Responsive Curexplore-inspired interface.
- Conversational AI endpoint at `POST /api/chat`.
- Lead capture endpoint at `POST /api/leads`.
- Local JSON lead storage for development.
- FAQ structured data (JSON-LD) and page metadata as an AEO/SEO starting point.

## Important
This is an independent demonstration, not an official Curexplore service. Do not use Curexplore branding publicly without permission. The AI must not diagnose, recommend treatment, interpret reports, promise outcomes, or handle emergencies. Clinical decisions belong to licensed clinicians.

Local JSON storage is for development only. Before production, use an access-controlled database/CRM, HTTPS, rate limiting, spam protection, admin authentication, retention rules, backups, privacy/legal review and company approval. Do not collect real patient records or identity documents through this demo.

AEO schema is a technical starting point, not a guarantee of visibility. All company/service claims must be reviewed and approved by Curexplore.
