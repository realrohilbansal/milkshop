// appwrite-functions/entitlements-guard/index.js
import {
  Client,
  Databases,
  ID,
  Permission,
  Query,
  Role
} from "node-appwrite";

/**
 * NOTE:
 * Using expo-constants inside a server function is risky.
 * Prefer process.env in the future to avoid silent misconfiguration.
 */
export const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE,
  CUSTOMERS_COLLECTION,
  ORDERS_COLLECTION,
  ENTITLEMENTS_COLLECTION,
} = process.env;

export default async ({ req, res, log }) => {
  const requestStart = Date.now();

  try {
    log("[INIT] Entitlements guard invoked");

    // ---- Validate critical config early (fail fast) ----
    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT || !APPWRITE_API_KEY) {
      throw new Error("APPWRITE_CONFIG_MISSING");
    }

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    // ---- Parse & validate request ----
    const body = JSON.parse(req.body || "{}");
    const { action, userId, payload } = body;

    log({ stage: "REQUEST", action, userId });

    if (!userId) {
      throw new Error("userId required");
    }

    // ---- Action routing ----
    if (action === "createCustomer") {
      log({ stage: "ACTION_START", action, userId });

      await enforceLimit({
        databases,
        userId,
        entitlementKey: "max_customers",
        targetCollection: CUSTOMERS_COLLECTION,
        log,
      });

      const doc = await databases.createDocument(
        APPWRITE_DATABASE,
        CUSTOMERS_COLLECTION,
        ID.unique(),
        {
          name: payload?.name,
          phone: payload?.phone ?? "",
          ownerId: userId,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
        ],
        [`user:${userId}`]
      );

      log({
        stage: "ACTION_SUCCESS",
        action,
        userId,
        documentId: doc.$id,
        durationMs: Date.now() - requestStart,
      });

      return res.json(doc);
    }

    if (action === "createOrder") {
      log({ stage: "ACTION_START", action, userId });

      await enforceLimit({
        databases,
        userId,
        entitlementKey: "max_orders",
        targetCollection: ORDERS_COLLECTION,
        log,
      });

      const doc = await databases.createDocument(
        APPWRITE_DATABASE,
        ORDERS_COLLECTION,
        ID.unique(),
        {
          ...payload,
          ownerId: userId,
          date: new Date().toISOString(),
        },
        [
          Permission.read(Role.user(userId)),
          Permission.write(Role.user(userId)),
        ],
        [`user:${userId}`]
      );

      log({
        stage: "ACTION_SUCCESS",
        action,
        userId,
        documentId: doc.$id,
        durationMs: Date.now() - requestStart,
      });

      return res.json(doc);
    }

    // ---- Unknown action ----
    log({ stage: "INVALID_ACTION", action, userId });
    throw new Error("Invalid action");

  } catch (err) {
    // Centralized error boundary with context
    log({
      stage: "ERROR",
      message: err.message,
      stack: err.stack,
      durationMs: Date.now() - requestStart,
    });

    return res.json(
      { error: err.message },
      err.message === "LIMIT_REACHED" ? 403 : 400
    );
  }
};

/**
 * Enforces entitlement-based limits for a given user & collection.
 * Throws:
 * - Entitlement missing
 * - LIMIT_REACHED
 */
async function enforceLimit({
  databases,
  userId,
  entitlementKey,
  targetCollection,
  log,
}) {
 log({
    stage: "ENTITLEMENT_CHECK",
    userId,
    entitlementKey,
    targetCollection,
  });

  // ---- Fetch entitlement definition ----
  const ent = await databases.listDocuments(
    APPWRITE_DATABASE,
    ENTITLEMENTS_COLLECTION,
    [
      Query.equal("userId", userId),
      Query.equal("feature", entitlementKey),
    ]
  );

  if (!ent.documents.length) {
    log({ stage: "ENTITLEMENT_MISSING", userId, entitlementKey });
    throw new Error("Entitlement missing");
  }

  const limit = ent.documents[0].limit;

  // ---- Count existing resources ----
  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    targetCollection,
    [Query.equal("ownerId", userId)],
    1 // limit=1 since we only care about total
  );

  log({
    stage: "ENTITLEMENT_USAGE",
    userId,
    entitlementKey,
    used: existing.total,
    limit,
  });

  if (existing.total >= limit) {
    log({ stage: "LIMIT_REACHED", userId, entitlementKey });
    throw new Error("LIMIT_REACHED");
  }
}
