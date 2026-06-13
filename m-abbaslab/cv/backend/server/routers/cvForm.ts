import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveCVFormData, getCVFormData } from "../db";

// Validation schemas
const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().min(1, "Location is required"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
});

const workExperienceSchema = z.array(
  z.object({
    company: z.string().min(1, "Company is required"),
    role: z.string().min(1, "Role is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().nullable(),
    currentlyWorking: z.boolean().default(false),
    responsibilities: z.string().min(10, "Responsibilities must be at least 10 characters"),
  })
);

const educationSchema = z.array(
  z.object({
    school: z.string().min(1, "School is required"),
    degree: z.string().min(1, "Degree is required"),
    field: z.string().min(1, "Field is required"),
    graduationDate: z.string().min(1, "Graduation date is required"),
  })
);

const skillsSchema = z.array(
  z.object({
    name: z.string().min(1, "Skill name is required"),
    proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  })
);

const cvFormDataSchema = z.object({
  personalInfo: personalInfoSchema,
  workExperience: workExperienceSchema,
  education: educationSchema,
  skills: skillsSchema,
  targetPlatform: z.enum(["linkedin", "flexjobs", "remote_co", "indeed", "upwork"]),
  customInstructions: z.string().optional(),
});

export type CVFormData = z.infer<typeof cvFormDataSchema>;

export const cvFormRouter = router({
  /**
   * Save or update CV form data for the current user
   * This allows users to save their progress and resume later
   */
  save: protectedProcedure
    .input(cvFormDataSchema)
    .mutation(async ({ ctx, input }) => {
      const saved = await saveCVFormData(ctx.user.id, input as any);

      return {
        success: true,
        data: saved,
      };
    }),

  /**
   * Retrieve saved CV form data for the current user
   * Returns undefined if no data has been saved yet
   */
  retrieve: protectedProcedure.query(async ({ ctx }) => {
    const data = await getCVFormData(ctx.user.id);
    return data || null;
  }),
});
