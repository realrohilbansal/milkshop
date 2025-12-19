// app/(tabs)/orders/products/index.jsx
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import Spacer from "../../../../components/Spacer";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedText from "../../../../components/ThemedText";
import ThemedView from "../../../../components/ThemedView";

import { listProductsByCategory } from "../../../../services/products";

export default function OtherProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    listProductsByCategory("other")
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <ThemedView safe style={{ flex: 1, padding: 20 }}>
      <ThemedText title style={{ fontSize: 28, fontWeight: "700" }}>
        Other Products
      </ThemedText>

      <Spacer />

      {products.map((p) => (
        <Link key={p.$id} href={`/orders/products/${p.$id}`} asChild>
          <ThemedCard pressable style={{ padding: 16, marginBottom: 12 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
              {p.productName}
            </ThemedText>
          </ThemedCard>
        </Link>
      ))}
    </ThemedView>
  );
}
