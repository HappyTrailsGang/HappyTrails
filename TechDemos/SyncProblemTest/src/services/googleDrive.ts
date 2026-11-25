import { File } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { fetch } from 'expo/fetch';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export type DriveFile = {
  id: string;
  name: string;
};

export type UploadedDriveFile = DriveFile & {
  webViewLink?: string;
};

type DriveFileList = {
  files?: DriveFile[];
};

export async function listFiles(accessToken: string): Promise<DriveFile[]> {
  const response = await fetch(`${DRIVE_API}/files?fields=files(id,name)`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Google Drive API error: ${response.status}`);
  }

  const data = (await response.json()) as DriveFileList;
  return data.files ?? [];
}

/**
 * Uploads an image using Drive's resumable upload protocol:
 * 1. POST metadata to open an upload session (returns a session URL in `Location`).
 * 2. PUT the file bytes to that session URL.
 */
export async function uploadImage(
  accessToken: string,
  image: ImagePickerAsset
): Promise<UploadedDriveFile> {
  const file = new File(image.uri);

  if (!file.exists || file.size === 0) {
    throw new Error('Local image file is missing or empty');
  }

  const mimeType = image.mimeType || file.type || 'application/octet-stream';
  const metadata = {
    name: image.fileName ?? file.name,
    mimeType,
  };

  const sessionResponse = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=resumable&fields=id,name,webViewLink`,
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

  if (!sessionResponse.ok) {
    throw new Error(`Upload initialization failed: ${sessionResponse.status}`);
  }

  const uploadUrl = sessionResponse.headers.get('Location');
  if (uploadUrl === null) {
    throw new Error('No upload URL received');
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': String(file.size),
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Image upload failed: ${uploadResponse.status}`);
  }

  return (await uploadResponse.json()) as UploadedDriveFile;
}
