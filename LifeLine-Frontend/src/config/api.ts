import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getExpoHost = () => {
  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | undefined)?.hostUri ||
    (Constants.manifest as { debuggerHost?: string } | undefined)?.debuggerHost ||
    (Constants as unknown as {
      manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
    }).manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(":")[0] || null;
};

export const getApiRoot = () => {
  const envRoot = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envRoot) {
    return envRoot.replace(/\/$/, "");
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  return "http://localhost:5000";
};

export const api = axios.create({
  baseURL: getApiRoot(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const API_ENDPOINTS = {
  LOCATION: {
    BASE: "/api/locations/v1",
    USER: (userId: string) => `/api/locations/v1/user/${userId}`,
    NEARBY_SEARCH: "/api/locations/v1/nearby/search",
    NEARBY_HELPERS: "/api/locations/v1/nearby/helpers",
    COORDINATES: "/api/locations/v1/coordinates",
    CURRENT: "/api/locations/v1/current",
  },
} as const;

export default api;
