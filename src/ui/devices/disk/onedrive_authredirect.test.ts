import { isOneDriveMsalAuthCallback } from "./onedrive_authredirect"

describe("OneDrive MSAL auth callback", () => {
  const opener = {} as WindowProxy

  test("recognizes authorization code and error popup responses", () => {
    expect(isOneDriveMsalAuthCallback({
      search: "?cloudProvider=OneDrive",
      hash: "#code=authorization-code&state=request-state",
    } as Location, opener)).toBe(true)
    expect(isOneDriveMsalAuthCallback({
      search: "?cloudProvider=OneDrive",
      hash: "#error=access_denied&state=request-state",
    } as Location, opener)).toBe(true)
  })

  test("does not intercept normal app or legacy picker URLs", () => {
    expect(isOneDriveMsalAuthCallback({
      search: "?cloudProvider=OneDrive",
      hash: "#access_token=token&state=request-state",
    } as Location, opener)).toBe(false)
    expect(isOneDriveMsalAuthCallback({
      search: "?cloudProvider=OneDrive",
      hash: "#code=authorization-code&state=request-state",
    } as Location, null)).toBe(false)
    expect(isOneDriveMsalAuthCallback({
      search: "",
      hash: "#Disk.po",
    } as Location, opener)).toBe(false)
  })
})