import { launchImageLibraryAsync, type ImagePickerAsset } from 'expo-image-picker';
import { Button, Image, StyleSheet, Text, View } from 'react-native';

type PhotoPickerProps = {
  image: ImagePickerAsset | null;
  onImageChange: (image: ImagePickerAsset | null) => void;
};

export default function PhotoPicker({ image, onImageChange }: PhotoPickerProps) {
  async function pickImage() {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      onImageChange(result.assets[0]);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Choose photo" onPress={pickImage} />

      {image && (
        <>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <Text>{image.fileName ?? 'Unknown filename'}</Text>
          <Text>
            {image.width} × {image.height}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  preview: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
});
