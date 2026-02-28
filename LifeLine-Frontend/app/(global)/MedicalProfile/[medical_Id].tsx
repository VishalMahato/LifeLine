import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

type Allergy = {
  name: string;
  level: string;
  color: string;
};

type DetailItem = {
  title: string;
  desc: string;
};

type EmergencyContact = {
  name: string;
  relation: string;
};

type MedicalProfileData = {
  name: string;
  lastUpdated: string;
  bloodType: string;
  organDonor: string;
  allergies: Allergy[];
  conditions: DetailItem[];
  medications: DetailItem[];
  contacts: EmergencyContact[];
};

const MEDICAL_PROFILES: Record<string, MedicalProfileData> = {
  "25": {
    name: "Johnathan Doe",
    lastUpdated: "OCT 24, 2023",
    bloodType: "A+",
    organDonor: "Yes",
    allergies: [
      { name: "Penicillin", level: "Severe", color: "#EF4444" },
      { name: "Peanuts", level: "Moderate", color: "#F59E0B" },
    ],
    conditions: [
      {
        title: "Type 1 Diabetes",
        desc: "Diagnosed 2015. Requires insulin pump therapy.",
      },
      {
        title: "Mild Asthma",
        desc: "Seasonal triggers. Inhaler used as needed.",
      },
    ],
    medications: [
      {
        title: "Insulin Aspart (Novolog)",
        desc: "Dosage: Sliding Scale via Pump",
      },
      {
        title: "Albuterol Inhaler",
        desc: "Dosage: 2 puffs as needed for shortness of breath",
      },
    ],
    contacts: [
      { name: "Sarah Doe", relation: "Spouse • (555) 012-3456" },
      { name: "Michael Chen", relation: "Brother • (555) 987-6543" },
    ],
  },
};

type SectionProps = {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
};

function Section({ title, icon, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={hp("2%")} color="#1E73E8" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.halfCard}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.highlight}>{value}</Text>
    </View>
  );
}

function AllergyItem({ item }: { item: Allergy }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <View style={[styles.badge, { backgroundColor: `${item.color}20` }]}>
        <Text style={[styles.badgeText, { color: item.color }]}>{item.level}</Text>
      </View>
    </View>
  );
}

function DetailRow({ item }: { item: DetailItem }) {
  return (
    <View style={styles.conditionItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDesc}>{item.desc}</Text>
    </View>
  );
}

function ContactRow({ item }: { item: EmergencyContact }) {
  return (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.relation}</Text>
      </View>
      <TouchableOpacity style={styles.callBtn}>
        <Ionicons name="call" size={hp("2%")} color="#1E73E8" />
      </TouchableOpacity>
    </View>
  );
}

export default function MedicalProfileScreen() {
  const { medical_Id } = useLocalSearchParams<{ medical_Id?: string }>();
  const selectedId = Array.isArray(medical_Id) ? medical_Id[0] : medical_Id ?? "25";
  const profileData = MEDICAL_PROFILES[selectedId] ?? MEDICAL_PROFILES["25"];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={hp("2.6%")} />
        </TouchableOpacity>
        <Text style={styles.title}>Medical ID</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=15" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{profileData.name}</Text>
          <Text style={styles.updated}>LAST UPDATED: {profileData.lastUpdated}</Text>
        </View>
      </View>

      <View style={styles.rowCard}>
        <InfoCard label="BLOOD TYPE" value={profileData.bloodType} />
        <InfoCard label="ORGAN DONOR" value={profileData.organDonor} />
      </View>

      <Section title="ALLERGIES" icon="warning">
        {profileData.allergies.map((item) => (
          <AllergyItem key={item.name} item={item} />
        ))}
      </Section>

      <Section title="MEDICAL CONDITIONS" icon="medkit">
        {profileData.conditions.map((item) => (
          <DetailRow key={item.title} item={item} />
        ))}
      </Section>

      <Section title="CURRENT MEDICATIONS" icon="flask">
        {profileData.medications.map((item) => (
          <DetailRow key={item.title} item={item} />
        ))}
      </Section>

      <Section title="EMERGENCY CONTACTS" icon="call">
        {profileData.contacts.map((item) => (
          <ContactRow key={item.name} item={item} />
        ))}
      </Section>

      <View style={{ height: hp("8%") }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("5%"),
    backgroundColor: "#F3F4F6",
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  title: {
    fontSize: hp("2.6%"),
    fontWeight: "800",
    color: "#111827",
  },
  headerSpacer: {
    width: hp("2.6%"),
    height: hp("2.6%"),
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: wp("5%"),
    borderRadius: 20,
    marginBottom: hp("3%"),
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: hp("7%"),
    height: hp("7%"),
    borderRadius: 100,
    marginRight: wp("4%"),
  },
  name: {
    fontWeight: "700",
    fontSize: hp("2%"),
    color: "#111827",
  },
  updated: {
    fontSize: hp("1.3%"),
    color: "#9CA3AF",
    marginTop: 4,
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("3%"),
  },
  halfCard: {
    flex: 0.48,
    backgroundColor: "#E8F1FB",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 20,
    elevation: 2,
  },
  label: {
    fontSize: hp("1.3%"),
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: hp("0.8%"),
  },
  highlight: {
    fontSize: hp("2.6%"),
    fontWeight: "800",
    color: "#2563EB",
  },
  section: {
    marginBottom: hp("3%"),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  sectionTitle: {
    fontSize: hp("1.5%"),
    fontWeight: "700",
    color: "#6B7280",
    marginLeft: wp("2%"),
  },
  sectionBody: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("5%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  conditionItem: {
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemTitle: {
    fontWeight: "600",
    fontSize: hp("1.7%"),
    color: "#111827",
  },
  itemDesc: {
    fontSize: hp("1.3%"),
    color: "#6B7280",
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("0.6%"),
    borderRadius: 25,
  },
  badgeText: {
    fontSize: hp("1.2%"),
    fontWeight: "600",
  },
  callBtn: {
    backgroundColor: "#DBEAFE",
    padding: wp("3%"),
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
