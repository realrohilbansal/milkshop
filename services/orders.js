// services/orders.js

import Constants from "expo-constants";
import { Functions, Query } from "react-native-appwrite";
import client, { databases } from "../lib/appwrite";

export const {
  APPWRITE_DATABASE,
  ORDERS_COLLECTION,
  ENTITLEMENTS_FUNCTION_ID,
} = Constants.expoConfig?.extra ?? {};

const functions = new Functions(client);

/**
 * Ensures required runtime config is present.
 */
function assertEnv(name, value) {
  if (!value) {
    console.error("[CONFIG] Missing expo extra", { name });
    throw new Error(`${name} missing in expo extras`);
  }
}

/**
 * Creates an order via entitlements-guard.
 * Server enforces limits and ownership.
 */
export async function createOrder({
  productId,
  productName,
  qty = 1,
  price,
  currentUserId,
  customerId,
  customerName,
}) {
  assertEnv("ENTITLEMENTS_FUNCTION_ID", ENTITLEMENTS_FUNCTION_ID);

  if (!currentUserId) throw new Error("currentUserId required");
  if (!productId) throw new Error("productId required");
  if (!productName) throw new Error("productName required");
  if (!customerId) throw new Error("customerId required");

  const payload = {
    action: "createOrder",
    userId: currentUserId,
    payload: {
      productId,
      productName,
      qty: Number(qty) || 1,
      price: Number(price),
      customerId,
      customerName,
    },
  };

  console.info("[ORDER] Creating order", {
    userId: currentUserId,
    productId,
    customerId,
    qty: payload.payload.qty,
  });

  const res = await functions.createExecution({
    functionId: ENTITLEMENTS_FUNCTION_ID,
    body: JSON.stringify(payload),
  });

  console.debug("[ORDER] Entitlements function response", {
    statusCode: res.responseStatusCode,
  });

  // Function may return non-JSON on crash
  let responseBody;
  try {
    responseBody = JSON.parse(res.responseBody);
  } catch {
    console.error("[ORDER] Invalid function response", {
      rawBody: res.responseBody,
    });
    throw new Error("Invalid server response");
  }

  if (res.responseStatusCode >= 400) {
    console.warn("[ORDER] Order creation rejected", {
      userId: currentUserId,
      error: responseBody?.error,
    });

    throw new Error(responseBody?.error || "Failed");
  }

  console.info("[ORDER] Order created", {
    userId: currentUserId,
    orderId: responseBody?.$id,
  });

  return responseBody;
}

/**
 * Lists orders for a user, optionally filtered by product.
 */
export async function listOrdersForUser({
  currentUserId,
  productId = "other",
  limit = 50,
} = {}) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("ORDERS_COLLECTION", ORDERS_COLLECTION);

  if (!currentUserId) throw new Error("currentUserId required");

  console.debug("[ORDER] Fetching orders", {
    userId: currentUserId,
    productId,
    limit,
  });

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: ORDERS_COLLECTION,
    queries: [
      Query.equal("ownerId", currentUserId),
      Query.equal("productId", productId),
    ],
    limit,
  });

  console.info("[ORDER] Orders fetched", {
    userId: currentUserId,
    count: res.documents?.length ?? 0,
  });

  return res.documents ?? [];
}
