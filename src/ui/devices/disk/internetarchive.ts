import { CLOUD_SYNC } from "../../../common/utility"
import { apple2tsProxyPath, hasApple2tsProxy } from "./apple2tsproxy"
import { handleSetDiskFromURL } from "./driveprops"
import { generateUrlFromInternetArchiveId } from "./internetarchive_utils"

export const INTERNET_ARCHIVE_PAGE_SIZE = 25

export type InternetArchiveCollection = {
  id: string
  title: string
  imageUrl: string
}

export type InternetArchiveResult = {
  identifier: string
  title: string
  creator: string
  downloads: number
  month: number
  num_reviews: number
}

export type InternetArchiveSearchPage = {
  results: InternetArchiveResult[]
  total: number
}

export const internetArchiveCollections: InternetArchiveCollection[] = [
  {
    id: "softwarelibrary_apple",
    title: "The Software Library: Apple Computer",
    imageUrl: "collections/softwarelibrary_apple_itemimage.jpg",
  },
  {
    id: "softwarelibrary_apple_games",
    title: "The Apple II Library: Games",
    imageUrl: "collections/softwarelibrary_apple_games_itemimage.jpg",
  },
  {
    id: "softwarelibrary_apple_woz_educational",
    title: "Software Library: Apple Educational",
    imageUrl: "collections/softwarelibrary_apple_woz_educational_itemimage.jpg",
  },
  {
    id: "apple_ii_library_4am",
    title: "Apple II Library: The 4am Collection",
    imageUrl: "collections/apple_ii_library_4am_itemimage.jpg",
  },
]

export const buildInternetArchiveQueryUrl = (
  query: string,
  collectionId: string,
  page: number,
) => {
  const params = [
    `q=title:(${query || "*"})+AND+collection:(${collectionId})+AND+mediatype:(software)`,
    "fl[]=identifier",
    "fl[]=title",
    "fl[]=creator",
    "fl[]=downloads",
    "fl[]=month",
    "fl[]=num_reviews",
    "sort[]=downloads+desc",
    "sort[]=stars+desc",
    `rows=${INTERNET_ARCHIVE_PAGE_SIZE}`,
    `page=${page}`,
    "output=json",
  ]
  return `https://archive.org/advancedsearch.php?${params.join("&")}`
}

export const searchInternetArchive = async (
  query: string,
  collectionId: string,
  page = 1,
): Promise<InternetArchiveSearchPage> => {
  const queryUrl = buildInternetArchiveQueryUrl(query, collectionId, page)
  const requestUrl = (hasApple2tsProxy || /\.pages\.dev$/i.test(window.location.hostname))
    ? apple2tsProxyPath(`/api/disk-direct?url=${encodeURIComponent(queryUrl)}`)
    : queryUrl
  const response = await fetch(requestUrl)
  if (!response.ok) throw new Error(`Internet Archive search failed: ${response.status}`)
  const json = await response.json()
  return {
    results: json?.response?.docs ?? [],
    total: json?.response?.numFound ?? 0,
  }
}

export const createInternetArchiveCloudData = (result: Pick<InternetArchiveResult, "identifier">): CloudData => ({
  providerName: "InternetArchive",
  syncStatus: CLOUD_SYNC.INACTIVE,
  syncInterval: -1,
  lastSyncTime: Number.MAX_VALUE,
  fileName: "",
  itemId: result.identifier,
  apiEndpoint: "",
  downloadUrl: generateUrlFromInternetArchiveId(result.identifier).toString(),
  detailsUrl: `https://archive.org/details/${result.identifier}`,
  fileSize: -1,
})

export const loadInternetArchiveResult = async (
  result: Pick<InternetArchiveResult, "identifier">,
  driveIndex: number,
) => {
  const cloudData = createInternetArchiveCloudData(result)
  return handleSetDiskFromURL(cloudData.downloadUrl, undefined, driveIndex, cloudData)
}
