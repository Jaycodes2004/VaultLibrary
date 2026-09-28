import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface AccessRequestEmailParams {
  requestId: string;
  fullName: string;
  email: string;
  organization: string;
  purpose: string;
  desiredTier: string;
}

export interface BookRequestEmailParams {
  requestId: string;
  userName: string;
  userEmail: string;
  title: string;
  author?: string;
  foundInArchive?: boolean;
}

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SENDER = process.env.SMTP_SENDER || 'ipcodesjay@gmail.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jaysharma83502@gmail.com';
const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL || 'http://127.0.0.1:8025';

function logToDispatchFile(subject: str, plainBody: string, to: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logDir = path.join(process.cwd(), 'mail-service');
  const logPath = fs.existsSync(logDir)
    ? path.join(logDir, 'mail_dispatches.log')
    : path.join(process.cwd(), 'mail_dispatches.log');

  const logEntry = `
------------------------------------------------------------
[DISPATCH LOG] ${timestamp}
FROM: ${SMTP_SENDER}
TO:   ${to}
SUBJ: ${subject}
BODY: 
${plainBody}
STATUS: Logged in Queue (Configure SMTP_PASSWORD in .env for live transmission to ${to})
------------------------------------------------------------
`;
  try {
    fs.appendFileSync(logPath, logEntry, 'utf-8');
    console.log(`[DISPATCH] Notification recorded in queue: ${logPath}`);
  } catch (err) {
    console.error('[DISPATCH] Error writing to mail log:', err);
  }
}

/**
 * Dispatches an Access Request notification to the Administrator.
 * Tries Python Microservice first, falls back to direct Nodemailer, or logs to queue.
 */
export async function dispatchAccessRequestNotification(params: AccessRequestEmailParams): Promise<{
  success: boolean;
  mode: 'live_smtp' | 'python_microservice' | 'queued_log';
  details?: string;
}> {
  const subject = `[ReadVault Alert] New Library Access Request: ${params.fullName}`;
  const plainBody = `
NEW LIBRARY ACCESS REQUEST PENDING APPROVAL
--------------------------------------------------
Applicant Scholar : ${params.fullName}
Email Address     : ${params.email}
Institution       : ${params.organization || 'Independent Scholar'}
Desired Tier      : ${params.desiredTier.toUpperCase()}
Request Reference : ${params.requestId}

Statement of Purpose / Need:
"${params.purpose}"

--------------------------------------------------
Administrative Review Link:
http://localhost:9000/portal-auth-x98q
(or LAN: http://192.168.1.54:9000/portal-auth-x98q)

Recipient: ${ADMIN_EMAIL}
Sender: ${SMTP_SENDER}
`;

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0c1222; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
  <div style="padding: 24px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-bottom: 1px solid rgba(255,255,255,0.1);">
    <h2 style="margin: 0; color: #ffffff; font-size: 20px;">ReadVault Security Notification</h2>
    <p style="margin: 4px 0 0 0; color: #a5b4fc; font-size: 13px;">New Library Access Request Pending Administrator Approval</p>
  </div>
  <div style="padding: 24px; font-size: 14px; line-height: 1.6;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr><td style="color: #94a3b8; padding: 6px 0; width: 140px;">Applicant:</td><td style="color: #ffffff; font-weight: 600;">${params.fullName}</td></tr>
      <tr><td style="color: #94a3b8; padding: 6px 0;">Email:</td><td style="color: #818cf8; font-family: monospace;">${params.email}</td></tr>
      <tr><td style="color: #94a3b8; padding: 6px 0;">Institution:</td><td style="color: #cbd5e1;">${params.organization || 'Independent Scholar'}</td></tr>
      <tr><td style="color: #94a3b8; padding: 6px 0;">Desired Tier:</td><td style="color: #fbbf24; font-weight: 600; text-transform: uppercase;">${params.desiredTier}</td></tr>
      <tr><td style="color: #94a3b8; padding: 6px 0;">Reference ID:</td><td style="color: #94a3b8; font-family: monospace;">${params.requestId}</td></tr>
    </table>
    <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;">
      <div style="color: #94a3b8; font-size: 12px; margin-bottom: 6px; text-transform: uppercase;">Research Purpose Statement:</div>
      <div style="color: #e2e8f0; font-style: italic;">"${params.purpose}"</div>
    </div>
    <a href="http://localhost:9000/portal-auth-x98q" style="display: block; text-align: center; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">Review & Approve in Admin Portal</a>
  </div>
  <div style="padding: 16px 24px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #64748b; font-family: monospace;">
    Administrative Target: ${ADMIN_EMAIL} &bull; ReadVault System Core
  </div>
</div>
`;

  // 1. If live SMTP password is configured, attempt direct delivery via Nodemailer
  if (SMTP_PASSWORD && SMTP_PASSWORD !== 'your_16_char_google_app_password') {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false, // TLS
        auth: {
          user: SMTP_SENDER,
          pass: SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"ReadVault Security Gateway" <${SMTP_SENDER}>`,
        to: ADMIN_EMAIL,
        subject,
        text: plainBody,
        html: htmlBody,
      });

      console.log(`[DISPATCH] Live SMTP email delivered directly to ${ADMIN_EMAIL}`);
      return { success: true, mode: 'live_smtp', details: `Sent live to ${ADMIN_EMAIL}` };
    } catch (err: any) {
      console.warn(`[DISPATCH] Direct SMTP failed (${err.message}), attempting Python microservice fallback...`);
    }
  }

  // 2. Attempt dispatch via Python Microservice
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${MAIL_SERVICE_URL}/notify-access-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: params.fullName,
        email: params.email,
        organization: params.organization,
        purpose: params.purpose,
        desired_tier: params.desiredTier,
        request_id: params.requestId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.log(`[DISPATCH] Microservice responded:`, data);
      return {
        success: true,
        mode: data.mode === 'live_smtp_sent' ? 'live_smtp' : 'python_microservice',
        details: data.note || 'Processed by Mail Microservice',
      };
    }
  } catch (err: any) {
    console.warn(`[DISPATCH] Python microservice unavailable (${err.message}), recording in dispatch queue.`);
  }

  // 3. Fallback: Log to dispatch queue file
  logToDispatchFile(subject, plainBody, ADMIN_EMAIL);
  return {
    success: true,
    mode: 'queued_log',
    details: `Recorded in mail_dispatches.log (Set SMTP_PASSWORD with Google App Password to transmit live over SMTP)`,
  };
}

