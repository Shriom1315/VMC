/**
 * emailService.ts — client-side helper to call the send-email Edge Function.
 * Handles PDF attachment encoding and HTML template generation.
 */

import { supabase } from "./supabase";

export interface EmailOptions {
  to:          string;
  subject:     string;
  html:        string;
  pdfBase64?:  string;   // base64 string of the PDF
  pdfName?:    string;   // filename for the attachment
}

/**
 * Send an email via the Supabase Edge Function.
 * Returns { success: true } or throws an error message string.
 */
export async function sendEmail(opts: EmailOptions): Promise<void> {
  const body: Record<string, unknown> = {
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
  };

  if (opts.pdfBase64 && opts.pdfName) {
    body.attachments = [{
      filename: opts.pdfName,
      content:  opts.pdfBase64,
      type:     "application/pdf",
    }];
  }

  // 1. Try Gmail SMTP endpoint (/api/send-email or Netlify function)
  const endpoints = ["/api/send-email", "/.netlify/functions/send-email"];
  let lastError = "";

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) return;
      } else {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error) {
          lastError = errJson.error;
          throw new Error(errJson.error);
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes("Failed to fetch")) {
        throw err;
      }
    }
  }

  // 2. Fallback to Supabase Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey":        import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }
  );

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error ?? "Failed to send email");
  }
}

/**
 * Fetch party's registered email address from Supabase `parties` table by name.
 */
export async function fetchPartyEmail(partyName: string): Promise<string> {
  if (!partyName.trim()) return "";
  try {
    const { data, error } = await supabase
      .from("parties")
      .select("email")
      .ilike("name", partyName.trim())
      .limit(1)
      .single();
    if (error || !data) return "";
    return data.email ?? "";
  } catch {
    return "";
  }
}

// ─── HTML Templates ───────────────────────────────────────────────────────────

export function quotationEmailHtml(opts: {
  clientName:   string;
  quotationNo:  string;
  date:         string;
  netTotal:     number;
  labName:      string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #111; background: #f9fafb; margin:0; padding:0;">
  <div style="max-width:600px; margin:32px auto; background:#fff; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
    <!-- Header -->
    <div style="background:#e85d04; padding:24px 28px;">
      <h1 style="color:#fff; margin:0; font-size:20px;">${opts.labName}</h1>
      <p style="color:#fde8d8; margin:4px 0 0; font-size:13px;">Calibration & Metrology Services</p>
    </div>

    <!-- Body -->
    <div style="padding:28px;">
      <p style="font-size:14px; margin-top:0;">Dear <strong>${opts.clientName}</strong>,</p>
      <p style="font-size:14px;">Thank you for considering our services. Please find your quotation attached.</p>

      <div style="background:#f3f4f6; border-radius:6px; padding:16px 20px; margin:20px 0;">
        <table style="width:100%; font-size:13px; border-collapse:collapse;">
          <tr>
            <td style="color:#6b7280; padding:4px 0;">Quotation No.</td>
            <td style="font-weight:600; text-align:right;">${opts.quotationNo}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:4px 0;">Date</td>
            <td style="text-align:right;">${opts.date}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:4px 0; padding-top:8px; border-top:1px solid #e5e7eb;">Total Amount</td>
            <td style="font-weight:700; color:#e85d04; text-align:right; padding-top:8px; border-top:1px solid #e5e7eb;">₹${opts.netTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px; color:#6b7280;">The quotation PDF is attached to this email. Please review it and contact us for any queries.</p>
      <p style="font-size:13px; margin-bottom:0;">For any questions, please reply to this email or call us.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:16px 28px; font-size:12px; color:#9ca3af;">
      <p style="margin:0;">${opts.labName} &nbsp;|&nbsp; This is an automated email.</p>
    </div>
  </div>
</body>
</html>`;
}

export function certificateEmailHtml(opts: {
  clientName:     string;
  gaugeName:      string;
  labId:          string;
  certNo:         string;
  calibDate:      string;
  nextCalibDate:  string;
  labName:        string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #111; background: #f9fafb; margin:0; padding:0;">
  <div style="max-width:600px; margin:32px auto; background:#fff; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
    <!-- Header -->
    <div style="background:#e85d04; padding:24px 28px;">
      <h1 style="color:#fff; margin:0; font-size:20px;">${opts.labName}</h1>
      <p style="color:#fde8d8; margin:4px 0 0; font-size:13px;">Calibration Certificate Issued</p>
    </div>

    <!-- Body -->
    <div style="padding:28px;">
      <p style="font-size:14px; margin-top:0;">Dear <strong>${opts.clientName}</strong>,</p>
      <p style="font-size:14px;">Your instrument has been successfully calibrated. Please find the calibration certificate attached.</p>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:16px 20px; margin:20px 0;">
        <p style="margin:0 0 8px; font-size:13px; font-weight:600; color:#166534;">✓ Calibration Complete</p>
        <table style="width:100%; font-size:13px; border-collapse:collapse;">
          <tr>
            <td style="color:#6b7280; padding:4px 0;">Instrument</td>
            <td style="font-weight:600; text-align:right;">${opts.gaugeName}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:4px 0;">VMC Lab ID</td>
            <td style="font-family:monospace; font-weight:600; color:#e85d04; text-align:right;">${opts.labId}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:4px 0;">Certificate No.</td>
            <td style="font-weight:600; text-align:right;">${opts.certNo}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:4px 0;">Calibration Date</td>
            <td style="text-align:right;">${opts.calibDate}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:4px 0; padding-top:8px; border-top:1px solid #e5e7eb;">Next Due Date</td>
            <td style="font-weight:700; color:#d97706; text-align:right; padding-top:8px; border-top:1px solid #e5e7eb;">${opts.nextCalibDate}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px; color:#6b7280;">The full calibration certificate (PDF) is attached. Please keep it for your quality records.</p>
      <p style="font-size:13px; margin-bottom:0;"><strong>Important:</strong> Please ensure the instrument is recalibrated before the next due date to maintain traceability.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:16px 28px; font-size:12px; color:#9ca3af;">
      <p style="margin:0;">${opts.labName} &nbsp;|&nbsp; NABL Accredited Calibration Laboratory &nbsp;|&nbsp; This is an automated email.</p>
    </div>
  </div>
</body>
</html>`;
}
