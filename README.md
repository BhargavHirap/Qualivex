# Qualivex

**Turn conversations into customers.**

Qualivex is an AI-assisted lead qualification and appointment workflow for service businesses. The first release is a polished, interactive product preview with a lead pipeline, manual lead capture and a rule-based qualification endpoint.

## Current status — v0.1.0
- Premium SaaS landing page
- Responsive sales dashboard
- Search and status filters for demo leads
- Add-lead flow (in-memory demo state)
- Lead qualification API (transparent rule-based scoring)
- Sample pipeline metrics and upcoming meetings

> This is a demo build. Sample leads and metrics are not real customer data. Leads added in the browser are not persisted after refresh. The qualification endpoint is a rules-based prototype, not an LLM.

## Run locally
Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Roadmap
1. Supabase Auth, tenant-aware Postgres schema and row-level security.
2. Persisted leads, activities, conversations and qualification outcomes.
3. Configurable qualification criteria and an LLM-backed assistant with human review.
4. Website chat widget and inbound lead capture.
5. Calendar availability, booking confirmation and reminders.
6. WhatsApp Business Platform and email integrations with consent and provider approval.
7. Analytics, audit trail, billing, monitoring and production hardening.

## Environment variables
See [.env.example](.env.example). Never commit secrets. Provider integrations remain disabled until credentials are configured.

## Security principles
- Keep provider and service-role secrets server-side only.
- Enforce tenant ownership in database policies and API authorization.
- Validate and rate-limit public lead intake endpoints.
- Obtain consent before sending marketing or WhatsApp messages.
- Provide human handoff and avoid claiming a meeting is booked until the calendar provider confirms it.

## Stack
Next.js App Router, React, TypeScript, Tailwind CSS and Lucide icons.

## License
All rights reserved until a license is selected.
