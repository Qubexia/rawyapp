/**
 * Location utility — collect user position via expo-location and sync to backend.
 */

import * as Location from 'expo-location';
import { updateLocation } from '@/services/users.service';

/**
 * Rounds a coordinate to a specific number of decimal places.
 * Default is 2 (approx 1.1km precision), good for proximity search without exact positioning.
 */
function roundCoordinate(coord: number, precision = 2): number {
    return parseFloat(coord.toFixed(precision));
}

/**
 * Request location permissions and update user's position in the backend.
 * Should be called on app launch or when relevant.
 */
export async function syncUserLocationAutomatically(): Promise<boolean> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            console.log('Location permission denied');
            return false;
        }

        // Get current position (balanced accuracy for efficiency)
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Reverse geocode to get city name if possible
        let city: string | undefined;
        try {
            const reverse = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });
            if (reverse.length > 0) {
                city = reverse[0].city || reverse[0].region || undefined;
            }
        } catch (e) {
            console.warn('Reverse geocoding failed', e);
        }

        // Round to 2 decimals for privacy and indexing efficiency
        const roundedLat = roundCoordinate(latitude);
        const roundedLng = roundCoordinate(longitude);

        await updateLocation({
            city,
            coordinates: [roundedLng, roundedLat], // GeoJSON order: [longitude, latitude]
        });

        return true;
    } catch (err) {
        console.error('Failed to sync user location', err);
        return false;
    }
}
