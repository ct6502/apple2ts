import {
  createHelpTextSelector,
  findCatalogHelpFile,
  getHelpFileUrl,
  readHelpResponseText
} from "./helpfile"
import { diskImages, internalDiskResources } from "./diskimages"
import { newReleases } from "./newreleases"
import fs from "node:fs"
import path from "node:path"

describe("findCatalogHelpFile", () => {
  it.each([
    ["Eamon", "Eamon 1.txt"],
    ["Total Replay", "TotalReplay.txt"],
    ["Instant Replay", "TotalReplayII.txt"],
    ["Pitch Dark", "PitchDark.txt"],
    ["Wizard Replay", "WizardReplay.txt"]
  ])("finds the Help file declared for %s", (title, helpFile) => {
    const disk = diskImages.find((item) => item.title === title)

    expect(findCatalogHelpFile(disk?.diskUrl ?? "")).toBe(helpFile)
  })

  it("finds the Help file declared for the internal blank disk", () => {
    expect(findCatalogHelpFile("blank.po")).toBe("blank.txt")
  })

  it("finds Help when a direct loader uses the bundled-disk URL prefix", () => {
    expect(findCatalogHelpFile("/disks/Eamon%201.po")).toBe("Eamon 1.txt")
  })

  it("does not infer a Help file from an uncataloged disk filename", () => {
    expect(findCatalogHelpFile("Tass Times.2mg")).toBeUndefined()
  })

  it.each([...diskImages, ...newReleases, ...internalDiskResources].filter((disk) => disk.helpFile))(
    "references an existing Help file for $diskUrl",
    ({ helpFile }) => {
      expect(fs.existsSync(path.resolve(__dirname, "../../../../public/disks", helpFile ?? "")))
        .toBe(true)
    }
  )
})

describe("getHelpFileUrl", () => {
  it("encodes a declared filesystem filename for an HTTP request", () => {
    expect(getHelpFileUrl("Eamon 1.txt")).toBe("disks/Eamon%201.txt")
  })
})

describe("readHelpResponseText", () => {
  const response = (ok: boolean, contentType: string | null, body: string) => {
    const text = jest.fn().mockResolvedValue(body)
    return {
      value: {
        ok,
        headers: { get: jest.fn().mockReturnValue(contentType) },
        text
      } as unknown as Pick<Response, "ok" | "headers" | "text">,
      text
    }
  }

  it("rejects an unsuccessful response without reading its body", async () => {
    const result = response(false, "text/plain", "Missing")

    await expect(readHelpResponseText(result.value)).resolves.toBeNull()
    expect(result.text).not.toHaveBeenCalled()
  })

  it("rejects an HTML fallback without inspecting its body", async () => {
    const result = response(true, "text/html; charset=utf-8", "<!DOCTYPE html>")

    await expect(readHelpResponseText(result.value)).resolves.toBeNull()
    expect(result.text).not.toHaveBeenCalled()
  })

  it.each(["text/plain; charset=utf-8", null])(
    "reads Help text with content type %p",
    async (contentType) => {
      const result = response(true, contentType, "Disk Help")

      await expect(readHelpResponseText(result.value)).resolves.toBe("Disk Help")
      expect(result.text).toHaveBeenCalledTimes(1)
    }
  )
})

describe("createHelpTextSelector", () => {
  it("does not apply Help from a disk that is no longer selected", async () => {
    let finishOldLoad: (helpText: string) => void = () => undefined
    const loadHelpText = () => new Promise<string>((resolve) => {
      finishOldLoad = resolve
    })
    const appliedHelp: string[] = []
    const selectHelpText = createHelpTextSelector(loadHelpText)

    selectHelpText("old.txt", (helpText) => appliedHelp.push(helpText))
    selectHelpText(undefined, (helpText) => appliedHelp.push(helpText))
    finishOldLoad("Old disk Help")
    await Promise.resolve()

    expect(appliedHelp).toEqual(["<Default>"])
  })
})
