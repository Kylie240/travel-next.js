import { Resend } from "resend";

export type PurchaseItinerary = { id: string; title: string };

/** Shown in the purchase confirmation email (from DB / Stripe session at send time). */
export type PurchaseEmailContext = {
  creatorUsername?: string | null;
  buyerUsername?: string | null;
  /** Stripe Checkout collects this for guests when name is enabled. */
  buyerName?: string | null;
  sellerThankYouMessage?: string | null;
};

/** Same PDF as in-app Export (jsPDF); optional when generation fails. */
export type PurchaseEmailPdfAttachment = {
  filename: string;
  buffer: Buffer;
};

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM || "Journli <onboarding@resend.dev>";

/**
 * Sends a purchase confirmation email for one itinerary (view / download link).
 * Uses RESEND_API_KEY and optionally RESEND_FROM (e.g. "Journli <noreply@yourdomain.com>").
 */
export async function sendPurchaseConfirmationEmail(
  to: string,
  itinerary: PurchaseItinerary,
  baseUrl: string,
  context?: PurchaseEmailContext,
  pdfAttachment?: PurchaseEmailPdfAttachment | null
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping purchase confirmation email");
    return { success: false, error: "Resend not configured" };
  }

  const linkUrl = `${baseUrl}/itinerary/${itinerary.id}`;
  const title = itinerary.title?.trim() || "Itinerary";
  const subjectSnippet = title
    .replace(/\s+/g, " ")
    .slice(0, 55)
    .trim();

  const creator = context?.creatorUsername?.trim();
  const buyerU = context?.buyerUsername?.trim();
  const buyerN = context?.buyerName?.trim();
  const thankYou = context?.sellerThankYouMessage?.trim();

  const greeting =
    buyerU != null && buyerU.length > 0
      ? `Hi ${escapeHtml(buyerU)}`
      : buyerN != null && buyerN.length > 0
        ? `Hi ${escapeHtml(buyerN)}`
        : "Hi there";

  const fromLine =
    creator != null && creator.length > 0
      ? `<p style="margin-bottom:16px;color:#4b5563;">Thank you for purchasing <strong>${subjectSnippet}</strong> from <strong>@${escapeHtml(creator)}</strong> on Journli. Your download is now ready.</p>`
      : "";

  const sellerNote =
    thankYou != null && thankYou.length > 0
      ? `<div style="margin:20px 0;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
  <p style="margin:0 0 8px;font-size:0.875rem;font-weight:600;color:#374151;">A note from the creator${
    creator != null && creator.length > 0 ? ` (${escapeHtml(creator)})` : ""
  }</p>
  <p style="margin:0;white-space:pre-wrap;color:#1f2937;font-size:0.9375rem;">${escapeHtml(
    thankYou
  )}</p>
</div>`
      : "";

  const linkHtml = `<p style="margin:16px 0;"><a href="${linkUrl}" style="color:#2563eb;text-decoration:underline;font-weight:600;">view itinerary</a></p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.5rem;margin-bottom:16px;">Journli</h1>
  <h3 style="font-size:1.5rem;margin-bottom:16px;">Thank you for your purchase</h3>
  <p style="margin-bottom:8px;">${greeting},</p>
  ${fromLine} 
  If you purchased from a Journli account, access the itinerary by following the link below or navigating to the <a href="${baseUrl}/purchased" style="color:#2563eb;">Purchased</a> page on your account. 
  ${linkHtml}
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">— The Journli team</p>
  ${sellerNote}
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      // to: [to],
      to: ["info@journli.com"],
      subject: "Your itinerary is here! – Journli",
      html,
      attachments:
        pdfAttachment != null
          ? [
              {
                filename: pdfAttachment.filename,
                content: pdfAttachment.buffer,
              },
            ]
          : undefined,
    });

    if (error) {
      console.error("Resend purchase email error:", error);
      return { success: false, error: error.message };
    }
    console.log("Purchase confirmation email sent:", data?.id, "to", to);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend send failed:", message);
    return { success: false, error: message };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping password reset email");
    return { success: false, error: "Resend not configured" };
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.5rem;margin-bottom:16px;">Journli</h1>
  <h2 style="font-size:1.25rem;margin-bottom:16px;">Reset your password</h2>
  <p style="margin-bottom:16px;color:#4b5563;">We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
  <p style="margin:24px 0;">
    <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#0d6b64;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Reset password</a>
  </p>
  <p style="color:#6b7280;font-size:0.875rem;">If you didn't request this, you can safely ignore this email.</p>
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">— The Journli team</p>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Reset your Journli password",
      html,
    });

    if (error) {
      console.error("Resend password reset email error:", error);
      return { success: false, error: error.message };
    }
    console.log("Password reset email sent:", data?.id, "to", to);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend password reset send failed:", message);
    return { success: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
