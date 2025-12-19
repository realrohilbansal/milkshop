import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

import Spacer from "../../../components/Spacer";
import ThemedButton from "../../../components/ThemedButton";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedView from "../../../components/ThemedView";

import { useUser } from "../../../hooks/useUser";
import { createCustomer } from "../../../services/customers";

function isValidPhone(p) {
  if (!p) return true;
  const cleaned = p.replace(/\s+/g, "");
  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  } else {
    const digits = cleaned.replace(/\D/g, "");
    return digits.length === 10;
  }
}

export default function AddCustomer() {
  const router = useRouter();
  const { getUserId } = useUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    const currentUserId = getUserId();

    if (!currentUserId) {
      Alert.alert(
        "Authentication required",
        "Please sign in before adding customers."
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert("Validation", "Customer name is required");
      return;
    }

    if (!isValidPhone(phone.trim())) {
      Alert.alert(
        "Validation",
        "Phone number looks invalid. Use +<countrycode><number> or 10 digits."
      );
      return;
    }

    setLoading(true);

    try {
      await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        currentUserId,
      });

      Alert.alert("Success", "Customer created");
      router.back();
    } catch (err) {
      console.error("createCustomer error:", err);

      if (err.message === "LIMIT_REACHED") {
        Alert.alert(
          "Limit reached",
          "You’ve reached the maximum number of customers allowed on your current plan. Upgrade to add more."
        );
      } else {
        Alert.alert(
          "Error",
          err?.message || "Failed to save customer"
        );
      }
    } finally {
      setLoading(false);
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
