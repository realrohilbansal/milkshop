import Constants from "expo-constants";
import { Account, Client, Databases } from 'react-native-appwrite';

export const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_PLATFORM_ID } =
  Constants.expoConfig?.extra ?? {};

const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(APPWRITE_PROJECT_ID); // Your project ID


export default client;
export const account = new Account(client);
export const databases = new Databases(client);
