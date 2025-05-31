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
            borderTopWidth: 1,
            paddingTop: 12,
            paddingBottom: Platform.select({
              ios: insets.bottom + 12,
              default: 16,
            }),
            paddingHorizontal: 8,
            height: Platform.select({
              ios: 80 + insets.bottom,
              android: 80,
              web: 85,
              default: 85,
            }),
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color, focused }) => (
              <Home 
                size={focused ? 32 : 28} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: "Categories",
            tabBarIcon: ({ color, focused }) => (
              <Search 
                size={focused ? 32 : 28} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
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
            tabBarIcon: ({ color, focused }) => (
              <BookmarkIcon 
                size={focused ? 32 : 28} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
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
            tabBarIcon: ({ color, focused }) => (
              <Settings 
                size={focused ? 32 : 28} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
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