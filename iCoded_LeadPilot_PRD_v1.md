# iCoded LeadPilot
## Product Requirements Document (PRD) — Version 1.0

**Prepared for:** iCoded Automation Pvt. Ltd.  
**Date:** 17 October 2026  
**Purpose:** Internal B2B lead discovery, qualification, outreach, and sales management platform.

## 1. Document Purpose

This PRD defines an internal web platform for iCoded Automation Pvt. Ltd. to discover, organize, qualify, contact, and convert potential B2B customers. The platform is intended to replace scattered manual research and spreadsheets with a repeatable lead-generation workflow.

The first release is an internal tool for the iCoded sales and marketing team. A future multi-tenant SaaS version may be considered only after the internal workflow is validated.

## 2. Product Summary

Product name: iCoded LeadPilot
Product type: Internal B2B prospecting, lead management, outreach, and sales pipeline web application
Primary users: Founders, sales representatives, and authorized administrators
Primary outcome: Help the team find relevant businesses, identify a concrete business need, manage follow-ups, and turn qualified prospects into paying customers.

Product promise: Find businesses → identify opportunities → contact responsibly → follow up consistently → close deals.

- Business discovery by category, location, radius/area, and keywords.
- Business profile enrichment with permitted source data and manual research.
- Lead qualification, scoring, notes, status, and ownership.
- CSV export for authorized users.
- Email outreach through a configured email provider, with delivery status and opt-out/suppression controls.
- Map/list views, saved searches, duplicate detection, reminders, and performance reports.

## 3. Business Context and Goals

iCoded provides websites and e-commerce websites, Android applications, custom software and automation, CRM/HRMS/ERP/LMS solutions, Meta Ads management, social media support, Google Business Profile assistance, lead generation, and WhatsApp enquiry/booking automation.

The platform should prioritize businesses whose public-facing presence suggests a plausible need for one or more of these services. It must not assume that a business needs a service merely because a data field is missing; a human should validate the opportunity.

- Reduce time spent manually searching directories and copying details into spreadsheets.
- Build a reusable, deduplicated prospect database with source and last-verified date.
- Help sales staff prioritize prospects based on fit and visible opportunity.
- Make follow-ups measurable instead of relying on memory or personal spreadsheets.
- Track conversion from discovered lead to contacted lead, meeting, proposal, won/lost, and collected revenue.
- Support a safe path from an internal tool to a potential commercial product.

## 4. Non-Goals for Version 1

- Do not build a public self-service SaaS with billing, tenant subscriptions, and plan management in V1.
- Do not promise unlimited Google Maps data extraction or scrape Google Maps pages using bots.
- Do not bypass CAPTCHA, access controls, API quotas, provider terms, or robots/anti-abuse controls.
- Do not harvest personal emails or phone numbers from unrelated sources or infer private contact details.
- Do not send bulk unsolicited email without appropriate legal basis, sender identity, and opt-out controls.
- Do not automatically send WhatsApp messages unless a compliant WhatsApp Business Platform integration and consent requirements are implemented.
- Do not use AI-generated lead scores as the sole basis for contacting, rejecting, or making consequential decisions.

## 5. Target Users and Permissions

- Admin/Founder: manage users, integrations, source configuration, global settings, exports, suppression list, audit events, and all leads.
- Sales/Marketing: search businesses, review profiles, create/update leads, log calls and meetings, draft/send permitted emails, manage follow-ups, and export within assigned permissions.
- Read-only/Analyst (optional V1.1): view dashboards and reports without editing leads or sending outreach.
- Authentication: Firebase Authentication; restrict access to approved company accounts. Do not expose API keys or provider secrets in the browser.
- Authorization: enforce roles in Firestore Security Rules and, for privileged operations, in trusted backend functions. Hiding a UI control is not authorization.

## 6. Core User Journeys

- Search: user selects category/keyword, location, radius or locality, and optional filters → platform requests permitted provider data → results show source attribution and available fields → user reviews results → selected businesses are saved as leads.
- Qualify: user opens a business profile → records service opportunity, evidence, priority, notes, owner, and next action → platform calculates a transparent score from editable rules.
- Outreach: user selects an eligible lead → reviews an email template and personalization fields → checks recipient suppression/consent state → sends via configured provider → logs provider message ID and status.
- Follow-up: user creates a call/email/meeting task with due date → dashboard highlights overdue and upcoming tasks → user records outcome and next step.
- Export: authorized user chooses a filtered lead set and fields → platform exports only permitted data to CSV → export event is logged.
- Conversion: lead moves through pipeline stages → user records deal value and outcome → dashboard reports conversion and revenue.

