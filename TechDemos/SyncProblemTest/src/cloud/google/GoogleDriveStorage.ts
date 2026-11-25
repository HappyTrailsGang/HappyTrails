import { CloudError } from '../errors';
import type { CloudAccount, CloudFile, CloudStorage, UploadInput } from '../types';
import * as auth from './auth';
import * as drive from './driveApi';

/** `CloudStorage` backed by Google Drive. Owns the access token so callers never see it. */
export class GoogleDriveStorage implements CloudStorage {
  readonly id = 'google-drive';
  readonly displayName = 'Google Drive';

  private account: CloudAccount | null = null;
  private accessToken: string | null = null;

  async restoreSession(): Promise<CloudAccount | null> {
    try {
      this.account = auth.getSignedInAccount();
    } catch {
      this.account = null;
    }
    return this.account;
  }

  async connect(): Promise<CloudAccount> {
    const { account, accessToken } = await auth.signIn();
    this.account = account;
    this.accessToken = accessToken;
    return account;
  }

  async disconnect(): Promise<void> {
    this.account = null;
    this.accessToken = null;
    await auth.signOut();
  }

  uploadFile(input: UploadInput): Promise<CloudFile> {
    return this.withAccessToken((token) => drive.uploadFile(token, input));
  }

  listFiles(): Promise<CloudFile[]> {
    return this.withAccessToken((token) => drive.listFiles(token));
  }

  /**
   * Runs a Drive request with a valid token. Access tokens expire after about an hour,
   * so on a 401 the cached token is discarded and the request is retried once.
   */
  private async withAccessToken<T>(request: (token: string) => Promise<T>): Promise<T> {
    if (this.account === null) {
      throw new CloudError('NOT_CONNECTED', 'Connect to Google Drive first');
    }

    try {
      const token = this.accessToken ?? (await auth.fetchAccessToken());
      this.accessToken = token;
      try {
        return await request(token);
      } catch (error) {
        if (!(error instanceof drive.DriveAuthError)) {
          throw error;
        }
        await auth.invalidateAccessToken(token);
        this.accessToken = await auth.fetchAccessToken();
        return await request(this.accessToken);
      }
    } catch (error) {
      if (error instanceof CloudError) {
        throw error;
      }
      throw new CloudError('REQUEST_FAILED', 'Google Drive request failed', error);
    }
  }
}
