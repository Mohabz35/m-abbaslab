/**
 * PDF Generation Service
 * Converts CV markdown to PDF format
 */

import { generateImage } from "./_core/imageGeneration";

/**
 * Convert CV content to PDF
 * Uses the built-in image generation service to create a PDF-like output
 */
export async function generateCVPDF(
  cvContent: string,
  cvName: string = "CV"
): Promise<{ url: string; key: string }> {
  try {
    // Convert markdown to a formatted text for PDF
    const formattedContent = formatCVForPDF(cvContent);

    // Use the image generation service to create a PDF-like document
    // For now, we'll return a placeholder that can be replaced with actual PDF generation
    const result = await generateImage({
      prompt: `Create a professional CV document with the following content formatted as a clean, ATS-friendly resume:\n\n${formattedContent}`,
    });

    return {
      url: result.url || "",
      key: `cv_${cvName}_${Date.now()}`,
    };
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}

/**
 * Format CV content for PDF generation
 */
function formatCVForPDF(cvContent: string): string {
  // Remove markdown formatting for cleaner PDF
  let formatted = cvContent
    .replace(/^### /gm, "") // Remove h3
    .replace(/^## /gm, "") // Remove h2
    .replace(/^# /gm, "") // Remove h1
    .replace(/\*\*/g, "") // Remove bold
    .replace(/\*/g, "") // Remove italics
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1"); // Convert links to plain text

  return formatted;
}

/**
 * Generate a simple text-based CV for email
 */
export function generateCVText(cvContent: string): string {
  // Remove markdown formatting
  return cvContent
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^# /gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
}
