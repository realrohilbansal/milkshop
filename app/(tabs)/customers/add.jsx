// app/(tabs)/customers/add.jsx

import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

import Spacer from "../../../components/Spacer";
import ThemedButton from "../../../components/ThemedButton";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedView from "../../../components/ThemedView";

import { useUser } from "../../../hooks/useUser";
import { createCustomer } from "../../../services/customers";

/**
 * Lightweight phone validation.
 * Accepts empty value (optional field).
 */
function isValidPhone(p) {
  if (!p) return true;

  const cleaned = p.replace(/\s+/g, "");

  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }

  const digits = cleaned.replace(/\D/g, "");
  return digits.length === 10;
}

export default function AddCustomer() {
  const router = useRouter();
  const { getUserId } = useUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    const currentUserId = getUserId();

    console.info("[UI][CUSTOMER] Save initiated");

    if (!currentUserId) {
      console.warn("[UI][CUSTOMER] Save blocked: not authenticated");

      Alert.alert(
        "Authentication required",
        "Please sign in before adding customers."
      );
      return;
    }

    if (!name.trim()) {
      console.warn("[UI][CUSTOMER] Validation failed: name missing");

      Alert.alert("Validation", "Customer name is required");
      return;
    }

    if (!isValidPhone(phone.trim())) {
      console.warn("[UI][CUSTOMER] Validation failed: invalid phone", {
        phone,
      });

      Alert.alert(
        "Validation",
        "Phone number looks invalid. Use +<countrycode><number> or 10 digits."
      );
      return;
    }

    setLoading(true);

    console.info("[UI][CUSTOMER] Creating customer", {
      userId: currentUserId,
      name: name.trim(),
    });

    try {
      await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        currentUserId,
      });

      console.info("[UI][CUSTOMER] Customer created successfully", {
        userId: currentUserId,
      });

      Alert.alert("Success", "Customer created");
      router.back();
    } catch (err) {
      console.warn("[UI][CUSTOMER] Save blocked", {
        reason: err?.message,
      });

      if (err?.message === "LIMIT_REACHED") {
        // NOT an error — business constraint
        Alert.alert(
          "Upgrade required",
          "You’ve reached the customer limit for your current plan.\n\nUpgrade to add more customers.",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => {
                router.push("/(modals)/upgrade"); 
                // or wherever you place the upgrade screen
              },
            },
          ]
        );
      } else {
        // Real error
        Alert.alert(
          "Something went wrong",
          err?.message || "Failed to save customer"
        );
      }
    } finally {
      setLoading(false);
      console.debug("[UI][CUSTOMER] Save flow completed");
    }
  }

  return (
    <ThemedView safe style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
      <Spacer height={100} />

      <ThemedTextInput
        placeholder="Customer name"
        value={name}
        onChangeText={setName}
      />

      <Spacer />

      <ThemedTextInput
        placeholder="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Spacer />

      <ThemedButton onPress={save} disabled={loading}>
        {loading ? "Saving..." : "Save Customer"}
      </ThemedButton>

      <ThemedButton variant="secondary" onPress={() => router.back()}>
        Cancel
      </ThemedButton>
    </ThemedView>
  );
}
