import { convertTextPageValueToASCII, getDefaultDiskDriveIndex } from "./utility"

test("disk drive defaults use the emulator's hard-drive image classification", () => {
  expect(getDefaultDiskDriveIndex("disk.dsk", 143360)).toBe(2)
  expect(getDefaultDiskDriveIndex("disk.hdv", 143360)).toBe(0)
  expect(getDefaultDiskDriveIndex("disk.po", 143360)).toBe(2)
  expect(getDefaultDiskDriveIndex("disk.po", 143361)).toBe(0)
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
