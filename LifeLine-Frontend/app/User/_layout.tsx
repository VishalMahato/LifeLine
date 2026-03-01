import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Ionicons from "@expo/vector-icons/Ionicons";
import Dashboard from "./Dashboard";

import SOSActiveAIScreen from "../(global)/SOSActiveAIScreen";

import NearbyScreen from "./Nearby";
import Profile from "./Profile/Profile";
import RequestHelpScreen from "./Helper/HelperRequest";
import { useAppSelector } from "@/src/core/store";

const Tab = createBottomTabNavigator();

export default function Layout() {
  const role = useAppSelector((state) => state.auth.userData?.role);

  useEffect(() => {
    if (!role) {
      router.replace("/Login");
    }
  }, [role]);

  if (!role) {
    return null;
  }

  const isUserRole = role === "user";

  return (
    <Tab.Navigator
      initialRouteName={isUserRole ? "Dashboard" : "Helpers"}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}
    >
      {isUserRole && (
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
          }}
        />
      )}

      {isUserRole && (
        <Tab.Screen
          name="Nearby"
          component={NearbyScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="navigate" size={22} color={color} />
            ),
          }}
        />
      )}

      {/* CENTER BUTTON */}
      {isUserRole && (
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
      )}

      <Tab.Screen
        name="Helpers"
        component={RequestHelpScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
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
