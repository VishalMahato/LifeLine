import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import Dashboard from "./Dashboard";

import SOSActiveAIScreen from "../(global)/SOSActiveAIScreen";

import NearbyScreen from "./Nearby";
import AccountDetails from "./Profile/AccountDetails";
import HistoryScreen from "./Profile/History";
import Profile from "./Profile/Profile";
import SavedAddress from "./Profile/SavedAddress";
import HelperProfileScreen from "./Helper/[helperId]";
import NgoProfileScreen from "./Helper/[ngoId]";
import RequestHelpScreen from "./Helper/HelperRequest";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Profile"
        component={Profile}
      />
      <Stack.Screen
        name="AccountDetails"
        component={AccountDetails}
      />
      <Stack.Screen
        name="SavedAddress"
        component={SavedAddress}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
};

export const HelperStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HelperRequest"
        component={RequestHelpScreen}
      />
      <Stack.Screen
        name="HelperProfile"
        component={HelperProfileScreen}
      />
      <Stack.Screen
        name="NgoProfile"
        component={NgoProfileScreen}
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
        listeners={() => ({
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            router.push("/(global)/SOSActiveAIScreen");
          },
        })}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.centerButton}>
              <Ionicons name="warning" size={28} color="#fff" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Helpers"
        component={HelperStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={22} color={color} />
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
