import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  freeCreditsUsed: int("freeCreditsUsed").default(0).notNull(), // 0 = not used, 1 = used
  totalCVsGenerated: int("totalCVsGenerated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * CV Form Data - Stores multi-step form submissions for recovery and history
 */
export const cvFormDataTable = mysqlTable("cv_form_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  personalInfo: json("personalInfo").$type<{
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  }>().notNull(),
  workExperience: json("workExperience").$type<Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string | null;
    currentlyWorking: boolean;
    responsibilities: string;
  }>>().notNull(),
  education: json("education").$type<Array<{
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>>().notNull(),
  skills: json("skills").$type<Array<{
    name: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  }>>().notNull(),
  targetPlatform: mysqlEnum("targetPlatform", ["linkedin", "flexjobs", "remote_co", "indeed", "upwork"]),
  customInstructions: text("customInstructions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CVFormData = typeof cvFormDataTable.$inferSelect;
export type InsertCVFormData = typeof cvFormDataTable.$inferInsert;

/**
 * CV Generations - Stores all generated CVs with metadata, ATS scores, and status
 */
export const cvGenerationsTable = mysqlTable("cv_generations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetPlatform: mysqlEnum("targetPlatform", ["linkedin", "flexjobs", "remote_co", "indeed", "upwork"]).notNull(),
  customInstructions: text("customInstructions"),
  generatedCV: text("generatedCV").notNull(),
  generatedCoverLetter: text("generatedCoverLetter"),
  atsScore: int("atsScore"),
  atsChecks: json("atsChecks").$type<Array<{
    name: string;
    points: number;
    status: "passed" | "failed";
    description: string;
  }>>(),
  suggestedImprovements: json("suggestedImprovements").$type<string[]>(),
  isHumanized: boolean("isHumanized").default(false),
  pdfStorageKey: varchar("pdfStorageKey", { length: 255 }),
  status: mysqlEnum("status", ["draft", "generated", "paid", "downloaded", "emailed"]).default("draft"),
  paymentId: varchar("paymentId", { length: 255 }),
  isPaid: boolean("isPaid").default(false),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "free"]).default("pending"),
  paymentReference: varchar("paymentReference", { length: 255 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CVGeneration = typeof cvGenerationsTable.$inferSelect;
export type InsertCVGeneration = typeof cvGenerationsTable.$inferInsert;

/**
 * Stripe Transactions - Audit log for all payments
 */
export const stripeTransactionsTable = mysqlTable("stripe_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cvGenerationId: int("cvGenerationId"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  amount: int("amount").notNull(), // Amount in cents (50 = $0.50)
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeTransaction = typeof stripeTransactionsTable.$inferSelect;
export type InsertStripeTransaction = typeof stripeTransactionsTable.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  cvFormData: many(cvFormDataTable),
  cvGenerations: many(cvGenerationsTable),
  stripeTransactions: many(stripeTransactionsTable),
}));

export const cvFormDataRelations = relations(cvFormDataTable, ({ one }) => ({
  user: one(users, {
    fields: [cvFormDataTable.userId],
    references: [users.id],
  }),
}));

export const cvGenerationsRelations = relations(cvGenerationsTable, ({ one }) => ({
  user: one(users, {
    fields: [cvGenerationsTable.userId],
    references: [users.id],
  }),
}));

export const stripeTransactionsRelations = relations(stripeTransactionsTable, ({ one }) => ({
  user: one(users, {
    fields: [stripeTransactionsTable.userId],
    references: [users.id],
  }),
  cvGeneration: one(cvGenerationsTable, {
    fields: [stripeTransactionsTable.cvGenerationId],
    references: [cvGenerationsTable.id],
  }),
}));