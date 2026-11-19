# Qualivex

**AI-assisted lead qualification and booking handoff for high-ticket service businesses.**

Qualivex is a multi-tenant revenue workflow product. It captures enquiries, qualifies them against explicit business rules, maintains conversation state, routes unsuitable or sensitive enquiries to humans, and hands qualified prospects to a configured calendar booking page.

## Implemented in the repository

- Supabase Auth and workspace-scoped data model with Row Level Security.
- Persistent lead pipeline with create/read/update/delete, search, status updates and CSV export.
- Configurable qualification profile per workspace: service, target service, budget tier, timeline, approved FAQs, alternative resource, calendar link and timezone.
- AI Studio page with a persistent one-question-at-a-time conversation tester.
- Groq-compatible conversational AI adapter with JSON output and a rules fallback.
- Server-side qualification gate: an LLM cannot mark a prospect qualified unless all required evidence and contact details are present.
- Sticky state merge: an omitted/null model value does not erase previously confirmed information.
- Disqualification and human-handoff paths.
- Conversation and message persistence with workspace RLS.
- Calendar handoff through a workspace-configured Cal.com/booking URL; no slot is claimed to be available unless the calendar provider confirms it.
- Mobile-first short-message prompt behaviour and channel metadata foundation.

## Activation status — read before pitching

The latest source is committed to GitHub, but this is **not yet a production-live service**. A dedicated Supabase project has not been provisioned, migrations have not been applied, production environment variables are not configured, and the latest source has not been confirmed deployed. Do not send real prospect data to it until these steps and the security checks are complete.

The current AI Studio supports authenticated web conversations. WhatsApp and Instagram DM are **not live integrations yet**: they require a Meta app, business-account permissions, webhook verification, approved messaging permissions/templates where applicable, and production tokens. Calendar is currently a booking-link handoff, not a live availability query or confirmed appointment API. Cal.com/Google Calendar OAuth, booking webhooks, reminders and attendance verification remain integration work.

## Zero-upfront operating model

- The app code is designed to use free tiers where available.
- Groq free-tier availability, limits and commercial terms can change; check the provider's current terms before a client pilot.
- Cal.com and Supabase free plans have usage/feature limits. Free-tier availability is not a guarantee of permanent zero cost.
- Do not promise a client real-time calendar booking until the selected calendar provider is connected and its booking confirmation webhook is verified.
- Do not charge per-showed-qualified-call until attendance is independently confirmed and the pilot agreement defines disputes, duplicates and attribution.

## Stack

- Next.js App Router, React and TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Groq-compatible API for optional conversational reasoning; rules fallback
- Cal.com booking-link handoff configured per workspace
- Vercel deployment

## Setup sequence

1. Provision a **dedicated** Supabase project for Qualivex. Do not reuse the MUMOVE or unrelated project.
2. Apply migrations in order:
   - `supabase/migrations/20261119000100_qualivex_core.sql`
   - `supabase/migrations/20261119000200_qualivex_conversations.sql`
3. Configure Vercel encrypted environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `GROQ_API_KEY` (optional; rules mode remains available without it)
   - `GROQ_MODEL` (optional)
4. Configure Supabase Auth site URL and redirect allowlist for the production domain.
5. Deploy the current main branch and verify health, auth, RLS, profile save, conversation persistence and calendar handoff.
6. In the authenticated app, open **AI Studio**, configure business rules and an HTTPS booking URL, save, and test qualification/disqualification/handoff scenarios.
7. Before a live client pilot, add privacy notice, retention rules, explicit consent, Meta channel approval if used, and a signed pilot agreement.

For local development, copy `.env.example` to `.env.local`, install dependencies and run `npm run dev`.

## Security and operational rules

- Never expose Supabase service-role/secret keys in the browser.
- Never store raw enquiry text in qualification analytics by default; conversation messages are persisted to support context, so disclose this clearly and set a retention policy before production.
- Treat model output as untrusted. The server independently enforces qualification status.
- Never invent price, medical/legal/financial claims, calendar availability or guaranteed outcomes.
- Human handoff is required for media/voice notes, complaints, requests for a person and unsupported high-stakes questions.
- Use provider signatures and event-id deduplication before enabling external webhooks.
- Keep outbound WhatsApp/Instagram messaging compliant with opt-in and platform rules.

## Product proof

Qualivex is not objectively “100x better” than mature CRM and conversational AI competitors today. Its intended differentiation is explainable qualification, strict server-side gates, human handoff, vertical-specific playbooks and an outcome-based pilot model. Prove performance with real pilot data: median first-response time, qualification precision, qualified-to-booked rate, show rate, attended qualified calls and client revenue attribution.

## Current limitations

- No WhatsApp/Instagram production webhook sender yet.
- No calendar free/busy lookup, OAuth integration or appointment confirmation webhook yet.
- No automated email/SMS reminders or no-show verification.
- No billing, team invitations, role management or client-facing analytics yet.
- Deployment and database activation are pending.

## License

All rights reserved until a license is selected.
