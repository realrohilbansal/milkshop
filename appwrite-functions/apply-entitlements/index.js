// appwrite-functions/apply-entitlements/index.js
import { Client, Databases, Query } from "node-appwrite";

export const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE,
  ENTITLEMENTS_COLLECTION,
  SUBSCRIPTIONS_COLLECTION,
  SUBSCRIPTION_PLANS_COLLECTION,
} = process.env;

export default async ({ req, res, log }) => {
  const requestStart = Date.now();

  try {
    log("[INIT] Apply entitlements invoked");

    // ---- Validate config early ----
    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT || !APPWRITE_API_KEY) {
      throw new Error("APPWRITE_CONFIG_MISSING");
    }

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    // ---- Parse & validate request ----
    const userId = req.headers["x-appwrite-user-id"];

    log({ stage: "REQUEST", userId });

    if (!userId) {
      throw new Error("userId required");
    }

    // ---- Fetch active subscription ----
    log({ stage: "SUBSCRIPTION_FETCH", userId });

    const subs = await databases.listDocuments(
      APPWRITE_DATABASE,
      SUBSCRIPTIONS_COLLECTION,
      [
        Query.equal("userId", userId),
        Query.equal("status", "active"),
      ]
    );

    if (!subs.documents.length) {
      log({ stage: "NO_ACTIVE_SUBSCRIPTION", userId });
      throw new Error("No active subscription found");
    }

    const subscription = subs.documents[0];

    log({
      stage: "SUBSCRIPTION_RESOLVED",
      userId,
      subscriptionId: subscription.$id,
      planKey: subscription.plan_key,
    });

    // ---- Fetch subscription plan ----
    const plans = await databases.listDocuments(
      APPWRITE_DATABASE,
      SUBSCRIPTION_PLANS_COLLECTION,
      [Query.equal("planName", subscription.plan_key)]
    );

    if (!plans.documents.length) {
      log({
        stage: "PLAN_NOT_FOUND",
        userId,
        planKey: subscription.plan_key,
      });
      throw new Error("Plan not found");
    }

    const plan = plans.documents[0];

    log({
      stage: "APPLY_PLAN",
      userId,
      planKey: plan.key,
      maxCustomers: plan.max_customers,
      maxOrders: plan.max_orders,
    });

    // ---- Apply entitlements ----
    await upsertLimit(
      databases,
      userId,
      "max_customers",
      plan.max_customers,
      plan.key,
      log
    );

    await upsertLimit(
      databases,
      userId,
      "max_orders",
      plan.max_orders,
      plan.key,
      log
    );

    log({
      stage: "SUCCESS",
      userId,
      planKey: plan.key,
      durationMs: Date.now() - requestStart,
    });

    return res.json({ success: true });

  } catch (err) {
    log({
      stage: "ERROR",
      message: err.message,
      stack: err.stack,
      durationMs: Date.now() - requestStart,
    });

    return res.json({ error: err.message }, 400);
  }
};

/**
 * Creates or updates a single entitlement limit for a user.
 * Idempotent by (userId + key).
 */
async function upsertLimit(
  databases,
  userId,
  key,
  limit,
  sourcePlan,
  log
) {
  log({
    stage: "ENTITLEMENT_UPSERT_START",
    userId,
    key,
    limit,
    sourcePlan,
  });

  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    ENTITLEMENTS_COLLECTION,
    [
      Query.equal("userId", userId),
      Query.equal("feature", key),
    ]
  );

  if (existing.documents.length) {
    const entitlementId = existing.documents[0].$id;

    log({
      stage: "ENTITLEMENT_UPDATE",
      userId,
      key,
      entitlementId,
      newLimit: limit,
    });

    await databases.updateDocument(
      APPWRITE_DATABASE,
      ENTITLEMENTS_COLLECTION,
      entitlementId,
      {
        limit,
        source_plan: sourcePlan,
        updated_at: new Date().toISOString(),
      }
    );
  } else {
    log({
      stage: "ENTITLEMENT_CREATE",
      userId,
      key,
      limit,
    });

    await databases.createDocument(
      APPWRITE_DATABASE,
      ENTITLEMENTS_COLLECTION,
      "unique()",
      {
        userId: userId,
        key,
        type: "limit",
        limit,
        source_plan: sourcePlan,
        updated_at: new Date().toISOString(),
      }
    );
  }
}
