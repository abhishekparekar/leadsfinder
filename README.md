# iCoded LeadPilot — B2B Lead Discovery, Qualification & Outreach Platform

Internal B2B prospecting, lead management, email outreach, and sales pipeline web application developed for **iCoded Automation Pvt. Ltd.** based on [`iCoded_LeadPilot_PRD_v1.md`](./iCoded_LeadPilot_PRD_v1.md).

## Quick Start

### 1. Unified Full-Stack Server
Runs both Express 5 API and the compiled React 19 UI on port 5000:
```powershell
node server/index.js
```
Open [http://localhost:5000](http://localhost:5000)

### 2. Development Mode with Hot Reload
Runs backend on port 5000 and Vite dev server on port 5173:
```powershell
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## Core Capabilities Implemented

- **Lead Discovery & Google Places Adapter:** Category, locality, and keyword search across Chhatrapati Sambhajinagar with dual List & Leaflet Map views.
- **Smart Deduplication:** Normalizes business name, phone, and domain with a duplicate review modal.
- **5-Dimension Transparent Scoring (0-100):** Target sector fit (25), service evidence (25), reachability (15), digital presence (20), and freshness (15).
- **Sales Pipeline Kanban:** 10 stages (`New` → `Researching` → `Qualified` → `Contacted` → `Interested` → `Meeting Booked` → `Proposal Sent` → `Negotiation` → `Won` / `Lost`) with celebration confetti on Won deals and mandatory loss reason capture.
- **Email Outreach Engine:** 1-to-1 personalization, suppression list enforcement, and emergency outbound kill switch.
- **Tasks & Follow-ups:** Due today, overdue, and upcoming 7-day tracking with automatic timeline logging.
- **Formula-Safe CSV Export:** Escapes cells starting with `=`, `+`, `-`, or `@` to prevent spreadsheet injection.
- **Analytics & Revenue Reconciliation:** Strictly separates Won Revenue from Cash Collected.
