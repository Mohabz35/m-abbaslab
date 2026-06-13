/**
 * Paystack Payment Service
 * Handles payment initialization, verification, and transaction management
 */

import { ENV } from "./_core/env";

const PAYSTACK_API_URL = "https://api.paystack.co";
const CV_PRICE = 50; // 50 kobo = 0.50 KES (or NGN depending on your setup)

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    paid_at: string;
    status: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    metadata: Record<string, any>;
  };
}

/**
 * Initialize a payment transaction with Paystack
 */
export async function initializePayment(
  email: string,
  userId: number,
  cvId: number,
  metadata?: Record<string, any>
): Promise<PaystackInitializeResponse> {
  const reference = `cv_${cvId}_${Date.now()}`;

  const payload = {
    email,
    amount: CV_PRICE * 100, // Paystack expects amount in kobo/cents
    reference,
    metadata: {
      userId,
      cvId,
      ...metadata,
    },
  };

  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Verify a payment transaction with Paystack
 */
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ENV.paystackSecretKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Verify webhook signature from Paystack
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", ENV.paystackSecretKey)
    .update(body)
    .digest("hex");

  return hash === signature;
}

/**
 * Create a customer in Paystack
 */
export async function createCustomer(email: string, firstName: string, lastName: string) {
  const payload = {
    email,
    first_name: firstName,
    last_name: lastName,
  };

  const response = await fetch(`${PAYSTACK_API_URL}/customer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get payment history for a customer
 */
export async function getCustomerTransactions(customerCode: string) {
  const response = await fetch(
    `${PAYSTACK_API_URL}/customer/${customerCode}/transactions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ENV.paystackSecretKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Format amount for display (convert from kobo to currency)
 */
export function formatAmount(amountInKobo: number): string {
  const amount = amountInKobo / 100;
  return `₦${amount.toFixed(2)}`; // Adjust currency symbol as needed
}

/**
 * Get CV pricing information
 */
export function getCVPricing() {
  return {
    firstCVPrice: 0, // Free
    subsequentCVPrice: CV_PRICE / 100, // Convert to currency
    priceInKobo: CV_PRICE,
  };
}
