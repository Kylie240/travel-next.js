import { Resend } from "resend";

import { getItineraryPublicUrl } from "@/lib/utils/itinerary-url";

export type PurchaseItinerary = { id: string; title: string; slug?: string | null };

/** Shown in the purchase confirmation email (from DB / Stripe session at send time). */
export type PurchaseEmailContext = {
  creatorUsername?: string | null;
  buyerUsername?: string | null;
  /** Stripe Checkout collects this for guests when name is enabled. */
  buyerName?: string | null;
  /** Custom intro from users_settings.seller_message (replaces default fromLine). */
  sellerMessage?: string | null;
};

/** Same PDF as in-app Export (jsPDF); optional when generation fails. */
export type PurchaseEmailPdfAttachment = {
  filename: string;
  buffer: Buffer;
};

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM_EMAIL = "Journli <onboarding@resend.dev>";

/** Resend requires `email@domain.com` or `Name <email@domain.com>`. */
function getFromEmail(): string {
  const raw = process.env.RESEND_FROM?.trim();
  if (!raw) return DEFAULT_FROM_EMAIL;

  // Strip wrapping quotes from .env values like "Journli <info@journli.com>"
  const from = raw.replace(/^["']|["']$/g, "").trim();
  if (!from) return DEFAULT_FROM_EMAIL;

  const plainEmail = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/;
  const namedEmail = /^.+<[^\s<>]+@[^\s<>]+\.[^\s<>]+>$/;

  if (plainEmail.test(from) || namedEmail.test(from)) {
    return from;
  }

  console.warn(
    "Invalid RESEND_FROM format; falling back to default sender:",
    raw
  );
  return DEFAULT_FROM_EMAIL;
}

const FROM_EMAIL = getFromEmail();

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

  const linkUrl = getItineraryPublicUrl(
    { id: itinerary.id, title: itinerary.title, slug: itinerary.slug },
    baseUrl
  );
  const title = itinerary.title?.trim() || "Itinerary";
  const subjectSnippet = title
    .replace(/\s+/g, " ")
    .slice(0, 55)
    .trim();

  const creator = context?.creatorUsername?.trim();
  const buyerU = context?.buyerUsername?.trim();
  const buyerN = context?.buyerName?.trim();
  const sellerMessage = context?.sellerMessage?.trim();

  const greeting =
    buyerU != null && buyerU.length > 0
      ? `Hi ${escapeHtml(buyerU)}`
      : buyerN != null && buyerN.length > 0
        ? `Hi ${escapeHtml(buyerN)}`
        : "Hi there";

  const thankYouLine =
    creator != null && creator.length > 0
      ? `<p style="margin-bottom:16px;color:#4b5563;">Thank you for purchasing <strong>${escapeHtml(subjectSnippet)}</strong> from <strong>@${escapeHtml(creator)}</strong> on Journli. Your download is now ready.</p>`
      : `<p style="margin-bottom:16px;color:#4b5563;">Thank you for your purchase on Journli. Your download is now ready.</p>`;

  const sellerNoteLine =
    sellerMessage != null && sellerMessage.length > 0
      ? `<p style="margin-bottom:8px;color:#4b5563;"><strong>A note from the seller${
          creator != null && creator.length > 0
            ? ` (@${escapeHtml(creator)})`
            : ""
        }:</strong></p>
      <p style="margin-bottom:16px;color:#4b5563;white-space:pre-wrap;">${escapeHtml(sellerMessage)}</p>`
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
  ${thankYouLine}
  ${sellerNoteLine}
  <p style="margin-bottom:8px;color:#4b5563;">If you purchased from a Journli account, access the itinerary by following the link below or navigating to the 'Purchased' page on your account.</p>
  ${linkHtml}
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">— The Journli team</p>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
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

export type CreatorPurchaseNotificationContext = {
  creatorUsername?: string | null;
  itineraryTitle: string;
  itineraryId: string;
  itinerarySlug?: string | null;
  buyerUsername?: string | null;
  buyerName?: string | null;
  buyerEmail?: string | null;
  amountCents?: number | null;
};

/**
 * Notifies the itinerary creator that someone purchased their itinerary.
 */
export async function sendCreatorPurchaseNotificationEmail(
  to: string,
  baseUrl: string,
  context: CreatorPurchaseNotificationContext
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping creator purchase notification");
    return { success: false, error: "Resend not configured" };
  }

  const title = context.itineraryTitle?.trim() || "Itinerary";
  const creator = context.creatorUsername?.trim();
  const buyerU = context.buyerUsername?.trim();
  const buyerN = context.buyerName?.trim();
  const buyerEmail = context.buyerEmail?.trim();

  const buyerLabel =
    buyerU != null && buyerU.length > 0
      ? `@${buyerU}`
      : buyerN != null && buyerN.length > 0
        ? buyerN
        : buyerEmail != null && buyerEmail.length > 0
          ? buyerEmail
          : "Someone";

  const greeting =
    creator != null && creator.length > 0
      ? `Hi ${escapeHtml(creator)}`
      : "Hi there";

  const amountLine =
    context.amountCents != null && context.amountCents > 0
      ? `<p style="margin:16px 0;color:#4b5563;">Sale amount: <strong>${formatUsd(context.amountCents)}</strong></p>`
      : "";

  const dashboardUrl = `${baseUrl.replace(/\/$/, "")}/seller-dashboard`;
  const itineraryUrl = getItineraryPublicUrl(
    {
      id: context.itineraryId,
      title: context.itineraryTitle,
      slug: context.itinerarySlug,
    },
    baseUrl
  );

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.5rem;margin-bottom:16px;">Journli</h1>
  <h3 style="font-size:1.25rem;margin-bottom:16px;">You made a sale!</h3>
  <p style="margin-bottom:8px;">${greeting},</p>
  <p style="margin-bottom:16px;color:#4b5563;"><strong>${escapeHtml(buyerLabel)}</strong> just purchased your itinerary <strong>${escapeHtml(title)}</strong>.</p>
  ${amountLine}
  <p style="margin:16px 0;"><a href="${itineraryUrl}" style="color:#2563eb;text-decoration:underline;font-weight:600;">View itinerary</a></p>
  <p style="margin:16px 0;"><a href="${dashboardUrl}" style="color:#2563eb;text-decoration:underline;font-weight:600;">Open seller dashboard</a></p>
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">— The Journli team</p>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Journli sale confirmation for: ${title.slice(0, 50)}`,
      html,
    });

    if (error) {
      console.error("Resend creator purchase notification error:", error);
      return { success: false, error: error.message };
    }
    console.log("Creator purchase notification sent:", data?.id, "to", to);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend creator notification send failed:", message);
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
    <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#0E7490;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Reset password</a>
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

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export type FeedbackNotificationContext = {
  submitterUserId: string;
  submitterEmail?: string | null;
  submitterName?: string | null;
  submitterUsername?: string | null;
  rating?: number | null;
  selectedIssues: string[];
  comment?: string | null;
};

