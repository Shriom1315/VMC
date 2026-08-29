const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass || gmailUser.includes("your-email")) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "GMAIL_USER and GMAIL_APP_PASSWORD environment variables are not configured in your Netlify site settings!",
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { to, subject, html, attachments } = body;

    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required parameters (to, subject, html)" }),
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"Vikramaditya Metrology" <${gmailUser}>`,
      to,
      subject,
      html,
    };

    if (Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
        contentType: att.type || "application/pdf",
      }));
    }

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: `Email sent to ${to}` }),
    };
  } catch (err) {
    console.error("Netlify Gmail SMTP Send Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Failed to send email via Netlify" }),
    };
  }
};
