// app/index.js
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

import Spacer from "../components/Spacer";
import ThemedButton from "../components/ThemedButton";
import ThemedText from "../components/ThemedText";
import ThemedView from "../components/ThemedView";

import { useUser } from "../hooks/useUser";

export default function Home() {
  const router = useRouter();
  const { user, initializing, logout } = useUser();

  // if user is signed in, go to profile immediately
  useEffect(() => {
    if (!initializing && user) {
      // replace so Home doesn't remain in history
      router.replace("/profile");
    }
  }, [initializing, user, router]);

  // while we check session
  if (initializing) {
    return (
      <ThemedView safe style={styles.container}>
        <ThemedText title style={styles.title}>
          Milkoo
        </ThemedText>

        <Spacer />

        <ThemedText>Checking authentication…</ThemedText>
      </ThemedView>
    );
  }

  // If user exists but for some reason replace didn't happen, show a small signed-in view
  if (user) {
    return (
      <ThemedView safe style={styles.container}>
        <ThemedText title style={styles.title}>
          Milkoo
        </ThemedText>

        <Spacer />

        <ThemedText>{user.email ?? user.phone ?? "Signed in"}</ThemedText>
        <Spacer />

        <ThemedButton onPress={() => router.replace("/profile")}>Go to profile</ThemedButton>
        <ThemedButton variant="secondary" onPress={async () => { await logout(); router.replace("/"); }}>
          Logout
        </ThemedButton>
      </ThemedView>
    );
  }

  // Not authenticated — show login / signup actions
  return (
    <ThemedView safe style={styles.container}>
      <ThemedText title style={styles.title}>
        Milkoo
      </ThemedText>

      <ThemedText style={styles.subtitle}>Milk Sales Management App</ThemedText>

      <Spacer />

      <Link href="/login" asChild>
        <ThemedButton style={styles.action} /* primary by default */>
          Login
        </ThemedButton>
      </Link>

      <Spacer />

      <ThemedText style={styles.small}>
        If you don't have an account, tap Sign up. We use phone OTP to authenticate.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    // center items vertically but not strictly; keeps UI pleasant on small screens
    justifyContent: "center",
    alignItems: "stretch",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    color: "#6b7280",
  },
  action: {
    marginTop: 12,
  },
  small: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
    color: "#6b7280",
  },
});
