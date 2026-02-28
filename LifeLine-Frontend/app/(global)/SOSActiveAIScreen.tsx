import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";

const options = [
  { label: "Chest pain", icon: "pulse", color: "#EF4444" },
  { label: "Accident", icon: "car", color: "#F97316" },
  { label: "Not breathing", icon: "wind", color: "#3B82F6" },
  { label: "Feeling unsafe", icon: "shield-checkmark", color: "#6366F1" },
  { label: "Someone injured", icon: "bandage", color: "#8B5CF6" },
  { label: "Other", icon: "ellipsis-horizontal", color: "#9CA3AF" },
];

const SOSActiveAIScreen = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Pulse animation for the mic button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const handleMicPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

    holdTimeout.current = setTimeout(() => {
      Alert.alert("Listening...", "AI is analyzing your voice.");
    }, 1200);
  };

  const handleMicPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={hp("2.5%")} />
        </TouchableOpacity>
        <View style={styles.sosBadge}>
          <Text style={styles.sosBadgeText}>SOS ACTIVE</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Tell me what happened.</Text>
      <Text style={styles.subtitle}>
        Help is already being dispatched to your location.
      </Text>

      {/* Options Grid */}
      <View style={styles.grid}>
        {options.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={hp("2.5%")}
                color={item.color}
              />
            </View>
            <Text style={styles.cardText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location Card */}
      <View style={styles.locationCard}>
        <Ionicons name="location" size={hp("2.2%")} color="#27AE60" />
        <View style={{ flex: 1 }}>
          <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
          <Text style={styles.locationText}>Market St, San Francisco</Text>
        </View>
        <Text style={styles.shared}>SHARED</Text>
      </View>

      {/* Mic Button */}
      <View style={styles.micWrapper}>
        <Animated.View
          style={[
            styles.micButton,
            { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
            style={styles.micTouchable}
          >
            <Ionicons name="mic" size={hp("4%")} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.holdText}>HOLD TO DESCRIBE</Text>
      </View>
    </View>
  );
};

export default SOSActiveAIScreen;

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

  sosBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.6%"),
    borderRadius: 20,
  },

  sosBadgeText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: hp("1.2%"),
  },

  title: {
    fontSize: hp("2.8%"),
    fontWeight: "800",
    marginTop: hp("3%"),
    color: "#0A2540",
  },

  subtitle: {
    fontSize: hp("1.8%"),
    color: "#5F6C7B",
    marginBottom: hp("3%"),
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    paddingVertical: hp("3%"),
    alignItems: "center",
    marginBottom: hp("2%"),
    elevation: 2,
  },

  iconWrapper: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("1%"),
  },

  cardText: {
    fontSize: hp("1.6%"),
    fontWeight: "600",
    color: "#0A2540",
    textAlign: "center",
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    padding: wp("4%"),
    marginVertical: hp("2%"),
    elevation: 2,
  },

  locationLabel: {
    fontSize: hp("1.2%"),
    color: "#8A94A6",
    fontWeight: "700",
  },

  locationText: {
    fontSize: hp("1.6%"),
    fontWeight: "600",
  },

  shared: {
    color: "#27AE60",
    fontWeight: "700",
    fontSize: hp("1.2%"),
  },

  micWrapper: {
    alignItems: "center",
    marginTop: hp("3%"),
  },

  micButton: {
    width: hp("12%"),
    height: hp("12%"),
    borderRadius: 100,
    backgroundColor: "#EF4444", // Changed to red to match SOS theme
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  micTouchable: {
    justifyContent: "center",
    alignItems: "center",
  },

  holdText: {
    marginTop: hp("2%"),
    fontWeight: "700",
    color: "#EF4444", // Changed to red
    fontSize: hp("1.6%"),
  },
});
