import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '@/types/listing';
import { CATEGORIES } from '@/utils/demo-data';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

const CATEGORY_ICONS: Record<string, string> = {
  'All': 'layers-outline',
  'Furniture': 'bed-outline',
  'Electronics': 'phone-portrait-outline',
  'Clothing & Shoes': 'shirt-outline',
  'Books & Media': 'book-outline',
  'Home & Kitchen': 'restaurant-outline',
  'Plants & Garden': 'leaf-outline',
  'Toys & Games': 'game-controller-outline',
  'Other': 'grid-outline',
};

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category;
        const gradientColors = (isSelected 
          ? ['#008b5e', '#006c49'] 
          : ['#ffffff', '#e6f4ee']) as [string, string];

        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            style={styles.pillWrapper}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.pill}
            >
              <Ionicons 
                name={(CATEGORY_ICONS[category] || 'cube-outline') as any} 
                size={14} 
                color={isSelected ? colors.onPrimary : colors.primary} 
              />
              <Text 
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected
                ]}
              >
                {category}
              </Text>
            </LinearGradient>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  pillWrapper: {
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 8,
  },
  pillText: {
    fontFamily: fontFamily.label,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: colors.onPrimary,
  },
  pillTextUnselected: {
    color: colors.onSurface,
  },
});
