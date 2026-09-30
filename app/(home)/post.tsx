import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAuth } from '@clerk/expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { useDefaultPickupLocation } from '@/hooks/useDefaultPickupLocation';
import { useIsGrabitPro } from '@/hooks/useIsGrabitPro';
import {
  createListingPost,
  PostValidationError,
} from '@/utils/create-listing-post';
import { getValidationMessage, postFormSchema } from '@/utils/post-validation';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { FREE_PHOTO_LIMIT, PRO_PHOTO_LIMIT } from '@/services/revenuecat';

import { PhotoUpload, type PhotoData } from '@/components/post/photo-upload';
import { FormInput } from '@/components/post/form-input';
import { ConditionSelector } from '@/components/post/condition-selector';
import { CategorySelector } from '@/components/post/category-selector';
import { LocationSelector } from '@/components/post/location-selector';

export default function PostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, userId } = useAuth();

  const isPro = useIsGrabitPro();
  const [images, setImages] = useState<PhotoData[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('');
  const { city, locationUrl, neighborhood } = useDefaultPickupLocation({
    getToken,
    userId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValidation = useMemo(
    () =>
      postFormSchema.safeParse({
        title,
        description,
        condition,
        category,
        images,
        neighborhood,
        locationUrl,
        city,
      }),
    [
      category,
      city,
      condition,
      description,
      images,
      locationUrl,
      neighborhood,
      title,
    ],
  );

  const isPostDisabled = isSubmitting || !formValidation.success;

  // Compute completed field count for progress bar
  const completedFields = useMemo(() => {
    let count = 0;
    if (images.length > 0) count++;
    if (title.trim().length > 0) count++;
    if (category.trim().length > 0) count++;
    if (description.trim().length > 0) count++;
    if (neighborhood && neighborhood.trim().length > 0) count++;
    return count;
  }, [images, title, category, description, neighborhood]);
  const TOTAL_FIELDS = 5;

  const handleAddImages = (newImages: PhotoData[]) => {
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please sign in before posting.');
      return;
    }

    if (!formValidation.success) {
      Alert.alert(
        'Complete the form',
        getValidationMessage(formValidation.error),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken({ template: 'supabase' });

      if (!token) {
        Alert.alert(
          'Error',
          'Authentication token missing. Please log in again.',
        );
        return;
      }

      const supabase = createClerkSupabaseClient(token);

      await createListingPost({
        title,
        description,
        condition,
        category,
        images,
        locationUrl,
        neighborhood,
        supabase,
        userId,
      });

      Alert.alert('Success!', 'Your item is now live.', [
        { text: 'Awesome', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      if (err instanceof PostValidationError) {
        Alert.alert('Complete the form', err.message);
        return;
      }

      Alert.alert('Upload Failed', err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#eef8f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='interactive'
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 206 },
          ]}
        >
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedFields / TOTAL_FIELDS) * 100}%` as any },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {completedFields === TOTAL_FIELDS
                ? 'Ready to post!'
                : `${completedFields} of ${TOTAL_FIELDS} fields filled`}
            </Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Give Something Away</Text>
            <Text style={styles.headerSubtitle}>
              Takes less than 60 seconds. Help your community.
            </Text>
          </View>

          <PhotoUpload
            images={images}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
            maxImages={isPro ? PRO_PHOTO_LIMIT : FREE_PHOTO_LIMIT}
          />

          <FormInput
            label='Title'
            placeholder='What are you giving away?'
            value={title}
            onChangeText={setTitle}
          />

          <ConditionSelector selected={condition} onSelect={setCondition} />

          <CategorySelector selected={category} onSelect={setCategory} />

          <FormInput
            label='Description'
            placeholder='Any details the next owner should know?'
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
          />

          <LocationSelector
            location={neighborhood}
            onPress={() => router.push('/location')}
          />
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View
          style={[styles.bottomBar, { bottom: insets.bottom > 0 ? insets.bottom + 88 : 104 }]}
        >
          {isPostDisabled && !isSubmitting && formValidation.error && (
            <Text style={styles.missingHint}>
              {formValidation.error.issues[0]?.message}
            </Text>
          )}
          <Pressable
            style={[
              styles.postButton,
              isPostDisabled && styles.postButtonDisabled,
            ]}
            disabled={isPostDisabled}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color='#ffffff' />
            ) : (
              <Text style={[styles.postButtonText, isPostDisabled && styles.postButtonTextDisabled]}>
                Post Item
              </Text>
            )}
          </Pressable>
        </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 100, // Pill shaped per design system
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  postButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  postButtonTextDisabled: {
    color: colors.onSurfaceVariant,
  },
  progressContainer: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%' as any,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
  },
  missingHint: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 8,
  },
});
