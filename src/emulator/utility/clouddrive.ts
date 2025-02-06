export enum CloudDriveSyncStatus {
  Inactive,
  Active,
  Pending,
  InProgress,
  Failed
}

export interface CloudDrive {
  providerName: string
  syncStatus: CloudDriveSyncStatus
  syncInterval: number
  lastSyncTime: number

  getFileName(): string
  setFileName(fileName: string): void

  download(filter: string): Promise<Uint8Array|undefined>
  upload(fileName: string, buffer: Uint8Array): Promise<boolean>
  sync(buffer: Uint8Array): Promise<void>
}