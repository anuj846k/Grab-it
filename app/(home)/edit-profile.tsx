import React, { useEffect, useRef, useState } from 'react';
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
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';
import { createClerkSupabaseClient } from '@/utils/supabase';
import { AppAlert } from '@/components/ui/AppAlert';
import { FormInput } from '@/components/post/form-input';
import { LocationSelector } from '@/components/post/location-selector';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { FormSkeleton } from '@/components/skeletons/FormSkeleton';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goBack = useBackNavigation('/(home)/profile');
  const { getToken, userId } = useAuth();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [defaultNeighborhood, setDefaultNeighborhood] = useState('');
  const [defaultAddressUrl, setDefaultAddressUrl] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = await getTokenRef.current({ template: 'supabase' });
        if (!token) return;

        const supabase = createClerkSupabaseClient(token);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setName(data?.name || user?.fullName || '');
        setBio(data?.bio || '');
        setDefaultNeighborhood(data?.default_neighborhood || '');
        setDefaultAddressUrl(data?.default_address_url || '');
        setAvatarUri(data?.avatar_url || user?.imageUrl || null);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user?.fullName, user?.imageUrl]);

  useEffect(() => {
    const locationSub = DeviceEventEmitter.addListener(
      'locationSelected',
      (address: string) => setDefaultNeighborhood(address),
    );
    const urlSub = DeviceEventEmitter.addListener(
      'locationUrlSelected',
      (url: string) => setDefaultAddressUrl(url),
    );

    return () => {
      locationSub.remove();
      urlSub.remove();
    };
  }, []);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      AppAlert.alert('Permission needed', 'We need access to your camera roll to change your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarBase64(result.assets[0].base64 || null);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setIsSaving(true);
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) {
        AppAlert.alert('Error', 'Authentication error. Please log in again.');
        return;
      }

      const supabase = createClerkSupabaseClient(token);

      let avatarUrl = avatarUri;

      if (avatarBase64) {
        const ext = 'jpg';
        const fileName = `avatars/${userId}/${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, decode(avatarBase64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          AppAlert.alert('Upload Failed', 'Failed to upload profile photo.');
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('listings')
          .getPublicUrl(uploadData.path);

        avatarUrl = publicUrlData.publicUrl;
      }

      const updateData: Record<string, any> = {
        name: name.trim(),
        bio: bio.trim() || null,
        default_neighborhood: defaultNeighborhood.trim() || null,
        default_address_url: defaultAddressUrl.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (avatarBase64) {
        updateData.avatar_url = avatarUrl;
      }

      const { error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('clerk_id', userId);

      if (dbError) {
        console.error('Database error:', dbError);
        AppAlert.alert('Error', 'Failed to save changes.');
        return;
      }

      AppAlert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: goBack },
      ]);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      AppAlert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = isSaving || !name.trim();

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#eef8f5', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>
          <FormSkeleton isProfile={true} />
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
            { paddingBottom: insets.bottom + 116 },
          ]}
        >
          <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarContainer}>
              <Image
                source={{ uri: avatarUri || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          <FormInput
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Bio"
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            optional
          />

          <LocationSelector
            location={defaultNeighborhood}
            onPress={() => router.push('/location')}
          />
        </ScrollView>

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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.surfaceContainer,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarHint: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
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
