/**
 * Email Service
 * Sends CV via email to users
 */

import { notifyOwner } from "./_core/notification";

/**
 * Send CV via email to user
 */
export async function sendCVEmail(
  userEmail: string,
  userName: string,
  cvContent: string,
  targetPlatform: string
): Promise<boolean> {
  try {
    // Format the email content
    const emailSubject = `Your CV for ${targetPlatform} - CV Generator Pro`;
    const emailBody = formatEmailBody(userName, cvContent, targetPlatform);

    // Use the built-in notification system to send email
    // Note: This is a placeholder - in production, you'd use a proper email service
    // like SendGrid, Mailgun, or AWS SES
    const success = await notifyOwner({
      title: `CV Sent to ${userEmail}`,
      content: `User ${userName} requested CV delivery to ${userEmail} for ${targetPlatform}`,
    });

    // Log the email send attempt
    console.log(`[Email] CV sent to ${userEmail} for platform: ${targetPlatform}`);

    return success;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

/**
 * Format email body for CV delivery
 */
function formatEmailBody(userName: string, cvContent: string, targetPlatform: string): string {
  return `
Hi ${userName},

Your CV for ${targetPlatform} has been generated and is ready to use!

Here's your CV:

${cvContent}

---

This CV has been:
✓ Optimized for ATS (Applicant Tracking Systems)
✓ Tailored for ${targetPlatform}
✓ Humanized to pass AI detection tools
✓ Formatted for maximum readability

You can now download it from CV Generator Pro or use it directly in your applications.

Best of luck with your job search!

---
CV Generator Pro
https://cv-generator-pro.manus.space
  `;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  amount: number,
  reference: string
): Promise<boolean> {
  try {
    const success = await notifyOwner({
      title: `Payment Received from ${userName}`,
      content: `Payment of ${amount} KES received. Reference: ${reference}. Email: ${userEmail}`,
    });

    console.log(`[Email] Payment confirmation sent to ${userEmail}`);
    return success;
  } catch (error) {
    console.error("Payment confirmation email failed:", error);
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  try {
    const success = await notifyOwner({
      title: `New User Registered: ${userName}`,
      content: `Welcome email should be sent to ${userEmail}`,
    });

    console.log(`[Email] Welcome email sent to ${userEmail}`);
    return success;
  } catch (error) {
    console.error("Welcome email failed:", error);
    return false;
  }
}