## 7. Functional Requirements

Priority labels: P0 = required for V1 launch; P1 = important after core workflow is stable; P2 = future enhancement.

## 7.1 Authentication and Team Access

- P0: Sign in/out using Firebase Authentication.
- P0: Admin can invite/approve company users and assign roles.
- P0: Protect all routes and data; apply least-privilege Firestore rules.
- P0: Record createdBy, updatedBy, createdAt, and updatedAt for key records.
- P1: Password reset, session timeout policy, and optional multi-factor authentication if supported by chosen identity setup.

## 7.2 Lead Search and Business Discovery

- P0: Search by business category, free-text keyword, city/locality, and map area or radius when supported by provider.
- P0: Filters for website present/missing, phone present/missing, rating/review count when available, business status, lead status, source, owner, and last verified date.
- P0: List view with pagination; map view with markers for results where location coordinates are available and provider terms permit display.
- P0: Result cards display business name, category, address/locality, phone/website if provided, rating/review count if permitted, source, and last fetched date.
- P0: User can open a detail panel, add notes, mark relevant opportunity, and save the business as a lead.
- P0: Clearly show source attribution and data freshness.
- P1: Saved searches and one-click rerun with updated date.
- P1: Search history and per-user recent searches.
- P2: Multi-source discovery, if each provider's license and terms permit the intended use.

## 7.3 Data Sources and Google Maps/Places Integration

Use an official, authorized provider such as Google Places API (New) for place discovery where it meets the product requirements, or another provider with suitable data rights. Implement the source behind a provider adapter so it can be changed without rewriting the UI.

Important design constraint: Google Maps/Places content is subject to provider terms, attribution, caching/storage restrictions, and field-specific requirements. Do not build a generic scraper that extracts the Google Maps website. Before production, verify current Google Maps Platform terms for each field and use case. Store only the fields and identifiers permitted for the intended use. If a field cannot legally be retained, display it from the provider when needed and avoid persisting it in the internal lead record.

Keep the lead record separate from raw provider response. Store source name, source record ID only where permitted, fetchedAt, attribution text/link where required, and an internal verification status. Never imply that every Google Business Profile field is available from the Places API.

- P0: Backend-only API calls for any provider secret; restrict keys by API and server/environment where supported.
- P0: Set quotas, timeouts, retry with backoff, rate limits, and usage monitoring.
- P0: Respect provider pagination, request limits, attribution, and retention rules.
- P0: Do not attempt to collect private/personal data or bypass technical protections.
- P1: Add a second provider adapter only after legal, data-quality, and commercial review.

## 7.4 Lead Database and Deduplication

- P0: Save a business as a lead with source, discoveredAt, lastVerifiedAt, status, owner, and notes.
- P0: Deduplicate using permitted stable source IDs where available; otherwise normalize business name + phone + address/domain and show possible duplicates for human review.
- P0: Do not automatically merge records if the match is uncertain.
- P0: Allow manual correction of business name, website, contact details, category, address, and source notes.
- P0: Track change history for important fields or at minimum updatedBy/updatedAt and activity log.
- P1: Bulk tagging, bulk assignment, and bulk status updates.

## 7.5 Lead Qualification and Scoring

Use a transparent, configurable score (0–100) as a prioritization aid, not as a claim about a business's intent. The initial rules should reward observable fit and verified opportunities, and should allow sales staff to override the score with a reason.

- P0: Suggested dimensions: target-sector fit (0–25), service opportunity evidence (0–25), business reachability (0–15), digital presence improvement opportunity (0–20), and freshness/verification (0–15).
- P0: Explain the score in the UI (e.g., 'website not found in checked sources', 'clinic category matches target segment', 'phone verified on date').
- P0: Never describe a missing field as proof that the business has no website or no marketing.
- P0: Lead priority: Hot, Warm, Cold, or Unqualified; user can override and add a reason.
- P1: Separate scoring presets for clinic, education, local business, and software/automation prospects.

## 7.6 CRM Pipeline and Activities

- P0: Pipeline stages: New → Researching → Qualified → Contacted → Interested → Meeting Booked → Proposal Sent → Negotiation → Won / Lost / Not a Fit.
- P0: Allow configurable loss reason, including no response, no current need, budget, timing, competitor, invalid contact, and opted out.
- P0: Log calls, emails, meetings, notes, proposals, and outcomes in a chronological activity timeline.
- P0: Assign lead owner and next action date.
- P0: Dashboard views for overdue follow-ups, due today, and upcoming 7 days.
- P1: Kanban pipeline view and bulk reassignment.
- P1: Reminder notifications by in-app notification/email, with user preferences.

