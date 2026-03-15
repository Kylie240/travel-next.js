import { Resend } from "resend";

export type PurchaseItinerary = { id: string; title: string };

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM || "Journli <onboarding@resend.dev>";

/**
 * Sends a purchase confirmation email with download links to the purchased itineraries.
 * Uses RESEND_API_KEY and optionally RESEND_FROM (e.g. "Journli <noreply@yourdomain.com>").
 */
export async function sendPurchaseConfirmationEmail(
  to: string,
  itineraries: PurchaseItinerary[],
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping purchase confirmation email");
    return { success: false, error: "Resend not configured" };
  }

  if (itineraries.length === 0) {
    return { success: false, error: "No itineraries" };
  }

  const linksHtml = itineraries
    .map(
      (it) =>
        `<li><a href="${baseUrl}/itinerary/${it.id}" style="color:#2563eb;text-decoration:underline;">${escapeHtml(it.title)}</a></li>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.5rem;margin-bottom:16px;">Thanks for your purchase</h1>
  <p>Your itineraries are ready. Use the links below to view and download them:</p>
  <ul style="list-style:none;padding:0;margin:16px 0;">
    ${linksHtml}
  </ul>
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">You can also access your purchases anytime from your <a href="${baseUrl}/purchased" style="color:#2563eb;">Purchased Itineraries</a> page.</p>
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">— The Journli team</p>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Your ${itineraries.length} itinerary ${itineraries.length === 1 ? "is" : "are"} ready – Journli`,
      html,
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
