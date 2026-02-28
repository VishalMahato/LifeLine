import Ionicons from "@expo/vector-icons/Ionicons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

type EmergencyContactForm = {
  id: number;
  name: string;
  relationship: string;
  phone: string;
  primary: boolean;
};

export type EmergencyContactsPayload = {
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
};

export type EmergencyContactsHandle = {
  handleSubmit: () => Promise<boolean>;
};

type Props = {
  onSubmit?: (data: EmergencyContactsPayload[]) => Promise<void> | void;
};

const RELATIONSHIP_VALUES = new Set([
  "parent",
  "spouse",
  "sibling",
  "child",
  "friend",
  "other",
]);

const RELATIONSHIP_ALIASES: Record<string, string> = {
  mom: "parent",
  mother: "parent",
  dad: "parent",
  father: "parent",
  husband: "spouse",
  wife: "spouse",
  partner: "spouse",
  boyfriend: "spouse",
  girlfriend: "spouse",
  brother: "sibling",
  sister: "sibling",
  son: "child",
  daughter: "child",
};

const normalizeRelationship = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  if (RELATIONSHIP_VALUES.has(normalized)) {
    return normalized;
  }

  return RELATIONSHIP_ALIASES[normalized] || "other";
};

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "").trim();

const EmergencyContactsScreen = forwardRef<EmergencyContactsHandle, Props>(
  ({ onSubmit }, ref) => {
    const [contacts, setContacts] = useState<EmergencyContactForm[]>([
      {
        id: 1,
        name: "",
        relationship: "",
        phone: "",
        primary: true,
      },
      {
        id: 2,
        name: "",
        relationship: "",
        phone: "",
        primary: false,
      },
    ]);
    const [errorMessage, setErrorMessage] = useState("");

    const togglePrimary = (id: number): void => {
      setContacts((prev) =>
        prev.map((c) => ({
          ...c,
          primary: c.id === id,
        })),
      );
    };

    const addContact = () => {
      setContacts((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: "",
          relationship: "",
          phone: "",
          primary: false,
        },
      ]);
      setErrorMessage("");
    };

    const removeContact = (id: number) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setErrorMessage("");
    };

    const updateContact = (
      id: number,
      field: "name" | "relationship" | "phone",
      value: string,
    ) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      );
      setErrorMessage("");
    };

    const handleSubmit = async () => {
      const nonEmptyContacts = contacts
        .map((contact) => ({
          ...contact,
          name: contact.name.trim(),
          relationship: contact.relationship.trim(),
          phone: contact.phone.trim(),
        }))
        .filter(
          (contact) =>
            contact.name.length > 0 ||
            contact.relationship.length > 0 ||
            contact.phone.length > 0,
        );

      if (nonEmptyContacts.length === 0) {
        setErrorMessage("Add at least one emergency contact to continue.");
        return false;
      }

      const hasIncompleteContact = nonEmptyContacts.some(
        (contact) =>
          contact.name.length === 0 ||
          contact.relationship.length === 0 ||
          contact.phone.length === 0,
      );

      if (hasIncompleteContact) {
        setErrorMessage(
          "Each emergency contact needs name, relationship, and phone number.",
        );
        return false;
      }

      const normalizedContacts = nonEmptyContacts.map((contact) => ({
        name: contact.name,
        relationship: normalizeRelationship(contact.relationship),
        phoneNumber: normalizePhone(contact.phone),
        isPrimary: contact.primary,
      }));

      const hasInvalidPhone = normalizedContacts.some(
        (contact) => contact.phoneNumber.length < 10,
      );
      if (hasInvalidPhone) {
        setErrorMessage("Enter a valid phone number with at least 10 digits.");
        return false;
      }

      const dedupedContacts = normalizedContacts.filter((contact, index, all) => {
        const key = `${contact.name.toLowerCase()}::${contact.phoneNumber}`;
        return all.findIndex((entry) => {
          const entryKey = `${entry.name.toLowerCase()}::${entry.phoneNumber}`;
          return entryKey === key;
        }) === index;
      });

      const primaryIndex = dedupedContacts.findIndex((contact) => contact.isPrimary);
      if (primaryIndex === -1 && dedupedContacts.length > 0) {
        dedupedContacts[0].isPrimary = true;
      }
      if (primaryIndex > -1) {
        dedupedContacts.forEach((contact, index) => {
          contact.isPrimary = index === primaryIndex;
        });
      }

      try {
        setErrorMessage("");
        await onSubmit?.(dedupedContacts);
        return true;
      } catch {
        setErrorMessage("Unable to save emergency contacts. Please try again.");
        return false;
      }
    };

    useImperativeHandle(ref, () => ({
      handleSubmit,
    }));

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="arrow-back" size={hp("2.5%")} />
          <Text style={styles.step}>STEP 2 OF 5</Text>
        </View>

        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>{"We'll alert these people if you activate SOS."}</Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={hp("1.9%")} color="#B3261E" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {contacts.map((item, index) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact {index + 1}</Text>
              <TouchableOpacity onPress={() => removeContact(item.id)}>
                <Ionicons name="trash-outline" size={hp("2%")} color="#8A94A6" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              placeholder="e.g. Sarah Jenkins"
              style={styles.input}
              value={item.name}
              onChangeText={(value) => updateContact(item.id, "name", value)}
            />

            <Text style={styles.label}>RELATIONSHIP</Text>
            <TextInput
              placeholder="parent, spouse, sibling, child, friend, other"
              style={styles.input}
              value={item.relationship}
              onChangeText={(value) => updateContact(item.id, "relationship", value)}
            />

            <Text style={styles.label}>PHONE</Text>
            <TextInput
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
              style={styles.input}
              value={item.phone}
              onChangeText={(value) => updateContact(item.id, "phone", value)}
            />

            <View style={styles.primaryRow}>
              <View style={styles.primaryLeft}>
                <Ionicons name="star" size={hp("2%")} color="#F5B301" />
                <Text style={styles.primaryText}>Primary contact</Text>
              </View>

              <Switch
                value={item.primary}
                onValueChange={() => togglePrimary(item.id)}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addContact}>
          <Ionicons name="add-circle-outline" size={hp("2.2%")} color="#2F80ED" />
          <Text style={styles.addText}>Add Another Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  },
);

