import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { initializePayment, verifyPayment, getCVPricing } from "../paystack";
import { getCVGeneration, updateCVGeneration } from "../db";
import { ENV } from "../_core/env";

export const paymentRouter = router({
  /**
   * Initialize a payment for CV download
   * Returns the Paystack checkout URL
   */
  initializeCheckout: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get the CV to verify it belongs to the user
      const cv = await getCVGeneration(input.cvId);

      if (!cv || cv.userId !== ctx.user.id) {
        throw new Error("CV not found or unauthorized");
      }

      // Check if this is the user's first CV (free)
      const pricing = getCVPricing();
      const isFirstCV = !cv.isPaid && !cv.paymentReference;

      if (isFirstCV) {
        // First CV is free, mark as paid without payment
        await updateCVGeneration(input.cvId, {
          isPaid: true,
          paymentStatus: "free",
          paymentReference: `free_${Date.now()}`,
        });

        return {
          success: true,
          isFree: true,
          message: "First CV is free! You can now download it.",
        };
      }

      // For subsequent CVs, initialize Paystack payment
      try {
        const response = await initializePayment(
          ctx.user.email || "",
          ctx.user.id,
          input.cvId,
          {
            cvId: input.cvId,
            userId: ctx.user.id,
            userName: ctx.user.name,
          }
        );

        if (!response.status) {
          throw new Error(response.message);
        }

        // Store the payment reference temporarily
        await updateCVGeneration(input.cvId, {
          paymentReference: response.data.reference,
          paymentStatus: "pending",
        });

        return {
          success: true,
          isFree: false,
          checkoutUrl: response.data.authorization_url,
          accessCode: response.data.access_code,
          reference: response.data.reference,
          amount: pricing.subsequentCVPrice,
        };
      } catch (error) {
        console.error("Payment initialization failed:", error);
        throw new Error("Failed to initialize payment. Please try again.");
      }
    }),

  /**
   * Verify payment and mark CV as paid
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        reference: z.string(),
        cvId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const paymentData = await verifyPayment(input.reference);

        if (!paymentData.status || paymentData.data.status !== "success") {
          throw new Error("Payment verification failed");
        }

        // Verify the payment belongs to this user
        if (paymentData.data.metadata.userId !== ctx.user.id) {
          throw new Error("Payment user mismatch");
        }

        // Mark CV as paid
        await updateCVGeneration(input.cvId, {
          isPaid: true,
          paymentStatus: "completed",
          paymentReference: input.reference,
          paidAt: new Date(),
        });

        return {
          success: true,
          message: "Payment verified successfully!",
          paymentId: paymentData.data.id,
        };
      } catch (error) {
        console.error("Payment verification failed:", error);
        throw new Error("Failed to verify payment. Please try again.");
      }
    }),

  /**
   * Get payment status for a CV
   */
  getPaymentStatus: protectedProcedure
    .input(
      z.object({
        cvId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const cv = await getCVGeneration(input.cvId);

      if (!cv || cv.userId !== ctx.user.id) {
        throw new Error("CV not found or unauthorized");
      }

      return {
        cvId: input.cvId,
        isPaid: cv.isPaid,
        paymentStatus: cv.paymentStatus,
        paymentReference: cv.paymentReference,
        paidAt: cv.paidAt,
      };
    }),

  /**
   * Get pricing information
   */
  getPricing: protectedProcedure.query(() => {
    return getCVPricing();
  }),
});
