import 'dotenv/config';

export default {
  expo: {
    name: "milkshop",
    slug: "milkshop",
    extra: {
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
      APPWRITE_PLATFORM_ID: process.env.APPWRITE_PLATFORM_ID,
    }
  }
};
