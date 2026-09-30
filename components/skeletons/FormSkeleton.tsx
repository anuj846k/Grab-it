import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBase } from './SkeletonBase';
import { colors } from '@/constants/theme';

interface FormSkeletonProps {
  isProfile?: boolean;
}

export function FormSkeleton({ isProfile = false }: FormSkeletonProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isProfile ? (
          /* Edit Profile Layout */
          <View style={styles.avatarSection}>
            <SkeletonBase width={100} height={100} borderRadius={50} />
            <SkeletonBase
              width={120}
              height={14}
              borderRadius={4}
              style={styles.avatarHint}
            />
          </View>
        ) : (
          /* Edit Listing Layout */
          <View style={styles.photoUploadSection}>
            <SkeletonBase width={100} height={100} borderRadius={16} />
            <View style={styles.photoUploadText}>
              <SkeletonBase width={150} height={16} borderRadius={4} />
              <SkeletonBase
                width={100}
                height={12}
                borderRadius={4}
                style={styles.photoSub}
              />
            </View>
          </View>
        )}

        {/* Input fields */}
        <View style={styles.formFields}>
          {Array.from({ length: isProfile ? 3 : 5 }).map((_, index) => (
            <View key={index} style={styles.fieldContainer}>
              <SkeletonBase width={60} height={14} borderRadius={4} style={styles.label} />
              <SkeletonBase
                width="100%"
                height={index === 3 && !isProfile ? 100 : 54}
                borderRadius={12}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <SkeletonBase width="100%" height={54} borderRadius={27} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarHint: {
    marginTop: 12,
  },
  photoUploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  photoUploadText: {
    flex: 1,
  },
  photoSub: {
    marginTop: 8,
  },
  formFields: {
    gap: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: colors.surfaceVariant,
  },
});