## 7.7 Email Outreach

Email sending must be implemented through a trusted email service provider (for example, an approved transactional or marketing email provider) from a server-side function. The platform must not send directly from the user's browser or expose SMTP/provider secrets to React.

V1 should focus on relevant, personalized one-to-one outreach or small, carefully reviewed batches. Follow applicable Indian law and recipient-country rules, provider terms, and company policies. Include a clear sender identity, truthful subject/content, appropriate opt-out method for marketing messages, and a suppression list. Do not send to suppressed recipients. Consult qualified counsel for legal interpretation before scaling outreach.

- P0: Admin configures provider credentials as server-side secrets.
- P0: Compose email with subject, body, sender identity, selected recipient, and preview.
- P0: Template variables: business name, contact name if verified, locality, relevant service, observed opportunity, sender name, company name, website, and contact details.
- P0: Preview the final rendered email and require user confirmation before send.
- P0: Validate address format; do not claim that format validation verifies mailbox existence.
- P0: Track queued/sent/provider message ID and delivery, bounce, complaint, and opt-out events where provider supports them.
- P0: Suppression list checked before every send; opt-outs and hard bounces block future sends.
- P0: Rate limits, daily caps, audit log, and a kill switch for outbound sending.
- P1: Template performance and campaign reporting.
- P2: Automated sequences only after consent/compliance rules and stop-on-reply/opt-out behavior are proven.

## 7.8 CSV Export and Import

- P0: Export filtered results or selected leads to CSV.
- P0: Let user choose columns: business name, category, address/locality, business phone, website, public business email if lawfully obtained, source, score, status, owner, notes, last verified date, next follow-up, and opportunity type.
- P0: Export only data the user is authorized to access and retain under provider terms.
- P0: Escape CSV cells that begin with =, +, -, or @ to mitigate spreadsheet formula injection.
- P0: Show record count and selected fields before export; log who exported, when, and how many records.
- P1: CSV import with preview, column mapping, validation, and duplicate review.
- P1: Export templates for clinic, education, and general B2B leads.

## 7.9 Reporting and Analytics

- P0: Summary metrics: leads discovered, saved, qualified, contacted, meetings booked, proposals sent, won/lost, and total recorded deal value.
- P0: Filters by date range, source, owner, category, location, and service line.
- P0: Funnel conversion rates with clear denominator and date range.
- P0: Activity metrics: follow-ups completed, overdue tasks, email delivery/bounce/opt-out counts when available.
- P0: Do not label a lead as revenue; count revenue only when recorded as won/collected according to the chosen metric.
- P1: CSV report exports and weekly performance summary.

## 7.10 Admin and Settings

- P0: Manage users, roles, lead stages, scoring weights, categories, service catalog, email templates, suppression list, and integrations.
- P0: Show provider API usage, errors, quota warnings, and last successful sync.
- P0: Provide an outbound email kill switch.
- P1: Configure per-user daily outreach limits and approval requirement for larger batches.

## 8. Information Architecture and Screens

- Dashboard: KPIs, lead funnel, tasks due today, overdue tasks, recent activity, and source/API health.
- Discover Leads: keyword/category, location, radius/map area, filters, map/list toggle, result count, source attribution, save-to-leads action.
- Lead Details: business profile, source details, verification date, opportunity notes, score explanation, contact actions, owner, tags, and timeline.
- Lead CRM: searchable table, filters, bulk actions, pipeline status, assignment, and next follow-up.
- Pipeline: Kanban or stage-based view from New through Won/Lost.
- Outreach: email templates, compose/preview, recipient eligibility, send confirmation, provider status, suppression controls.
- Tasks & Follow-ups: calendar/list, due date, overdue filters, activity outcome.
- Reports: funnel, service/category performance, sales activity, and revenue.
- Settings: users, roles, integrations, scoring rules, categories, templates, suppression, and audit log.
- Responsive layout: desktop-first for research and exports; tablet/mobile usable for calls, notes, and follow-ups.

## 9. Recommended Technical Architecture

Frontend: React.js + Vite + Tailwind CSS. Use React Router for navigation, a consistent component system, form validation, accessible controls, and a query/cache layer such as TanStack Query if useful.

