import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useAppDispatch, useAppSelector } from "@/src/core/store";
import { activateSos, deactivateSos } from "@/src/features/SOS/sos.slice";
import {
  clearPersistedLocationUserId,
  persistLocationUserId,
  reportLocationCoordinates,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/src/shared/tasks/location.task";

const SOS_HOLD_SECONDS = 10;
const LOCATION_REPORT_INTERVAL_MS = 5000;

type GpsStatus =
  | "idle"
  | "syncing"
  | "live"
  | "permission-denied"
  | "error";

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const role = useAppSelector((state) => state.auth.userData?.role);
  const authId = useAppSelector((state) => state.auth.authId);
  const userId = useAppSelector((state) => state.auth.userId);
  const isSOSActive = useAppSelector((state) => state.sos.isSOSActive);
  const trackedUserId = userId || authId || null;

  const [countdown, setCountdown] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const reportForegroundLocation = useCallback(async () => {
    if (!trackedUserId) {
      return;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    await reportLocationCoordinates(
      trackedUserId,
      position.coords,
      position.timestamp || Date.now(),
    );
  }, [trackedUserId]);

  useEffect(() => {
    if (!role) {
      router.replace("/Login");
      return;
    }

    if (role !== "user") {
      router.replace("/User/Helper/HelperRequest");
    }
  }, [role, router]);

  useEffect(() => {
    let isUnmounted = false;

    const syncTrackedUser = async () => {
      if (!trackedUserId) {
        return;
      }

      try {
        await persistLocationUserId(trackedUserId);
      } catch (error) {
        if (!isUnmounted) {
          console.error("Failed to persist tracking user id", error);
        }
      }
    };

    void syncTrackedUser();

    return () => {
      isUnmounted = true;
      void clearPersistedLocationUserId();
    };
  }, [trackedUserId]);

  useEffect(() => {
    let isMounted = true;

    const clearForegroundTimer = () => {
      if (!locationTimerRef.current) {
        return;
      }

      clearInterval(locationTimerRef.current);
      locationTimerRef.current = null;
    };

    const reportOnce = async () => {
      try {
        await reportForegroundLocation();
        if (isMounted) {
          setGpsStatus("live");
        }
      } catch (error) {
        if (isMounted) {
          setGpsStatus("error");
        }
        console.error("Failed to report foreground location", error);
      }
    };

    const startTracking = async () => {
      if (!trackedUserId) {
        setGpsStatus("error");
        return;
      }

      setGpsStatus("syncing");

      const foregroundPermission =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundPermission.status !== "granted") {
        setGpsStatus("permission-denied");
        return;
      }

      await reportOnce();

      clearForegroundTimer();
      locationTimerRef.current = setInterval(() => {
        void reportOnce();
      }, LOCATION_REPORT_INTERVAL_MS);

      const backgroundStatus = await startBackgroundLocationTracking();
      if (
        (backgroundStatus === "permission-denied"
          || backgroundStatus === "missing-user-id")
        && isMounted
      ) {
        setGpsStatus("permission-denied");
      }
    };

    const stopTracking = async () => {
      clearForegroundTimer();
      await stopBackgroundLocationTracking();
      if (isMounted) {
        setGpsStatus("idle");
      }
    };

    if (isSOSActive) {
      void startTracking();
    } else {
      void stopTracking();
    }

    return () => {
      isMounted = false;
      clearForegroundTimer();
      void stopBackgroundLocationTracking();
    };
  }, [isSOSActive, reportForegroundLocation, trackedUserId]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isSOSActive) {
      animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ]),
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
      Vibration.cancel();
    }

    return () => {
      animation?.stop();
      Vibration.cancel();
    };
  }, [isSOSActive, pulseAnim, rippleAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (locationTimerRef.current) {
        clearInterval(locationTimerRef.current);
      }
      Vibration.cancel();
    };
  }, []);

  if (!role || role !== "user") {
    return null;
  }

  const cancelHold = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCountdown(null);
  };

  const startHold = () => {
    if (timerRef.current) {
      return;
    }

    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 5,
      useNativeDriver: true,
    }).start();

    let seconds = SOS_HOLD_SECONDS;
    setCountdown(seconds);
    Vibration.vibrate(50);

    timerRef.current = setInterval(() => {
      seconds -= 1;

      if (seconds > 0) {
        setCountdown(seconds);
        Vibration.vibrate(50);
        return;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setCountdown(null);
      if (isSOSActive) {
        dispatch(deactivateSos());
      } else {
        dispatch(activateSos());
      }

      Vibration.vibrate(400);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  const sosLabel = isSOSActive && countdown === null ? "SOS\nACTIVE" : countdown ?? "SOS";
  const sosHint = isSOSActive
    ? countdown !== null
      ? "Release to cancel"
      : "Hold for 10s to deactivate"
    : countdown !== null
      ? "Release to cancel"
      : "Hold for 10s to activate";

  const gpsBadgeConfig: Record<
    GpsStatus,
    { label: string; color: string; backgroundColor: string }
  > = {
    idle: {
      label: "GPS READY",
      color: "#334155",
      backgroundColor: "#E2E8F0",
    },
    syncing: {
      label: "SYNCING",
      color: "#1D4ED8",
      backgroundColor: "#DBEAFE",
    },
    live: {
      label: "GPS LIVE",
      color: "#166534",
      backgroundColor: "#DCFCE7",
    },
    "permission-denied": {
      label: "GPS BLOCKED",
      color: "#B45309",
      backgroundColor: "#FEF3C7",
    },
    error: {
      label: "SYNC ERROR",
      color: "#B91C1C",
      backgroundColor: "#FEE2E2",
    },
  };

  const activeGpsBadge = gpsBadgeConfig[gpsStatus];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Safety Status</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={hp("1.8%") as number} color="#2F80ED" />
            <Text style={styles.locationText}>221B Baker St, London</Text>
          </View>
        </View>

        <View style={[styles.gpsBadge, { backgroundColor: activeGpsBadge.backgroundColor }]}>
          <View style={[styles.gpsDot, { backgroundColor: activeGpsBadge.color }]} />
          <Text style={[styles.gpsText, { color: activeGpsBadge.color }]}>
            {activeGpsBadge.label}
          </Text>
        </View>
      </View>

      <View style={styles.sosWrapper}>
        <Animated.View
          style={[
            styles.sosButton,
            {
              backgroundColor: isSOSActive ? "#DC2626" : "#EF4444",
              transform: [{ scale: isSOSActive ? pulseAnim : scaleAnim }],
            },
          ]}
        >
          {isSOSActive && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                  opacity: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.75, 0],
                  }),
                },
              ]}
            />
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={startHold}
            onPressOut={cancelHold}
            style={styles.sosTouchable}
          >
            <Text style={[styles.sosText, isSOSActive && styles.sosTextActive]}>{sosLabel}</Text>
            <Text style={styles.sosSub}>{sosHint}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.sosInfo}>
          Long-press the SOS button in dangerous situations. Countdown prevents accidental triggers.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={hp("2.4%") as number} color="#2F80ED" />
          <Text style={styles.statValue}>14</Text>
          <Text style={styles.statLabel}>VERIFIED HELPERS</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="leaf" size={hp("2.4%") as number} color="#2F80ED" />
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>ACTIVE NGOS</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.aiCard}>
        <View style={styles.aiLeft}>
          <Ionicons name="sparkles" size={hp("2.5%") as number} color="#fff" />
          <View>
            <Text style={styles.aiTitle}>LifeLine AI Assistant</Text>
            <Text style={styles.aiSub}>{'"I smell gas" or "Help with injury"'}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={hp("2.5%") as number} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp("6%"),
    paddingTop: hp("4%"),
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: hp("2.4%"),
    fontWeight: "800",
    color: "#0A2540",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    marginTop: hp("0.5%"),
  },
  locationText: {
    fontSize: hp("1.6%"),
    color: "#5F6C7B",
  },
  gpsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9F7EF",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.6%"),
    borderRadius: 20,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#27AE60",
    marginRight: 6,
  },
  gpsText: {
    fontSize: hp("1.2%"),
    fontWeight: "700",
    color: "#27AE60",
  },
  sosWrapper: {
    alignItems: "center",
    marginVertical: hp("4%"),
  },
  sosButton: {
    width: hp("23%"),
    height: hp("23%"),
    borderRadius: hp("11.5%"),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  ripple: {
    position: "absolute",
    width: hp("28%"),
    height: hp("28%"),
    borderRadius: hp("14%"),
    borderWidth: 2,
    borderColor: "rgba(220, 38, 38, 0.35)",
  },
  sosTouchable: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: wp("3%"),
  },
  sosText: {
    fontSize: hp("4.8%"),
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    lineHeight: hp("5.2%"),
  },
  sosTextActive: {
    fontSize: hp("3.8%"),
    lineHeight: hp("4.2%"),
  },
  sosSub: {
    fontSize: hp("1.3%"),
    letterSpacing: 1,
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "uppercase",
    marginTop: hp("0.8%"),
    textAlign: "center",
  },
  sosInfo: {
    textAlign: "center",
    fontSize: hp("1.6%"),
    color: "#8A94A6",
    marginTop: hp("2%"),
    paddingHorizontal: wp("2%"),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    paddingVertical: hp("3%"),
    alignItems: "center",
    elevation: 3,
  },
  statValue: {
    fontSize: hp("3%"),
    fontWeight: "800",
    marginTop: hp("1%"),
  },
  statLabel: {
    fontSize: hp("1.2%"),
    color: "#8A94A6",
    marginTop: hp("0.5%"),
  },
  aiCard: {
    marginTop: hp("4%"),
    backgroundColor: "#1E73E8",
    borderRadius: hp("2%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("3%"),
  },
  aiTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  aiSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: hp("1.4%"),
  },
});
