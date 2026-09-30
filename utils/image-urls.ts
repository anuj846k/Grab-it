const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400';

export const normalizeImageUrls = (imageUrls: unknown) => {
  if (Array.isArray(imageUrls)) {
    const urls = imageUrls
      .flatMap((url) => String(url).split(','))
      .map((url) => url.trim())
      .filter(Boolean);

    return urls.length > 0 ? urls : [FALLBACK_IMAGE_URL];
  }

  if (typeof imageUrls === 'string') {
    const urls = imageUrls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    return urls.length > 0 ? urls : [FALLBACK_IMAGE_URL];
  }

  return [FALLBACK_IMAGE_URL];
};
