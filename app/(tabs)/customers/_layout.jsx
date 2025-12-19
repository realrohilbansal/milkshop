// app/(tabs)/customers/_layout.jsx
import { Stack } from "expo-router";
import React from "react";

export default function CustomersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: "Add Customer" }} />
    </Stack>
  );
}
