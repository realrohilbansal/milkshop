// app/(tabs)/products/index.jsx

import { Link } from "expo-router";
import { useEffect, useState } from "react";

import Spacer from "../../../components/Spacer";
import ThemedCard from "../../../components/ThemedCard";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";

import { useUser } from "../../../hooks/useUser";
import { getUserProductPrice } from "../../../services/prices";
import { listAllProducts } from "../../../services/products";

export default function ProductsIndex() {
  const { getUserId } = useUser();
  const userId = getUserId();

  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState({}); // productId → price

  useEffect(() => {
    async function load() {
      const items = await listAllProducts();
      setProducts(items);

      const priceMap = {};

      for (const p of items) {
        const entry = await getUserProductPrice({ userId, productId: p.$id });
        priceMap[p.$id] = entry?.price ?? null;
      }

      setPrices(priceMap);
    }

    load();
  }, []);

  return (
    <ThemedView safe style={{ flex: 1, padding: 20 }}>
      <ThemedText title style={{ fontSize: 32, fontWeight: "700" }}>
        Products
      </ThemedText>

      <Spacer size={20} />

      {products.map((p) => (
        <Link key={p.$id} href={`/products/${p.$id}/edit-price`} asChild>
          <ThemedCard pressable style={{ padding: 16, marginBottom: 12 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
              {p.productName}
            </ThemedText>

            <ThemedText style={{ marginTop: 4, fontSize: 14 }}>
              Price: {prices[p.$id] != null ? `₹${prices[p.$id]}` : "Not set"}
            </ThemedText>
          </ThemedCard>
        </Link>
      ))}
    </ThemedView>
  );
}
