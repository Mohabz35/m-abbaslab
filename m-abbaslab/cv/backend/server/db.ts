import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, cvFormDataTable, cvGenerationsTable, stripeTransactionsTable, CVFormData, InsertCVFormData, CVGeneration, InsertCVGeneration, StripeTransaction, InsertStripeTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// CV Form Data helpers
export async function saveCVFormData(userId: number, data: InsertCVFormData): Promise<CVFormData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(cvFormDataTable)
    .values({ ...data, userId })
    .onDuplicateKeyUpdate({
      set: data,
    });

  // Retrieve the inserted/updated record
  const saved = await db
    .select()
    .from(cvFormDataTable)
    .where(eq(cvFormDataTable.userId, userId))
    .limit(1);

  return saved[0]!;
}

export async function getCVFormData(userId: number): Promise<CVFormData | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(cvFormDataTable)
    .where(eq(cvFormDataTable.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// CV Generation helpers
export async function saveCVGeneration(data: InsertCVGeneration): Promise<CVGeneration> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(cvGenerationsTable).values(data);

  // Retrieve the most recently inserted record for this user
  const saved = await db
    .select()
    .from(cvGenerationsTable)
    .where(eq(cvGenerationsTable.userId, data.userId))
    .orderBy((t) => [t.createdAt])
    .limit(1);

  return saved[0]!;
}

export async function getCVGeneration(id: number): Promise<CVGeneration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(cvGenerationsTable)
    .where(eq(cvGenerationsTable.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserCVGenerations(userId: number): Promise<CVGeneration[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(cvGenerationsTable)
    .where(eq(cvGenerationsTable.userId, userId))
    .orderBy((t) => [t.createdAt]);
}

export async function updateCVGeneration(id: number, updates: Partial<CVGeneration>): Promise<CVGeneration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db
    .update(cvGenerationsTable)
    .set(updates)
    .where(eq(cvGenerationsTable.id, id));

  return getCVGeneration(id);
}

// Stripe Transaction helpers
export async function saveStripeTransaction(data: InsertStripeTransaction): Promise<StripeTransaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(stripeTransactionsTable).values(data);

  // Retrieve by unique stripePaymentIntentId
  const saved = await db
    .select()
    .from(stripeTransactionsTable)
    .where(eq(stripeTransactionsTable.stripePaymentIntentId, data.stripePaymentIntentId))
    .limit(1);

  return saved[0]!;
}

export async function getStripeTransaction(paymentIntentId: string): Promise<StripeTransaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stripeTransactionsTable)
    .where(eq(stripeTransactionsTable.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserStripeTransactions(userId: number): Promise<StripeTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(stripeTransactionsTable)
    .where(eq(stripeTransactionsTable.userId, userId))
    .orderBy((t) => [t.createdAt]);
}

export async function updateStripeTransaction(id: number, updates: Partial<StripeTransaction>): Promise<StripeTransaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db
    .update(stripeTransactionsTable)
    .set(updates)
    .where(eq(stripeTransactionsTable.id, id));

  const result = await db
    .select()
    .from(stripeTransactionsTable)
    .where(eq(stripeTransactionsTable.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
