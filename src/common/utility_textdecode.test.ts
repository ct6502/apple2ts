import { convertTextPageValueToASCII } from "./utility"

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
