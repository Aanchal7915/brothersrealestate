// The existing admin-notification template below interpolates user input
// straight into the HTML with no escaping. New templates in this file are
// deliberately not the same — this helper keeps them from becoming an email
// HTML-injection vector via a submitted name/message.
function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

interface EnquiryLike {
  name: string;
  email: string;
  phone: string;
  message?: string;
  specialEnquiry?: string;
  project?: string;
  propertyId?: { title?: string; city?: string } | null;
  createdAt: Date | string;
}

// Port of utils/emailTemplate.js with rebrand text applied per plan Section 3:
// footer "Hi-Tech Properties" -> "Brothers Realestate"; address already matches
// the standardized Gurugram address.
export function getEnquiryEmailTemplate(enquiry: EnquiryLike): string {
  const { name, email, phone, message, specialEnquiry, project, propertyId, createdAt } = enquiry;
  const date = new Date(createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  let leadType = "General Enquiry";
  let propertyDetail: { label: string; value: string } | null = null;

  if (project) {
    leadType = "Landing Page Lead";
    propertyDetail = { label: "Project", value: project };
  } else if (propertyId && propertyId.title) {
    leadType = "Property Enquiry";
    propertyDetail = { label: "Property", value: `${propertyId.title} (${propertyId.city})` };
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1c1915 0%, #242b2e 100%); padding: 30px; text-align: center; border-bottom: 3px solid #dfae75; }
            .logo { max-width: 150px; height: auto; }
            .content { padding: 40px; }
            .title { color: #1c1915; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .info-table td { padding: 12px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; width: 140px; text-transform: uppercase; font-size: 11px; }
            .value { color: #1c1915; font-weight: 600; font-size: 14px; }
            .special-box { background-color: #fdf8f3; border-left: 4px solid #dfae75; padding: 20px; margin-top: 30px; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
            .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: #dfae75; color: #1c1915; font-weight: 800; font-size: 10px; text-transform: uppercase; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">

                </div>
            <div class="content">
                <div style="text-align: center;">
                    <span class="badge">${leadType}</span>
                </div>
                <h1 class="title">New Enquiry Details</h1>

                <table class="info-table">
                    <tr>
                        <td class="label">Date & Time</td>
                        <td class="value">${date}</td>
                    </tr>
                    ${
                      propertyDetail
                        ? `
                    <tr>
                        <td class="label">${propertyDetail.label}</td>
                        <td class="value" style="color: #dfae75;">${propertyDetail.value}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr>
                        <td class="label">Name</td>
                        <td class="value">${name}</td>
                    </tr>
                    <tr>
                        <td class="label">Email</td>
                        <td class="value">${email}</td>
                    </tr>
                    <tr>
                        <td class="label">Phone</td>
                        <td class="value">${phone}</td>
                    </tr>
                </table>

                <div class="special-box">
                    <div class="label" style="margin-bottom: 8px;">Message / Message:</div>
                    <div class="value">${message || "No specific message provided."}</div>
                </div>

                ${
                  specialEnquiry
                    ? `
                <div class="special-box" style="margin-top: 10px; background-color: #f0f7ff; border-left-color: #007bff;">
                    <div class="label" style="margin-bottom: 8px; color: #007bff;">Special Enquiry:</div>
                    <div class="value">${specialEnquiry}</div>
                </div>
                `
                    : ""
                }

                <div style="margin-top: 30px; text-align: center;">
                    <p style="font-size: 14px; color: #666;">Action Required: Please respond to this lead promptly.</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Brothers Realestate. All rights reserved.</p>
                <p>Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Sent back to the person who filled a form, so they have proof their
// enquiry went through and know who to expect a call from.
export function getEnquiryConfirmationEmailTemplate(enquiry: EnquiryLike): string {
  const { name, message, specialEnquiry, project, propertyId } = enquiry;

  let aboutLine: string | null = null;
  if (project) {
    aboutLine = escapeHtml(project);
  } else if (propertyId && propertyId.title) {
    aboutLine = `${escapeHtml(propertyId.title)}${propertyId.city ? ` (${escapeHtml(propertyId.city)})` : ""}`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1c1915 0%, #242b2e 100%); padding: 32px; text-align: center; border-bottom: 3px solid #dfae75; }
            .wordmark { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
            .wordmark span { color: #dfae75; }
            .content { padding: 40px; }
            .title { color: #1c1915; font-size: 22px; font-weight: bold; margin: 0 0 14px; text-align: center; }
            .lead { color: #555; font-size: 14.5px; line-height: 1.7; text-align: center; margin: 0 auto 26px; max-width: 440px; }
            .summary-box { background-color: #fdf8f3; border-left: 4px solid #dfae75; padding: 20px; border-radius: 4px; }
            .summary-box .row { padding: 6px 0; }
            .summary-box .label { font-weight: bold; color: #666; text-transform: uppercase; font-size: 11px; display: block; }
            .summary-box .value { color: #1c1915; font-weight: 600; font-size: 14px; margin-top: 2px; }
            .next-steps { margin-top: 30px; text-align: center; }
            .cta { display: inline-block; margin-top: 8px; padding: 12px 28px; background-color: #dfae75; color: #1c1915 !important; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <p class="wordmark">BROTHERS <span>ESTATE</span></p>
            </div>
            <div class="content">
                <h1 class="title">Thank you, ${escapeHtml(name)}!</h1>
                <p class="lead">
                    We've received your enquiry and a member of our team will reach out to you shortly
                    ${aboutLine ? `about <strong style="color:#1c1915;">${aboutLine}</strong>` : ""}.
                </p>

                <div class="summary-box">
                    <div class="row">
                        <span class="label">Your message</span>
                        <span class="value" style="font-weight: 500;">${escapeHtml(message) || "No specific message provided."}</span>
                    </div>
                    ${
                      specialEnquiry
                        ? `<div class="row" style="margin-top: 10px;">
                        <span class="label">Special enquiry</span>
                        <span class="value" style="font-weight: 500;">${escapeHtml(specialEnquiry)}</span>
                    </div>`
                        : ""
                    }
                </div>

                <div class="next-steps">
                    <p style="font-size: 13.5px; color: #666; margin: 0 0 4px;">Need us sooner? Call or WhatsApp:</p>
                    <a class="cta" href="tel:+911234567899">+91-123456 7899</a>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Brothers Realestate. All rights reserved.</p>
                <p>Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram</p>
                <p style="margin-top: 8px; color: #bbb;">This is an automated confirmation — no need to reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

interface AdminLockedEmailOptions {
  adminName: string;
  /** What was entered incorrectly — "login password" or "security passcode". */
  reason: string;
  attempts: number;
  minutes: number;
}

// Sent to the admin when either lockout tier trips (see the two thresholds
// in app/api/admin/login/route.ts). Deliberately doesn't include the IP or a
// "was this you?" action link — the backend has no session/IP trail wired up
// yet for failed attempts, and a fabricated action link would be worse than
// none.
export function getAdminLockedEmailTemplate({
  adminName,
  reason,
  attempts,
  minutes,
}: AdminLockedEmailOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1c1915 0%, #242b2e 100%); padding: 32px; text-align: center; border-bottom: 3px solid #d9534f; }
            .wordmark { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
            .wordmark span { color: #dfae75; }
            .content { padding: 40px; }
            .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: #fbeae9; color: #b3261e; font-weight: 800; font-size: 10px; text-transform: uppercase; margin-bottom: 18px; }
            .title { color: #1c1915; font-size: 22px; font-weight: bold; margin: 0 0 14px; text-align: center; }
            .lead { color: #555; font-size: 14.5px; line-height: 1.75; text-align: center; margin: 0 auto; max-width: 440px; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 26px; }
            .info-table td { padding: 12px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; width: 160px; text-transform: uppercase; font-size: 11px; }
            .value { color: #1c1915; font-weight: 600; font-size: 14px; }
            .note { margin-top: 26px; background-color: #fdf8f3; border-left: 4px solid #dfae75; padding: 16px 20px; font-size: 13px; color: #555; line-height: 1.6; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <p class="wordmark">BROTHERS <span>ESTATE</span></p>
            </div>
            <div class="content">
                <div style="text-align: center;">
                    <span class="badge">Security Alert</span>
                </div>
                <h1 class="title">Your admin access is temporarily locked</h1>
                <p class="lead">
                    Hi ${escapeHtml(adminName)}, we locked the Brothers Realestate admin panel for your account after
                    ${attempts} incorrect ${escapeHtml(reason)} attempts in a row.
                </p>

                <table class="info-table">
                    <tr>
                        <td class="label">Locked for</td>
                        <td class="value">${minutes} minutes</td>
                    </tr>
                    <tr>
                        <td class="label">Reason</td>
                        <td class="value">${attempts} incorrect ${escapeHtml(reason)} attempts</td>
                    </tr>
                    <tr>
                        <td class="label">Time</td>
                        <td class="value">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                    </tr>
                </table>

                <div class="note">
                    If this was you, just wait out the lock and try again — no action needed.
                    If you don't recognize this activity, please change your admin password as soon as the
                    lock lifts.
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Brothers Realestate. All rights reserved.</p>
                <p>Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
