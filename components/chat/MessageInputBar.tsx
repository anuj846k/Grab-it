import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { useChatContext } from '@/providers/ChatProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MessageInputBarProps {
  keyboardHeight: number;
}

export function MessageInputBar({ keyboardHeight }: MessageInputBarProps) {
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState<{
    uri: string;
    base64: string;
    mimeType: string;
  } | null>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const { conversation, isSending, isBlocked, sendMessage, broadcastTyping } =
    useChatContext();

  const isArchived = conversation?.status === 'archived';

  const handleSend = () => {
    if (!inputText.trim() && !image) return;
    sendMessage(inputText, image || undefined);
    setInputText('');
    setImage(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: false, // DO NOT request base64 to prevent JS bridge freezing
      allowsEditing: true,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    const asset = result.assets[0];
    setImage({
      uri: asset.uri,
      base64: '',
      mimeType: asset.mimeType || 'image/jpeg',
    });
  };

  const isMessageEmpty = !inputText.trim() && !image;

  return (
    <View
      style={[
        styles.inputBar,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
          marginBottom: keyboardHeight > 0 ? 0 : 30,
        },
      ]}
    >
      {isArchived ? (
        <View style={styles.archivedNotice}>
          <Ionicons
            name='lock-closed'
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={styles.archivedText}>
            This conversation has been archived
          </Text>
        </View>
      ) : isBlocked ? (
        <View style={styles.archivedNotice}>
          <Ionicons
            name='shield-half-outline'
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={styles.archivedText}>You have blocked this user</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <Pressable
                onPress={() => setImage(null)}
                style={styles.removeImageButton}
              >
                <Ionicons name='close' size={14} color='dimgray' />
              </Pressable>
            </View>
          )}

          <View style={styles.inputRow}>
            <Pressable
              style={styles.attachButton}
              onPress={handlePickImage}
              disabled={isSending}
            >
              <Ionicons
                name='image'
                size={24}
                color={isSending ? colors.onSurfaceVariant : colors.primary}
              />
            </Pressable>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                if (text.trim()) broadcastTyping();
              }}
              placeholder='Type something...'
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              maxLength={2000}
              onSubmitEditing={handleSend}
              blurOnSubmit
            />
            <Pressable
              style={[
                styles.sendButton,
                isMessageEmpty
                  ? styles.sendButtonDisabled
                  : styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={isMessageEmpty || isSending}
            >
              {isSending ? (
                <ActivityIndicator size='small' color='#ffffff' />
              ) : (
                <Ionicons
                  name='send'
                  size={18}
                  color={isMessageEmpty ? colors.onSurfaceVariant : '#ffffff'}
                />
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    backgroundColor: colors.surface,
  },
  inputContainer: {
    gap: 12,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    marginTop: 8,
    marginLeft: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F3F4F6',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  archivedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  archivedText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  attachButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 21,
  },
});
