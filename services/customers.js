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

function assertEnv(name, v) {
  if (!v) throw new Error(`${name} missing in expo extras`);
}

export async function createCustomer({ name, phone, currentUserId }) {
  assertEnv("ENTITLEMENTS_FUNCTION_ID", ENTITLEMENTS_FUNCTION_ID);

  if (!currentUserId) throw new Error("currentUserId required");
  if (!name?.trim()) throw new Error("name required");

  const res = await functions.createExecution({
    functionId: ENTITLEMENTS_FUNCTION_ID,
    body: JSON.stringify({
      action: "createCustomer",
      userId: currentUserId,
      payload: { name: name.trim(), phone: phone ?? "" },
    }),
  });

  if (res.responseStatusCode >= 400) {
    throw new Error(JSON.parse(res.responseBody)?.error || "Failed");
  }

  return JSON.parse(res.responseBody);
}

export async function listCustomersForUser({ currentUserId, limit = 50 } = {}) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("CUSTOMERS_COLLECTION", CUSTOMERS_COLLECTION);

  if (!currentUserId) throw new Error("currentUserId required");

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: CUSTOMERS_COLLECTION,
    queries: [Query.equal("ownerId", currentUserId)],
    limit,
  });

  return res.documents ?? [];
}