Backend: Firebase Authentication + Cloud Firestore + Cloud Functions (or a secured server/API layer) for provider calls, email sending, exports that need server enforcement, webhooks, scoring, and privileged actions. Never call a provider with a secret key directly from the browser.

Maps: Google Maps Platform only where current API terms, billing, and product requirements support it. Keep map rendering and place discovery behind a service adapter. Show required attribution.

Email: A provider with an API and event webhooks; keep credentials in server-side secret storage. Use verified sending domain, SPF, DKIM, and DMARC where supported.

Hosting: Firebase Hosting or another static host for the React app; deploy trusted backend functions separately. Use separate development, staging, and production environments.

Monitoring: error reporting, structured server logs, API quota monitoring, email delivery events, and audit logs.

- Suggested frontend folders: src/app, src/components, src/features/auth, src/features/discovery, src/features/leads, src/features/pipeline, src/features/outreach, src/features/tasks, src/features/reports, src/features/settings, src/services, src/types, src/utils.
- Suggested backend functions: searchBusinesses, getPlaceDetails, saveLead, calculateLeadScore, sendLeadEmail, handleEmailWebhook, exportLeadsCsv, createFollowUp, and audit privileged actions.
- Provider adapters should normalize external results to a safe internal shape and explicitly flag fields that may not be persisted.

## 10. Data Model (Initial)

Use Firestore collections with stable document IDs and server timestamps. Keep raw provider responses out of persistent storage unless provider terms explicitly allow them.

## 10.1 users

- uid, displayName, email, role, active, createdAt, updatedAt

## 10.2 leads

- businessName, normalizedBusinessName, category, subcategory, address, locality, city, region, country, latitude/longitude only where permitted, businessPhone, businessWebsite, publicBusinessEmail (if lawfully sourced), sourceName, sourceRecordId (only if permitted), sourceAttribution, discoveredAt, lastVerifiedAt, dataQualityStatus, opportunityTypes[], opportunityEvidence[], score, scoreBreakdown, priority, pipelineStage, ownerUid, tags[], notes, nextFollowUpAt, createdBy, createdAt, updatedBy, updatedAt, archivedAt.
- Store only fields permitted by the relevant source terms. Separate provider-managed data from independently verified internal notes.

## 10.3 activities

- leadId, type (call/email/meeting/note/proposal/status-change), occurredAt, outcome, summary, nextStep, createdBy, createdAt, providerMessageId where applicable.

## 10.4 tasks

- leadId, title, type, dueAt, status, assignedTo, completedAt, outcome, createdBy, createdAt, updatedAt.

## 10.5 emailTemplates

- name, purpose, subjectTemplate, bodyTemplate, serviceLine, active, createdBy, updatedAt.

## 10.6 emailEvents and suppression

- Email events: leadId, providerMessageId, eventType, eventAt, sanitizedMetadata.
- Suppression records: normalizedEmail, reason (opt-out, hard bounce, complaint, manual block), source, createdAt, createdBy. Restrict access to this collection.

## 10.7 auditLogs and settings

- Audit logs: actorUid, action, entityType, entityId, timestamp, result, limited metadata. Do not log credentials or unnecessary personal data.
- Settings: stages, scoring rules, service catalog, daily caps, provider health, and feature flags.

## 11. API and Backend Behavior

- All provider integrations must run server-side. Validate and normalize all input.
- Search endpoint accepts category/keyword, location or map bounds, radius where supported, pagination token where applicable, and filters.
- Lead creation endpoint checks user permissions, deduplication, source storage restrictions, and required fields.
- Email endpoint checks role, recipient eligibility, suppression status, limits, template validity, and confirmation token before sending.
- Email webhook verifies provider signature and idempotently records events.
- CSV export endpoint verifies authorization, filters permitted columns, sanitizes spreadsheet formulas, and records audit event.
- Use idempotency keys or equivalent safeguards for send operations to reduce accidental duplicate sends.
- Return clear error states for quota exceeded, provider unavailable, no results, invalid location, permission denied, and rate limited.

## 12. UX and Design Requirements

- Professional, clean B2B SaaS interface; navy/white/neutral surfaces with iCoded electric-blue accents.
- Desktop-first discovery table with sticky filter area, pagination, selectable rows, and clear empty/loading/error states.
- Use labels and visible explanations for source, data freshness, score, and next action.
- Keep primary actions obvious: Search Businesses, Save Lead, Log Activity, Schedule Follow-up, Draft Email, Export CSV.
- Use confirmation dialogs for sending emails, exporting large sets, deleting records, and bulk changes.
- Accessible keyboard navigation, readable contrast, form validation, and responsive layout.
- Do not show fake KPIs, fake ratings, or placeholder leads as if they were real. Demo data must be labeled clearly.

