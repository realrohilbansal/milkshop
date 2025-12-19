// app/(tabs)/products/[productId]/edit-price.jsx

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import Spacer from "../../../../components/Spacer";
import ThemedButton from "../../../../components/ThemedButton";
import ThemedText from "../../../../components/ThemedText";
import ThemedTextInput from "../../../../components/ThemedTextInput";
import ThemedView from "../../../../components/ThemedView";

import { useUser } from "../../../../hooks/useUser";
import { getUserProductPrice, setUserProductPrice } from "../../../../services/prices";
import { getProduct } from "../../../../services/products";

export default function EditPriceScreen() {
  const { productId } = useLocalSearchParams();
  const { getUserId } = useUser();

  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState("");

  useEffect(() => {
    async function load() {
      const p = await getProduct(productId);
      setProduct(p);

      const existing = await getUserProductPrice({
        userId: getUserId(),
        productId,
      });

      if (existing) setPrice(String(existing.price));
    }

    load();
  }, []);

  async function save() {
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("Validation", "Enter a valid positive price.");
      return;
    }

    await setUserProductPrice({
      userId: getUserId(),
      productId,
      price: n,
    });

    Alert.alert("Success", "Price updated!");
    router.back();
  }

  if (!product) return null;

  return (
    <ThemedView safe style={{ padding: 20 }}>
      <ThemedText title style={{ fontSize: 28 }}>
        Edit Price
      </ThemedText>

      <Spacer />

      <ThemedText style={{ marginBottom: 6 }}>Product</ThemedText>
      <ThemedTextInput value={product.productName} editable={false} />

      <Spacer />

      <ThemedText style={{ marginBottom: 6 }}>Price</ThemedText>
      <ThemedTextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="Enter price"
      />

      <Spacer />

      <ThemedButton variant="primary" onPress={save}>
        Save
      </ThemedButton>

      <ThemedButton variant="secondary" onPress={() => router.back()}>
        Cancel
      </ThemedButton>
    </ThemedView>
  );
}
