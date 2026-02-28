import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAppDispatch, useAppSelector } from "@/src/core/store";
import { clearError, loginUser } from "@/src/features/auth/authSlice";
import {
  loginSchema,
  validateForm,
} from "@/src/features/auth/validation/userInfoSchema";

const ROLE_ROUTE_MAP: Record<"user" | "helper", string> = {
  user: "/User/Dashboard",
  helper: "/User/Helper/HelperRequest",
};

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const handleLogin = async () => {
    setGlobalError("");
    setFieldErrors({});

    const normalizedEmail = email.trim().toLowerCase();
    const validationErrors = await validateForm(loginSchema, {
      email: normalizedEmail,
      password,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          email: normalizedEmail,
          password,
        }),
      ).unwrap();

      dispatch(clearError());

      const role = result.user?.role;
      if (role && ROLE_ROUTE_MAP[role]) {
        router.replace(ROLE_ROUTE_MAP[role]);
      } else {
        router.replace("/(main)/Home");
      }
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to login";
      setGlobalError(message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={hp("8%")} color="#2F80ED" />
        </View>

        {/* Header */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your safety network.</Text>

        {globalError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.globalErrorText}>{globalError}</Text>
          </View>
        ) : null}

        {/* Form Card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View
            style={[styles.inputWrapper, fieldErrors.email && styles.inputError]}
          >
            <Ionicons name="mail-outline" size={hp("2%")} color="#8A94A6" />
            <TextInput
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>
          {fieldErrors.email ? (
            <Text style={styles.errorText}>{fieldErrors.email}</Text>
          ) : null}

          {/* Password */}
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.inputWrapper, fieldErrors.password && styles.inputError]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={hp("2%")}
              color="#8A94A6"
            />
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              secureTextEntry
              style={styles.input}
            />
          </View>
          {fieldErrors.password ? (
            <Text style={styles.errorText}>{fieldErrors.password}</Text>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
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

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: wp("3%"),
    borderRadius: hp("1%"),
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  globalErrorText: {
    color: "#EF4444",
    marginLeft: wp("2%"),
    fontSize: hp("1.6%"),
    flex: 1,
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
    borderWidth: 1,
    borderColor: "transparent",
  },

  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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

  loginBtnDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: "#fff",
    fontSize: hp("2%"),
    fontWeight: "700",
  },

  errorText: {
    color: "#EF4444",
    fontSize: hp("1.4%"),
    marginTop: -hp("1.2%"),
    marginBottom: hp("1.6%"),
    marginLeft: wp("1%"),
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
