import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
  trustScore: number;
  bio: string;
  onEditPress?: () => void;
}

export function ProfileHeader({ name, avatarUrl, trustScore, bio, onEditPress }: ProfileHeaderProps) {
  return (
    <LinearGradient
      colors={['#e8f5e9', '#f9f9ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Pressable onPress={onEditPress} style={styles.avatarContainer}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatar} 
          contentFit="cover" 
        />
        <View style={styles.editBadge}>
          <Ionicons name="pencil" size={14} color="#ffffff" />
        </View>
      </Pressable>
      
      <Text style={styles.name}>{name}</Text>
      
      <View style={styles.trustBadge}>
        <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
        <Text style={styles.trustBadgeText}>{trustScore}% Trust Score</Text>
      </View>
      
      <Text style={[styles.bio, !bio && styles.placeholderBio]}>
        {bio || 'Add a description by editing profile'}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: colors.surfaceContainer,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trustBadgeText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  placeholderBio: {
    fontStyle: 'italic',
    color: colors.outline,
  },
});
