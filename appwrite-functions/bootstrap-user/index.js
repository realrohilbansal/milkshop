// appwrite-functions/bootstrap-user/index.js
import { Client, Databases, Functions, Query } from "node-appwrite";

export const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE,
  SUBSCRIPTIONS_COLLECTION,
  APPLY_ENTITLEMENTS_FUNCTION_ID,
} = process.env;

export default async ({ req, res, log }) => {
  const requestStart = Date.now();

  try {
    log("[INIT] User bootstrap invoked");

    // ---- Validate config ----
    if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT || !APPWRITE_API_KEY) {
      throw new Error("APPWRITE_CONFIG_MISSING");
    }

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const functions = new Functions(client);

    // ---- Parse & validate request ----
    const userId = req.headers["x-appwrite-user-id"];

    log({ stage: "REQUEST", userId });

    if (!userId) {
      throw new Error("userId required");
    }

    // ---- Check if user already bootstrapped ----
    log({ stage: "CHECK_EXISTING_SUBSCRIPTION", userId });

    const existing = await databases.listDocuments(
      APPWRITE_DATABASE,
      SUBSCRIPTIONS_COLLECTION,
      [Query.equal("userId", userId)]
    );

    if (existing.documents.length > 0) {
      log({
        stage: "ALREADY_INITIALIZED",
        userId,
        subscriptionCount: existing.documents.length,
        durationMs: Date.now() - requestStart,
      });

      // Idempotent-safe early exit
      return res.json({ status: "already_initialized" });
    }

    // ---- Create FREE subscription ----
    log({ stage: "CREATE_FREE_SUBSCRIPTION", userId });

    const subscription = await databases.createDocument(
      APPWRITE_DATABASE,
      SUBSCRIPTIONS_COLLECTION,
      "unique()",
      {
        userId: userId,
        planName: "free",
        status: "active",
      }
    );

    log({
      stage: "SUBSCRIPTION_CREATED",
      userId,
      subscriptionId: subscription.$id,
      planName: "free",
    });

    // ---- Apply entitlements asynchronously ----
    log({
      stage: "TRIGGER_APPLY_ENTITLEMENTS",
      userId,
      functionId: APPLY_ENTITLEMENTS_FUNCTION_ID,
    });

    const execution = await functions.createExecution(
      APPLY_ENTITLEMENTS_FUNCTION_ID,
      JSON.stringify({ userId }),
      false // async execution
    );


    log({
      stage: "ENTITLEMENTS_TRIGGERED",
      userId,
      executionId: execution.$id,
      durationMs: Date.now() - requestStart,
    });

    return res.json({ status: "initialized" });

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
