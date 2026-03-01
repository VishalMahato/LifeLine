import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
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
import { useAppDispatch, useAppSelector } from "@/src/core/store";
import { fetchMedicalInfo } from "@/src/features/auth/medicalSlice";

type AllergyItem = {
  substance?: string;
  severity?: string;
};

type ConditionItem = {
  name?: string;
  status?: string;
  notes?: string;
};

type MedicationItem = {
  name?: string;
  dosage?: string;
  frequency?: string;
};

type EmergencyContactItem = {
  fullName?: string;
  relation?: string;
  phoneNumber?: string;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

const asString = (value: unknown, fallback = "-") => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
};

const asArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
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

function EmptyState({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

export default function MedicalProfileScreen() {
  const dispatch = useAppDispatch();

  const { medical_Id } = useLocalSearchParams<{ medical_Id?: string }>();
  const selectedId = Array.isArray(medical_Id) ? medical_Id[0] : medical_Id;

  const { userData, userId, authId } = useAppSelector((state) => state.auth);
  const { medicalInfo, isLoading, error } = useAppSelector((state) => state.medical);

  const medicalLookupId = selectedId || userId || authId || "";

  useEffect(() => {
    if (!medicalLookupId) {
      return;
    }

    void dispatch(fetchMedicalInfo(medicalLookupId));
  }, [dispatch, medicalLookupId]);

  const record = asRecord(medicalInfo) ?? {};

  const bloodType = asString(record.bloodType);
  const organDonor = typeof record.organDonor === "boolean"
    ? record.organDonor
      ? "Yes"
      : "No"
    : "-";

  const allergies = asArray<AllergyItem>(record.allergies);
  const conditions = asArray<ConditionItem>(record.conditions);
  const medications = asArray<MedicationItem>(record.medications);
  const contacts = asArray<EmergencyContactItem>(record.emergencyContacts);

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
          source={{
            uri:
              userData?.profileImage ||
              "https://i.pravatar.cc/150?img=15",
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{userData?.fullName || "LifeLine User"}</Text>
          <Text style={styles.updated}>{userData?.mobileNumber || "No phone added"}</Text>
        </View>
      </View>

      {isLoading && !medicalInfo ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loaderText}>Loading medical profile...</Text>
        </View>
      ) : null}

      {error && !medicalInfo ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          {medicalLookupId ? (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                void dispatch(fetchMedicalInfo(medicalLookupId));
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View style={styles.rowCard}>
        <InfoCard label="BLOOD TYPE" value={bloodType} />
        <InfoCard label="ORGAN DONOR" value={organDonor} />
      </View>

      <Section title="ALLERGIES" icon="warning">
        {allergies.length ? (
          allergies.map((item, index) => (
            <View key={`${item.substance || "allergy"}-${index}`} style={styles.listItem}>
              <Text style={styles.itemTitle}>{asString(item.substance, "Unknown Allergy")}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{asString(item.severity, "unspecified")}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState text="No allergies recorded" />
        )}
      </Section>

      <Section title="MEDICAL CONDITIONS" icon="medkit">
        {conditions.length ? (
          conditions.map((item, index) => (
            <View key={`${item.name || "condition"}-${index}`} style={styles.conditionItem}>
              <Text style={styles.itemTitle}>{asString(item.name, "Unknown Condition")}</Text>
              <Text style={styles.itemDesc}>
                {[item.status, item.notes].filter(Boolean).join(" • ") || "No notes"}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState text="No conditions recorded" />
        )}
      </Section>

      <Section title="CURRENT MEDICATIONS" icon="flask">
        {medications.length ? (
          medications.map((item, index) => (
            <View key={`${item.name || "medication"}-${index}`} style={styles.conditionItem}>
              <Text style={styles.itemTitle}>{asString(item.name, "Unknown Medication")}</Text>
              <Text style={styles.itemDesc}>
                {[item.dosage, item.frequency].filter(Boolean).join(" • ") || "No dosage notes"}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState text="No medications recorded" />
        )}
      </Section>

      <Section title="EMERGENCY CONTACTS" icon="call">
        {contacts.length ? (
          contacts.map((item, index) => (
            <View key={`${item.fullName || "contact"}-${index}`} style={styles.listItem}>
              <View style={styles.contactLeft}>
                <Text style={styles.itemTitle}>{asString(item.fullName, "Unnamed Contact")}</Text>
                <Text style={styles.itemDesc}>
                  {[item.relation, item.phoneNumber].filter(Boolean).join(" • ") ||
                    "No details"}
                </Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={hp("2%")} color="#1E73E8" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <EmptyState text="No emergency contacts recorded" />
        )}
      </Section>

      <View style={styles.footerSpacer} />
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
  loaderWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: hp("2%"),
    marginBottom: hp("2%"),
    alignItems: "center",
  },
  loaderText: {
    marginTop: hp("1%"),
    color: "#475569",
    fontSize: hp("1.5%"),
  },
  errorWrap: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 16,
    padding: wp("4%"),
    marginBottom: hp("2%"),
  },
  errorText: {
    color: "#B91C1C",
    fontSize: hp("1.5%"),
    fontWeight: "600",
  },
  retryButton: {
    marginTop: hp("1.5%"),
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("0.8%"),
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: hp("1.4%"),
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
    fontSize: hp("2.2%"),
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
  contactLeft: {
    flex: 1,
    marginRight: wp("3%"),
  },
  conditionItem: {
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  itemDesc: {
    marginTop: 3,
    fontSize: hp("1.4%"),
    color: "#6B7280",
    lineHeight: hp("2.1%"),
  },
  badge: {
    backgroundColor: "#FEE2E2",
    borderRadius: 999,
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.5%"),
  },
  badgeText: {
    color: "#B91C1C",
    fontSize: hp("1.3%"),
    fontWeight: "700",
    textTransform: "capitalize",
  },
  callBtn: {
    backgroundColor: "#EFF6FF",
    borderRadius: 30,
    padding: hp("1.2%"),
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: hp("1.5%"),
    fontWeight: "500",
  },
  footerSpacer: {
    height: hp("8%"),
  },
});
