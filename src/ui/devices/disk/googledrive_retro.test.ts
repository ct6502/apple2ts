const mockLoadDiskFromCloudDrive = jest.fn()

jest.mock("./diskdrive", () => ({
  loadDiskFromCloudDrive: (...args: unknown[]) => mockLoadDiskFromCloudDrive(...args),
}))
jest.mock("./googledrive", () => ({ GoogleDrive: jest.fn() }))

import { ControlRegistry } from "../../controls/controlregistry"
import { createControlContext } from "../../retro/retromenucontext"
import { GoogleDrive } from "./googledrive"
import { createRetroGoogleDriveControl } from "./googledrive_retro"

describe("retro Google Drive control", () => {
  beforeEach(() => jest.clearAllMocks())

  test("loads through Google Picker and closes after success", async () => {
    mockLoadDiskFromCloudDrive.mockResolvedValue(true)
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.close = jest.fn()
    const metadata = createRetroGoogleDriveControl(2)
    metadata.parentId = null
    const control = new ControlRegistry([metadata]).resolve(context)[0]

    await control.action?.()

    expect(GoogleDrive).toHaveBeenCalledWith()
    expect(mockLoadDiskFromCloudDrive).toHaveBeenCalledWith(expect.any(GoogleDrive), 2)
    expect(context.close).toHaveBeenCalled()
  })

  test("keeps the menu open when selection is cancelled", async () => {
    mockLoadDiskFromCloudDrive.mockResolvedValue(false)
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.close = jest.fn()
    const metadata = createRetroGoogleDriveControl(0)
    metadata.parentId = null
    const control = new ControlRegistry([metadata]).resolve(context)[0]

    await control.action?.()

    expect(context.close).not.toHaveBeenCalled()
  })
})