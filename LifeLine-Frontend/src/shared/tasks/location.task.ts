import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import locationSocketService from "@/src/shared/services/socket.service";

let trackedUserId: string | null = null;

type TrackingStartStatus =
  | "started"
  | "already-running"
  | "permission-denied"
  | "missing-user-id"
  | "error";

type SerializableCoords = Pick<
  Location.LocationObjectCoords,
  "latitude" | "longitude" | "accuracy" | "altitude" | "speed" | "heading"
>;

type LocationTaskPayload = {
  locations?: Location.LocationObject[];
};

const LOCATION_TRACKING_USER_KEY = "lifeline_tracking_user_id";
export const LOCATION_TASK_NAME = "lifeline-background-location-task";

const resolveTrackedUserId = async () => {
  if (trackedUserId) {
    return trackedUserId;
  }

  trackedUserId = await AsyncStorage.getItem(LOCATION_TRACKING_USER_KEY);
  return trackedUserId;
};

export const persistLocationUserId = async (userId: string) => {
  trackedUserId = userId || null;

  if (!trackedUserId) {
    await AsyncStorage.removeItem(LOCATION_TRACKING_USER_KEY);
    return;
  }

  await AsyncStorage.setItem(LOCATION_TRACKING_USER_KEY, trackedUserId);
};

export const clearPersistedLocationUserId = async () => {
  trackedUserId = null;
  await AsyncStorage.removeItem(LOCATION_TRACKING_USER_KEY);
};

export const reportLocationCoordinates = async (
  userId: string,
  coords: SerializableCoords,
  timestamp = Date.now(),
) => {
  if (!userId) {
    return;
  }

  await locationSocketService.updateLocation({
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

if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error("[location.task] Background location task error:", error);
      return;
    }

    const currentTrackedUserId = await resolveTrackedUserId();
    if (!currentTrackedUserId) {
      return;
    }

    const payload = data as LocationTaskPayload | undefined;
    const updates = payload?.locations ?? [];
    const latest = updates[updates.length - 1];

    if (!latest?.coords) {
      return;
    }

    try {
      await reportLocationCoordinates(
        currentTrackedUserId,
        latest.coords,
        latest.timestamp || Date.now(),
      );
    } catch (taskError) {
      console.error("[location.task] Failed to report background location", taskError);
    }
  });
}

export const startBackgroundLocationTracking =
  async (): Promise<TrackingStartStatus> => {
    const currentTrackedUserId = await resolveTrackedUserId();
    if (!currentTrackedUserId) {
      return "missing-user-id";
    }

    try {
      const foregroundPermission =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundPermission.status !== "granted") {
        return "permission-denied";
      }

      const backgroundPermission =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundPermission.status !== "granted") {
        return "permission-denied";
      }

      const isStarted =
        await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isStarted) {
        return "already-running";
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 5,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "LifeLine Background Tracking",
          notificationBody: "Reporting location to help during emergencies.",
          notificationColor: "#2563eb",
        },
      });

      return "started";
    } catch (error) {
      console.error("[location.task] Failed to start background tracking", error);
      return "error";
    }
  };

export const stopBackgroundLocationTracking = async () => {
  try {
    const isStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME,
    );
    if (isStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch (error) {
    console.error("[location.task] Failed to stop background tracking", error);
  }
};
