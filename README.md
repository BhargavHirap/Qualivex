# Qualivex

**The revenue workflow for modern service businesses.**

Qualivex is building a secure, AI-assisted workspace that helps teams capture, qualify, manage and convert inbound prospects. It is designed around a simple principle: every recommendation should be explainable, every action should be auditable, and customer data should remain isolated by workspace.

## Current build — v0.2.0

Implemented in the repository:
- Premium product website and responsive workspace UI.
- Supabase Auth sign-up and sign-in experience.
- Multi-tenant database schema for workspaces, memberships, leads, appointments and qualification events.
- Row-level security policies designed to isolate workspace data.
- Persistent lead create/read/update/delete flows.
- Lead pipeline search, status management and real database metrics (no fabricated sample records).
- Qualification API with a provider-ready OpenAI integration and an explicit rules-only fallback.
- Qualification history stored without retaining the raw enquiry text by default.
- Health endpoint that reports whether database and AI credentials are configured.

## Important activation requirements

This repository is now structured as a real application, but it is **not production-live until a dedicated Supabase project is connected and the migration is applied**. AI reasoning requires an OpenAI API key. Calendar, WhatsApp, email, billing and inbound website capture are not yet connected.

Do not treat the rules-only qualifier as an LLM. The interface reports which mode produced each result.

## Stack
- Next.js 14 App Router, React and TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Vercel deployment
- OpenAI Chat Completions API (optional; server-side only)

## Setup

1. Create a dedicated Supabase project for Qualivex.
2. Apply `supabase/migrations/20261119000100_qualivex_core.sql` to that project.
3. In Vercel, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY` (optional until AI qualification is enabled)
   - `OPENAI_MODEL` (optional; defaults to `gpt-4.1-mini`)
4. Redeploy the Vercel project.
5. Configure Supabase Auth email confirmation and allowed redirect URLs for the production domain.

For local development, copy `.env.example` to `.env.local`, install dependencies and run `npm run dev`.

## Security baseline
- No service-role key is used in the browser.
- Authenticated server routes verify the user session.
- Database RLS is the tenant boundary; API filtering is not treated as authorization.
- Qualification events store score/signals/model, not the full raw prospect message by default.
- AI output is treated as advisory; humans remain responsible for qualification and outreach.
- Secrets belong in Vercel encrypted environment variables, never Git.

## Product principles
1. Evidence over invented certainty.
2. Human approval for high-impact actions and outbound communication.
3. Explainable scoring and model provenance.
4. Tenant isolation and data minimisation by default.
5. Measure outcomes (qualified, attended, won), not vanity activity.

## Roadmap
- Configurable ICPs, qualification rubrics and custom scoring weights.
- Website chat and lead intake with spam controls and consent.
- Calendar availability, conflict-safe booking and reminders.
- WhatsApp Business and email channels with opt-in and template compliance.
- Funnel attribution, revenue reporting and experiment measurement.
- Team roles, audit logs, billing, observability and operational controls.

## License
All rights reserved until a license is selected.
