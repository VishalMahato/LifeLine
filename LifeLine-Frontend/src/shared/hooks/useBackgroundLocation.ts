import { useCallback, useState } from "react";
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/src/shared/tasks/location.task";

export const useBackgroundLocation = () => {
  const [isTracking, setIsTracking] = useState(false);

  const startBackgroundTracking = useCallback(async () => {
    const status = await startBackgroundLocationTracking();
    if (status === "started" || status === "already-running") {
      setIsTracking(true);
    }

    return status;
  }, []);

  const stopBackgroundTracking = useCallback(async () => {
    await stopBackgroundLocationTracking();
    setIsTracking(false);
  }, []);

  return {
    isTracking,
    startBackgroundTracking,
    stopBackgroundTracking,
  };
};
