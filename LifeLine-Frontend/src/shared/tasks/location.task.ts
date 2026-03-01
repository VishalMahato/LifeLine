import * as Location from "expo-location";
import apiClient, { API_ENDPOINTS } from "@/src/config/api";

let trackedUserId: string | null = null;

type TrackingStartStatus =
  | "started"
  | "already-running"
  | "permission-denied"
  | "unsupported";

type SerializableCoords = Pick<
  Location.LocationObjectCoords,
  "latitude" | "longitude" | "accuracy" | "altitude" | "speed" | "heading"
>;

export const LOCATION_TASK_NAME = "lifeline-background-location-task";

export const persistLocationUserId = async (userId: string) => {
  trackedUserId = userId || null;
};

export const clearPersistedLocationUserId = async () => {
  trackedUserId = null;
};

export const reportLocationCoordinates = async (
  userId: string,
  coords: SerializableCoords,
  timestamp = Date.now(),
) => {
  if (!userId) {
    return;
  }

  await apiClient.post(API_ENDPOINTS.LOCATION.COORDINATES, {
    userId,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? undefined,
    altitude: coords.altitude ?? undefined,
    speed: coords.speed ?? undefined,
    heading: coords.heading ?? undefined,
    timestamp: new Date(timestamp).toISOString(),
  });
};

export const startBackgroundLocationTracking =
  async (): Promise<TrackingStartStatus> => {
    if (!trackedUserId) {
      return "permission-denied";
    }

    return "unsupported";
  };

export const stopBackgroundLocationTracking = async () => {};
