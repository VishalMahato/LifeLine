import { openURL } from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { WebView } from "react-native-webview";

// Interfaces for type safety
interface Helper {
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
}

interface NGO {
  id: string;
  name: string;
  services: string;
  status: string;
  distance: string;
  latitude: number;
  longitude: number;
  phone: string;
}

// Mock data (replace with props or API calls)
const mockHelpers: Helper[] = [
  {
    id: "1",
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
  {
    id: "2",
    name: "Dr. Michael Lee",
    role: "Emergency Physician",
    degree: "MD",
    distance: "1.2 km",
    responseRate: "95%",
    avatar: "https://i.pravatar.cc/150?img=13",
    verified: true,
    latitude: 19.076,
    longitude: 72.8777,
    phone: "+1987654321",
  },

  {
    id: "3",
    name: "Abhishek Kumar",
    role: "Developer",
    degree: "MCA",
    distance: "2.8 km",
    responseRate: "95%",
    avatar: "https://i.pravatar.cc/150?img=17",
    verified: false,
    latitude: 19.076,
    longitude: 72.8777,
    phone: "+1987654321",
  },
];

const mockNGOs: NGO[] = [
  {
    id: "1",
    name: "Red Cross Response",
    services: "Emergency Shelter & First Aid",
    status: "OPEN 24/7",
    distance: "2.4 km",
    latitude: 40.7128,
    longitude: -74.006,
    phone: "+1555123456",
  },
  {
    id: "2",
    name: "Green Aid Network",
    services: "Medical Supplies & Ambulance",
    status: "OPEN 24/7",
    distance: "3.1 km",
    latitude: 51.5074,
    longitude: -0.1278,
    phone: "+447700900000",
  },
  {
    id: "3",
    name: "Blue Shield Relief",
    services: "Disaster Response & Care",
    status: "OPEN 24/7",
    distance: "4.0 km",
    latitude: 35.6762,
    longitude: 139.6503,
    phone: "+81312345678",
  },
];

// Sub-components for cleaner code
const Header: React.FC = () => (
  <View style={styles.header}>
    <Text style={styles.title}>Nearby</Text>
    <Ionicons name="options-outline" size={hp("2.6%")} />
  </View>
);

const Tabs: React.FC<{
  activeTab: "helpers" | "ngos";
  setActiveTab: (tab: "helpers" | "ngos") => void;
}> = ({ activeTab, setActiveTab }) => (
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
        style={[styles.tabText, activeTab === "ngos" && styles.activeTabText]}
      >
        NGOs
      </Text>
    </TouchableOpacity>
  </View>
);

const SearchBar: React.FC = () => (
  <View style={styles.searchWrapper}>
    <Ionicons name="search-outline" size={hp("2%")} color="#9CA3AF" />
    <TextInput
      placeholder="Search by name or role..."
      style={styles.searchInput}
    />
  </View>
);

const MapPreview: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    const defaultLocation = { latitude: 51.505, longitude: -0.09 };
    const currentLat = location?.coords.latitude ?? defaultLocation.latitude;
    const currentLng = location?.coords.longitude ?? defaultLocation.longitude;

    const helperMarkers = mockHelpers
      .map(
        (helper) =>
          `L.marker([${helper.latitude}, ${helper.longitude}]).addTo(map).bindPopup('${helper.name}');`,
      )
      .join("");
    const ngoMarkers = mockNGOs
      .map(
        (ngo) =>
          `L.marker([${ngo.latitude}, ${ngo.longitude}]).addTo(map).bindPopup('${ngo.name}');`,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${currentLat}, ${currentLng}], 13);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          L.marker([${currentLat}, ${currentLng}]).addTo(map).bindPopup('Your Location').openPopup();
          ${helperMarkers}
          ${ngoMarkers}
        </script>
      </body>
      </html>
    `;

    setHtmlContent(html);
  }, [location]);

  return (
    <View style={styles.mapCard}>
      {Platform.OS === "web" ? (
        <View style={styles.mapUnavailable}>
          <Text style={styles.mapUnavailableText}>
            Map preview is not available on web.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
        />
      )}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE VIEW ENABLED</Text>
      </View>
    </View>
  );
};

const HelperCard: React.FC<{ helper: Helper }> = ({ helper }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Image source={{ uri: helper.avatar }} style={styles.avatar} />
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{helper.name}</Text>
          {helper.verified && (
            <Ionicons name="checkmark-circle" size={hp("2%")} color="#1E73E8" />
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
);

const NGOCard: React.FC<{ ngo: NGO }> = ({ ngo }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.ngoIcon}>
        <Ionicons name="medkit" size={hp("2.5%")} color="#EF4444" />
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
);

// Main Component
const NearbyScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"helpers" | "ngos">("helpers");

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: hp("5%") }}
    >
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <SearchBar />
      <MapPreview />

      {activeTab === "helpers" && (
        <View style={{ marginBottom: hp("5%") }}>
          <Text style={styles.sectionTitle}>
            AVAILABLE NOW ({mockHelpers.length})
          </Text>
          {mockHelpers.map((helper) => (
            <HelperCard key={helper.id} helper={helper} />
          ))}
        </View>
      )}

      {activeTab === "ngos" && (
        <View style={{ paddingBottom: hp("5%") }}>
          <View style={styles.ngoHeader}>
            <Text style={styles.sectionTitle}>
              ACTIVE NGO RELIEF ({mockNGOs.length})
            </Text>
            <Text style={styles.seeAll}>See All NGOs</Text>
          </View>
          {mockNGOs.map((ngo) => (
            <NGOCard key={ngo.id} ngo={ngo} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default NearbyScreen;

// Updated Styles for better responsiveness and alignment
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
    aspectRatio: 2, // Maintains a responsive 2:1 aspect ratio for the map
    backgroundColor: "#E5E7EB", // Placeholder background
    marginHorizontal: wp("6%"),
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapUnavailable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapUnavailableText: {
    color: "#DC2626",
    fontSize: hp("1.8%"),
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: wp("4%"),
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
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  name: {
    fontSize: hp("2%"),
    fontWeight: "700",
    color: "#111827",
  },
  subText: {
    fontSize: hp("1.6%"),
    color: "#6B7280",
    marginBottom: hp("0.5%"),
  },
  meta: {
    fontSize: hp("1.4%"),
    color: "#9CA3AF",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryBtn: {
    backgroundColor: "#1E73E8",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("6%"),
    borderRadius: 10,
    flex: 1,
    marginRight: wp("2%"),
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: hp("1.6%"),
  },
  secondaryBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("6%"),
    borderRadius: 10,
    flex: 1,
    marginLeft: wp("2%"),
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "600",
    fontSize: hp("1.6%"),
    color: "#374151",
  },
  ngoIcon: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  ngoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    color: "#1E73E8",
    fontWeight: "600",
    fontSize: hp("1.6%"),
  },
});
