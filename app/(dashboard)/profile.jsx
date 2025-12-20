import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import { useEntitlements } from "../../hooks/useEntitlements";
import { useUser } from "../../hooks/useUser";

import Spacer from "../../components/Spacer";
import ThemedButton from "../../components/ThemedButton";
import ThemedCard from "../../components/ThemedCard";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUser();
  const { isPro, loading: entitlementsLoading } = useEntitlements();

  if (!user) {
    return (
      <ThemedView safe style={styles.centered}>
        <ThemedText title style={styles.title}>Profile</ThemedText>
        <Spacer />
        <ThemedText>You are not signed in.</ThemedText>
      </ThemedView>
    );
  }

  const displayName =
    user.name ||
    user.phone ||
    user.email ||
    "User";

  return (
    <ThemedView safe style={styles.container}>
      <ThemedText title style={styles.title}>Your Profile</ThemedText>
      <Spacer size="lg" />

      {/* USER CARD */}
      <ThemedCard style={styles.card}>
        <ThemedText title style={styles.name}>{displayName}</ThemedText>
        {user.phone ? (
          <ThemedText style={styles.sub}>{user.phone}</ThemedText>
        ) : null}
        {user.email ? (
          <ThemedText style={styles.sub}>{user.email}</ThemedText>
        ) : null}
      </ThemedCard>

      <Spacer size="lg" />

      {/* DETAILS CARD */}
      <ThemedCard style={styles.card}>
        <ThemedText style={styles.label}>User ID</ThemedText>
        <ThemedText style={styles.value}>{user.$id}</ThemedText>

        <Spacer />

        <ThemedText style={styles.label}>Created At</ThemedText>
        <ThemedText style={styles.value}>
          {new Date(user.$createdAt).toLocaleDateString()}
        </ThemedText>
      </ThemedCard>

      <Spacer size="lg" />

      {/* UPGRADE (FREE USERS ONLY) */}
      {!entitlementsLoading && !isPro && (
        <>
          <ThemedCard style={styles.card}>
            <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
              Free Plan
            </ThemedText>

            <Spacer />

            <ThemedText>
              You’re currently on the Free plan with limited capacity.
            </ThemedText>

            <Spacer />

            <ThemedButton
              onPress={() => router.push("/upgrade")}
            >
              Upgrade to Pro
            </ThemedButton>
          </ThemedCard>

          <Spacer size="lg" />
        </>
      )}

      <ThemedButton onPress={logout} style={styles.logout}>
        Logout
      </ThemedButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "left",
  },
  card: {
    padding: 18,
    borderRadius: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  sub: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  label: {
    fontSize: 13,
    opacity: 0.7,
  },
  value: {
    fontSize: 15,
    marginTop: 4,
  },
  logout: {
    marginTop: 10,
  },
});
