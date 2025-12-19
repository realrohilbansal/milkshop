import { Client, Databases, Functions, Query } from "node-appwrite";

export const { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY,
    APPWRITE_DATABASE, CUSTOMERS_COLLECTION,
    ORDERS_COLLECTION, ENTITLEMENTS_COLLECTION,
    SUBSCRIPTIONS_COLLECTION, SUBSCRIPTION_PLANS_COLLECTION,
    APPLY_ENTITLEMENTS_FUNCTION_ID
 } = Constants.expoConfig?.extra ?? {};

export default async ({ req, res, log }) => {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const functions = new Functions(client);

    const { userId } = JSON.parse(req.body || "{}");
    if (!userId) throw new Error("userId required");

    // 1️⃣ Check if subscription already exists
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      SUBSCRIPTIONS_COLLECTION,
      [Query.equal("user_id", userId)]
    );

    if (existing.documents.length > 0) {
      // Already bootstrapped → safe exit
      return res.json({ status: "already_initialized" });
    }

    // 2️⃣ Create FREE subscription
    await databases.createDocument(
      APPWRITE_DATABASE,
      SUBSCRIPTIONS_COLLECTION,
      "unique()",
      {
        user_id: userId,
        plan_key: "free",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    // 3️⃣ Apply entitlements
    await functions.createExecution(
      APPLY_ENTITLEMENTS_FUNCTION_ID,
      JSON.stringify({ userId }),
      false
    );

    return res.json({ status: "initialized" });
  } catch (err) {
    log(err.message);
    return res.json({ error: err.message }, 400);
  }
};
