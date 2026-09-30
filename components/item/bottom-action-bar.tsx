import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface BottomActionBarProps {
  onMessage: () => void;
  onClaim: () => void;
  claimStatus?: string | null;
  isClaiming?: boolean;
  conversationId?: string | null;
}

export function BottomActionBar({ onMessage, onClaim, claimStatus, isClaiming, conversationId }: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom > 0 ? insets.bottom + 12 : 20;

  if (claimStatus === 'pending') {
    return (
      <View style={[styles.container, { paddingBottom }]}>
        <View style={styles.requestedButton}>
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.claimText}>Requested</Text>
        </View>
      </View>
    );
  }

  if (claimStatus === 'cancelled' || claimStatus === 'rejected') {
    return (
      <View style={[styles.container, { paddingBottom }]}>
        <View style={styles.cancelledButton}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          <Text style={styles.cancelledText}>
            {claimStatus === 'cancelled' ? 'Cancelled' : 'Declined'}
          </Text>
        </View>
      </View>
    );
  }

  if (conversationId) {
    return (
      <View style={[styles.container, { paddingBottom }]}>
        <Pressable style={styles.claimButton} onPress={onMessage}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#ffffff" />
          <Text style={styles.claimText}>Open Chat</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom }]}>
      <Pressable
        style={styles.claimButton}
        onPress={onClaim}
        disabled={isClaiming}
      >
        {isClaiming ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="hand-right-outline" size={20} color="#ffffff" />
            <Text style={styles.claimText}>Claim Item</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  messageButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  messageText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  claimButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  requestedButton: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHighest,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelledButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  claimText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cancelledText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
});
