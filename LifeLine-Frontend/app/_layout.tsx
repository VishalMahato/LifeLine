import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import Providers from "@/src/core/Providers";
import { ThemeProvider as AppThemeProvider } from "@/theme/ThemeContext";

export const unstable_settings = {
  anchor: "(main)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Providers>
      <AppThemeProvider>
        <NavigationThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="User" options={{ headerShown: false }} />
            <Stack.Screen name="(global)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </AppThemeProvider>
    </Providers>
  );
}
