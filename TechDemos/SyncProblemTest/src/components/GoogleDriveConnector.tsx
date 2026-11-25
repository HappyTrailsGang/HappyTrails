import { Alert, Button } from 'react-native';
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) {
    return;
  }
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set (see .env)');
  }
  GoogleOneTapSignIn.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  isConfigured = true;
}

type GoogleDriveConnectorProps = {
  onConnect: (accessToken: string, email: string | null) => void;
};

export default function GoogleDriveConnector({ onConnect }: GoogleDriveConnectorProps) {
  async function authenticate() {
    try {
      ensureConfigured();
      await GoogleOneTapSignIn.checkPlayServices();

      const response = await GoogleOneTapSignIn.presentExplicitSignIn();
      if (!isSuccessResponse(response)) {
        Alert.alert('Google sign-in unsuccessful');
        return;
      }

      const authorization = await GoogleOneTapSignIn.requestScopes(DRIVE_SCOPES);
      if (!authorization.accessToken) {
        Alert.alert('Google Drive access not granted');
        return;
      }

      onConnect(authorization.accessToken, response.data.user.email);
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Unable to connect to Google Drive');
    }
  }

  return <Button title="Connect Google Drive" onPress={authenticate} />;
}
