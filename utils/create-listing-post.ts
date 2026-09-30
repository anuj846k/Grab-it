import { decode } from 'base64-arraybuffer';

import type { PhotoData } from '@/components/post/photo-upload';
import {
  getCityFromNeighborhood,
  normalizePickupLocation,
} from '@/utils/location';
import { getValidationMessage, postFormSchema } from '@/utils/post-validation';

interface CreateListingPostParams {
  category: string;
  condition: string;
  description: string;
  images: PhotoData[];
  locationUrl: string | null;
  neighborhood: string;
  supabase: any;
  title: string;
  userId: string;
}

export class PostValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostValidationError';
  }
}

export async function createListingPost({
  category,
  condition,
  description,
  images,
  locationUrl,
  neighborhood,
  supabase,
  title,
  userId,
}: CreateListingPostParams) {
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, default_neighborhood, default_address_url')
    .eq('clerk_id', userId)
    .single();

  if (profileError || !userProfile) {
    console.error('Failed to fetch user profile:', profileError);
    throw new Error(
      'Could not verify your user profile. Please try logging out and back in.',
    );
  }

  const listingNeighborhood =
    normalizePickupLocation(userProfile.default_neighborhood) ||
    normalizePickupLocation(neighborhood);
  const listingLocationUrl = userProfile.default_address_url || locationUrl;
  const city = getCityFromNeighborhood(listingNeighborhood);
  const validation = postFormSchema.safeParse({
    title,
    description,
    condition,
    category,
    images,
    neighborhood: listingNeighborhood,
    locationUrl: listingLocationUrl,
    city,
  });

  if (!validation.success) {
    throw new PostValidationError(getValidationMessage(validation.error));
  }

  const uploadedImageUrls: string[] = [];

  for (const img of images) {
    if (!img.base64) continue;

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
      throw new Error('Failed to upload images.');
    }

    const { data: publicUrlData } = supabase.storage
      .from('listings')
      .getPublicUrl(data.path);

    uploadedImageUrls.push(publicUrlData.publicUrl);
  }

  const { error: dbError } = await supabase.from('listings').insert({
    user_id: userProfile.id,
    title,
    description,
    condition,
    category,
    image_urls: uploadedImageUrls,
    city,
    neighborhood: listingNeighborhood,
    location_url: listingLocationUrl,
    status: 'active',
  });

  if (dbError) {
    console.error('Database error:', dbError);
    throw new Error('Failed to save listing details.');
  }
}