EmergencyContactsScreen.displayName = "EmergencyContactsScreen";
export default EmergencyContactsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp("6%"),
    backgroundColor: "#FAFAFA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("4%"),
    marginTop: hp("3%"),
  },

  step: {
    fontSize: hp("1.4%"),
    color: "#2F80ED",
    fontWeight: "700",
  },

  title: {
    fontSize: hp("2.8%"),
    fontWeight: "800",
    marginTop: hp("2%"),
    color: "#0A2540",
  },

  subtitle: {
    fontSize: hp("1.8%"),
    color: "#5F6C7B",
    marginBottom: hp("2%"),
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    backgroundColor: "#FDECEA",
    borderRadius: hp("1.3%"),
    padding: wp("3%"),
    marginBottom: hp("2%"),
  },

  errorText: {
    color: "#B3261E",
    fontSize: hp("1.5%"),
    flex: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    padding: wp("5%"),
    marginBottom: hp("2.5%"),
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("1.5%"),
    alignItems: "center",
  },

  cardTitle: {
    fontSize: hp("2%"),
    fontWeight: "700",
    color: "#0A2540",
  },

  label: {
    fontSize: hp("1.3%"),
    color: "#8A94A6",
    fontWeight: "700",
    marginTop: hp("1.6%"),
    marginBottom: hp("0.6%"),
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: hp("1%"),
    paddingHorizontal: wp("4%"),
    height: hp("5.5%"),
    fontSize: hp("1.7%"),
  },

  primaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp("2%"),
  },

  primaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
  },

  primaryText: {
    fontSize: hp("1.7%"),
    fontWeight: "600",
    color: "#0A2540",
  },

  addBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: wp("2%"),
    borderWidth: 1,
    borderColor: "#2F80ED",
    borderStyle: "dashed",
    borderRadius: hp("1.5%"),
    paddingVertical: hp("1.6%"),
    marginBottom: hp("3%"),
  },

  addText: {
    fontSize: hp("1.8%"),
    fontWeight: "600",
    color: "#2F80ED",
  },
});
