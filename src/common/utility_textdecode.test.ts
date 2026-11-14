import { canDriveTakeImage, convertTextPageValueToASCII, getCleanDiskFilename, getDefaultDiskDriveIndex, parseDiskSwapperParam, separateUrlAndComment } from "./utility"

test("disk drive defaults use the emulator's hard-drive image classification", () => {
  expect(getDefaultDiskDriveIndex("disk.dsk", 143360)).toBe(2)
  expect(getDefaultDiskDriveIndex("disk.hdv", 143360)).toBe(0)
  expect(getDefaultDiskDriveIndex("disk.po", 143360)).toBe(2)
  expect(getDefaultDiskDriveIndex("disk.po", 143361)).toBe(0)
  expect(getDefaultDiskDriveIndex("disk.img", 143360)).toBe(2)
  expect(getDefaultDiskDriveIndex("disk.img", 819200)).toBe(0)
  expect(getDefaultDiskDriveIndex("disk.img.zip", 33553920)).toBe(0)
  expect(getDefaultDiskDriveIndex("disk.img.gz", 33553920)).toBe(0)
  expect(getDefaultDiskDriveIndex("disk.img.7z", 33553920)).toBe(0)
  expect(getDefaultDiskDriveIndex("WizardReplay.hdv_.zip", 33553920)).toBe(0)
})

// An 800 KB disk is slot-5 media on the IIgs, so it must default there instead
// of the 5.25" drive, and a bay the user picked explicitly must only be changed
// when that bay physically cannot hold the media.
test("the IIgs slot-5 drive is a real media family for mounting", () => {
  const payload = 64 + 800 * 1024
  expect(getDefaultDiskDriveIndex("SystemDisk.2mg", payload, true)).toBe(4)
  expect(getDefaultDiskDriveIndex("SystemDisk.2mg", payload, false)).toBe(0)
  expect(canDriveTakeImage(0, "SystemDisk.2mg", payload, true)).toBe(true)
  expect(canDriveTakeImage(4, "SystemDisk.2mg", payload, true)).toBe(true)
  expect(canDriveTakeImage(2, "SystemDisk.2mg", payload, true)).toBe(false)
  expect(canDriveTakeImage(4, "game.woz", 368584, true)).toBe(false)
  expect(canDriveTakeImage(2, "game.woz", 368584, true)).toBe(true)
  expect(canDriveTakeImage(4, "WizardReplay.hdv", 33553920, true)).toBe(false)
  expect(canDriveTakeImage(0, "WizardReplay.hdv", 33553920, true)).toBe(true)
  expect(canDriveTakeImage(4, "disk.dsk", 800 * 1024, true)).toBe(true)
  expect(canDriveTakeImage(4, "disk.dsk", 143360, true)).toBe(false)
})

// A protected 3.5" capture (Cavern_Cobra_IIgs.woz, 1,296,147 bytes) is 3.5"
// media: the IIgs's slot-5 drive is the only bay wired for it, so it must land
// there instead of being re-routed to the 5.25" drive - and a captured
// bitstream still cannot be served as block data by slot 7. On a machine
// without a 3.5" bay the floppy drive is the only sane fallback.
test("a 3.5\" WOZ capture is slot-5 media, not 5.25\" media", () => {
  const capture = 1_296_147
  expect(getDefaultDiskDriveIndex("Cavern_Cobra_IIgs.woz", capture, true)).toBe(4)
  expect(getDefaultDiskDriveIndex("Cavern_Cobra_IIgs.woz", capture, false)).toBe(2)
  expect(canDriveTakeImage(4, "Cavern_Cobra_IIgs.woz", capture, true)).toBe(true)
  expect(canDriveTakeImage(5, "Cavern_Cobra_IIgs.woz", capture, true)).toBe(true)
  expect(canDriveTakeImage(2, "Cavern_Cobra_IIgs.woz", capture, true)).toBe(false)
  expect(canDriveTakeImage(0, "Cavern_Cobra_IIgs.woz", capture, true)).toBe(false)
  // A 5.25" capture is still 5.25" media at slot-5 sizes and below.
  expect(canDriveTakeImage(4, "DOS33.woz", 234_496, true)).toBe(false)
  expect(canDriveTakeImage(2, "DOS33.woz", 234_496, true)).toBe(true)
})

