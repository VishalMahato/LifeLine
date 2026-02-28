import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useRef } from "react";
import { router } from "expo-router";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import UserInfo, {
  type UserInfoHandle,
  type UserInfoSubmitPayload,
} from "@/src/features/auth/screens/UserInfo";
import EmergencyContactsScreen, {
  type EmergencyContactsHandle,
  type EmergencyContactsPayload,
} from "@/src/features/auth/screens/EmergencyContacts";
import VerifySkillsScreen from "@/src/features/auth/screens/VerifySkillsScreen";
import MedicalInfoScreen, {
  type MedicalInfoHandle,
} from "@/src/features/auth/screens/MedicalInfoScreen";
import SecureLocationScreen, {
  type SecureLocationPayload,
  type SecureLocationScreenHandle,
} from "@/src/features/auth/screens/SecureLocationScreen";
import {
  createUserAuth,
  updateSignupEmergencyContacts,
} from "@/src/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/src/core/store";

const userSignUpSteps = [
  {
    id: 1,
    Element: <UserInfo />,
  },
  {
    id: 2,
    Element: <EmergencyContactsScreen />,
  },
  {
    id: 3,
    Element: <MedicalInfoScreen />,
  },
  {
    id: 4,
    Element: <SecureLocationScreen />,
  },
];

const helperSignUpSteps = [
  {
    id: 1,
    Element: <UserInfo />,
  },
  {
    id: 2,
    Element: <VerifySkillsScreen />,
  },
  {
    id: 3,
    Element: <SecureLocationScreen />,
  },
];

const SignUp = () => {
  const dispatch = useAppDispatch();
  const { isLoading, userData, authId } = useAppSelector((state) => state.auth);
  const isSavingMedical = useAppSelector((state) => state.medical.isSaving);
  const [currentRole, setCurrentRole] = React.useState<
    "user" | "helper" | null
  >(userData?.role || null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const userInfoRef = useRef<UserInfoHandle>(null);
  const emergencyContactsRef = useRef<EmergencyContactsHandle>(null);
  const medicalInfoRef = useRef<MedicalInfoHandle>(null);
  const secureLocationRef = useRef<SecureLocationScreenHandle>(null);
  const currentSteps =
    currentRole === "helper" ? helperSignUpSteps : userSignUpSteps;
  const isLastStep = currentStep === currentSteps.length - 1;

  const goToNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleUserInfoSubmit = async (payload: UserInfoSubmitPayload) => {
    setCurrentRole(payload.userData.role);
    if (!payload.emailExists) {
      await dispatch(createUserAuth(payload.formData)).unwrap();
    }
    setCurrentStep(1);
  };

  const handleEmergencyContactsSubmit = async (
    contacts: EmergencyContactsPayload[],
  ) => {
    if (!authId) {
      throw new Error("Signup session was not found. Please restart signup.");
    }

    await dispatch(
      updateSignupEmergencyContacts({
        authId,
        emergencyContacts: contacts,
      }),
    ).unwrap();
  };

  const handleSecureLocationSubmit = async (_payload: SecureLocationPayload) => {
    const nextRoute =
      currentRole === "helper" ? "/HelperAccountReady" : "/AccountReady";
    router.replace(nextRoute as "/HelperAccountReady" | "/AccountReady");
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!userInfoRef.current) {
        return;
      }

      const success = await userInfoRef.current.handleSubmit();
      if (!success) {
        return;
      }

      return;
    }

    if (currentRole === "user" && currentStep === 1) {
      if (!emergencyContactsRef.current) {
        return;
      }

      const success = await emergencyContactsRef.current.handleSubmit();
      if (!success) {
        return;
      }
    }

    if (currentRole === "user" && currentStep === 2) {
      if (!medicalInfoRef.current) {
        return;
      }

      const success = await medicalInfoRef.current.handleSubmit();
      if (!success) {
        return;
      }
    }

    if (isLastStep) {
      if (!secureLocationRef.current) {
        return;
      }

      const success = await secureLocationRef.current.handleSubmit();
      if (!success) {
        return;
      }
      return;
    }

    goToNextStep();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {currentStep === 0 ? (
        <UserInfo ref={userInfoRef} onSubmit={handleUserInfoSubmit} />
      ) : currentRole === "user" && currentStep === 1 ? (
        <EmergencyContactsScreen
          ref={emergencyContactsRef}
          onSubmit={handleEmergencyContactsSubmit}
        />
      ) : currentRole === "user" && currentStep === 2 ? (
        <MedicalInfoScreen ref={medicalInfoRef} />
      ) : isLastStep ? (
        <SecureLocationScreen
          ref={secureLocationRef}
          onSubmit={handleSecureLocationSubmit}
        />
      ) : (
        currentSteps[currentStep].Element
      )}

      <View style={[styles.footer, isLastStep && styles.footerLastStep]}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, currentStep === 0 && styles.nextBtnFull]}
          onPress={handleNext}
          disabled={isLoading || isSavingMedical}
        >
          <Text style={styles.nextText}>
            {((currentStep === 0 && isLoading) || isSavingMedical)
              ? "Saving..."
              : isLastStep
                ? "Finish Setup →"
                : "Next Step →"}
          </Text>
        </TouchableOpacity>
      </View>

      {currentStep === 0 && (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/Login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SignUp;

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
    marginBottom: hp("3%"),
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

  footer: {
    backgroundColor: "#fff",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
    marginBottom: hp("4%"),
  },

  footerLastStep: {
    justifyContent: "flex-start",
  },

  backBtn: {
    width: "30%",
    borderWidth: 1,
    borderColor: "#E0E6ED",
    borderRadius: hp("1.2%"),
    alignItems: "center",
    paddingVertical: hp("1.5%"),
  },

  backText: {
    fontWeight: "600",
    color: "#0A2540",
  },

  nextBtn: {
    width: "65%",
    backgroundColor: "#0B5ED7",
    borderRadius: hp("1.2%"),
    alignItems: "center",
    paddingVertical: hp("1.6%"),
  },

  nextBtnFull: {
    width: "100%",
  },

  nextText: {
    color: "#fff",
    fontSize: hp("1.9%"),
    fontWeight: "700",
  },

  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("2%"),
    marginBottom: hp("4%"),
  },

  loginPromptText: {
    fontSize: hp("1.6%"),
    color: "#5F6C7B",
  },

  loginLink: {
    fontSize: hp("1.6%"),
    color: "#2F80ED",
    fontWeight: "600",
  },
});
