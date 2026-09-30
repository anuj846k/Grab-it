export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export const parseGoogleMapsUrl = (mapUrl?: string | null) => {
  if (!mapUrl) return null;

  const decodedUrl = decodeURIComponent(mapUrl);
  const coordinateMatch = decodedUrl.match(
    /(?:[?&](?:query|q|destination)=|@)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  );

  if (!coordinateMatch) return null;

  const latitude = Number(coordinateMatch[1]);
  const longitude = Number(coordinateMatch[2]);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
};

export const buildGoogleMapsDirectionsUrl = ({
  latitude,
  longitude,
}: MapCoordinates) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
