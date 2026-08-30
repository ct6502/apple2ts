export const isOneDriveMsalAuthCallback = (
  location: Pick<Location, "search" | "hash"> = window.location,
  opener: WindowProxy | null = window.opener,
) => {
  if (!opener) return false
  const params = new URLSearchParams(location.search)
  if (params.get("cloudProvider") !== "OneDrive") return false
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""))
  return hashParams.has("state") && (hashParams.has("code") || hashParams.has("error"))
}