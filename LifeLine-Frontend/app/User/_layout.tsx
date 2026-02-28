import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import * as Speech from "expo-speech";
import React from "react";
import { StyleSheet, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import Dashboard from "./Dashboard";

import SOSActiveAIScreen from "../(global)/SOSActiveAIScreen";

import NearbyScreen from "./Nearby";
import Profile from "./Profile/Profile";
import MedicalProfile from "./Profile/MedicalProfile";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const speak = () => {
  const thingToSay =
    "Hii I am your AI assistant. I am here to help you. Please tell me how can I assist you?";
  Speech.speak(thingToSay, {
    language: "en",
    pitch: 1,
    rate: 1,
  });
};

export const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedicalProfile"
        component={MedicalProfile}
        options={{ headerTitle: "Medical Profile" }}
      />
    </Stack.Navigator>
  );
};

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Nearby"
        component={NearbyScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="navigate" size={22} color={color} />
          ),
        }}
      />

      {/* CENTER BUTTON */}
      <Tab.Screen
        name="SOS"
        component={SOSActiveAIScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            speak();
          },
        })}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.centerButton}>
              <Ionicons name="snow" size={28} color="#fff" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Safety"
        component={Profile} // Changed to ProfileStack
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield-checkmark" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: hp("9%"),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
    elevation: 10,
  },

  label: {
    fontSize: hp("1.2%"),
    marginBottom: hp("1%"),
  },

  centerButton: {
    width: hp("8%"),
    height: hp("8%"),
    borderRadius: 100,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("4%"), // lift above tab
    elevation: 8,
  },
});
