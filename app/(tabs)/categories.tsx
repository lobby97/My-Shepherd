import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryCard } from '@/components/CategoryCard';
import { categories } from '@/mocks/categories';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';

export default function CategoriesScreen() {
  const router = useRouter();
  const { isDarkMode } = useSettingsStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const handleCategoryPress = (id: string) => {
    router.push(`/category/${id}`);
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => handleCategoryPress(category.id)}
          />
        ))}
      </View>
      
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 160, // Extra space for bigger mini player and tab bar
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  footer: {
    height: 20,
  },
});