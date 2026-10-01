import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAuth } from '@clerk/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { normalizeImageUrls } from '@/utils/image-urls';
import { editFormSchema, getValidationMessage } from '@/utils/post-validation';
import { getCityFromNeighborhood } from '@/utils/location';
import { useIsGrabitPro } from '@/hooks/useIsGrabitPro';
import { FREE_PHOTO_LIMIT, PRO_PHOTO_LIMIT } from '@/services/revenuecat';
import { AppAlert } from '@/components/ui/AppAlert';

import { PhotoUpload, type PhotoData } from '@/components/post/photo-upload';
import { FormInput } from '@/components/post/form-input';
import { ConditionSelector } from '@/components/post/condition-selector';
import { CategorySelector } from '@/components/post/category-selector';
import { LocationSelector } from '@/components/post/location-selector';
import { FormSkeleton } from '@/components/skeletons/FormSkeleton';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const isPro = useIsGrabitPro();

  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listingNotFound, setListingNotFound] = useState(false);

  const [images, setImages] = useState<PhotoData[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [city, setCity] = useState('');

  const getTokenRef = useRef(getToken);
  const userIdRef = useRef(userId);
  const removedUrlsRef = useRef<string[]>([]);
  const existingImageUrlsRef = useRef<string[]>([]);

  getTokenRef.current = getToken;
  userIdRef.current = userId;

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setIsLoadingListing(true);
        const token = await getTokenRef.current({ template: 'supabase' });
        if (!token) {
          setListingNotFound(true);
          return;
        }

        const supabase = createClerkSupabaseClient(token);

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', userIdRef.current)
          .single();

        if (profileError || !userProfile) {
          setListingNotFound(true);
          return;
        }

        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setListingNotFound(true);
          return;
        }

        if (data.user_id !== userProfile.id) {
          setListingNotFound(true);
          return;
        }

        const imageUrls = normalizeImageUrls(data.image_urls);
        existingImageUrlsRef.current = imageUrls;

        setImages(imageUrls.map((url: string) => ({ uri: url })));
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCondition(data.condition || 'Good');
        setCategory(data.category || '');
        setNeighborhood(data.neighborhood || data.city || '');
        setLocationUrl(data.location_url || null);
        setCity(data.city || '');
      } catch (err) {
        console.error('Error fetching listing:', err);
        setListingNotFound(true);
      } finally {
        setIsLoadingListing(false);
      }
    };

    fetchListing();
  }, [id]);

  // Listen for location changes from the location screen
  useEffect(() => {
    const locationSub = DeviceEventEmitter.addListener(
      'locationSelected',
      (address: string) => {
        setNeighborhood(address);
        setCity(getCityFromNeighborhood(address) || '');
      },
    );
    const urlSub = DeviceEventEmitter.addListener(
      'locationUrlSelected',
      (url: string) => setLocationUrl(url),
    );

    return () => {
      locationSub.remove();
      urlSub.remove();
    };
  }, []);

  const formValidation = useMemo(
    () =>
      editFormSchema.safeParse({
        title,
        description,
        condition,
        category,
        images,
        neighborhood,
        locationUrl,
        city,
      }),
    [title, description, condition, category, images, neighborhood, locationUrl, city],
  );

  const isSaveDisabled = isSaving || !formValidation.success;

  const handleAddImages = (newImages: PhotoData[]) => {
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    const removed = images[index];
    // If this was an existing image (no base64), track it for deletion
    if (removed.uri && !removed.base64) {
      removedUrlsRef.current.push(removed.uri);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId || !id) return;

    if (!formValidation.success) {
      AppAlert.alert('Complete the form', getValidationMessage(formValidation.error));
      return;
    }

    try {
      setIsSaving(true);
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        AppAlert.alert('Error', 'Authentication token missing. Please log in again.');
        return;
      }

      const supabase = createClerkSupabaseClient(token);

      // Delete images from storage that were removed by the user
      const deletePromises = removedUrlsRef.current.map(async (url) => {
        // Extract the file path from the public URL
        const pathMatch = url.match(/listings\/(.+)$/);
        if (pathMatch) {
          return supabase.storage.from('listings').remove([pathMatch[1]]);
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);

      // Upload new images (those with base64)
      const newImageUrls: string[] = [];
      for (const img of images) {
        if (!img.base64) {
          // Existing image — keep it
          newImageUrls.push(img.uri);
          continue;
        }

        const ext = img.type === 'image/png' ? 'png' : 'jpg';
        const fileName = `${userId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;

        const { data, error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, decode(img.base64), {
            contentType: img.type || 'image/jpeg',
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          AppAlert.alert('Upload Failed', 'Failed to upload images.');
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('listings')
          .getPublicUrl(data.path);

        newImageUrls.push(publicUrlData.publicUrl);
      }

      // Update the listing in the database
      const { error: dbError } = await supabase
        .from('listings')
        .update({
          title,
          description,
          condition,
          category,
          image_urls: newImageUrls,
          neighborhood,
          location_url: locationUrl,
          city,
        })
        .eq('id', id);

      if (dbError) {
        console.error('Database error:', dbError);
        AppAlert.alert('Error', 'Failed to save changes.');
        return;
      }

      AppAlert.alert('Saved!', 'Your listing has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error('Error saving listing:', err);
      AppAlert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingListing) {
    return (
      <LinearGradient
        colors={['#eef8f5', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Listing</Text>
            <View style={styles.placeholder} />
          </View>
          <FormSkeleton isProfile={false} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (listingNotFound) {
    return (
      <LinearGradient
        colors={['#eef8f5', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Listing</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.errorTitle}>Listing Not Found</Text>
            <Text style={styles.errorText}>
              This listing doesn&apos;t exist or you don&apos;t have permission to edit it.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Listing</Text>
            <View style={styles.placeholder} />
          </View>

          <PhotoUpload
            images={images}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
            maxImages={isPro ? PRO_PHOTO_LIMIT : FREE_PHOTO_LIMIT}
          />

          <FormInput
            label="Title"
            placeholder="What are you giving away?"
            value={title}
            onChangeText={setTitle}
          />

          <ConditionSelector selected={condition} onSelect={setCondition} />

          <CategorySelector selected={category} onSelect={setCategory} />

          <FormInput
            label="Description"
            placeholder="Any details the next owner should know?"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <LocationSelector
            location={neighborhood}
            onPress={() => router.push('/location')}
          />
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View
          style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20 }]}
        >
          <Pressable
            style={[
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
            ]}
            disabled={isSaveDisabled}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  saveButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
