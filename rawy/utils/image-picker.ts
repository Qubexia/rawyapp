import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Utility to pick a single image from the library.
 * Returns formatted image object for FormData or null.
 */
export async function pickImage(): Promise<SelectedImage | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to update your profile.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Use the new array-based mediaTypes API (expo-image-picker v17+).
    // This replaces the deprecated MediaTypeOptions enum.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    
    // Use mimeType from picker if available (more reliable), else extract from filename
    const filename = asset.fileName || uri.split('/').pop() || 'image.jpg';
    let type: string;
    if (asset.mimeType && asset.mimeType.startsWith('image/')) {
      // Normalize image/jpg → image/jpeg for standard compliance
      type = asset.mimeType === 'image/jpg' ? 'image/jpeg' : asset.mimeType;
    } else {
      const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    }

    return {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    };
  } catch (error) {
    console.error('[pickImage] Error:', error);
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
}
