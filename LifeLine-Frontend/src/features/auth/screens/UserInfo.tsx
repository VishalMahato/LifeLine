import { filePicker } from "@/src/utils/filePicker.utils";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";



const UserInfo = () => {
  const [role, setRole] = useState("user");
  const [image, setImage] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      const result = await filePicker();
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Unable to open gallery', String(error));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{"Let's get started"}</Text>
      <Text style={styles.subtitle}>
        Create your profile to join the safety network.
      </Text>

      {/* Profile Image */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity style={styles.avatarCircle} onPress={handleImagePick}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-outline" size={hp("3%")} color="#8A94A6" />
          )}
        </TouchableOpacity>

        <View style={styles.editIcon}>
          <Ionicons name="pencil" size={hp("1.6%")} color="#fff" />
        </View>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Full Name */}
        <Text style={styles.label}>FULL NAME</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={hp("2%")} color="#8A94A6" />
          <TextInput placeholder="e.g. Sarah Connor" style={styles.input} />
        </View>

        {/* Email */}
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={hp("2%")} color="#8A94A6" />
          <TextInput
            placeholder="sarah@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Phone */}
        <Text style={styles.label}>MOBILE NUMBER</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={hp("2%")} color="#8A94A6" />
          <TextInput
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <Text style={styles.helperText}>
          {"We'll send a code to verify this number"}
        </Text>

        {/* Role */}
        <Text style={styles.label}>How will you use LifeLine?</Text>

        <View style={styles.roleWrapper}>
          <TouchableOpacity
            style={[styles.roleCard, role === "user" && styles.roleActive]}
            onPress={() => setRole("user")}
          >
            <Ionicons
              name="person"
              size={hp("2.4%")}
              color={role === "user" ? "#2F80ED" : "#8A94A6"}
            />
            <Text style={styles.roleText}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, role === "helper" && styles.roleActive]}
            onPress={() => setRole("helper")}
          >
            <Ionicons
              name="heart"
              size={hp("2.4%")}
              color={role === "helper" ? "#2F80ED" : "#8A94A6"}
            />
            <Text style={styles.roleText}>Helper</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp("6%"),
    paddingTop: hp("4%"),
    height: "100%",
    marginTop: hp("5%"),
    backgroundColor: "#FAFAFA",
    flex: 1,
  },

  title: {
    fontSize: hp("2.8%"),
    fontWeight: "800",
    color: "#0A2540",
  },

  subtitle: {
    fontSize: hp("1.8%"),
    color: "#5F6C7B",
    marginBottom: hp("3%"),
  },

  avatarWrapper: {
    alignSelf: "center",
    marginBottom: hp("3%"),
  },

  avatarCircle: {
    width: hp("12%"),
    height: hp("12%"),
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#D0D5DD",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: hp("3.5%"),
    height: hp("3.5%"),
    borderRadius: 50,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    padding: wp("5%"),
    marginBottom: hp("3%"),
    elevation: 3,
  },

  label: {
    fontSize: hp("1.4%"),
    fontWeight: "700",
    color: "#8A94A6",
    marginTop: hp("1.8%"),
    marginBottom: hp("0.6%"),
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: hp("1%"),
    paddingHorizontal: wp("4%"),
    height: hp("5.5%"),
  },

  input: {
    flex: 1,
    marginLeft: wp("2%"),
    fontSize: hp("1.7%"),
  },

  helperText: {
    fontSize: hp("1.4%"),
    color: "#8A94A6",
    marginTop: hp("0.8%"),
  },

  roleWrapper: {
    flexDirection: "row",
    gap: wp("4%"),
    marginTop: hp("2%"),
  },

  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    borderRadius: hp("1.5%"),
    paddingVertical: hp("1.8%"),
    alignItems: "center",
    gap: hp("0.8%"),
  },

  roleActive: {
    borderColor: "#2F80ED",
    backgroundColor: "#EAF4FF",
  },

  roleText: {
    fontSize: hp("1.7%"),
    fontWeight: "600",
    color: "#0A2540",
  },

  primaryBtn: {
    backgroundColor: "#0B5ED7",
    paddingVertical: hp("1.8%"),
    borderRadius: hp("1.2%"),
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontSize: hp("2%"),
    fontWeight: "700",
  },

  terms: {
    textAlign: "center",
    fontSize: hp("1.4%"),
    color: "#8A94A6",
    marginTop: hp("2%"),
  },

  link: {
    color: "#2F80ED",
    fontWeight: "600",
  },
});
