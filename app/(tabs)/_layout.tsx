import React from "react";
import { Tabs } from "expo-router";
import { Home, Search, BookmarkIcon, Settings } from "lucide-react-native";
import { useSettingsStore } from "@/store/settingsStore";
import { colors } from "@/constants/colors";
import { MiniPlayer } from "@/components/MiniPlayer";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.secondary,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Platform.select({
              ios: insets.bottom,
              default: 8,
            }),
            height: Platform.select({
              ios: 49 + insets.bottom,
              android: 56,
              web: 60,
              default: 60,
            }),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          },
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: "Categories",
            tabBarIcon: ({ color }) => <Search size={24} color={color} />,
            headerTitle: "Categories",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
            },
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color }) => <BookmarkIcon size={24} color={color} />,
            headerTitle: "Favorites",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
            headerTitle: "Settings",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
            },
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}