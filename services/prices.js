// services/prices.js

import Constants from "expo-constants";
import { ID, Query } from "react-native-appwrite";
import { databases } from "../lib/appwrite";

export const { APPWRITE_DATABASE, USER_PRICE_COLLECTION } =
  Constants.expoConfig?.extra ?? {};

/**
 * Ensures required runtime config is present.
 */
function assertEnv(name, value) {
  if (!value) {
    console.error("[CONFIG] Missing expo extra", { name });
    throw new Error(`${name} missing in expo extras`);
  }
}

// ---------------------------------------------------
// Get price for a product for a specific user
// ---------------------------------------------------
export async function getUserProductPrice({ userId, productId }) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("USER_PRICE_COLLECTION", USER_PRICE_COLLECTION);

  if (!userId) throw new Error("userId required");
  if (!productId) throw new Error("productId required");

  console.debug("[PRICE] Resolving user product price", {
    userId,
    productId,
  });

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: USER_PRICE_COLLECTION,
    queries: [
      Query.equal("ownerId", userId),
      Query.equal("productId", productId),
    ],
    limit: 1,
  });

  const priceDoc = res.documents[0] ?? null;

  if (priceDoc) {
    console.info("[PRICE] Price found", {
      userId,
      productId,
      price: priceDoc.price,
    });
  } else {
    console.info("[PRICE] No custom price found", {
      userId,
      productId,
    });
  }

  return priceDoc;
}

// ---------------------------------------------------
// Set or update price for user + product
// ---------------------------------------------------
export async function setUserProductPrice({ userId, productId, price }) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("USER_PRICE_COLLECTION", USER_PRICE_COLLECTION);

  if (!userId) throw new Error("userId required");
  if (!productId) throw new Error("productId required");

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    throw new Error("price must be a number");
  }

  console.info("[PRICE] Setting user product price", {
    userId,
    productId,
    price: numericPrice,
  });

  // Check if a price already exists (read-before-write)
  const existing = await getUserProductPrice({ userId, productId });

  const data = {
    ownerId: userId,
    productId,
    price: numericPrice,
  };

  if (existing) {
    console.info("[PRICE] Updating existing price", {
      userId,
      productId,
      previousPrice: existing.price,
      newPrice: numericPrice,
    });

    return databases.updateDocument({
      databaseId: APPWRITE_DATABASE,
      collectionId: USER_PRICE_COLLECTION,
      documentId: existing.$id,
      data,
    });
  }

  console.info("[PRICE] Creating new price entry", {
    userId,
    productId,
    price: numericPrice,
  });

  return databases.createDocument({
    databaseId: APPWRITE_DATABASE,
    collectionId: USER_PRICE_COLLECTION,
    documentId: ID.unique(),
    data,
  });
}
