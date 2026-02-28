import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";



const FooterCTASection = () => {
  return (
    <View style={styles.container}>
      {/* CTA */}
      <TouchableOpacity style={styles.ctaBtn}>
        <Text style={styles.ctaText}>Get LifeLine Free</Text>
        <Ionicons name="arrow-forward" size={hp("2.4%")} color="#fff" />
      </TouchableOpacity>

      {/* Links */}
      <View style={styles.linksRow}>
        <TouchableOpacity>
          <Text style={styles.link}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.link}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Social Links */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-facebook" size={hp("2.5%")} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-twitter" size={hp("2.5%")} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-instagram" size={hp("2.5%")} color="#E4405F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-linkedin" size={hp("2.5%")} color="#0077B5" />
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <Text style={styles.copyright}>
        © 2023 LifeLine Safety Inc. All rights reserved.
      </Text>

      {/* Trust Badge */}
      <View style={styles.trustContainer}>
        <Ionicons name="shield-checkmark" size={hp("2%")} color="#2F80ED" />
        <Text style={styles.trustText}>Trusted by millions worldwide</Text>
      </View>
    </View>
  );
};

export default FooterCTASection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp("6%"),
    marginTop: hp("7%"),
    paddingVertical: hp("4%"),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E6ED",
  },

  ctaBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: wp("3%"),
    backgroundColor: "#0A122A",
    borderRadius: hp("2%"),
    paddingVertical: hp("2%"),
    marginBottom: hp("3%"),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  ctaText: {
    fontSize: hp("2%"),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: wp("6%"),
    marginBottom: hp("3%"),
  },

  link: {
    fontSize: hp("1.7%"),
    color: "#2F80ED",
    fontWeight: "500",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp("4%"),
    marginBottom: hp("3%"),
  },

  socialBtn: {
    width: hp("5%"),
    height: hp("5%"),
    borderRadius: hp("2.5%"),
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  copyright: {
    textAlign: "center",
    fontSize: hp("1.5%"),
    color: "#8A94A6",
    marginBottom: hp("2%"),
  },

  trustContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: wp("2%"),
  },

  trustText: {
    fontSize: hp("1.4%"),
    color: "#5F6C7B",
    fontWeight: "600",
  },
});
