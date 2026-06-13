import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveCVGeneration, getCVGeneration, getUserCVGenerations, updateCVGeneration } from "../db";
import { upsertUser, getUserByOpenId } from "../db";
import { invokeLLM } from "../_core/llm";
import { calculateATSScore, humanizeCV } from "../ats";

// Platform-specific guidelines
const platformGuidelines = {
  linkedin: `
    LinkedIn CVs should emphasize:
    - Quantifiable achievements and metrics
    - Industry-specific keywords
    - Professional accomplishments
    - Clear career progression
    - Leadership and impact statements
  `,
  flexjobs: `
    FlexJobs CVs should highlight:
    - Remote work experience
    - Flexibility and adaptability
    - Self-management skills
    - Time zone independence
    - Project-based accomplishments
  `,
  remote_co: `
    Remote.co CVs should focus on:
    - Async communication skills
    - Self-motivation and discipline
    - Remote-specific experience
    - Time management
    - Collaboration in distributed teams
  `,
  indeed: `
    Indeed CVs should be:
    - ATS-optimized with clear formatting
    - Keyword-rich for job matching
    - Well-structured with clear sections
    - Free of graphics and tables
    - Mobile-friendly
  `,
  upwork: `
    Upwork CVs should showcase:
    - Freelance portfolio highlights
    - Client testimonials and ratings
    - Project-based achievements
    - Specialized skills and expertise
    - Hourly rate or project pricing
  `,
};

export const cvGenerationRouter = router({
  /**
   * Generate a CV and cover letter using AI
   * Applies platform-specific tailoring and humanization
   */
  generate: protectedProcedure
    .input(
      z.object({
        personalInfo: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string(),
          location: z.string(),
          summary: z.string(),
        }),
        workExperience: z.array(z.any()),
        education: z.array(z.any()),
        skills: z.array(z.any()),
        targetPlatform: z.enum(["linkedin", "flexjobs", "remote_co", "indeed", "upwork"]),
        customInstructions: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByOpenId(ctx.user.openId);
      if (!user) throw new Error("User not found");

      // Check if user has used their free credit
      const isFirstCV = user.freeCreditsUsed === 0;

      // Construct the LLM prompt
      const platformGuide = platformGuidelines[input.targetPlatform];
      const prompt = `
You are an expert CV and cover letter writer. Generate a professional CV and cover letter based on the following information.

PLATFORM GUIDELINES:
${platformGuide}

USER INFORMATION:
Name: ${input.personalInfo.name}
Email: ${input.personalInfo.email}
Phone: ${input.personalInfo.phone}
Location: ${input.personalInfo.location}
Professional Summary: ${input.personalInfo.summary}

WORK EXPERIENCE:
${JSON.stringify(input.workExperience, null, 2)}

EDUCATION:
${JSON.stringify(input.education, null, 2)}

SKILLS:
${JSON.stringify(input.skills, null, 2)}

${input.customInstructions ? `CUSTOM INSTRUCTIONS:\n${input.customInstructions}` : ""}

Please generate:
1. A professional CV in markdown format with clear sections
2. A tailored cover letter for the ${input.targetPlatform} platform

Ensure the CV is ATS-optimized, keyword-rich, and tailored to the ${input.targetPlatform} platform.
Make the language natural and human-like, avoiding overly formal or robotic phrasing.

Return the response in this exact JSON format:
{
  "cv": "...markdown formatted CV...",
  "coverLetter": "...cover letter text..."
}
      `;

      try {
        // Call the LLM to generate CV and cover letter
        const response = await invokeLLM({
          messages: [
            {
              role: "system" as const,
              content: "You are an expert CV and cover letter writer. Generate professional, ATS-optimized documents.",
            },
            {
              role: "user" as const,
              content: prompt,
            },
          ],
        });

        const responseContent = response.choices[0]?.message?.content;
        if (!responseContent || typeof responseContent !== 'string') throw new Error("No response from LLM");

        // Parse the JSON response
        const parsed = JSON.parse(responseContent);
        const { cv, coverLetter } = parsed;

        // Calculate ATS score
        const atsReport = calculateATSScore(cv);

        // Humanize the CV to pass AI detection
        const humanizedCV = humanizeCV(cv);

        // Save the generation to the database
        const generation = await saveCVGeneration({
          userId: user.id,
          targetPlatform: input.targetPlatform,
          customInstructions: input.customInstructions,
          generatedCV: humanizedCV,
          generatedCoverLetter: coverLetter,
          status: "generated",
          isHumanized: true,
          atsScore: atsReport.score,
          atsChecks: atsReport.checks as any,
          suggestedImprovements: atsReport.suggestedImprovements,
        });

        // Update user's CV generation count
        await upsertUser({
          openId: ctx.user.openId,
          totalCVsGenerated: user.totalCVsGenerated + 1,
          freeCreditsUsed: isFirstCV ? 1 : user.freeCreditsUsed,
        });

        return {
          success: true,
          data: generation,
          isFirstCV,
        };
      } catch (error) {
        console.error("CV generation error:", error);
        throw new Error(`Failed to generate CV: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Retrieve a specific CV generation
   */
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const generation = await getCVGeneration(input.id);
    if (!generation || generation.userId !== ctx.user.id) {
      throw new Error("CV not found or unauthorized");
    }
    return generation;
  }),

  /**
   * Get all CV generations for the current user
   */
  listByUser: protectedProcedure.query(async ({ ctx }) => {
    return await getUserCVGenerations(ctx.user.id);
  }),

  /**
   * Update CV generation status and metadata
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "generated", "paid", "downloaded", "emailed"]).optional(),
        atsScore: z.number().optional(),
        atsChecks: z.any().optional(),
        suggestedImprovements: z.array(z.string()).optional(),
        isHumanized: z.boolean().optional(),
        pdfStorageKey: z.string().optional(),
        paymentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const generation = await getCVGeneration(input.id);
      if (!generation || generation.userId !== ctx.user.id) {
        throw new Error("CV not found or unauthorized");
      }

      const updated = await updateCVGeneration(input.id, {
        status: input.status,
        atsScore: input.atsScore,
        atsChecks: input.atsChecks,
        suggestedImprovements: input.suggestedImprovements,
        isHumanized: input.isHumanized,
        pdfStorageKey: input.pdfStorageKey,
        paymentId: input.paymentId,
      });

      return updated;
    }),
});
