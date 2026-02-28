import { Link } from "expo-router";
import React, { useState } from "react";
import {
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

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log({ email, password });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={hp("8%")} color="#2F80ED" />
        </View>

        {/* Header */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your safety network.</Text>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={hp("2%")} color="#8A94A6" />
            <TextInput
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={hp("2%")}
              color="#8A94A6"
            />
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-google" size={hp("2.2%")} />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
            <Ionicons name="logo-apple" size={hp("2.2%")} />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Signup */}
        <Link href="/SignUp" style={styles.footerText}>
          Don’t have an account? <Text style={styles.signup}>Sign Up</Text>
        </Link>

        {/* Trust Note */}
        <Text style={styles.trust}>
          TRUSTED BY MEDICAL PROFESSIONALS WORLDWIDE
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: hp("5%"),
    backgroundColor: "#FAFAFA",
  },

  container: {
    width: wp("100%"),
    overflow: "hidden",
    paddingHorizontal: wp("6%"),
    backgroundColor: "#FAFAFA",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },

  title: {
    textAlign: "center",
    fontSize: hp("3%"),
    fontWeight: "800",
    color: "#0A2540",
  },

  subtitle: {
    textAlign: "center",
    fontSize: hp("1.8%"),
    color: "#5F6C7B",
    marginBottom: hp("3%"),
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    padding: wp("5%"),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: hp("3%"),
  },

  label: {
    fontSize: hp("1.3%"),
    fontWeight: "700",
    color: "#8A94A6",
    marginBottom: hp("0.6%"),
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: hp("1%"),
    paddingHorizontal: wp("4%"),
    height: hp("5.6%"),
    marginBottom: hp("1.6%"),
  },

  input: {
    flex: 1,
    marginLeft: wp("2%"),
    fontSize: hp("1.7%"),
  },

  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgot: {
    fontSize: hp("1.4%"),
    color: "#2F80ED",
    fontWeight: "600",
  },

  loginBtn: {
    backgroundColor: "#0B5ED7",
    borderRadius: hp("1.2%"),
    paddingVertical: hp("1.7%"),
    alignItems: "center",
    marginTop: hp("1%"),
  },

  loginText: {
    color: "#fff",
    fontSize: hp("2%"),
    fontWeight: "700",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp("3%"),
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E6ED",
  },

  dividerText: {
    marginHorizontal: wp("3%"),
    fontSize: hp("1.3%"),
    color: "#8A94A6",
    fontWeight: "700",
  },

  socialRow: {
    flexDirection: "row",
    gap: wp("4%"),
    marginBottom: hp("3%"),
  },

  socialBtn: {
    flex: 1,
    flexDirection: "row",
    gap: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E6ED",
    borderRadius: hp("1.5%"),
    paddingVertical: hp("1.6%"),
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  socialText: {
    fontSize: hp("1.7%"),
    fontWeight: "600",
  },

  footerText: {
    textAlign: "center",
    fontSize: hp("1.6%"),
    color: "#5F6C7B",
  },

  signup: {
    color: "#2F80ED",
    fontWeight: "700",
  },

  trust: {
    textAlign: "center",
    fontSize: hp("1.2%"),
    color: "#8A94A6",
    marginTop: hp("3%"),
    letterSpacing: 1,
  },
});
