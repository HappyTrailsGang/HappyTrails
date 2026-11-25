/**
 * Provider-agnostic cloud storage contract.
 *
 * Everything outside `src/cloud/` should depend only on these types (via `src/cloud/index.ts`),
 * never on a specific backend. Google Drive is the first implementation; iCloud is planned.
 */

export type CloudStorageId = 'google-drive' | 'icloud';

/** The signed-in user, as far as the app needs to know. */
export type CloudAccount = {
  id: string;
  email: string | null;
  displayName: string | null;
};

/** A local file to upload. `name` and `mimeType` are inferred from the file when omitted. */
export type UploadInput = {
  uri: string;
  name?: string;
  mimeType?: string;
};

/** A file stored in the cloud. */
export type CloudFile = {
  id: string;
  name: string;
  /** Link to view the file in the provider's UI, when the provider has one. */
  webUrl?: string;
};

export interface CloudStorage {
  readonly id: CloudStorageId;
  /** Human-readable name for UI, e.g. "Google Drive". */
  readonly displayName: string;

  /**
   * Silently restores a previous session without showing UI.
   * Resolves `null` when the user needs to connect interactively.
   */
  restoreSession(): Promise<CloudAccount | null>;

  /** Interactive sign-in plus storage permission. Throws `CloudError` (e.g. `CANCELLED`). */
  connect(): Promise<CloudAccount>;

  /** Signs out and forgets cached credentials. */
  disconnect(): Promise<void>;

  /** Uploads a local file. Requires a connected session. */
  uploadFile(input: UploadInput): Promise<CloudFile>;

  /** Lists files this app can see. Requires a connected session. */
  listFiles(): Promise<CloudFile[]>;
}
