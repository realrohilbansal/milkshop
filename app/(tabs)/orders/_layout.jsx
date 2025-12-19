// app/(tabs)/orders/_layout.jsx
import { Stack } from "expo-router";

export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Entry point: Milk Products / Other Products */}
      <Stack.Screen name="index" />

      {/* MILK FLOWS */}
      <Stack.Screen name="milk/index" />
      <Stack.Screen name="milk/[productId]/index" />
      <Stack.Screen name="milk/[productId]/add" />

      {/* OTHER PRODUCTS FLOWS */}
      <Stack.Screen name="products/index" />
      <Stack.Screen name="products/[productId]/index" />
      <Stack.Screen name="products/[productId]/add" />
    </Stack>
  );
}
