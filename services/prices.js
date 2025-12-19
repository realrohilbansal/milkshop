// services/prices.js
import Constants from "expo-constants";
import { ID, Query } from "react-native-appwrite";
import { databases } from "../lib/appwrite";

export const { APPWRITE_DATABASE, USER_PRICE_COLLECTION } =
  Constants.expoConfig?.extra ?? {};

function assertEnv(name, v) {
  if (!v) throw new Error(`${name} missing in expo extras`);
}

// ---------------------------------------------------
// Get price for a product for a specific user
// ---------------------------------------------------
export async function getUserProductPrice({ userId, productId }) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("USER_PRICE_COLLECTION", USER_PRICE_COLLECTION);

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: USER_PRICE_COLLECTION,
    queries: [
      Query.equal("ownerId", userId),
      Query.equal("productId", productId)
    ],
    limit: 1
  });

  return res.documents[0] ?? null;
}

// ---------------------------------------------------
// Set or update price for user + product
// ---------------------------------------------------
export async function setUserProductPrice({ userId, productId, price }) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("USER_PRICE_COLLECTION", USER_PRICE_COLLECTION);

  // Check if exists
  const existing = await getUserProductPrice({ userId, productId });

  const data = { ownerId: userId, productId, price: Number(price) };

  if (existing) {
    // Update
    return databases.updateDocument({
      databaseId: APPWRITE_DATABASE,
      collectionId: USER_PRICE_COLLECTION,
      documentId: existing.$id,
      data
    });
  }

  // Create new
  return databases.createDocument({
    databaseId: APPWRITE_DATABASE,
    collectionId: USER_PRICE_COLLECTION,
    documentId: ID.unique(),
    data
  });
}
