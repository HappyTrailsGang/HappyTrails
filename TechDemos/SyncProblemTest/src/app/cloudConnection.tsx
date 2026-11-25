import type { ImagePickerAsset } from 'expo-image-picker';
import { useState } from 'react';
import { Button, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import GoogleDriveConnector from '../components/GoogleDriveConnector';
import PhotoPicker from '../components/PhotoPicker';
import { uploadImage, type UploadedDriveFile } from '../services/googleDrive';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function CloudConnectionScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedDriveFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleConnect(token: string, accountEmail: string | null) {
    setAccessToken(token);
    setEmail(accountEmail);
  }

  async function handleUpload() {
    if (accessToken === null || image === null) {
      return;
    }

    setIsUploading(true);
    setUploadedFile(null);
    setUploadError(null);

    try {
      setUploadedFile(await uploadImage(accessToken, image));
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Connect to Cloud</Text>

      {Platform.OS !== 'android' ? (
        <Text>Cloud sync is currently only supported on Android.</Text>
      ) : (
        <>
          <GoogleDriveConnector onConnect={handleConnect} />

          {accessToken && (
            <>
              <Text>Connected to Google Drive</Text>
              <Text>Account: {email ?? 'Unknown account'}</Text>

              <PhotoPicker image={image} onImageChange={setImage} />

              <Button
                title={isUploading ? 'Uploading...' : 'Upload to Google Drive'}
                onPress={handleUpload}
                disabled={image === null || isUploading}
              />

              {uploadError && <Text style={styles.error}>{uploadError}</Text>}

              {uploadedFile && (
                <>
                  <Text>Upload successful!</Text>
                  <Text>Filename: {uploadedFile.name}</Text>
                  <Text>File ID: {uploadedFile.id}</Text>
                  {uploadedFile.webViewLink && (
                    <Text selectable>{uploadedFile.webViewLink}</Text>
                  )}
                </>
              )}
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
