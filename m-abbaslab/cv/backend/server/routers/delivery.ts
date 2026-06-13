import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getCVGeneration, updateCVGeneration, getDb } from "../db";
import { sendCVEmail } from "../email";
import { generateCVPDF, generateCVText } from "../pdf";
import { cvGenerationsTable } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const deliveryRouter = router({
  /**
   * Generate and download CV as PDF
   */
  downloadPDF: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get the CV
        const cv = await getCVGeneration(input.cvId);

        if (!cv || cv.userId !== ctx.user.id) {
          throw new Error("CV not found or unauthorized");
        }

        // Check if CV is paid (or free first CV)
        if (!cv.isPaid && cv.paymentStatus !== "free") {
          throw new Error("This CV has not been paid for. Please complete payment first.");
        }

        // Generate PDF
        const pdfResult = await generateCVPDF(cv.generatedCV, `${ctx.user.id}_${input.cvId}`);

        // Update CV with PDF storage key
        await updateCVGeneration(input.cvId, {
          pdfStorageKey: pdfResult.key,
          status: "downloaded",
        });

        return {
          success: true,
          downloadUrl: pdfResult.url,
          fileName: `CV_${cv.targetPlatform}_${Date.now()}.pdf`,
        };
      } catch (error) {
        console.error("PDF download failed:", error);
        throw new Error("Failed to generate PDF. Please try again.");
      }
    }),

  /**
   * Send CV via email
   */
  sendViaEmail: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get the CV
        const cv = await getCVGeneration(input.cvId);

        if (!cv || cv.userId !== ctx.user.id) {
          throw new Error("CV not found or unauthorized");
        }

        // Check if CV is paid (or free first CV)
        if (!cv.isPaid && cv.paymentStatus !== "free") {
          throw new Error("This CV has not been paid for. Please complete payment first.");
        }

        // Send email
        const emailSent = await sendCVEmail(
          input.email,
          ctx.user.name || "User",
          cv.generatedCV,
          cv.targetPlatform
        );

        if (!emailSent) {
          throw new Error("Failed to send email. Please try again.");
        }

        // Update CV status
        await updateCVGeneration(input.cvId, {
          status: "emailed",
        });

        return {
          success: true,
          message: `CV sent successfully to ${input.email}`,
        };
      } catch (error) {
        console.error("Email send failed:", error);
        throw new Error("Failed to send email. Please try again.");
      }
    }),

  /**
   * Get CV for viewing/preview
   */
  getCV: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const cv = await getCVGeneration(input.cvId);

        if (!cv || cv.userId !== ctx.user.id) {
          throw new Error("CV not found or unauthorized");
        }

        return {
          id: cv.id,
          targetPlatform: cv.targetPlatform,
          generatedCV: cv.generatedCV,
          generatedCoverLetter: cv.generatedCoverLetter,
          atsScore: cv.atsScore,
          atsChecks: cv.atsChecks,
          suggestedImprovements: cv.suggestedImprovements,
          isHumanized: cv.isHumanized,
          isPaid: cv.isPaid,
          paymentStatus: cv.paymentStatus,
          status: cv.status,
          createdAt: cv.createdAt,
        };
      } catch (error) {
        console.error("Get CV failed:", error);
        throw new Error("Failed to retrieve CV");
      }
    }),

  /**
   * Get user's CV history
   */
  getCVHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const cvs = await db
        .select()
        .from(cvGenerationsTable)
        .where(eq(cvGenerationsTable.userId, ctx.user.id))
        .orderBy(desc(cvGenerationsTable.createdAt));

      return cvs.map((cv) => ({
        id: cv.id,
        targetPlatform: cv.targetPlatform,
        atsScore: cv.atsScore,
        status: cv.status,
        isPaid: cv.isPaid,
        paymentStatus: cv.paymentStatus,
        createdAt: cv.createdAt,
      }));
    } catch (error) {
      console.error("Get CV history failed:", error);
      throw new Error("Failed to retrieve CV history");
    }
  }),

  /**
   * Get plain text version of CV (for email preview)
   */
  getCVAsText: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const cv = await getCVGeneration(input.cvId);

        if (!cv || cv.userId !== ctx.user.id) {
          throw new Error("CV not found or unauthorized");
        }

        const textVersion = generateCVText(cv.generatedCV);

        return {
          success: true,
          text: textVersion,
        };
      } catch (error) {
        console.error("Get CV as text failed:", error);
        throw new Error("Failed to retrieve CV text");
      }
    }),
});