## 13. Security, Privacy, and Compliance

- Use least-privilege access, secure Firestore rules, server-side authorization, secret management, HTTPS, and dependency updates.
- Collect only business contact data needed for the business purpose; define retention and deletion rules.
- Respect Google Maps Platform and every other source provider's terms, field restrictions, attribution, and caching/retention policies.
- Follow applicable Indian privacy and IT requirements, recipient-country marketing rules, and email-provider acceptable-use rules; obtain qualified legal review before production-scale outreach.
- Provide a clear sender identity and a practical opt-out process for marketing emails where required; honor opt-outs promptly.
- Do not email suppressed addresses; handle hard bounces and complaints automatically where provider events allow.
- Restrict exports, log export activity, and protect CSV files as sensitive business data.
- Set data retention periods for old leads and activity logs; support correction, archival, and deletion workflows where appropriate.
- Never store passwords, API secrets, or full payment-card data in Firestore.

## 14. Non-Functional Requirements

- Performance: common dashboard and lead-list interactions should feel responsive; use pagination and indexes rather than loading all records.
- Reliability: show actionable errors and retry transient provider failures safely.
- Scalability: query by owner, status, category, locality, and updatedAt; define indexes based on actual filters.
- Maintainability: use TypeScript if possible, shared types, feature-based modules, linting, and environment-specific configuration.
- Observability: log backend failures, provider quota use, email events, and privileged actions.
- Data quality: show last-verified date and confidence; never present uncertain fields as verified.
- Backup/recovery: document Firestore export/backup policy and test recovery for critical records.

## 15. Acceptance Criteria for V1

- An authorized user can sign in and only see actions/data permitted by their role.
- A user can search a supported category and locality through an authorized provider and view permitted results with attribution.
- A user can save a prospect, edit internal notes, assign an owner, and move it through pipeline stages.
- Duplicate warnings prevent obvious duplicate records while allowing human review of uncertain matches.
- A user can see score components and override the score/priority with a reason.
- A user can create a follow-up, see it on the dashboard when due, and mark it complete with an outcome.
- A user can compose and preview an email; the backend blocks suppressed recipients and enforces limits before sending.
- Email events are recorded where the provider supplies them, and opt-outs/hard bounces suppress future sends.
- An authorized user can export selected or filtered leads to CSV; formula-like cells are sanitized and the export is audited.
- Reports show counts and conversion rates that reconcile with the underlying pipeline for the selected date range.
- Provider errors, no-results, quota, and permission states are handled without crashing the app.
- No secret API key is exposed in client bundles or browser network requests.

## 16. Testing Plan

- Unit tests: normalization, scoring rules, template rendering, CSV escaping, permission checks, deduplication.
- Integration tests: provider adapter, Firestore access, email provider, signed webhook handling, export endpoint.
- Security tests: role escalation, direct API calls without authorization, data access across users, secret exposure, rate limiting.
- Functional tests: search-to-save, lead-to-follow-up, email suppression, export, pipeline conversion.
- Manual QA: attribution, mobile responsiveness, keyboard accessibility, loading/empty/error states, provider quota exhaustion.
- Use a sandbox/test email mode until domain authentication, suppression behavior, and deliverability checks pass.

## 17. Implementation Roadmap

- Phase 0 — Validation (2–4 days): confirm target niche, data source terms, fields permitted for storage, email provider, budget, and success metrics.
- Phase 1 — Foundation (Week 1): React/Vite/Tailwind setup, authentication, layout, role model, Firestore schema, security rules.
- Phase 2 — Lead CRM (Week 2): lead table, detail panel, manual lead entry, tags, owner, pipeline, activity timeline, follow-up tasks.
- Phase 3 — Discovery (Week 3): authorized business search API, location/category filters, result list/map, save-to-leads, source attribution, quota handling.
- Phase 4 — Export and scoring (Week 4): duplicate review, scoring rules, CSV export with sanitization and audit log, basic reports.
- Phase 5 — Email outreach (Week 5): provider integration, templates, preview/confirmation, suppression list, webhooks, rate limits, kill switch.
- Phase 6 — Hardening (Week 6): tests, security review, deployment, monitoring, team training, pilot with one niche.
- These are indicative estimates for a small experienced team; actual duration depends on API access, compliance review, and implementation capacity.