/**
 * Dispatches a Book Acquisition Inquiry to the Administrator.
 */
export async function dispatchBookRequestNotification(params: BookRequestEmailParams): Promise<{
  success: boolean;
  mode: 'live_smtp' | 'python_microservice' | 'queued_log';
}> {
  const subject = `[ReadVault Catalog Inquiry] New Book Requested: "${params.title}"`;
  const plainBody = `
NEW BOOK ARCHIVE REQUEST
--------------------------------------------------
Requested Title : ${params.title}
Author          : ${params.author || 'Unknown'}
Requesting User : ${params.userName} (${params.userEmail})
Status in Disk  : ${params.foundInArchive ? 'FOUND IN D:\\Desktop\\Archive\\Books' : 'NOT FOUND IN LOCAL ARCHIVE'}
Request Ref     : ${params.requestId}

--------------------------------------------------
Administrative Review Link:
http://localhost:9000/portal-auth-x98q
Recipient: ${ADMIN_EMAIL}
`;

  // 1. Direct SMTP if password available
  if (SMTP_PASSWORD && SMTP_PASSWORD !== 'your_16_char_google_app_password') {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false,
        auth: {
          user: SMTP_SENDER,
          pass: SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"ReadVault Catalog Gateway" <${SMTP_SENDER}>`,
        to: ADMIN_EMAIL,
        subject,
        text: plainBody,
      });

      return { success: true, mode: 'live_smtp' };
    } catch (err: any) {
      console.warn(`[DISPATCH] Direct SMTP failed (${err.message}), trying microservice.`);
    }
  }

  // 2. Try Python microservice
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${MAIL_SERVICE_URL}/notify-book-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: params.title,
        author: params.author || '',
        user_name: params.userName,
        user_email: params.userEmail,
        request_id: params.requestId,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return { success: true, mode: 'python_microservice' };
    }
  } catch (err) {
    // Microservice offline
  }

  // 3. Fallback queue log
  logToDispatchFile(subject, plainBody, ADMIN_EMAIL);
  return { success: true, mode: 'queued_log' };
}
