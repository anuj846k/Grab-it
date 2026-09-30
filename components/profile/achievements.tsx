import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface AchievementProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  isOutlined?: boolean;
}

const ACHIEVEMENT_DATA: AchievementProps[] = [
  { title: 'First Giver', icon: 'trophy', color: '#059669', backgroundColor: '#E0F2F1' },
  { title: 'Community Helper', icon: 'people', color: '#059669', backgroundColor: '#E0F2F1' },
  { title: 'Super Donor', icon: 'diamond', color: '#059669', backgroundColor: '#E0F2F1' },
  { title: '50 Items Club', icon: 'lock-closed-outline', color: '#9CA3AF', backgroundColor: '#ffffff', isOutlined: true },
];

export function Achievements() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>
      <View style={styles.list}>
        {ACHIEVEMENT_DATA.map((achievement, index) => (
          <View 
            key={index} 
            style={[
              styles.pill, 
              { backgroundColor: achievement.backgroundColor },
              achievement.isOutlined && styles.outlinedPill
            ]}
          >
            <Ionicons name={achievement.icon} size={14} color={achievement.color} />
            <Text style={[styles.pillTitle, { color: achievement.isOutlined ? '#6B7280' : '#111827' }]}>
              {achievement.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAll: {
    fontFamily: fontFamily.label,
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  outlinedPill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillTitle: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: '600',
  },
});
