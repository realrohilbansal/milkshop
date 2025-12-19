// services/products.js
import Constants from "expo-constants";
import { Query } from "react-native-appwrite";
import { databases } from "../lib/appwrite";

export const { APPWRITE_DATABASE, PRODUCTS_COLLECTION } =
  Constants.expoConfig?.extra ?? {};

function assertEnv(name, v) {
  if (!v) throw new Error(`${name} missing in expo extras`);
}

// --------------------------------------------
// Fetch ALL active products
// --------------------------------------------
export async function listAllProducts() {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("PRODUCTS_COLLECTION", PRODUCTS_COLLECTION);

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: PRODUCTS_COLLECTION,
    queries: [Query.equal("isActive", true)],
  });

  return res.documents ?? [];
}

// --------------------------------------------
// Fetch products by category ("milk" | "other")
// --------------------------------------------
export async function listProductsByCategory(category) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("PRODUCTS_COLLECTION", PRODUCTS_COLLECTION);

  if (!category) throw new Error("category required");

  const res = await databases.listDocuments({
    databaseId: APPWRITE_DATABASE,
    collectionId: PRODUCTS_COLLECTION,
    queries: [
      Query.equal("category", category),
      Query.equal("isActive", true),
    ],
  });

  return res.documents ?? [];
}

// --------------------------------------------
// Fetch single product by productId
// --------------------------------------------
export async function getProduct(productId) {
  assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
  assertEnv("PRODUCTS_COLLECTION", PRODUCTS_COLLECTION);

  if (!productId) throw new Error("productId required");

  return databases.getDocument({
    databaseId: APPWRITE_DATABASE,
    collectionId: PRODUCTS_COLLECTION,
    documentId: productId,
  });
}
