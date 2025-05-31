import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Category } from '@/types';
import { categoryColors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const { isDarkMode } = useSettingsStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  
  // @ts-ignore - TypeScript doesn't know about our dynamic keys
  const backgroundColor = categoryColors[category.name] || theme.primary;
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: cardWidth,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});