/**
 * Public API of the cloud module. Code outside `src/cloud/` should import only from here.
 *
 * Usage:
 *   <CloudProvider storage={cloudStorage}>...</CloudProvider>   // root layout
 *   const { status, connect, uploadFile } = useCloud();          // any screen
 */
export { CloudProvider, useCloud } from './CloudProvider';
export type { CloudContextValue, CloudStatus } from './CloudProvider';
export { createCloudStorage } from './createCloudStorage';
export { CloudError, isCloudError } from './errors';
export type { CloudErrorCode } from './errors';
export type { CloudAccount, CloudFile, CloudStorage, CloudStorageId, UploadInput } from './types';
