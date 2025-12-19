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

function assertEnv(name, v) {
  if (!v) throw new Error(`${name} missing in expo extras`);
}

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

  const res = await functions.createExecution({
    functionId: ENTITLEMENTS_FUNCTION_ID,
    body: JSON.stringify({
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
    }),
  });

  if (res.responseStatusCode >= 400) {
    throw new Error(JSON.parse(res.responseBody)?.error || "Failed");
  }

  return JSON.parse(res.responseBody);
}

export async function listOrdersForUser({
  currentUserId,
  productId = "other",
  limit = 50,
} = {}) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("ORDERS_COLLECTION", ORDERS_COLLECTION);

  if (!currentUserId) throw new Error("currentUserId required");

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: ORDERS_COLLECTION,
    queries: [
      Query.equal("ownerId", currentUserId),
      Query.equal("productId", productId),
    ],
    limit,
  });

  return res.documents ?? [];
}
