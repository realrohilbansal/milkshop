import { Client, Databases, Query } from "node-appwrite";

export const { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY,
    APPWRITE_DATABASE, CUSTOMERS_COLLECTION,
    ORDERS_COLLECTION, ENTITLEMENTS_COLLECTION,
    SUBSCRIPTIONS_COLLECTION, SUBSCRIPTION_PLANS_COLLECTION
 } = Constants.expoConfig?.extra ?? {};

export default async ({ req, res, log }) => {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    const { userId } = JSON.parse(req.body || "{}");
    if (!userId) throw new Error("userId required");

    // 1️⃣ Fetch active subscription
    const subs = await databases.listDocuments(
      APPWRITE_DATABASE,
      SUBSCRIPTIONS_COLLECTION,
      [
        Query.equal("user_id", userId),
        Query.equal("status", "active"),
      ]
    );

    if (!subs.documents.length) {
      throw new Error("No active subscription found");
    }

    const subscription = subs.documents[0];

    // 2️⃣ Fetch plan
    const plans = await databases.listDocuments(
      APPWRITE_DATABASE,
      SUBSCRIPTION_PLANS_COLLECTION,
      [Query.equal("key", subscription.plan_key)]
    );

    if (!plans.documents.length) {
      throw new Error("Plan not found");
    }

    const plan = plans.documents[0];

    // 3️⃣ Upsert entitlements
    await upsertLimit(databases, userId, "max_customers", plan.max_customers, plan.key);
    await upsertLimit(databases, userId, "max_orders", plan.max_orders, plan.key);

    return res.json({ success: true });
  } catch (err) {
    log(err.message);
    return res.json({ error: err.message }, 400);
  }
};

async function upsertLimit(databases, userId, key, limit, sourcePlan) {
  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    ENTITLEMENTS_COLLECTION,
    [
      Query.equal("user_id", userId),
      Query.equal("key", key),
    ]
  );

  if (existing.documents.length) {
    await databases.updateDocument(
      APPWRITE_DATABASE,
      ENTITLEMENTS_COLLECTION,
      existing.documents[0].$id,
      {
        limit,
        source_plan: sourcePlan,
        updated_at: new Date().toISOString(),
      }
    );
  } else {
    await databases.createDocument(
      APPWRITE_DATABASE,
      ENTITLEMENTS_COLLECTION,
      "unique()",
      {
        user_id: userId,
        key,
        type: "limit",
        limit,
        source_plan: sourcePlan,
        updated_at: new Date().toISOString(),
      }
    );
  }
}
