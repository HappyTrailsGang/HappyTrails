/** Google Drive provider configuration. Values come from `.env` (see README). */
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** `drive.file` = only files this app created or the user opened with it. */
export const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const DRIVE_API = 'https://www.googleapis.com/drive/v3';
export const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
