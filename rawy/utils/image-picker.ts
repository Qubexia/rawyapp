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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    
    // Extract filename and type
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpg`;

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
