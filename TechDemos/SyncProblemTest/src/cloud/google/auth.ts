import {
  GoogleOneTapSignIn,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  type OneTapUser,
} from 'react-native-nitro-google-signin';
import { CloudError } from '../errors';
import type { CloudAccount } from '../types';
import { DRIVE_SCOPES, GOOGLE_WEB_CLIENT_ID } from './config';

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) {
    return;
  }
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new CloudError('MISCONFIGURED', 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set (see .env)');
  }
  GoogleOneTapSignIn.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: DRIVE_SCOPES,
    offlineAccess: false,
  });
  isConfigured = true;
}

function toAccount(user: OneTapUser): CloudAccount {
  return { id: user.id, email: user.email, displayName: user.name };
}

function hasDriveScopes(grantedScopes: string[]): boolean {
  return DRIVE_SCOPES.every((scope) => grantedScopes.includes(scope));
}

/** Converts sign-in library errors into `CloudError`s. */
export function toCloudError(error: unknown, fallbackMessage: string): CloudError {
  if (error instanceof CloudError) {
    return error;
  }
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return new CloudError('CANCELLED', 'Google sign-in was cancelled', error);
      case statusCodes.SIGN_IN_REQUIRED:
        return new CloudError('NOT_CONNECTED', 'Not signed in to Google', error);
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return new CloudError('UNAVAILABLE', 'Google Play Services is unavailable', error);
      case statusCodes.DEVELOPER_ERROR:
        return new CloudError(
          'MISCONFIGURED',
          'Google sign-in is misconfigured (check client ID and SHA-1)',
          error
        );
    }
  }
  return new CloudError('UNKNOWN', fallbackMessage, error);
}

/** Restores a previous session without UI, or returns `null`. */
export function getSignedInAccount(): CloudAccount | null {
  ensureConfigured();
  const current = GoogleOneTapSignIn.getCurrentUser();
  if (current === null || !hasDriveScopes(current.scopes)) {
    return null;
  }
  return toAccount(current.user);
}

/** Interactive sign-in followed by the Drive consent screen. */
export async function signIn(): Promise<{ account: CloudAccount; accessToken: string }> {
  try {
    ensureConfigured();
    await GoogleOneTapSignIn.checkPlayServices();

    const response = await GoogleOneTapSignIn.presentExplicitSignIn();
    if (!isSuccessResponse(response)) {
      throw new CloudError('CANCELLED', 'Google sign-in was cancelled');
    }

    const authorization = await GoogleOneTapSignIn.requestScopes(DRIVE_SCOPES);
    if (!authorization.accessToken) {
      throw new CloudError('PERMISSION_DENIED', 'Google Drive access was not granted');
    }

    return { account: toAccount(response.data.user), accessToken: authorization.accessToken };
  } catch (error) {
    throw toCloudError(error, 'Unable to sign in to Google');
  }
}

/** Gets a fresh access token for an existing session (no account picker). */
export async function fetchAccessToken(): Promise<string> {
  try {
    ensureConfigured();
    const tokens = await GoogleOneTapSignIn.getTokens();
    return tokens.accessToken;
  } catch (error) {
    throw toCloudError(error, 'Unable to get a Google access token');
  }
}

export async function invalidateAccessToken(accessToken: string): Promise<void> {
  try {
    await GoogleOneTapSignIn.clearCachedAccessToken(accessToken);
  } catch {
    // Best effort: a failed cache clear only means the next fetch may return the same token.
  }
}

export async function signOut(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleOneTapSignIn.signOut();
  } catch (error) {
    throw toCloudError(error, 'Unable to sign out of Google');
  }
}
