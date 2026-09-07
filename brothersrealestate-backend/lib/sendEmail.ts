interface SendEmailOptions {
  to?: string;
  toName?: string;
  subject: string;
  html: string;
}

/** "Brothers Real Estate <aanchal2115@gmail.com>" -> { name, email } */
function parseFromHeader(raw: string): { name: string; email: string } {
  const match = raw.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (match) return { name: match[1] || "Brothers Real Estate", email: match[2] };
  return { name: "Brothers Real Estate", email: raw.trim() };
}

// Every transactional email in this app (enquiry notifications, enquiry
// confirmations, admin lockout alerts) goes through Brevo's REST API — the
// provider that's actually configured with a live key. `@sendgrid/mail`
// remains a dependency but SENDGRID_API_KEY is unset in every environment,
// so a SendGrid-based sender here would silently no-op.
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const to = options.to || process.env.ADMIN_EMAIL;

  if (!apiKey) {
    console.warn("BREVO_API_KEY not set — skipping email send (no-op)");
    return false;
  }
  if (!to) {
    console.warn("sendEmail: no recipient (options.to / ADMIN_EMAIL both empty) — skipping");
    return false;
  }

  const fromRaw = process.env.BREVO_FROM || process.env.FROM_EMAIL || "Brothers Real Estate <no-reply@brothersrealestate.com>";
  const { name: fromName, email: fromEmail } = parseFromHeader(fromRaw);

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to, name: options.toName || to }],
        subject: options.subject,
        htmlContent: options.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Brevo send failed:", res.status, body);
      return false;
    }

    console.log("Email sent successfully to", to);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export default sendEmail;
