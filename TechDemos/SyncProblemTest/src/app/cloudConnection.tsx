import type { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text } from 'react-native';
import { isCloudError, useCloud, type CloudFile } from '../cloud';
import PhotoPicker from '../components/PhotoPicker';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function CloudConnectionScreen() {
  const cloud = useCloud();
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [uploadedFile, setUploadedFile] = useState<CloudFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleConnect() {
    try {
      await cloud.connect();
    } catch (error) {
      if (isCloudError(error) && error.code === 'CANCELLED') {
        return;
      }
      console.error('Cloud connect failed:', error);
      Alert.alert('Unable to connect', errorMessage(error));
    }
  }

  async function handleDisconnect() {
    setImage(null);
    setUploadedFile(null);
    setUploadError(null);
    try {
      await cloud.disconnect();
    } catch (error) {
      console.error('Cloud disconnect failed:', error);
    }
  }

  async function handleUpload() {
    if (image === null) {
      return;
    }

    setIsUploading(true);
    setUploadedFile(null);
    setUploadError(null);

    try {
      const file = await cloud.uploadFile({
        uri: image.uri,
        name: image.fileName ?? undefined,
        mimeType: image.mimeType,
      });
      setUploadedFile(file);
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Connect to Cloud</Text>

      {cloud.status === 'unsupported' && (
        <Text>Cloud sync isn&apos;t supported on this device yet.</Text>
      )}

      {(cloud.status === 'restoring' || cloud.status === 'connecting') && <ActivityIndicator />}

      {cloud.status === 'disconnected' && (
        <Button title={`Connect ${cloud.providerName}`} onPress={handleConnect} />
      )}

      {cloud.status === 'connected' && (
        <>
          <Text>Connected to {cloud.providerName}</Text>
          <Text>Account: {cloud.account?.email ?? 'Unknown account'}</Text>
          <Button title="Disconnect" onPress={handleDisconnect} />

          <PhotoPicker image={image} onImageChange={setImage} />

          <Button
            title={isUploading ? 'Uploading...' : `Upload to ${cloud.providerName}`}
            onPress={handleUpload}
            disabled={image === null || isUploading}
          />

          {uploadError && <Text style={styles.error}>{uploadError}</Text>}

          {uploadedFile && (
            <>
              <Text>Upload successful!</Text>
              <Text>Filename: {uploadedFile.name}</Text>
              <Text>File ID: {uploadedFile.id}</Text>
              {uploadedFile.webUrl && <Text selectable>{uploadedFile.webUrl}</Text>}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  error: {
    color: 'crimson',
  },
});
