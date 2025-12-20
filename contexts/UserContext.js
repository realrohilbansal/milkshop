// contexts/UserContext.js
import Constants from "expo-constants";
import { createContext, useCallback, useEffect, useState } from "react";
import { Functions, ID } from "react-native-appwrite";

import client, { account } from "../lib/appwrite";
import { initSubscriptions } from "../services/subscriptions";

export const UserContext = createContext();

const { BOOTSTRAP_USER_FUNCTION_ID } =
  Constants.expoConfig?.extra ?? {};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const functions = new Functions(client);

  // ---------------------------------------------------------
  // Restore session
  // ---------------------------------------------------------
  const refreshUser = useCallback(async () => {
    try {
      const current = await account.get();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // ---------------------------------------------------------
  // App init
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      await refreshUser();
      setInitializing(false);
    })();
  }, [refreshUser]);

  // ---------------------------------------------------------
  // 🔔 Initialize IAP ONCE (global)
  // ---------------------------------------------------------
  useEffect(() => {
    console.info("[IAP] Initializing subscriptions");

    initSubscriptions({
      onPurchase: (purchase) => {
        console.info("[IAP] Purchase finalized", {
          productId: purchase.productId,
        });

        /**
         * Do nothing else here.
         * Backend webhook handles entitlements.
         */
      },
    });

    return () => {
      // optional cleanup on app kill
    };
  }, []);

  // ---------------------------------------------------------
  // Auth
  // ---------------------------------------------------------
  async function sendOtp(phone) {
    const token = await account.createPhoneToken({
      userId: ID.unique(),
      phone,
    });
    return token.userId;
  }

  async function verifyOtp(userId, otp) {
    await account.createSession({
      userId,
      secret: otp,
    });

    const current = await refreshUser();

    // Fire-and-forget bootstrap
    if (current?.$id && BOOTSTRAP_USER_FUNCTION_ID) {
      try {
        await functions.createExecution({
          functionId: BOOTSTRAP_USER_FUNCTION_ID,
          body: JSON.stringify({ userId: current.$id }),
        });
      } catch (err) {
        console.warn("[BOOTSTRAP] Failed", err?.message);
      }
    }

    return current;
  }

  async function logout() {
    try {
      await account.deleteSession({ sessionId: "current" });
    } finally {
      setUser(null);
    }
  }

  function getUserId() {
    return user?.$id ?? null;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        initializing,
        sendOtp,
        verifyOtp,
        logout,
        refreshUser,
        getUserId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
