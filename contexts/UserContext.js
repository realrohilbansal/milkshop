import Constants from "expo-constants";
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

  const refreshUser = useCallback(async () => {
    try {
      const current = await account.get();
      setUser(current);
      return current;
    } catch (err) {
      setUser(null);
      return null;
    }
  }, []);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      await refreshUser();
      setInitializing(false);
    })();
  }, [refreshUser]);

  // 1️⃣ Send OTP
  async function sendOtp(phone) {
    try {
      const token = await account.createPhoneToken({
        userId: ID.unique(),
        phone,
      });
      return token.userId;
    } catch (error) {
      console.log("sendOtp error:", error);
      throw error;
    }
  }

  // 2️⃣ Verify OTP + bootstrap user
  async function verifyOtp(userId, otp) {
    try {
      await account.createSession({
        userId,
        secret: otp,
      });

      const current = await refreshUser();

      // 🔒 BOOTSTRAP USER (fire-and-forget)
      if (current?.$id && BOOTSTRAP_USER_FUNCTION_ID) {
        try {
          await functions.createExecution({
            functionId: BOOTSTRAP_USER_FUNCTION_ID,
            body: JSON.stringify({ userId: current.$id }),
          });
        } catch (err) {
          // Never block login on bootstrap failure
          console.warn("bootstrap-user failed:", err?.message);
        }
      }

      return current;
    } catch (error) {
      console.log("verifyOtp error:", error);
      throw error;
    }
  }

  // 3️⃣ Logout
  async function logout() {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch (error) {
      console.log("logout error:", error);
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