test("II+ decode maps 0x60/0x6C/0x6E to space/comma/period", () => {
  const isAltCharSet = false
  const hasMouseText = false
  const hasLowerCase = false

  expect(convertTextPageValueToASCII(0x60, isAltCharSet, hasMouseText, hasLowerCase)).toEqual(" ")
  expect(convertTextPageValueToASCII(0x6C, isAltCharSet, hasMouseText, hasLowerCase)).toEqual(",")
  expect(convertTextPageValueToASCII(0x6E, isAltCharSet, hasMouseText, hasLowerCase)).toEqual(".")
})

test("II+ high-bit punctuation map decodes E0/E2/EC/EE to space/quote/comma/period", () => {
  const isAltCharSet = false
  const hasMouseText = false
  const hasLowerCase = false
  const useApple2PlusMap = true

  expect(convertTextPageValueToASCII(0xE0, isAltCharSet, hasMouseText, hasLowerCase, useApple2PlusMap)).toEqual(" ")
  expect(convertTextPageValueToASCII(0xE2, isAltCharSet, hasMouseText, hasLowerCase, useApple2PlusMap)).toEqual("\"")
  expect(convertTextPageValueToASCII(0xEC, isAltCharSet, hasMouseText, hasLowerCase, useApple2PlusMap)).toEqual(",")
  expect(convertTextPageValueToASCII(0xEE, isAltCharSet, hasMouseText, hasLowerCase, useApple2PlusMap)).toEqual(".")
})

test("Alt-charset decode signature maps 0x60/0x6C/0x6E to `LN (debug signature)", () => {
  const isAltCharSet = true
  const hasMouseText = false
  const hasLowerCase = false

  expect(convertTextPageValueToASCII(0x60, isAltCharSet, hasMouseText, hasLowerCase)).toEqual("`")
  expect(convertTextPageValueToASCII(0x6C, isAltCharSet, hasMouseText, hasLowerCase)).toEqual("L")
  expect(convertTextPageValueToASCII(0x6E, isAltCharSet, hasMouseText, hasLowerCase)).toEqual("N")
})

test("parseDiskSwapperParam parses single and multi-disk swapper URLs", () => {
  expect(parseDiskSwapperParam("http://example.com/disk.dsk")).toEqual(["http://example.com/disk.dsk"])
  expect(parseDiskSwapperParam("{http://example.com/diska, diskb}")).toEqual([
    "http://example.com/diska",
    "http://example.com/diskb"
  ])
  expect(parseDiskSwapperParam("%7Bhttp://example.com/diska%2Cdiskb%7D")).toEqual([
    "http://example.com/diska",
    "http://example.com/diskb"
  ])
  const archiveUrls = parseDiskSwapperParam(
    "{https://archive.org/download/coll/game.zip/sub%2FsideA.woz, sideB.woz}"
  )
  expect(archiveUrls).toEqual([
    "https://archive.org/download/coll/game.zip/sub%2FsideA.woz",
    "https://archive.org/download/coll/game.zip/sub%2FsideB.woz"
  ])
  const withComments = parseDiskSwapperParam(
    "{http://example.com/diska.woz|Program Disk, diskb.woz|Scenario Disk}"
  )
  expect(withComments).toEqual([
    "http://example.com/diska.woz|Program Disk",
    "http://example.com/diskb.woz|Scenario Disk"
  ])
})

test("separateUrlAndComment splits url and optional comment", () => {
  expect(separateUrlAndComment("http://example.com/disk.woz|Program Disk")).toEqual({
    url: "http://example.com/disk.woz",
    comment: "Program Disk"
  })
  expect(separateUrlAndComment("http://example.com/disk.woz")).toEqual({
    url: "http://example.com/disk.woz"
  })
})

test("getCleanDiskFilename extracts only final filename without paths or encoded slashes", () => {
  expect(getCleanDiskFilename("Ultima III (woz-a-day collection)/Ultima III side A.woz")).toBe("Ultima III side A.woz")
  expect(getCleanDiskFilename("Ultima III (woz-a-day collection)%2FUltima III side B.woz")).toBe("Ultima III side B.woz")
  expect(getCleanDiskFilename("https://archive.org/download/something/disc.dsk")).toBe("disc.dsk")
  expect(getCleanDiskFilename("sub\\dir\\game.nib")).toBe("game.nib")
  expect(getCleanDiskFilename("simple.woz")).toBe("simple.woz")
})

