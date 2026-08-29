# Vikramaditya Metrology Calibration System (VMC)

VMC is an industrial metrology and gauge calibration laboratory management application built with **React 19**, **Vite**, **TypeScript**, **TailwindCSS v4**, and **Supabase**.

## Key Features
- **ISO/IEC 17025 Compliance**: Calibration certificate tracking, ULR numbers, NABL vs Non-NABL calibration badges.
- **Quotations & PO Workflow**: Instant PDF generation, discount tracking, and email delivery.
- **Certificate Emailing via Gmail SMTP**: Direct PDF emailing of Quotations and Calibration Certificates with registered party or custom recipient email selection.
- **Role-Based Access Control (RBAC)**: Dedicated permissions for `admin`, `manager`, and `staff`.

## Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Gmail SMTP Setup (Edge Function):**
   To send emails via Gmail SMTP, set up an App Password in your Google Account (Security → 2-Step Verification → App Passwords) and set the secrets in Supabase Edge Functions:
   ```bash
   supabase secrets set GMAIL_USER="your-email@gmail.com" GMAIL_APP_PASSWORD="your-app-password"
   supabase functions deploy send-email
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

