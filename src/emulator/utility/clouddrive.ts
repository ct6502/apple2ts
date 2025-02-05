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

  download(filter: string): Promise<Blob|undefined>
  upload(fileName: string, blob: Blob): Promise<boolean>
  sync(blob: Blob): Promise<void>
}