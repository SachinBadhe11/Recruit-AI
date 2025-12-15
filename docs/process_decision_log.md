# Process & Decision Log - Recruit-AI

## Project Kickoff
**Date:** 2025-11-29
**Goal:** Build "Recruit-AI", an Agentic AI solution for screening and scheduling candidates.

## Phase 1: Discovery & Strategy

### Decision: Technology Stack
- **Frontend:** React + Vite + Tailwind CSS. Selected for speed, performance, and ease of creating a "premium" feel as per design guidelines.
- **Backend/Agent:** n8n (as requested). Will generate workflow JSON.
- **Documentation:** Markdown files in `docs/` folder.

### Research Log
**Date:** 2025-11-29
**Activity:** Market Research via Web Search.
**Findings:**
- Confirmed high growth in SMB HR Tech (13.5% CAGR).
- Identified key competitors: Paradox (Enterprise), Ashby (All-in-one), Breezy HR (SMB).
- Validated pain point: "Volume Overload" is the #1 challenge.
**Conclusion:** There is a clear gap for a specialized "Screening Agent" that sits on top of existing workflows for SMBs, rather than replacing the entire ATS.

### Decision: Problem Framing
- Focused on "Sarah" (SMB Founder/Recruiter) as the persona.
- Narrowed scope to "Screening & Scheduling" rather than full lifecycle recruiting to ensure a focused MVP.

## Phase 3: The Build

### Decision: Mock Mode for Frontend
- **Context:** n8n requires a running server and webhook URL.
- **Challenge:** I cannot run n8n locally for the user, and the user needs a working UI immediately.
- **Solution:** Implemented a `USE_MOCK` toggle in `api.js`.
- **Benefit:** The user can demo the UI immediately without setting up the backend, while the code is ready for real integration by just flipping a boolean.

### Reflection
- **Trade-off:** Using "Mock Mode" means the demo isn't "live" on the backend, but it ensures the *product experience* is demonstrable.
- **Architecture:** Decoupling the Frontend (React) from the Agent (n8n) via a REST API allows them to scale independently. We could swap n8n for a Python/FastAPI backend later without changing the UI.
