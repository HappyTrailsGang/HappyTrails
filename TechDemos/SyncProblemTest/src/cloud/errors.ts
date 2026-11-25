export type CloudErrorCode =
  /** No session; call `connect()` first. */
  | 'NOT_CONNECTED'
  /** The user dismissed a sign-in or consent screen. */
  | 'CANCELLED'
  /** The user declined the storage permission. */
  | 'PERMISSION_DENIED'
  /** The provider isn't usable on this device (e.g. Play Services missing). */
  | 'UNAVAILABLE'
  /** App-side setup is wrong (client ID, signing certificate, entitlements...). */
  | 'MISCONFIGURED'
  /** The provider's API rejected the request or couldn't be reached. */
  | 'REQUEST_FAILED'
  /** The local file to upload is missing or empty. */
  | 'INVALID_FILE'
  | 'UNKNOWN';

/** The only error type `CloudStorage` implementations throw. */
export class CloudError extends Error {
  readonly code: CloudErrorCode;
  readonly cause?: unknown;

  constructor(code: CloudErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'CloudError';
    this.code = code;
    this.cause = cause;
  }
}

export function isCloudError(error: unknown): error is CloudError {
  return error instanceof CloudError;
}
