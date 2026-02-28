import {
  checkEmailExists,
  clearError,
  setUserData,
} from "@/src/features/auth/authSlice";
import {
  existingUserSchema,
  validateForm,
} from "@/src/features/auth/validation";
import { useAppDispatch, useAppSelector } from "@/src/core/store";
import { filePicker } from "@/src/utils/filePicker.utils";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Alert,
  Image,
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

export interface UserInfoSubmitPayload {
  emailExists: boolean;
  formData: FormData;
  userData: {
    fullName: string;
    email: string;
    mobileNumber: string;
    role: "user" | "helper";
    profileImage?: string;
  };
}

export interface UserInfoHandle {
  handleSubmit: () => Promise<boolean>;
}

type UserInfoProps = {
  onSubmit?: (payload: UserInfoSubmitPayload) => Promise<void> | void;
};

const UserInfo = forwardRef<UserInfoHandle, UserInfoProps>(
  ({ onSubmit }, ref) => {
    const dispatch = useAppDispatch();
    const { emailExists, error, userData } = useAppSelector(
      (state) => state.auth,
    );
    const [role, setRole] = useState<"user" | "helper">("user");
    const [image, setImage] = useState<string | null>(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useImperativeHandle(ref, () => ({ handleSubmit }));

    useEffect(() => {
      return () => {
        dispatch(clearError());
      };
    }, [dispatch]);

    useEffect(() => {
      if (emailExists && userData) {
        setFullName(userData.fullName || "");
        setMobileNumber(userData.mobileNumber || "");
        setRole(userData.role || "user");
        if (userData.profileImage) {
          setImage(userData.profileImage);
        }
      }
    }, [emailExists, userData]);

    const handleImagePick = async () => {
      try {
        const result = await filePicker();
        if (!result.canceled && result.assets?.[0]?.uri) {
          setImage(result.assets[0].uri);
        }
      } catch (error) {
        Alert.alert("Unable to open gallery", String(error));
      }
    };

    const handleEmailBlur = async () => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return;
      }

      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
      if (!isEmailValid) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, email: "" }));
      await dispatch(checkEmailExists(normalizedEmail));
    };

    const handleSubmit = async () => {
      const normalizedValues = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobileNumber.trim(),
        role,
      };

      const formValues = { ...normalizedValues };
      const validationErrors = await validateForm(
        existingUserSchema,
        formValues,
      );
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return false;
      }

      dispatch(
        setUserData({
          fullName: normalizedValues.fullName,
          email: normalizedValues.email,
          mobileNumber: normalizedValues.mobileNumber,
          role: normalizedValues.role,
          profileImage: image || undefined,
        }),
      );

      const submitData = new FormData();
      submitData.append("name", normalizedValues.fullName);
      submitData.append("email", normalizedValues.email);
      submitData.append("phoneNumber", normalizedValues.mobileNumber);
      submitData.append("role", normalizedValues.role);

      if (image && !image.startsWith("http")) {
        const filename = image.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        submitData.append("profileImage", {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      try {
        if (onSubmit) {
          await onSubmit({
            emailExists,
            formData: submitData,
            userData: {
              ...normalizedValues,
              profileImage: image || undefined,
            },
          });
        }
      } catch (submissionError) {
        const message =
          typeof submissionError === "string"
            ? submissionError
            : "Please check your connection and try again.";
        Alert.alert("Unable to continue", message);
        return false;
      }

      return true;
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
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={handleImagePick}
          >
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
            <TextInput
              placeholder="e.g. Sarah Connor"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}

          {/* Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={hp("2%")} color="#8A94A6" />
            <TextInput
              placeholder="sarah@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              onBlur={handleEmailBlur}
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
          {emailExists && !errors.email ? (
            <Text style={styles.helperText}>
              This email is already registered. Continue to resume signup.
            </Text>
          ) : null}

          {/* Phone */}
          <Text style={styles.label}>MOBILE NUMBER</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={hp("2%")} color="#8A94A6" />
            <TextInput
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              style={styles.input}
              value={mobileNumber}
              onChangeText={(value) => {
                setMobileNumber(value);
                if (errors.mobileNumber) {
                  setErrors((prev) => ({ ...prev, mobileNumber: "" }));
                }
              }}
            />
          </View>
          {errors.mobileNumber ? (
            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
          ) : null}

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

          {errors.role ? (
            <Text style={styles.errorText}>{errors.role}</Text>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
    );
  },
);

UserInfo.displayName = "UserInfo";
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
    width: "100%",
    height: "100%",
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

  errorText: {
    color: "#D64545",
    fontSize: hp("1.3%"),
    marginTop: hp("0.6%"),
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
});
