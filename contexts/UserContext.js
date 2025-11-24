// contexts/UserContext.js
import { createContext, useEffect, useState } from "react";
import { ID } from "react-native-appwrite";
import { account } from "../lib/appwrite";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Try to restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const current = await account.get();
        setUser(current);
      } catch (err) {
        // no session
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // 1) Send OTP via Appwrite (creates/uses user by phone)
  async function sendOtp(phone) {
    try {
      const token = await account.createPhoneToken({
        userId: ID.unique(),
        phone, // must be in E.164, e.g. +919876543210
      });

      // token.userId is what we need later with the OTP
      return token.userId;
    } catch (error) {
      console.log("sendOtp error:", error);
      throw error;
    }
  }

  // 2) Verify OTP and create session
  async function verifyOtp(userId, otp) {
    try {
      await account.createSession({
        userId,
        secret: otp,
      });

      const current = await account.get();
      setUser(current);
      return current;
    } catch (error) {
      console.log("verifyOtp error:", error);
      throw error;
    }
  }

  // 3) Logout
  async function logout() {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch (error) {
      console.log("logout error:", error);
    } finally {
      setUser(null);
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        initializing,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
