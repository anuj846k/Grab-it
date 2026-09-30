import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

export default function ClaimSuccessScreen() {
  const router = useRouter();
  const handleClose = () => {
    router.back();
  };

  const handleViewItem = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Claim Success</Text>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name='close' size={20} color={colors.onSurface} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name='checkmark' size={32} color='#00C27C' />
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>Request Sent!</Text>
        <Text style={styles.description}>
          Great news! We&apos;ve let the owner know you&apos;re interested.
          You&apos;ll be able to message them once they accept.
        </Text>

        {/* Next Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Next Steps</Text>

          <View style={styles.stepRow}>
            <View style={styles.stepIconContainer}>
              <Ionicons name='map-outline' size={20} color='#00C27C' />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepHeading}>Arrange pickup</Text>
              <Text style={styles.stepSubtext}>
                Agree on a time and safe location with the owner.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepIconContainer}>
              <Ionicons
                name='checkmark-circle-outline'
                size={20}
                color='#00C27C'
              />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepHeading}>Confirm received</Text>
              <Text style={styles.stepSubtext}>
                Mark as completed in the app once you have the item.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <View style={[styles.primaryButton, { backgroundColor: '#E8F8F2' }]}>
          <Ionicons
            name='checkmark-circle'
            size={20}
            color='#00C27C'
            style={styles.buttonIcon}
          />
          <Text style={[styles.primaryButtonText, { color: '#00C27C' }]}>
            Requested
          </Text>
        </View>

        <Pressable style={styles.secondaryButton} onPress={handleViewItem}>
          <Text style={styles.secondaryButtonText}>View Item Details</Text>
        </Pressable>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 16,
    color: '#000000',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.headlineMd,
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  stepsContainer: {
    backgroundColor: 'transparent',
  },
  stepsTitle: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 18,
    color: '#000000',
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepHeading: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
  },
  stepSubtext: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#00C27C',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    color: '#333333',
  },
});
