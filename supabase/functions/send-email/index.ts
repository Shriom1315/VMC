/**
 * Supabase Edge Function — send-email
 * Uses Gmail SMTP via nodemailer-style SMTP over fetch (Deno compatible).
 *
 * Deploy with:
 *   supabase functions deploy send-email
 *
 * Set secrets with:
 *   supabase secrets set GMAIL_USER=your@gmail.com
 *   supabase secrets set GMAIL_APP_PASSWORD=abcdefghijklmnop
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  to:          string;
  subject:     string;
  html:        string;
  attachments?: {
    filename: string;
    content:  string; // base64-encoded
    type:     string; // MIME type e.g. "application/pdf"
  }[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, subject, html, attachments = [] } = body;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "to, subject, and html are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gmailUser     = Deno.env.get("GMAIL_USER")!;
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD")!;

    if (!gmailUser || !gmailPassword) {
      return new Response(
        JSON.stringify({ error: "GMAIL_USER or GMAIL_APP_PASSWORD not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build MIME message
    const boundary = `VMC_${Date.now()}_BOUNDARY`;
    const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

    let mimeBody = [
      `From: "Vikramaditya Metrology" <${gmailUser}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: quoted-printable`,
      ``,
      html,
    ].join("\r\n");

    for (const att of attachments) {
      mimeBody += [
        `\r\n--${boundary}`,
        `Content-Type: ${att.type}; name="${att.filename}"`,
        `Content-Transfer-Encoding: base64`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        ``,
        att.content,
      ].join("\r\n");
    }

    mimeBody += `\r\n--${boundary}--`;

    // Send via Gmail SMTP API (using Google's SMTP relay via fetch isn't possible from Deno directly)
    // Instead use Gmail API with OAuth2 — but since we want simple app password SMTP,
    // we use the smtp.js approach via a relay or Google's SMTP submission endpoint.
    //
    // For Deno, we use the built-in TCP SMTP client via smtp library:
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port:     465,
        tls:      true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    const emailData: Record<string, unknown> = {
      from:    `"Vikramaditya Metrology" <${gmailUser}>`,
      to,
      subject,
      html,
    };

    if (attachments.length > 0) {
      emailData.attachments = attachments.map(a => ({
        filename:    a.filename,
        content:     a.content,
        encoding:    "base64",
        contentType: a.type,
      }));
    }

    await client.send(emailData);
    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${to}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Email send error:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