function getFeedbackNotificationRecipient(): string {
  const configured = process.env.FEEDBACK_NOTIFICATION_EMAIL?.trim();
  if (configured) return configured;
  return "info@journli.com";
}

/**
 * Notifies the site owner when a user submits feedback.
 * Set FEEDBACK_NOTIFICATION_EMAIL to override the default info@journli.com recipient.
 */
export async function sendFeedbackNotificationEmail(
  context: FeedbackNotificationContext
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping feedback notification email");
    return { success: false, error: "Resend not configured" };
  }

  const to = getFeedbackNotificationRecipient();
  const submitterLabel =
    context.submitterUsername?.trim()
      ? `@${context.submitterUsername.trim()}`
      : context.submitterName?.trim() || context.submitterEmail?.trim() || "Unknown user";

  const ratingLine =
    context.rating != null && context.rating > 0
      ? `<p style="margin:12px 0;color:#4b5563;"><strong>Rating:</strong> ${context.rating} / 5</p>`
      : `<p style="margin:12px 0;color:#4b5563;"><strong>Rating:</strong> Not provided</p>`;

  const issuesHtml =
    context.selectedIssues.length > 0
      ? `<ul style="margin:8px 0 16px;padding-left:20px;color:#4b5563;">${context.selectedIssues
          .map((issue) => `<li>${escapeHtml(issue)}</li>`)
          .join("")}</ul>`
      : `<p style="margin:8px 0 16px;color:#4b5563;">None selected</p>`;

  const commentText = context.comment?.trim() || "";
  const commentHtml = commentText
    ? `<p style="margin:16px 0 8px;color:#111827;font-weight:600;">Additional details</p>
       <p style="margin:0 0 16px;color:#4b5563;white-space:pre-wrap;">${escapeHtml(commentText)}</p>`
    : `<p style="margin:16px 0;color:#4b5563;">No additional details provided.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.5rem;margin-bottom:16px;">Journli</h1>
  <h2 style="font-size:1.25rem;margin-bottom:16px;">New user feedback</h2>
  <p style="margin-bottom:16px;color:#4b5563;"><strong>From:</strong> ${escapeHtml(submitterLabel)}</p>
  <p style="margin-bottom:8px;color:#4b5563;"><strong>User ID:</strong> ${escapeHtml(context.submitterUserId)}</p>
  ${
    context.submitterEmail?.trim()
      ? `<p style="margin-bottom:8px;color:#4b5563;"><strong>Email:</strong> ${escapeHtml(context.submitterEmail.trim())}</p>`
      : ""
  }
  ${ratingLine}
  <p style="margin:16px 0 8px;color:#111827;font-weight:600;">Issues reported</p>
  ${issuesHtml}
  ${commentHtml}
  <p style="margin-top:24px;color:#6b7280;font-size:0.875rem;">— Journli feedback</p>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `New feedback from ${submitterLabel.replace(/^@/, "")} – Journli`,
      html,
    });

    if (error) {
      console.error("Resend feedback notification error:", error);
      return { success: false, error: error.message };
    }
    console.log("Feedback notification email sent:", data?.id, "to", to);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Resend feedback notification send failed:", message);
    return { success: false, error: message };
  }
}
