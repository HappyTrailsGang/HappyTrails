import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { CloudError } from '../errors';
import type { CloudFile, UploadInput } from '../types';
import { DRIVE_API, DRIVE_UPLOAD_API } from './config';

type DriveFile = {
  id: string;
  name: string;
  webViewLink?: string;
};

const FILE_FIELDS = 'id,name,webViewLink';

/** Thrown when Drive rejects the access token, so the caller can refresh and retry. */
export class DriveAuthError extends CloudError {
  constructor(status: number) {
    super('NOT_CONNECTED', `Google Drive rejected the access token (${status})`);
  }
}

function toCloudFile(file: DriveFile): CloudFile {
  return { id: file.id, name: file.name, webUrl: file.webViewLink };
}

function checkResponse(response: Response, action: string) {
  if (response.status === 401) {
    throw new DriveAuthError(response.status);
  }
  if (!response.ok) {
    throw new CloudError('REQUEST_FAILED', `${action} failed (HTTP ${response.status})`);
  }
}

export async function listFiles(accessToken: string): Promise<CloudFile[]> {
  const response = await fetch(`${DRIVE_API}/files?fields=files(${FILE_FIELDS})`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  checkResponse(response, 'Listing Drive files');

  const data = (await response.json()) as { files?: DriveFile[] };
  return (data.files ?? []).map(toCloudFile);
}

/**
 * Uploads a file using Drive's resumable upload protocol:
 * 1. POST metadata to open an upload session (returns a session URL in `Location`).
 * 2. PUT the file bytes to that session URL.
 */
export async function uploadFile(accessToken: string, input: UploadInput): Promise<CloudFile> {
  const file = new File(input.uri);
  if (!file.exists || file.size === 0) {
    throw new CloudError('INVALID_FILE', 'Local file is missing or empty');
  }

  const mimeType = input.mimeType || file.type || 'application/octet-stream';
  const metadata = { name: input.name ?? file.name, mimeType };

  const sessionResponse = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=resumable&fields=${FILE_FIELDS}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': String(file.size),
      },
      body: JSON.stringify(metadata),
    }
  );
  checkResponse(sessionResponse, 'Starting the upload');

  const uploadUrl = sessionResponse.headers.get('Location');
  if (uploadUrl === null) {
    throw new CloudError('REQUEST_FAILED', 'Google Drive did not return an upload URL');
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(file.size),
    },
    body: file,
  });
  checkResponse(uploadResponse, 'Uploading the file');

  return toCloudFile((await uploadResponse.json()) as DriveFile);
}
