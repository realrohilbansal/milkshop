import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Query } from "react-native-appwrite";

import { databases } from "../lib/appwrite";
import { useUser } from "./useUser";

const {
  APPWRITE_DATABASE,
  ENTITLEMENTS_COLLECTION,
} = Constants.expoConfig?.extra ?? {};

function assertEnv(name, v) {
  if (!v) throw new Error(`${name} missing in expo extras`);
}

export function useEntitlements() {
  const { getUserId } = useUser();

  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEntitlements = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setEntitlements(null);
      setLoading(false);
      return;
    }

    assertEnv("APPWRITE_DATABASE", APPWRITE_DATABASE);
    assertEnv("ENTITLEMENTS_COLLECTION", ENTITLEMENTS_COLLECTION);

    try {
      const res = await databases.listDocuments({
        databaseId: APPWRITE_DATABASE,
        collectionId: ENTITLEMENTS_COLLECTION,
        queries: [Query.equal("userId", userId)],
      });

      // Convert array → map for easy access
      const map = {};
      for (const doc of res.documents ?? []) {
        map[doc.key] = doc;
      }

      setEntitlements(map);
    } catch (err) {
      console.warn("[useEntitlements] fetch failed", err);
      setEntitlements(null);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  // -------- Derived helpers --------

  const maxCustomers = entitlements?.max_customers?.limit ?? 0;
  const maxOrders = entitlements?.max_orders?.limit ?? 0;

  const isPro =
    maxCustomers > 3 || maxOrders > 100;

  return {
    entitlements,
    loading,
    isPro,
    maxCustomers,
    maxOrders,
    refreshEntitlements: fetchEntitlements,
  };
}
