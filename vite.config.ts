import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import nodemailer from 'nodemailer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const gmailUser = env.GMAIL_USER || process.env.GMAIL_USER;
  const gmailPass = env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gmail-smtp-server-plugin',
        configureServer(server) {
          server.middlewares.use('/api/send-email', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr);
                const { to, subject, html, attachments } = body;

                if (!to || !subject || !html) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing required parameters (to, subject, html)' }));
                  return;
                }

                if (!gmailUser || !gmailPass || gmailUser.includes('your-email')) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'Please configure GMAIL_USER and GMAIL_APP_PASSWORD in your .env file to send emails!'
                  }));
                  return;
                }

                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: gmailUser,
                    pass: gmailPass,
                  },
                });

                const mailOptions: any = {
                  from: `"Vikramaditya Metrology" <${gmailUser}>`,
                  to,
                  subject,
                  html,
                };

                if (Array.isArray(attachments) && attachments.length > 0) {
                  mailOptions.attachments = attachments.map((att: any) => ({
                    filename: att.filename,
                    content: Buffer.from(att.content, 'base64'),
                    contentType: att.type || 'application/pdf',
                  }));
                }

                await transporter.sendMail(mailOptions);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: `Email sent to ${to}` }));
              } catch (err: any) {
                console.error('Local Gmail SMTP Send Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Failed to send email via Gmail SMTP' }));
              }
            });
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
