// services/subscriptions.js
import {
    endConnection,
    finishTransaction,
    initConnection,
    purchaseErrorListener,
    purchaseUpdatedListener,
    requestSubscription
} from "react-native-iap";

const PRODUCT_ID_PRO = "pro_monthly";

let iapInitialized = false;
let purchaseUpdateSub = null;
let purchaseErrorSub = null;

/**
 * Initialize IAP connection once.
 * Safe to call multiple times.
 */
export async function initSubscriptions({ onPurchase }) {
  if (iapInitialized) return;

  await initConnection();
  iapInitialized = true;

  // Listen for successful purchases
  purchaseUpdateSub = purchaseUpdatedListener(async (purchase) => {
    console.info("[IAP] Purchase update received", {
      productId: purchase.productId,
      transactionId: purchase.transactionId,
    });

    try {
      /**
       * CRITICAL:
       * - Do NOT unlock here
       * - Webhooks will update backend
       */
      await finishTransaction({ purchase, isConsumable: false });

      onPurchase?.(purchase);
    } catch (err) {
      console.error("[IAP] Failed to finalize transaction", {
        message: err?.message,
      });
    }
  });

  // Listen for errors
  purchaseErrorSub = purchaseErrorListener((error) => {
    console.error("[IAP] Purchase error", {
      code: error.code,
      message: error.message,
    });
  });
}

/**
 * Trigger Pro subscription purchase.
 */
export async function startProPurchase({ userId }) {
  if (!userId) {
    throw new Error("userId required for purchase");
  }

  if (!iapInitialized) {
    throw new Error("IAP not initialized");
  }

  await requestSubscription({
    sku: PRODUCT_ID_PRO,
    obfuscatedAccountIdAndroid: userId,
  });
}

/**
 * Cleanup listeners & connection.
 * Call on app exit if needed.
 */
export async function cleanupSubscriptions() {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();

  purchaseUpdateSub = null;
  purchaseErrorSub = null;

  if (iapInitialized) {
    await endConnection();
    iapInitialized = false;
  }
}
