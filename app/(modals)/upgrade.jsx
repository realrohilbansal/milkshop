// app/(modals)/upgrade.jsx
import { useRouter } from "expo-router";
import React from "react";

import Spacer from "../../components/Spacer";
import ThemedButton from "../../components/ThemedButton";
import ThemedCard from "../../components/ThemedCard";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import { startProPurchase } from "../../services/subscriptions";

export default function UpgradeScreen() {
  const router = useRouter();

  return (
    <ThemedView safe style={{ flex: 1, padding: 20 }}>
      <Spacer height={40} />

      <ThemedText title style={{ fontSize: 32 }}>
        Upgrade to Pro
      </ThemedText>

      <Spacer height={10} />

      <ThemedText style={{ opacity: 0.7 }}>
        Unlock higher limits and grow your business without restrictions.
      </ThemedText>

      <Spacer height={30} />

      {/* FREE PLAN */}
      <ThemedCard style={{ marginBottom: 15 }}>
        <ThemedText style={{ fontWeight: "700", fontSize: 18 }}>
          Free Plan
        </ThemedText>

        <Spacer height={10} />

        <ThemedText>• Up to 3 customers</ThemedText>
        <ThemedText>• Up to 100 orders</ThemedText>
        <ThemedText>• Basic features</ThemedText>
      </ThemedCard>

      {/* PRO PLAN */}
      <ThemedCard>
        <ThemedText style={{ fontWeight: "700", fontSize: 18 }}>
          Pro Plan
        </ThemedText>

        <Spacer height={10} />

        <ThemedText>• Up to 300 customers</ThemedText>
        <ThemedText>• Up to 10,000 orders</ThemedText>
        <ThemedText>• Priority growth</ThemedText>
      </ThemedCard>

      <Spacer height={40} />

      <ThemedButton
        onPress={async () => {
          try {
            await startProPurchase({ userId: getUserId() });
          } catch (err) {
            Alert.alert(
              "Unable to start purchase",
              err?.message || "Please try again"
            );
          }
        }}
      >
        Upgrade to Pro
      </ThemedButton>
      <Spacer />

      <ThemedButton
        variant="secondary"
        onPress={() => router.back()}
      >
        Not now
      </ThemedButton>
    </ThemedView>
  );
}
