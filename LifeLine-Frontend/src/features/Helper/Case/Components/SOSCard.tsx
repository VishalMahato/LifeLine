import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type SOSPriority = "CRITICAL" | "MEDIUM" | "MODERATE" | "SAFETY";

export type SOSItem = {
  id: string;
  name: string;
  issue: string;
  priority: SOSPriority;
  eta: string;
  time: string;
  distance: string;
  type: "fire" | "medical" | "accident" | "check";
};

type Props = {
  item: SOSItem;
  onAccept?: (item: SOSItem) => void;
  onReject?: (item: SOSItem) => void;
  onMessage?: (item: SOSItem) => void;
};

const PRIORITY_STYLES: Record<
  SOSPriority,
  { container: object; text: object }
> = {
  CRITICAL: {
    container: { backgroundColor: "#FEE2E2" },
    text: { color: "#B91C1C" },
  },
  MEDIUM: {
    container: { backgroundColor: "#FFEDD5" },
    text: { color: "#C2410C" },
  },
  MODERATE: {
    container: { backgroundColor: "#FEF9C3" },
    text: { color: "#A16207" },
  },
  SAFETY: {
    container: { backgroundColor: "#DCFCE7" },
    text: { color: "#166534" },
  },
};

const SOSCard = ({ item, onAccept, onReject, onMessage }: Props) => {
  const priorityStyle = PRIORITY_STYLES[item.priority];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.priorityBadge, priorityStyle.container]}>
                <Text style={[styles.priorityText, priorityStyle.text]}>
                  {item.priority}
                </Text>
              </View>
            </View>

            <Text style={styles.issue}>{item.issue}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.metaText}>{item.eta}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{item.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.alertIconWrap}>
          <Ionicons name="warning-outline" size={18} color="#F97316" />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => onReject?.(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => onAccept?.(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => onMessage?.(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftSection: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 8,
  },
  priorityBadge: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  issue: {
    fontSize: 14,
    color: "#334155",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    color: "#64748B",
    fontSize: 12,
    marginLeft: 4,
  },
  metaDot: {
    color: "#94A3B8",
    marginHorizontal: 6,
  },
  alertIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FDBA74",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    marginRight: 8,
  },
  rejectText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    marginRight: 8,
  },
  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SOSCard;
