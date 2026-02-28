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
import Ionicons from "@expo/vector-icons/Ionicons";

const MedicalProfile = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Medical ID</Text>
        <TouchableOpacity>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=15" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>Johnathan Doe</Text>
          <Text style={styles.updated}>LAST UPDATED OCT 24, 2023</Text>
        </View>
      </View>

      {/* Blood + Donor */}
      <View style={styles.rowCard}>
        <View style={styles.halfCard}>
          <Text style={styles.label}>BLOOD TYPE</Text>
          <Text style={styles.highlight}>A+</Text>
        </View>

        <View style={styles.halfCard}>
          <Text style={styles.label}>ORGAN DONOR</Text>
          <Text style={styles.highlight}>Yes</Text>
        </View>
      </View>

      {/* Allergies */}
      <Section title="ALLERGIES" icon="warning">
        <AllergyItem name="Penicillin" level="Severe" color="#EF4444" />
        <AllergyItem name="Peanuts" level="Moderate" color="#F59E0B" />
      </Section>

      {/* Medical Conditions */}
      <Section title="MEDICAL CONDITIONS" icon="medkit">
        <ConditionItem
          title="Type 1 Diabetes"
          desc="Uses insulin pump for last 8 years"
        />
        <ConditionItem
          title="Mild Asthma"
          desc="Seasonal triggers, inhaler used as needed"
        />
      </Section>

      {/* Current Medications */}
      <Section title="CURRENT MEDICATIONS" icon="flask">
        <ConditionItem
          title="Insulin Aspart (Novolog)"
          desc="Dosage: 5 units before meals"
        />
        <ConditionItem
          title="Albuterol Inhaler"
          desc="Dosage: 2 puffs as needed for SOB"
        />
      </Section>

      {/* Emergency Contacts */}
      <Section title="EMERGENCY CONTACTS" icon="call">
        <ContactItem name="Sarah Doe" relation="Spouse • (555) 012-3456" />
        <ContactItem name="Michael Chen" relation="Brother • (555) 987-6543" />
      </Section>
    </ScrollView>
  );
};

export default MedicalProfile;

const Section = ({ title, icon, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={hp("2%")} color="#1E73E8" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const AllergyItem = ({ name, level, color }: any) => (
  <View style={styles.listItem}>
    <Text style={styles.itemTitle}>{name}</Text>
    <View style={[styles.badge, { backgroundColor: color + "20" }]}>
      <Text style={[styles.badgeText, { color }]}>{level}</Text>
    </View>
  </View>
);

const ConditionItem = ({ title, desc }: any) => (
  <View style={styles.conditionItem}>
    <Text style={styles.itemTitle}>{title}</Text>
    <Text style={styles.itemDesc}>{desc}</Text>
  </View>
);

const ContactItem = ({ name, relation }: any) => (
  <View style={styles.listItem}>
    <View>
      <Text style={styles.itemTitle}>{name}</Text>
      <Text style={styles.itemDesc}>{relation}</Text>
    </View>
    <TouchableOpacity style={styles.callBtn}>
      <Ionicons name="call" size={hp("2%")} color="#1E73E8" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
  },

  title: {
    fontSize: hp("2.4%"),
    fontWeight: "800",
  },

  edit: {
    color: "#1E73E8",
    fontWeight: "600",
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("4%"),
    backgroundColor: "#fff",
    padding: wp("4%"),
    borderRadius: 14,
    marginBottom: hp("2%"),
  },

  avatar: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: 50,
  },

  name: {
    fontWeight: "700",
  },

  updated: {
    fontSize: hp("1.2%"),
    color: "#9CA3AF",
  },

  rowCard: {
    flexDirection: "row",
    gap: wp("4%"),
    marginBottom: hp("2%"),
  },

  halfCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: wp("4%"),
    borderRadius: 14,
  },

  label: {
    fontSize: hp("1.2%"),
    color: "#9CA3AF",
    marginBottom: hp("0.5%"),
  },

  highlight: {
    fontSize: hp("2.2%"),
    fontWeight: "800",
    color: "#1E73E8",
  },

  section: {
    marginBottom: hp("2%"),
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    marginBottom: hp("1%"),
  },

  sectionTitle: {
    fontSize: hp("1.3%"),
    fontWeight: "700",
    color: "#6B7280",
  },

  sectionBody: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: wp("4%"),
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },

  conditionItem: {
    marginBottom: hp("1.5%"),
  },

  itemTitle: {
    fontWeight: "600",
  },

  itemDesc: {
    fontSize: hp("1.3%"),
    color: "#6B7280",
  },

  badge: {
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.4%"),
    borderRadius: 20,
  },

  badgeText: {
    fontSize: hp("1.2%"),
    fontWeight: "600",
  },

  callBtn: {
    backgroundColor: "#E0F2FE",
    padding: wp("2%"),
    borderRadius: 20,
  },
});
