import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EmergencyDetaill = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Detail</Text>
      <Text style={styles.subtitle}>
        This screen is prepared for helper-side SOS detail handling.
      </Text>

      <TouchableOpacity
        style={styles.cta}
        onPress={() => router.push("/User/IncomeUserSOS")}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>Open SOS Queue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 24,
  },
  cta: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default EmergencyDetaill;
