import { convertTextPageValueToASCII, getCleanDiskFilename, getDefaultDiskDriveIndex, parseDiskSwapperParam, separateUrlAndComment } from "./utility"

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

