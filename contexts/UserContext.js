// contexts/UserContext.js

import Constants from "expo-constants";
import * as InAppPurchases from "expo-in-app-purchases";
import { createContext, useCallback, useEffect, useState } from "react";
import { Functions, ID } from "react-native-appwrite";

import client, { account } from "../lib/appwrite";

export const UserContext = createContext();

const { BOOTSTRAP_USER_FUNCTION_ID } =
  Constants.expoConfig?.extra ?? {};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const functions = new Functions(client);

  /**
   * Fetches the current authenticated user and updates state.
   * Returns null if no active session exists.
   */
  const refreshUser = useCallback(async () => {
    try {
      console.debug("[AUTH] Refreshing user session");

      const current = await account.get();

      console.info("[AUTH] User session restored", {
        userId: current?.$id,
      });

      setUser(current);
      return current;
    } catch {
      console.info("[AUTH] No active session found");
      setUser(null);
      return null;
    }
  }, []);

  // ---------------------------------------------------------
  // App initialization
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      console.info("[APP] Initializing user context");

      await refreshUser();

      setInitializing(false);
      console.info("[APP] User context initialized");
    })();
  }, [refreshUser]);

  // ---------------------------------------------------------
  // 🔔 In-App Purchase listener (GLOBAL, SINGLE INSTANCE)
  // ---------------------------------------------------------
  useEffect(() => {
    console.info("[IAP] Registering purchase listener");

    const subscription = InAppPurchases.setPurchaseListener(
      async ({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              console.info("[IAP] Purchase completed", {
                productId: purchase.productId,
                transactionId: purchase.transactionId,
              });

              /**
               * IMPORTANT:
               * - Do NOT unlock anything here
               * - Backend webhooks will update subscription & entitlements
               * - This only finalizes the store transaction
               */
              await InAppPurchases.finishTransactionAsync(purchase, false);
            }
          }
        } else if (
          responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED
        ) {
          console.info("[IAP] Purchase canceled by user");
        } else {
          console.error("[IAP] Purchase failed", {
            responseCode,
            errorCode,
          });
        }
      }
    );

    return () => {
      console.info("[IAP] Removing purchase listener");
      subscription?.remove?.();
    };
  }, []);

  /**
   * Initiates phone-based authentication by sending OTP.
   * Returns the generated userId required for OTP verification.
   */
  async function sendOtp(phone) {
    try {
      console.info("[AUTH] Sending OTP");

      const token = await account.createPhoneToken({
        userId: ID.unique(),
        phone,
      });

      console.debug("[AUTH] OTP sent", {
        tempUserId: token.userId,
      });

      return token.userId;
    } catch (error) {
      console.error("[AUTH] Failed to send OTP", {
        message: error?.message,
      });
      throw error;
    }
  }

  /**
   * Verifies OTP, creates session, refreshes user,
   * and triggers backend bootstrap asynchronously.
   */
  async function verifyOtp(userId, otp) {
    try {
      console.info("[AUTH] Verifying OTP", { userId });

      await account.createSession({
        userId,
        secret: otp,
      });

      console.info("[AUTH] Session created");

      const current = await refreshUser();

      // Fire-and-forget bootstrap (must never block login)
      if (current?.$id && BOOTSTRAP_USER_FUNCTION_ID) {
        console.info("[BOOTSTRAP] Triggering user bootstrap", {
          userId: current.$id,
        });

        try {
          const execution = await functions.createExecution({
            functionId: BOOTSTRAP_USER_FUNCTION_ID,
            body: JSON.stringify({ userId: current.$id }),
          });

          console.debug("[BOOTSTRAP] Bootstrap execution triggered", {
            executionId: execution?.$id,
          });
        } catch (err) {
          // Explicitly non-fatal by design
          console.warn("[BOOTSTRAP] Bootstrap execution failed", {
            message: err?.message,
          });
        }
      } else {
        console.debug("[BOOTSTRAP] Skipped", {
          reason: !current?.$id ? "no_user" : "function_id_missing",
        });
      }

      return current;
    } catch (error) {
      console.error("[AUTH] OTP verification failed", {
        message: error?.message,
      });
      throw error;
    }
  }

  /**
   * Logs out the current user and clears local state.
   */
  async function logout() {
    try {
      console.info("[AUTH] Logging out");

      await account.deleteSession({ sessionId: "current" });
    } catch (error) {
      console.warn("[AUTH] Logout failed", {
        message: error?.message,
      });
    } finally {
      setUser(null);
      console.info("[AUTH] User state cleared");
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
