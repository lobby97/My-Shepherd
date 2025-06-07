import { AudioProvider } from "@/components/AudioProvider";
import { colors } from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { useSettingsStore } from "@/store/settingsStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-gesture-handler";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      // Don't throw the error - just log it and continue
      // The app can still function with system fonts
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      // Hide splash screen when fonts are loaded OR if there's an error
      // This prevents the app from being stuck on splash screen
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Don't block the app if fonts fail to load
  if (!loaded && !error) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <RootLayoutNav />
        </AudioProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerBackTitle: "Back",
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="quote/[id]"
          options={{
            title: "Quote",
            headerTransparent: true,
            headerTintColor: "#FFFFFF",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{
            title: "Category",
            headerBackTitle: "Categories",
          }}
        />
      </Stack>
    </>
  );
}
