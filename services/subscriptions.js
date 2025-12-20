// services/subscriptions.js
import * as InAppPurchases from "expo-in-app-purchases";

const PRODUCT_ID_PRO = "pro_monthly";

let connected = false;

export async function initSubscriptions() {
  if (connected) return;

  await InAppPurchases.connectAsync();
  connected = true;
}

export async function startProPurchase({ userId }) {
  if (!userId) {
    throw new Error("userId required for purchase");
  }

  await initSubscriptions();

  await InAppPurchases.purchaseItemAsync(PRODUCT_ID_PRO, {
    obfuscatedAccountId: userId,
  });
}

export async function cleanupSubscriptions() {
  if (!connected) return;

  await InAppPurchases.disconnectAsync();
  connected = false;
}
