// app/(tabs)/customers/index.jsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet } from "react-native";

import Spacer from "../../../components/Spacer";
import ThemedButton from "../../../components/ThemedButton";
import ThemedCard from "../../../components/ThemedCard";
import ThemedRow from "../../../components/ThemedRow";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import { Colors } from "../../../constants/theme";

import { useUser } from "../../../hooks/useUser";
import { listCustomersForUser } from "../../../services/customers";

export default function CustomersList() {
  const { user, getUserId } = useUser();
  const [customers, setCustomers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const colorScheme = Colors.useColorScheme ?? "light";
  const theme = Colors[colorScheme] ?? Colors.light;

  const fetchCustomers = useCallback(async () => {
    const currentUserId = getUserId();
    if (!currentUserId) {
      setCustomers([]);
      setLoadingInitial(false);
      return;
    }
    setRefreshing(true);
    try {
      const docs = await listCustomersForUser({ currentUserId });
      setCustomers(docs);
    } catch (err) {
      console.error("listCustomersForUser error", err);
      Alert.alert("Error", err?.message || "Failed to load customers");
    } finally {
      setRefreshing(false);
      setLoadingInitial(false);
    }
  }, [getUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [fetchCustomers])
  );

  function renderItem({ item }) {
    return (
      <ThemedCard style={styles.card}>
        <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
        {item.phone ? <ThemedText style={styles.cardMeta}>{item.phone}</ThemedText> : null}
      </ThemedCard>
    );
  }

  return (
    <ThemedView safe style={styles.container}>
      <ThemedRow style={styles.headerRow}>
        <ThemedText title={true} style={styles.headerTitle}>
          Customers
        </ThemedText>

        <Link href="/customers/add" asChild>
          <ThemedButton
            size="icon"
            variant="primary"
            style={{ backgroundColor: theme.tint ?? Colors.info }}
            accessibilityLabel="Add Customer"
          >
            <Ionicons name="add" size={20} color="#fff" />
          </ThemedButton>
        </Link>
      </ThemedRow>

      <Spacer />

      <FlatList
        data={customers}
        keyExtractor={(c) => String(c.$id ?? c.id ?? Math.random())}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={fetchCustomers}
        ListEmptyComponent={
          loadingInitial ? (
            <ThemedCard style={{ padding: 18, alignItems: "center" }}>
              <ThemedText>Loading customers…</ThemedText>
            </ThemedCard>
          ) : (
            <ThemedCard style={{ padding: 18, alignItems: "center" }}>
              <ThemedText>No customers yet. Add your first customer.</ThemedText>
            </ThemedCard>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { marginTop: 8, marginBottom: 6 },
  headerTitle: { fontSize: 36, fontWeight: "700" },
  listContent: { paddingTop: 10, paddingBottom: 40 },
  card: { marginBottom: 12 },
  cardTitle: { fontWeight: "700" },
  cardMeta: { marginTop: 6, fontSize: 13, color: "#6b7280" },
});
