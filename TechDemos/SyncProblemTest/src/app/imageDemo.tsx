import type { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import PhotoPicker from '../components/PhotoPicker';

export default function ImageDemo() {
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [note, setNote] = useState('');

  return (
    <View style={styles.container}>
      <PhotoPicker image={image} onImageChange={setImage} />

      {image && (
        <TextInput
          style={styles.textBox}
          placeholder="Write something about this photo..."
          value={note}
          onChangeText={setNote}
          multiline
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  textBox: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
  },
});
