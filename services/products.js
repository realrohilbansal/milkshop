// services/products.js

import Constants from "expo-constants";
import { Query } from "react-native-appwrite";
import { databases } from "../lib/appwrite";

export const { APPWRITE_DATABASE, PRODUCTS_COLLECTION } =
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

// --------------------------------------------
// Fetch ALL active products
// --------------------------------------------
export async function listAllProducts() {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("PRODUCTS_COLLECTION", PRODUCTS_COLLECTION);

  console.debug("[PRODUCT] Fetching all active products");

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: PRODUCTS_COLLECTION,
    queries: [Query.equal("isActive", true)],
  });

  console.info("[PRODUCT] Active products fetched", {
    count: res.documents?.length ?? 0,
  });

  return res.documents ?? [];
}

// --------------------------------------------
// Fetch products by category ("milk" | "other")
// --------------------------------------------
export async function listProductsByCategory(category) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("PRODUCTS_COLLECTION", PRODUCTS_COLLECTION);

  if (!category) {
    throw new Error("category required");
  }

  console.debug("[PRODUCT] Fetching products by category", {
    category,
  });

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: PRODUCTS_COLLECTION,
    queries: [
      Query.equal("category", category),
      Query.equal("isActive", true),
    ],
  });

  console.info("[PRODUCT] Category products fetched", {
    category,
    count: res.documents?.length ?? 0,
  });

  return res.documents ?? [];
}

// --------------------------------------------
// Fetch single product by productId
// --------------------------------------------
export async function getProduct(productId) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("PRODUCTS_COLLECTION", PRODUCTS_COLLECTION);

  if (!productId) {
    throw new Error("productId required");
  }

  console.debug("[PRODUCT] Fetching product", { productId });

  const product = await databases.getDocument({
    databaseId: APPWRITE_DATABASE,
    collectionId: PRODUCTS_COLLECTION,
    documentId: productId,
  });

  console.info("[PRODUCT] Product fetched", {
    productId,
    isActive: product?.isActive,
    category: product?.category,
  });

  return product;
}
