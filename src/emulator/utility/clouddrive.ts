import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export enum CloudDriveSyncStatus {
  Inactive,
  Active,
  Pending,
  InProgress,
  Failed
}

export interface CloudDrive {
  syncStatus: CloudDriveSyncStatus
  syncInterval: number
  lastSyncTime: number
  fileName: string
  downloadUrl: string
  uploadUrl: string

  getSyncStatus(dprops: DriveProps): CloudDriveSyncStatus
  setSyncStatus(status: CloudDriveSyncStatus): void
  isSyncPaused(): boolean

  getSyncInterval(): number
  setSyncInterval(interval: number): void

  getStatusMessage(dprops: DriveProps): string
  getStatusClassName(dprops: DriveProps): string
  getSyncIcon(dprops: DriveProps): IconDefinition

  downloadFile(filter: string): Promise<boolean>
  uploadFile(blob: Blob): Promise<void>
  syncDrive(dprops: DriveProps): void
  saveFile(filename: string): Promise<boolean>
}