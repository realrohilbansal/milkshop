import 'dotenv/config';

export default {
  expo: {
    name: "milkshop",
    slug: "milkshop",
    scheme: "milkshop",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    extra: {
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_PROJECT: process.env.APPWRITE_PROJECT,
      APPWRITE_PLATFORM: process.env.APPWRITE_PLATFORM,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,

      APPWRITE_DATABASE: process.env.APPWRITE_DATABASE, 
      ORDERS_COLLECTION: process.env.ORDERS_COLLECTION,
      CUSTOMERS_COLLECTION: process.env.CUSTOMERS_COLLECTION,
      PRODUCTS_COLLECTION: process.env.PRODUCTS_COLLECTION,
      USER_PRICE_COLLECTION: process.env.USER_PRICE_COLLECTION,
      SUBSCRIPTION_PLANS_COLLECTION: process.env.SUBSCRIPTION_PLANS_COLLECTION,
      SUBSCRIPTIONS_COLLECTION: process.env.SUBSCRIPTIONS_COLLECTION,
      ENTITLEMENTS_COLLECTION: process.env.ENTITLEMENTS_COLLECTION,

      APPLY_ENTITLEMENTS_FUNCTION_ID: process.env.APPLY_ENTITLEMENTS_FUNCTION_ID,
      ENTITLEMENTS_FUNCTION_ID: process.env.ENTITLEMENTS_FUNCTION_ID,
      BOOTSTRAP_USER_FUNCTION_ID: process.env.BOOTSTRAP_USER_FUNCTION_ID,

      eas: {
        projectId: "bf54576a-2169-45cd-95c3-14e004b9b53b",
      },
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "dev.milkshop.milkooapp",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      "expo-localization"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
};
