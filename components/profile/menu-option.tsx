import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface MenuOptionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  destructive?: boolean;
  hideDivider?: boolean; // Keep prop for backward compatibility
  badge?: number;
}

export function MenuOption({ icon, title, onPress, destructive, badge }: MenuOptionProps) {
  const contentColor = destructive ? colors.error : colors.onSurface;
  const iconBackgroundColor = destructive 
    ? 'rgba(186, 26, 26, 0.06)' 
    : 'rgba(0, 108, 73, 0.06)';
  const iconColor = destructive ? colors.error : colors.primary;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        <View style={[styles.iconCircle, { backgroundColor: iconBackgroundColor }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.title, { color: contentColor }]}>{title}</Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outlineVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    fontWeight: '600',
  },
  badgePill: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.label,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
