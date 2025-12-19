// app/(tabs)/orders/products/[productId]/index.jsx
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import Spacer from "../../../../../components/Spacer";
import ThemedButton from "../../../../../components/ThemedButton";
import ThemedCard from "../../../../../components/ThemedCard";
import ThemedText from "../../../../../components/ThemedText";
import ThemedView from "../../../../../components/ThemedView";

import { useUser } from "../../../../../hooks/useUser";
import { listOrdersForUser } from "../../../../../services/orders";
import { getProduct } from "../../../../../services/products";

export default function ProductOrdersList() {
  const { productId } = useLocalSearchParams();
  const { getUserId } = useUser();

  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getProduct(productId).then(setProduct);
  }, [productId]);

  useEffect(() => {
    const userId = getUserId();
    listOrdersForUser({ currentUserId: userId, productId })
      .then(setOrders)
      .catch(console.error);
  }, [productId]);

  if (!product) return null;

  return (
    <ThemedView safe style={{ flex: 1, padding: 20 }}>
      <ThemedText title style={{ fontSize: 28, fontWeight: "700" }}>
        {product.productName} Orders
      </ThemedText>

      <Spacer />

      <Link href={`/orders/products/${productId}/add`} asChild>
        <ThemedButton variant="primary">Add Order</ThemedButton>
      </Link>

      <Spacer size={20} />

      {orders.map((o) => (
        <ThemedCard key={o.$id} style={{ padding: 16, marginBottom: 12 }}>
          <ThemedText style={{ fontWeight: "600" }}>
            Qty: {o.qty}
          </ThemedText>
          <ThemedText>Customer: {o.customerName}</ThemedText>
          <ThemedText>Price: ₹{o.price}</ThemedText>
        </ThemedCard>
      ))}
    </ThemedView>
  );
}
