# Tardezinha da Space

## Overview
This is a React + TypeScript event management application for "Tardezinha da Space" - an annual company celebration event. The application, built with Vite and utilizing Supabase for backend services, manages event registrations, companion details, transport options, and integrates with a purchase system. Its purpose is to streamline the event attendance confirmation process for employees and their guests.

## User Preferences
I prefer simple language and clear explanations. I want iterative development, with frequent updates and feedback loops. Ask before making major architectural changes or introducing new libraries. Ensure all changes maintain a mobile-first responsive design. Do not make changes to the existing file `employees.ts` or the folder `data/`.

## System Architecture
The application uses a 6-step confirmation wizard as its primary interface for user interaction. This wizard system, managed by `ConfirmationWizard.tsx` and `WizardContext`, orchestrates various step components (`StepEmployeeLogin`, `StepAttendance`, `StepCompanions`, `StepTransport`, `StepSummary`, `StepSuccess`).

**UI/UX:** The design uses a light background (`#F9FAFB`), white cards with shadows, and an orange/pink gradient (`#F97316` → `#EC4899`) for progress indicators and CTA buttons. It incorporates professional SVG icons for visual consistency and is fully responsive across all devices (mobile-first design with Tailwind breakpoints).

**Technical Implementations & Feature Specifications:**
*   **Confirmation Wizard:**
    *   **Employee Login:** Autocomplete search for 156 employees, RG/CPF collection (min 5 chars) used as a password.
    *   **Attendance:** Yes/No choice with conditional flow.
    *   **Companion Management:** Add up to 2 adults and 5 children, collecting name, RG, and age.
    *   **Transport Selection:** Bus choice with a smart lap option for children ≤5 years (free transport on lap).
    *   **Summary:** Review data, itemized cost breakdown, and final confirmation.
    *   **Success:** Two paths: simple confirmation or a 6-second countdown with redirect to a purchase page when purchases are needed.
*   **Duplicate Prevention & Edit Mode:** Uses RG-based password validation and a unique database constraint on `confirmations.employee_id`. If a duplicate is detected, the system allows the user to load and edit existing data.
*   **Real-time Cost Calculation:** `costCalculator.ts` centralizes pricing logic with age-based rules:
    *   Collaborator: FREE daily pass, R$ 64,19 for transport.
    *   Adults (13+): R$ 103,78 daily pass + R$ 64,19 transport.
    *   Children (0-12): R$ 51,89 daily pass (half price) + R$ 64,19 transport.
    *   Children (≤5): Can sit on lap for FREE transport.
*   **Admin Dashboard:** Password-protected (`space2025`) with real-time statistics, attendance management (CRUD), bus boarding lists with check-in/check-out, and employee database management.
*   **Database Interaction:** Companion operations use a PostgreSQL RPC function `upsert_companions` for atomic transactions, bypassing PostgREST schema caching for reliability and performance. This function deletes existing companions and inserts new ones within a single transaction.

**Tech Stack:**
*   **Frontend:** React 19.2.0, Vite 6.2.0, TypeScript 5.8.2.
*   **Styling:** Tailwind CSS (via CDN).
*   **Backend:** Supabase (database, authentication).

## External Dependencies
*   **Supabase:** Utilized for database services (storing confirmations, employee data, etc.) and potentially authentication. Configured via `SUPABASE_URL` and `SUPABASE_KEY` environment variables.
*   **Useingresso.com:** Integrated for event ticket purchases, with automatic redirects to `https://useingresso.com/evento/691b30d3dc465aca63b2bbef` when applicable.
*   **Gemini API:** Optional integration, configurable via `GEMINI_API_KEY`.