## 18. MVP Scope and Deferred Features

MVP must include: authentication and roles; one authorized business discovery source; category/location search; lead save/edit/dedup; CRM pipeline; activity log; follow-up reminders; CSV export; transparent scoring; one email provider with suppression and audit; basic reporting.

Defer until validated: AI email writing, automated multi-step campaigns, WhatsApp Business API, LinkedIn integrations, multi-source enrichment, advanced territory management, mobile app, SaaS billing, tenant management, and AI-based intent prediction.

## 19. Success Metrics

- Research efficiency: median minutes from search to a reviewed, saved lead.
- Lead quality: percentage of saved leads marked qualified after human review.
- Sales activity: qualified leads contacted, follow-ups completed, meetings booked, proposals sent.
- Conversion: contacted-to-meeting, meeting-to-proposal, proposal-to-won.
- Revenue: recorded won value and cash collected, tracked separately.
- Data health: duplicate rate, invalid contact rate, and percentage with source/verification date.
- Outreach health: delivery, bounce, complaint, and opt-out rates where provider data is available.
- Adoption: weekly active users and follow-up tasks completed on time.

## 20. Example Use Case for iCoded

Example: Find dental and multi-specialty clinics in Chhatrapati Sambhajinagar. Review public business details from the approved source, check the clinic website manually or through a permitted website-checking workflow, and record a specific opportunity such as a confusing mobile website or missing online enquiry path. Save only permitted data, score the lead using visible rules, assign an owner, and create a call task. If appropriate, send a personalized email through the approved provider, honor any opt-out, then record the outcome and next follow-up.

The platform should help the team prioritize and organize work; it must not automatically claim a clinic lacks a website or needs advertising without verification.

## 21. Open Decisions Before Development

- Which authorized business data provider and API plan will be used, and which fields may be stored?
- Will V1 target clinics first, or include clinics, education, and general local businesses from launch?
- Which email provider will be connected, and what daily send limit will be enforced?
- Will the first release be limited to internal users with company email accounts?
- What retention period should apply to inactive/unqualified leads?
- What is the monthly budget for API usage, email, hosting, and monitoring?
- Who will own provider compliance, suppression handling, and periodic data-quality review?

## 22. Recommended V1 Decisions

- Start with an internal tool and one niche: clinics in Chhatrapati Sambhajinagar, because this aligns with iCoded's existing outreach and service offer.
- Build the CRM workflow before adding complex automation. A lead database without follow-up discipline will not create sales by itself.
- Use official APIs and approved data sources; do not build a Google Maps webpage scraper.
- Use a server-side email integration with manual send confirmation, suppression checks, provider event handling, and an emergency kill switch.
- Use React + Vite + Tailwind CSS + Firebase Authentication + Firestore + Cloud Functions, with a provider adapter for discovery and a separate adapter for email.
- Treat the score as a transparent prioritization aid and validate actual sales conversion before adding AI features.

## Appendix A. Suggested Initial Lead Categories

- Healthcare: dental clinic, skin/hair clinic, physiotherapy, diagnostic center, hospital.
- Education: coaching class, training institute, school, college, skill academy.
- Local services: salon, gym, travel agency, hotel, real estate, vehicle rental.
- B2B/industrial: manufacturer, distributor, logistics provider, professional service firm.
- Use categories as search presets; do not assume the same score or pitch applies to every sector.

## Appendix B. Example Outreach Workflow

- 1. Search the target category and locality using an approved source.
- 2. Review the result and confirm that it matches the ideal customer profile.
- 3. Check relevant digital presence and record an evidence-based opportunity.
- 4. Save lead, set owner, score, and create a call or meeting task.
- 5. Choose a relevant service offer and personalize the message honestly.
- 6. Check suppression and sending limits; preview and confirm the email.
- 7. Record response, follow up at an appropriate interval, and stop outreach when asked.
- 8. Update pipeline stage and record proposal, win/loss reason, and revenue outcome.

## Appendix C. Definition of Done

- The app is deployed to a production environment with a documented rollback plan.
- Access rules are tested for every role.
- Provider terms and data retention constraints are documented.
- All secrets are server-side and all outbound email checks are enabled.
- CSV export has formula-injection mitigation and an audit trail.
- Team members can complete the full search → qualify → contact → follow-up → conversion workflow.
- Basic monitoring, backup policy, and incident response contact are documented.
