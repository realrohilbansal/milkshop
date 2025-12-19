import { Link } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
import Spacer from "../../components/Spacer";
import ThemedButton from "../../components/ThemedButton";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import { Colors } from "../../constants/theme";

import { t } from "../../i18n";
import { getEnglishLabel } from "../../i18n/helpers";

const H_GUTTER = 20;

export default function DashboardIndex() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <ThemedView safe style={[styles.container]}>

      {/* HEADER */}
      <ThemedView style={styles.headerRow}>
        <ThemedView style={styles.headerLeft}>
          <Spacer />
          <ThemedText title style={styles.header}>
            {t("dashboard.title")}
          </ThemedText>
          <ThemedText style={styles.headerSub}>
            {t("dashboard.subtitle")}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <Spacer size={12} />

      {/* GRID */}
      <ThemedView style={styles.grid}>

        {/* ORDERS */}
        <Link href="/orders" asChild>
          <ThemedButton
            size="tile"
            variant="secondary"
            accessibilityLabel={t("dashboard.orders")}
          >
            <TileLabel labelKey="dashboard.orders" />
          </ThemedButton>
        </Link>

        {/* CUSTOMERS */}
        <Link href="/customers" asChild>
          <ThemedButton
            size="tile"
            variant="secondary"
            accessibilityLabel={t("dashboard.customers")}
          >
            <TileLabel labelKey="dashboard.customers" />
          </ThemedButton>
        </Link>

        {/* PRODUCTS */}
        <Link href="/products" asChild>
          <ThemedButton
            size="tile"
            variant="secondary"
            accessibilityLabel={t("dashboard.products")}
          >
            <TileLabel labelKey="dashboard.products" />
          </ThemedButton>
        </Link>

        {/* BUY FROM US */}
        <Link href="/buyfromus" asChild>
          <ThemedButton
            size="tile"
            variant="secondary"
            accessibilityLabel={t("dashboard.buyfromus")}
          >
            <TileLabel labelKey="dashboard.buyfromus" />
          </ThemedButton>
        </Link>

      </ThemedView>

      <Spacer />
    </ThemedView>
  );
}

/* -------------------------- */
/*     BILINGUAL TILE LABEL   */
/* -------------------------- */

function TileLabel({ labelKey }) {
  const primary = t(labelKey);
  const english = getEnglishLabel(labelKey);

  const showEnglish = english && english !== primary;

  return (
    <>
      <ThemedText style={styles.tilePrimary}>{primary}</ThemedText>
      {showEnglish && (
        <ThemedText style={styles.tileSecondary}>{english}</ThemedText>
      )}
    </>
  );
}

/* -------------------------- */
/*           STYLES           */
/* -------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: H_GUTTER,
    paddingTop: 18,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  header: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },

  grid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  tilePrimary: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  tileSecondary: {
    marginTop: 2,
    fontSize: 13,
    opacity: 0.7,
    textAlign: "center",
  },
});
