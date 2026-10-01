import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { AppAlert } from '@/components/ui/AppAlert';

export interface PhotoData {
  uri: string;
  base64?: string;
  type?: string;
}

interface PhotoUploadProps {
  images: PhotoData[];
  onAddImages: (newImages: PhotoData[]) => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
}

export function PhotoUpload({ images, onAddImages, onRemoveImage, maxImages = 5 }: PhotoUploadProps) {
  
  const takePhoto = async () => {
    if (images.length >= maxImages) {
      AppAlert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      AppAlert.alert('Permission needed', 'We need camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const selected = result.assets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64 || undefined,
        type: asset.mimeType || 'image/jpeg'
      }));
      onAddImages(selected);
    }
  };

  const pickImages = async () => {
    if (images.length >= maxImages) {
      AppAlert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      AppAlert.alert('Permission needed', 'We need access to your camera roll to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const selected = result.assets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64 || undefined,
        type: asset.mimeType || 'image/jpeg'
      }));
      onAddImages(selected);
    }
  };

  const handleUploadPress = () => {
    AppAlert.alert('Add Photo', 'Choose how you want to add a photo', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImages },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          Photos<Text style={styles.requiredAsterisk}> *</Text>
        </Text>
        <Text style={styles.counter}>{images.length}/{maxImages}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, images.length === 0 && styles.scrollContentEmpty]}
      >
        {images.map((img, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: img.uri }}
              style={styles.image}
              contentFit="cover"
            />
            {/* First image badge */}
            {index === 0 && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>
            )}
            <Pressable
              style={styles.removeButton}
              onPress={() => onRemoveImage(index)}
            >
              <Ionicons name="close" size={14} color="#ffffff" />
            </Pressable>
          </View>
        ))}

        {images.length < maxImages && (
          <Pressable
            style={[styles.uploadBox, images.length > 0 && styles.uploadBoxSmall]}
            onPress={handleUploadPress}
          >
            <View style={[styles.iconCircle, images.length > 0 && styles.iconCircleSmall]}>
              <Ionicons name="camera" size={images.length > 0 ? 20 : 28} color={colors.primary} />
            </View>
            {images.length === 0 && (
              <>
                <Text style={styles.title}>Add Photos</Text>
                <Text style={styles.subtitle}>Tap to upload · Up to {maxImages} images</Text>
              </>
            )}
          </Pressable>
        )}
      </ScrollView>

      {images.length === 0 && (
        <Text style={styles.hint}>Good photos get more responses</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  requiredAsterisk: {
    color: colors.error,
    fontWeight: 'bold',
  },
  counter: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  scrollContent: {
    gap: 12,
  },
  scrollContentEmpty: {
    flex: 1,
  },
  uploadBox: {
    width: '100%',
    minWidth: 300,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadBoxSmall: {
    minWidth: 96,
    width: 96,
    height: 96,
    paddingVertical: 0,
    paddingHorizontal: 0,
    gap: 0,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  imageContainer: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mainBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: fontFamily.label,
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
});
