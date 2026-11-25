import { Platform } from 'react-native';
import { GoogleDriveStorage } from './google/GoogleDriveStorage';
import type { CloudStorage } from './types';

/**
 * Picks the storage backend for the current platform, or `null` if none is supported.
 * Add the iCloud implementation here (e.g. `Platform.OS === 'ios'`) when it exists.
 */
export function createCloudStorage(): CloudStorage | null {
  if (Platform.OS === 'android') {
    return new GoogleDriveStorage();
  }
  return null;
}
