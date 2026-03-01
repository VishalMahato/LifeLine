import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SOSCard, {
  type SOSItem,
} from "@/src/features/Helper/Case/Components/SOSCard";

const sosList: SOSItem[] = [
  {
    id: "1",
    name: "Anjali M.",
    issue: "Fire Emergency",
    priority: "MEDIUM",
    eta: "2.5 km away",
    time: "2m ago",
    distance: "2.5 km",
    type: "fire",
  },
  {
    id: "2",
    name: "Sarah",
    issue: "Cardiac Arrest",
    priority: "CRITICAL",
    eta: "CPR in progress",
    time: "2m ago",
    distance: "0.5 km",
    type: "medical",
  },
  {
    id: "3",
    name: "Mike",
    issue: "Car Accident",
    priority: "MODERATE",
    eta: "Minor injuries",
    time: "8m ago",
    distance: "2 km",
    type: "accident",
  },
  {
    id: "4",
    name: "Unknown",
    issue: "Check-In Request",
    priority: "SAFETY",
    eta: "No immediate danger",
    time: "15m ago",
    distance: "5 km",
    type: "check",
  },
];

const IncomeUserSOS = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming SOS</Text>
        <View style={styles.systemOnlineWrap}>
          <View style={styles.systemOnlineDot} />
          <Text style={styles.systemOnlineText}>SYSTEM ONLINE</Text>
        </View>
      </View>

      <View style={styles.queueHeader}>
        <Text style={styles.queueTitle}>PRIORITY QUEUE ({sosList.length})</Text>
        <TouchableOpacity style={styles.mapButton} activeOpacity={0.8}>
          <Ionicons name="map-outline" size={16} color="#2563EB" />
          <Text style={styles.mapButtonText}>Map View</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sosList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SOSCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  systemOnlineWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  systemOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  systemOnlineText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },
  queueHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  queueTitle: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapButtonText: {
    color: "#2563EB",
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default IncomeUserSOS;
