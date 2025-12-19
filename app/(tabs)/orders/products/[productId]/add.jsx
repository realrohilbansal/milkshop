// app/(tabs)/orders/products/[productId]/add.jsx

// IDENTICAL CODE TO MILK VERSION
// Only change the import path relative to folder depth

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";

import Spacer from "../../../../../components/Spacer";
import ThemedButton from "../../../../../components/ThemedButton";
import ThemedCard from "../../../../../components/ThemedCard";
import ThemedModal from "../../../../../components/ThemedModal";
import ThemedText from "../../../../../components/ThemedText";
import ThemedTextInput from "../../../../../components/ThemedTextInput";
import ThemedView from "../../../../../components/ThemedView";

import { useUser } from "../../../../../hooks/useUser";
import { listCustomersForUser } from "../../../../../services/customers";
import { createOrder } from "../../../../../services/orders";
import { getUserProductPrice } from "../../../../../services/prices";
import { getProduct } from "../../../../../services/products";

export default function AddOtherProductOrder() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const { getUserId } = useUser();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [customers, setCustomers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const prod = await getProduct(productId);
      if (isMounted) setProduct(prod);

      const userId = getUserId();
      const entry = await getUserProductPrice({ userId, productId });
      if (isMounted && entry) setPrice(String(entry.price));
    }

    load();

    return () => { 
      isMounted = false; 
    };
  }, [productId]);


  const fetchCustomers = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    setRefreshing(true);

    try {
      const docs = await listCustomersForUser({ currentUserId: userId });
      setCustomers(docs);
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to load customers");
    } finally {
      setRefreshing(false);
    }
  }, [getUserId]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  function pickCustomer(c) {
    setCustomerId(c.$id);
    setCustomerName(c.name);
    setModalVisible(false);
  }

  function validateInputs() {
    if (!customerId) {
      Alert.alert("Validation", "Please choose a customer.");
      return false;
    }

    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("Validation", "Quantity must be a positive number.");
      return false;
    }

    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) {
      Alert.alert("Validation", "Price must be a valid number.");
      return false;
    }

    return true;
  }

  async function save() {
    if (!product) return;
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await createOrder({
        currentUserId: getUserId(),
        productId,
        productName: product.productName,
        qty: Number(qty),
        price: Number(price),
        customerId,
        customerName,
      });

      Alert.alert("Success", "Order saved!");
      router.back();
    } catch (err) {
      console.error("createOrder error:", err);

      if (err.message === "LIMIT_REACHED") {
        Alert.alert(
          "Order limit reached",
          "You’ve reached the maximum number of orders allowed on your current plan. Upgrade to add more."
        );
      } else {
        Alert.alert("Error", err?.message || "Failed to save order");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!product) return null;

  return (
    <ThemedView safe style={{ flex: 1, padding: 20 }}>
      <Spacer height={20} />

      <ThemedText title style={{ fontSize: 30 }}>
        Add {product.productName} Order
      </ThemedText>

      <Spacer height={30} />

      <ThemedText style={{ marginBottom: 6 }}>Customer</ThemedText>
      <ThemedButton
        variant="secondary"
        onPress={() => setModalVisible(true)}
        style={{ alignItems: "flex-start", paddingHorizontal: 15, paddingVertical: 10 }}
      >
        {customerName || "Choose customer"}
      </ThemedButton>

      <Spacer />

      <ThemedText style={{ marginBottom: 6 }}>Product</ThemedText>
      <ThemedTextInput value={product.productName} editable={false} />

      <Spacer />

      <ThemedText style={{ marginBottom: 6 }}>Quantity</ThemedText>
      <ThemedTextInput
        value={qty}
        onChangeText={setQty}
        keyboardType="numeric"
      />

      <Spacer />

      <ThemedText style={{ marginBottom: 6 }}>Price</ThemedText>
      <ThemedTextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Spacer />

      <ThemedButton onPress={save} disabled={loading}>
        {loading ? "Saving..." : "Save Order"}
      </ThemedButton>

      <ThemedButton variant="secondary" onPress={() => router.back()}>
        Cancel
      </ThemedButton>

      <ThemedModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Select Customer">
        <FlatList
          data={customers}
          keyExtractor={(c) => String(c.$id)}
          renderItem={({ item }) => (
            <ThemedCard
              style={{ marginBottom: 10 }}
              onTouchEnd={() => pickCustomer(item)}
            >
              <ThemedText style={{ fontWeight: "700" }}>{item.name}</ThemedText>
              {item.phone ? (
                <ThemedText style={{ fontSize: 12 }}>{item.phone}</ThemedText>
              ) : null}
            </ThemedCard>
          )}
          refreshing={refreshing}
          onRefresh={fetchCustomers}
        />
      </ThemedModal>
    </ThemedView>
  );
}
