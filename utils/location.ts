export const DEFAULT_PICKUP_LOCATION = 'Select pickup location';
export const LEGACY_DEFAULT_PICKUP_LOCATION = 'My Default Neighborhood';

export const normalizePickupLocation = (neighborhood?: string | null) => {
  const normalized = neighborhood?.trim();

  if (
    !normalized ||
    normalized === DEFAULT_PICKUP_LOCATION ||
    normalized === LEGACY_DEFAULT_PICKUP_LOCATION
  ) {
    return null;
  }

  return normalized;
};

export const getCityFromNeighborhood = (neighborhood?: string | null) => {
  const normalized = normalizePickupLocation(neighborhood);
  if (!normalized) return null;

  const parts = normalized
    .split(', ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) return parts[parts.length - 2];
  return parts[0] || null;
};

export const getStateFromNeighborhood = (neighborhood?: string | null) => {
  const normalized = normalizePickupLocation(neighborhood);
  if (!normalized) return null;

  const parts = normalized
    .split(', ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 0) return parts[parts.length - 1];
  return null;
};
