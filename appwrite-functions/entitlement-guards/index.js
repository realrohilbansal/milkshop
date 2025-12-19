import { Client, Databases, ID, Query } from "node-appwrite";

export const { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY,
    APPWRITE_DATABASE, CUSTOMERS_COLLECTION,
    ORDERS_COLLECTION, ENTITLEMENTS_COLLECTION
 } = Constants.expoConfig?.extra ?? {};

export default async ({ req, res, log }) => {
  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    const body = JSON.parse(req.body || "{}");
    const { action, userId, payload } = body;

    if (!userId) throw new Error("userId required");

    if (action === "createCustomer") {
      await enforceLimit({
        databases,
        userId,
        entitlementKey: "max_customers",
        targetCollection: CUSTOMERS_COLLECTION,
      });

      const doc = await databases.createDocument(
        APPWRITE_DATABASE,
        CUSTOMERS_COLLECTION,
        ID.unique(),
        {
          name: payload.name,
          phone: payload.phone ?? "",
          ownerId: userId,
        },
        [`user:${userId}`],
        [`user:${userId}`]
      );

      return res.json(doc);
    }

    if (action === "createOrder") {
      await enforceLimit({
        databases,
        userId,
        entitlementKey: "max_orders",
        targetCollection: ORDERS_COLLECTION,
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
        [`user:${userId}`],
        [`user:${userId}`]
      );

      return res.json(doc);
    }

    throw new Error("Invalid action");
  } catch (err) {
    log(err.message);
    return res.json(
      { error: err.message },
      err.message === "LIMIT_REACHED" ? 403 : 400
    );
  }
};

async function enforceLimit({
  databases,
  userId,
  entitlementKey,
  targetCollection,
}) {
  // 1️⃣ Fetch entitlement
  const ent = await databases.listDocuments(
    APPWRITE_DATABASE,
    ENTITLEMENTS_COLLECTION,
    [
      Query.equal("user_id", userId),
      Query.equal("key", entitlementKey),
    ]
  );

  if (!ent.documents.length) {
    throw new Error("Entitlement missing");
  }

  const limit = ent.documents[0].limit;

  // 2️⃣ Count existing docs
  const existing = await databases.listDocuments(
    APPWRITE_DATABASE,
    targetCollection,
    [Query.equal("ownerId", userId)],
    1
  );

  if (existing.total >= limit) {
    throw new Error("LIMIT_REACHED");
  }
}
