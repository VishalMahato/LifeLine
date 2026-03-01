import apiClient, { API_ENDPOINTS } from "@/src/config/api";
import UniversalMap from "@/src/features/auth/screens/UniversalMap";
import { openURL } from "expo-linking";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

type Helper = {
  id: string;
  name: string;
  role: string;
  degree: string;
  distance: string;
  responseRate: string;
  avatar: string;
  verified: boolean;
  latitude: number;
  longitude: number;
  phone: string;
};

type NGO = {
  id: string;
  name: string;
  services: string;
  status: string;
  distance: string;
  latitude: number;
  longitude: number;
  phone: string;
};

type NearbySearchLocation = {
  id: string;
  coordinates?: [number, number];
  placeType?: string;
  address?: string;
};

const FALLBACK_HELPERS: Helper[] = [
  {
    id: "fallback-1",
    name: "Dr. Sarah Jenkins",
    role: "Cardiologist",
    degree: "MD",
    distance: "0.8 km",
    responseRate: "98%",
    avatar: "https://i.pravatar.cc/150?img=12",
    verified: true,
    latitude: 28.6139,
    longitude: 77.209,
    phone: "+1234567890",
  },
];

const FALLBACK_NGOS: NGO[] = [
  {
    id: "ngo-1",
    name: "Red Cross Response",
    services: "Emergency Shelter & First Aid",
    status: "OPEN 24/7",
    distance: "2.4 km",
    latitude: 40.7128,
    longitude: -74.006,
    phone: "+1555123456",
  },
];

const mapNgo = (raw: NearbySearchLocation): NGO | null => {
  if (!Array.isArray(raw.coordinates) || raw.coordinates.length !== 2) {
    return null;
  }

  const placeType = raw.placeType?.toLowerCase();
  if (placeType !== "ngo" && placeType !== "hospital") {
    return null;
  }

  return {
    id: raw.id,
    name: raw.address || "Relief Center",
    services:
      placeType === "hospital" ? "Emergency Medical" : "Disaster Relief",
    status: "OPEN 24/7",
    distance: "Nearby",
    latitude: raw.coordinates[1],
    longitude: raw.coordinates[0],
    phone: "+1234567890",
  };
};

const NearbyScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"helpers" | "ngos">("helpers");
  const [helpers, setHelpers] = useState<Helper[]>(FALLBACK_HELPERS);
  const [ngos, setNgos] = useState<NGO[]>(FALLBACK_NGOS);
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNearby = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const lat = current.coords.latitude;
      const lng = current.coords.longitude;
      setCurrentCoords({ latitude: lat, longitude: lng });

      const [helpersRes, nearbyRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: Helper[] }>(
          API_ENDPOINTS.LOCATION.NEARBY_HELPERS,
          { params: { lat, lng, radius: 10 } },
        ),
        apiClient.get<{ success: boolean; data: NearbySearchLocation[] }>(
          API_ENDPOINTS.LOCATION.NEARBY_SEARCH,
          { params: { lat, lng, radius: 10 } },
        ),
      ]);

      if (helpersRes.data.success && Array.isArray(helpersRes.data.data)) {
        if (helpersRes.data.data.length > 0) {
          setHelpers(helpersRes.data.data);
        }
      }

      if (nearbyRes.data.success && Array.isArray(nearbyRes.data.data)) {
        const mappedNgos = nearbyRes.data.data
          .map(mapNgo)
          .filter((item): item is NGO => item !== null);
        if (mappedNgos.length > 0) {
          setNgos(mappedNgos);
        }
      }
    } catch (error) {
      console.error("Failed to fetch nearby data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNearby();
  }, [fetchNearby]);

  const mapMarkers = useMemo(
    () => [
      ...helpers.map((helper) => ({
        latitude: helper.latitude,
        longitude: helper.longitude,
        title: helper.name,
        type: "helper" as const,
      })),
      ...ngos.map((ngo) => ({
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        title: ngo.name,
        type: "ngo" as const,
      })),
    ],
    [helpers, ngos],
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: hp("5%") }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => void fetchNearby()}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Nearby</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => void fetchNearby()}
            disabled={loading}
          >
            <Ionicons
              name={loading ? "sync" : "refresh-outline"}
              size={hp("2.4%")}
              color="#1E73E8"
            />
          </TouchableOpacity>
          <Ionicons
            name="options-outline"
            size={hp("2.4%") as number}
            color="#374151"
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "helpers" && styles.activeTab]}
          onPress={() => setActiveTab("helpers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "helpers" && styles.activeTabText,
            ]}
          >
            Helpers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ngos" && styles.activeTab]}
          onPress={() => setActiveTab("ngos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "ngos" && styles.activeTabText,
            ]}
          >
            NGOs
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons
          name="search-outline"
          size={hp("2%") as number}
          color="#9CA3AF"
        />
        <TextInput
          placeholder="Search by name or role..."
          style={styles.searchInput}
        />
      </View>

      <View style={styles.mapCard}>
        <UniversalMap
          latitude={currentCoords?.latitude}
          longitude={currentCoords?.longitude}
          markers={mapMarkers}
        />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE VIEW ENABLED</Text>
        </View>
      </View>

      {activeTab === "helpers" && (
        <View style={{ marginBottom: hp("5%") }}>
          <Text style={styles.sectionTitle}>
            AVAILABLE NOW ({helpers.length})
          </Text>
          {helpers.map((helper) => (
            <View key={helper.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: helper.avatar }} style={styles.avatar} />
                <View style={styles.cardContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{helper.name}</Text>
                    {helper.verified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={hp("2%") as number}
                        color="#1E73E8"
                      />
                    )}
                  </View>
                  <Text style={styles.subText}>
                    {helper.role} • {helper.degree}
                  </Text>
                  <Text style={styles.meta}>
                    {helper.distance} • {helper.responseRate} response rate
                  </Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => openURL(`tel:${helper.phone}`)}
                >
                  <Text style={styles.primaryText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() =>
                    openURL(
                      `https://www.google.com/maps/dir/?api=1&destination=${helper.latitude},${helper.longitude}&travelmode=driving&dir_action=navigate`,
                    )
                  }
                >
                  <Text style={styles.secondaryText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === "ngos" && (
        <View style={{ marginBottom: hp("5%") }}>
          <View style={styles.ngoHeader}>
            <Text style={styles.sectionTitle}>
              ACTIVE NGO RELIEF ({ngos.length})
            </Text>
            <Text style={styles.seeAll}>See All NGOs</Text>
          </View>
          {ngos.map((ngo) => (
            <View key={ngo.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.ngoIcon}>
                  <Ionicons
                    name="medkit"
                    size={hp("2.5%") as number}
                    color="#EF4444"
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{ngo.name}</Text>
                  <Text style={styles.subText}>{ngo.services}</Text>
                  <Text style={styles.meta}>
                    {ngo.status} • {ngo.distance}
                  </Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => openURL(`tel:${ngo.phone}`)}
                >
                  <Text style={styles.primaryText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() =>
                    openURL(
                      `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}&travelmode=driving&dir_action=navigate`,
                    )
                  }
                >
                  <Text style={styles.secondaryText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default NearbyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
    paddingHorizontal: wp("6%"),
    paddingTop: hp("4%"),
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("3%"),
  },
  title: {
    fontSize: hp("2.6%"),
    fontWeight: "800",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: hp("2%"),
    padding: hp("0.5%"),
    marginHorizontal: wp("6%"),
  },
  tab: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: hp("1.8%"),
  },
  activeTabText: {
    color: "#1E73E8",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: wp("4%"),
    marginBottom: hp("2%"),
    height: hp("6%"),
    marginHorizontal: wp("6%"),
  },
  searchInput: {
    flex: 1,
    fontSize: hp("1.8%"),
    marginLeft: wp("2%"),
  },
  mapCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: hp("2%"),
    marginHorizontal: wp("6%"),
    backgroundColor: "#E5E7EB",
  },
  liveBadge: {
    position: "absolute",
    bottom: hp("1%"),
    left: wp("3%"),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.6%"),
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveDot: {
    width: hp("0.8%"),
    height: hp("0.8%"),
    borderRadius: hp("0.4%"),
    backgroundColor: "#1E73E8",
    marginRight: wp("1.5%"),
  },
  liveText: {
    fontSize: hp("1.2%"),
    fontWeight: "700",
    color: "#374151",
  },
  sectionTitle: {
    fontSize: hp("1.6%"),
    fontWeight: "700",
    color: "#6B7280",
    marginVertical: hp("1.5%"),
    marginHorizontal: wp("6%"),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp("4%"),
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: wp("6%"),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  avatar: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: hp("3%"),
    marginRight: wp("3%"),
  },
  ngoIcon: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: hp("1.5%"),
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1.5%"),
    marginBottom: hp("0.3%"),
  },
  name: {
    fontSize: hp("1.9%"),
    fontWeight: "700",
    color: "#111827",
  },
  subText: {
    fontSize: hp("1.5%"),
    color: "#6B7280",
    marginBottom: hp("0.4%"),
  },
  meta: {
    fontSize: hp("1.3%"),
    color: "#9CA3AF",
  },
  actionRow: {
    flexDirection: "row",
    gap: wp("3%"),
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#1E73E8",
    borderRadius: 10,
    paddingVertical: hp("1.3%"),
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp("1.6%"),
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: hp("1.3%"),
    alignItems: "center",
  },
  secondaryText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: hp("1.6%"),
  },
  ngoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp("6%"),
  },
  seeAll: {
    color: "#1E73E8",
    fontWeight: "600",
    fontSize: hp("1.4%"),
  },
});
