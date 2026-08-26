import { GoogleDrive } from "./googledrive"
import { OneDriveCloudDrive } from "./onedriveclouddrive"

export const CLOUD_PROVIDER_NAMES = ["GoogleDrive", "OneDrive"] as const

export const createCloudProviderByName = (providerName: string): CloudProvider | null => {
  switch (providerName) {
    case "GoogleDrive":
      return new GoogleDrive()
    case "OneDrive":
      return new OneDriveCloudDrive()
    default:
      return null
  }
}

const CLOUD_PROVIDER_DISPLAY_NAME: Record<string, string> = {
  GoogleDrive: "Google Drive",
  OneDrive: "OneDrive",
}

export const cloudProviderDisplayName = (providerName: string): string =>
  CLOUD_PROVIDER_DISPLAY_NAME[providerName] || providerName

export const cloudProviderHasAuthToken = (providerName: string): boolean =>
  createCloudProviderByName(providerName)?.hasAuthToken() ?? false

const requestCloudAuthTokenWithTimeout = (
  provider: CloudProvider,
  timeoutMs = 15000,
): Promise<boolean> => new Promise((resolve) => {
  let settled = false
  const timeoutId = window.setTimeout(() => {
    if (settled) return
    settled = true
    resolve(false)
  }, timeoutMs)

  try {
    provider.requestAuthToken(() => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      resolve(true)
    })
  } catch {
    if (settled) return
    settled = true
    clearTimeout(timeoutId)
    resolve(false)
  }
})

export const signInToCloudProvider = async (providerName: string): Promise<boolean> => {
  const provider = createCloudProviderByName(providerName)
  if (!provider) return false
  const authReady = await requestCloudAuthTokenWithTimeout(provider)
  if (!authReady) {
    alert(`${cloudProviderDisplayName(providerName)} sign-in did not complete. Please allow the provider popup and try again.`)
  }
  return authReady
}

export const getCloudProvidersNeedingAuth = (
  disks: readonly DiskCollectionItem[],
): string[] => Array.from(new Set(
  disks
    .filter(disk => disk.cloudData?.providerName)
    .map(disk => disk.cloudData!.providerName as string),
)).filter(providerName => !cloudProviderHasAuthToken(providerName))