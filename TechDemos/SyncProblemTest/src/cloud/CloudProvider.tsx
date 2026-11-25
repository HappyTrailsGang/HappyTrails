import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { CloudError } from './errors';
import type { CloudAccount, CloudFile, CloudStorage, UploadInput } from './types';

export type CloudStatus = 'unsupported' | 'restoring' | 'disconnected' | 'connecting' | 'connected';

export type CloudContextValue = {
  status: CloudStatus;
  account: CloudAccount | null;
  /** Name of the active backend (e.g. "Google Drive"), or `null` when unsupported. */
  providerName: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  uploadFile: (input: UploadInput) => Promise<CloudFile>;
  listFiles: () => Promise<CloudFile[]>;
};

const CloudContext = createContext<CloudContextValue | null>(null);

function notSupported(): never {
  throw new CloudError('UNAVAILABLE', 'Cloud storage is not supported on this device');
}

type CloudProviderProps = {
  /** The backend to use, usually `createCloudStorage()`. `null` means unsupported. */
  storage: CloudStorage | null;
  children: ReactNode;
};

/** Holds the cloud session for the whole app. Wrap the root layout with it. */
export function CloudProvider({ storage, children }: CloudProviderProps) {
  const [status, setStatus] = useState<CloudStatus>(storage ? 'restoring' : 'unsupported');
  const [account, setAccount] = useState<CloudAccount | null>(null);

  useEffect(() => {
    if (storage === null) {
      return;
    }
    let isActive = true;
    storage.restoreSession().then((restored) => {
      if (isActive) {
        setAccount(restored);
        setStatus(restored ? 'connected' : 'disconnected');
      }
    });
    return () => {
      isActive = false;
    };
  }, [storage]);

  async function connect() {
    if (storage === null) {
      notSupported();
    }
    setStatus('connecting');
    try {
      const connected = await storage.connect();
      setAccount(connected);
      setStatus('connected');
    } catch (error) {
      setStatus(account ? 'connected' : 'disconnected');
      throw error;
    }
  }

  async function disconnect() {
    if (storage === null) {
      return;
    }
    try {
      await storage.disconnect();
    } finally {
      setAccount(null);
      setStatus('disconnected');
    }
  }

  const value: CloudContextValue = {
    status,
    account,
    providerName: storage?.displayName ?? null,
    connect,
    disconnect,
    uploadFile: (input) => (storage ? storage.uploadFile(input) : notSupported()),
    listFiles: () => (storage ? storage.listFiles() : notSupported()),
  };

  return <CloudContext value={value}>{children}</CloudContext>;
}

/** Access the cloud session from any screen under `<CloudProvider>`. */
export function useCloud(): CloudContextValue {
  const context = use(CloudContext);
  if (context === null) {
    throw new Error('useCloud must be used inside <CloudProvider>');
  }
  return context;
}
