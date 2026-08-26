const mockGoogleHasAuthToken = jest.fn()
const mockGoogleRequestAuthToken = jest.fn()
const mockOneDriveHasAuthToken = jest.fn()

jest.mock("./googledrive", () => ({
  GoogleDrive: jest.fn().mockImplementation(() => ({
    hasAuthToken: mockGoogleHasAuthToken,
    requestAuthToken: mockGoogleRequestAuthToken,
  })),
}))

jest.mock("./onedriveclouddrive", () => ({
  OneDriveCloudDrive: jest.fn().mockImplementation(() => ({
    hasAuthToken: mockOneDriveHasAuthToken,
    requestAuthToken: jest.fn(),
  })),
}))

import { getCloudProvidersNeedingAuth, signInToCloudProvider } from "./cloudauth"

const cloudDisk = (providerName: string): DiskCollectionItem => ({
  cloudData: { providerName } as CloudData,
} as DiskCollectionItem)

describe("cloud authentication notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGoogleHasAuthToken.mockReturnValue(false)
    mockOneDriveHasAuthToken.mockReturnValue(true)
  })

  test("returns each unauthenticated provider once", () => {
    expect(getCloudProvidersNeedingAuth([
      cloudDisk("GoogleDrive"),
      cloudDisk("GoogleDrive"),
      cloudDisk("OneDrive"),
    ])).toEqual(["GoogleDrive"])
  })

  test("sign in invokes the provider auth action", async () => {
    mockGoogleRequestAuthToken.mockImplementation(callback => callback("token"))

    await expect(signInToCloudProvider("GoogleDrive")).resolves.toBe(true)
    expect(mockGoogleRequestAuthToken).toHaveBeenCalledTimes(1)
  })

  test("reports a provider auth failure", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => undefined)
    mockGoogleRequestAuthToken.mockImplementation(() => {
      throw new Error("popup blocked")
    })

    await expect(signInToCloudProvider("GoogleDrive")).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith(expect.stringContaining("Google Drive sign-in did not complete"))
  })
})