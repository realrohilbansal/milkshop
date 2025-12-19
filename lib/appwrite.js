import Constants from "expo-constants";
import { Account, Client, Databases } from 'react-native-appwrite';

export const { APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_PLATFORM } =
  Constants.expoConfig?.extra ?? {};

const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(APPWRITE_PROJECT) // Your project ID
  .setPlatform(APPWRITE_PLATFORM); // Your platform ID


export default client;
export const account = new Account(client);
export const databases = new Databases(client);
