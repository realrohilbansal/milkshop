// services/customers.js

import Constants from "expo-constants";
import { Functions, Query } from "react-native-appwrite";
import client, { databases } from "../lib/appwrite";

export const {
  APPWRITE_DATABASE,
  CUSTOMERS_COLLECTION,
  ENTITLEMENTS_FUNCTION_ID,
} = Constants.expoConfig?.extra ?? {};

const functions = new Functions(client);

/**
 * Ensures required runtime config is present.
 * Throws immediately to avoid silent misbehavior.
 */
function assertEnv(name, value) {
  if (!value) {
    console.error("[CONFIG] Missing expo extra", { name });
    throw new Error(`${name} missing in expo extras`);
  }
}

/**
 * Creates a customer via the entitlements-guard function.
 * Enforces limits server-side.
 */
export async function createCustomer({ name, phone, currentUserId }) {
  assertEnv("ENTITLEMENTS_FUNCTION_ID", ENTITLEMENTS_FUNCTION_ID);

  if (!currentUserId) {
    throw new Error("currentUserId required");
  }

  if (!name?.trim()) {
    throw new Error("name required");
  }

  const payload = {
    action: "createCustomer",
    userId: currentUserId,
    payload: {
      name: name.trim(),
      phone: phone ?? "",
    },
  };

  console.info("[CUSTOMER] Creating customer", {
    userId: currentUserId,
    name: payload.payload.name,
  });

  const res = await functions.createExecution({
    functionId: ENTITLEMENTS_FUNCTION_ID,
    body: JSON.stringify(payload),
  });

  console.debug("[CUSTOMER] Entitlements function response", {
    statusCode: res.responseStatusCode,
  });

  // Appwrite Functions may return non-JSON on crash
  let responseBody;
  try {
    responseBody = JSON.parse(res.responseBody);
  } catch {
    console.error("[CUSTOMER] Invalid function response", {
      rawBody: res.responseBody,
    });
    throw new Error("Invalid server response");
  }

  if (res.responseStatusCode >= 400) {
    console.warn("[CUSTOMER] Customer creation rejected", {
      userId: currentUserId,
      error: responseBody?.error,
    });

    throw new Error(responseBody?.error || "Failed");
  }

  console.info("[CUSTOMER] Customer created", {
    userId: currentUserId,
    customerId: responseBody?.$id,
  });

  return responseBody;
}

/**
 * Lists customers owned by the given user.
 */
export async function listCustomersForUser({
  currentUserId,
  limit = 50,
} = {}) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("CUSTOMERS_COLLECTION", CUSTOMERS_COLLECTION);

  if (!currentUserId) {
    throw new Error("currentUserId required");
  }

  console.debug("[CUSTOMER] Fetching customers", {
    userId: currentUserId,
    limit,
  });

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: CUSTOMERS_COLLECTION,
    queries: [Query.equal("ownerId", currentUserId)],
    limit,
  });

  console.info("[CUSTOMER] Customers fetched", {
    userId: currentUserId,
    count: res.documents?.length ?? 0,
  });

  return res.documents ?? [];
}
