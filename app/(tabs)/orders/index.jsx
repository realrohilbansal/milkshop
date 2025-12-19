// app/(tabs)/orders/index.jsx
import { Link } from "expo-router";
import Spacer from "../../../components/Spacer";
import ThemedButton from "../../../components/ThemedButton";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";

export default function OrdersHome() {
  return (
    <ThemedView safe style={{ flex: 1, padding: 20 }}>
      <ThemedText title style={{ fontSize: 36, fontWeight: "700" }}>
        Orders
      </ThemedText>

      <Spacer size={32} />

      <Link href="/orders/milk" asChild>
        <ThemedButton style={{ flex:1 }} variant="secondary">Milk Products</ThemedButton>
      </Link>

      <Spacer size={16} />

      <Link href="/orders/products" asChild>
        <ThemedButton style={{ flex:1 }} variant="secondary">Other Products</ThemedButton>
      </Link>
    </ThemedView>
  );
}
