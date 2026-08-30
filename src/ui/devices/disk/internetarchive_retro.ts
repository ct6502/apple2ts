import { showGlobalProgressModal } from "../../ui_utilities"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import {
  internetArchiveCollections,
  loadInternetArchiveResult,
  searchInternetArchive,
  createInternetArchiveCloudData,
  type InternetArchiveResult,
} from "./internetarchive"
import { generateUrlFromInternetArchiveId } from "./internetarchive_utils"

type InternetArchiveRetroState = {
  collectionIndex: number
  query: string
  results: InternetArchiveResult[]
  total: number
  page: number
  loading: boolean
}

const initialState = (): InternetArchiveRetroState => ({
  collectionIndex: 0,
  query: "",
  results: [],
  total: 0,
  page: 0,
  loading: false,
})

const collectionTitle = (title: string) => {
  const separatorIndex = title.indexOf(":")
  return separatorIndex < 0 ? title : title.slice(separatorIndex + 1).trim()
}

const runSearch = async (state: InternetArchiveRetroState, append: boolean) => {
  if (state.loading) return
  state.loading = true
  showGlobalProgressModal(true, "Fetching query results")
  try {
    const page = append ? state.page + 1 : 1
    const response = await searchInternetArchive(
      state.query,
      internetArchiveCollections[state.collectionIndex].id,
      page,
    )
    state.results = append ? [...state.results, ...response.results] : response.results
    state.total = response.total
    state.page = page
  } finally {
    state.loading = false
    showGlobalProgressModal(false)
  }
}

const buildItems = (
  context: RetroMenuContext,
  driveIndex: number,
  state: InternetArchiveRetroState,
): RetroControlMetadata[] => {
  const items: RetroControlMetadata[] = [
    {
      id: `diskDrives.${driveIndex}.internetArchive.collection`,
      kind: "action",
      label: "Collection",
      options: internetArchiveCollections.map(collection => ({ label: collectionTitle(collection.title) })),
      optionIndex: state.collectionIndex,
      keepMenuOpen: true,
      refreshAfterAction: true,
      action: async () => {
        await runSearch(state, false)
      },
      refreshOptions: (runtime, index) => {
        state.collectionIndex = index
        state.results = []
        state.total = 0
        state.page = 0
        return buildItems(runtime, driveIndex, state)
      },
    },
    {
      id: `diskDrives.${driveIndex}.internetArchive.title`,
      kind: "action",
      label: "Title",
      textInput: true,
      textValue: state.query,
      keepMenuOpen: true,
      refreshAfterAction: true,
      onTextInput: (runtime, value) => {
        state.query = value
        state.results = []
        state.total = 0
        state.page = 0
        return buildItems(runtime, driveIndex, state)
      },
      action: async () => {
        await runSearch(state, false)
      },
    },
  ]

  if (state.results.length === 0) return items

  items.push({
    id: `diskDrives.${driveIndex}.internetArchive.resultsSeparator`,
    label: "Results",
    separator: true,
    selectable: false,
  })
  state.results.forEach((result, index) => {
    const isLast = index === state.results.length - 1
    const isFavorite = context.diskBookmarks?.contains(result.identifier) ?? false
    items.push({
      id: `diskDrives.${driveIndex}.internetArchive.result.${result.identifier}`,
      label: result.title,
      indicator: isFavorite ? "*" : undefined,
      contextualActionLabel: "Load",
      keepMenuOpen: true,
      onHorizontalInput: (runtime, direction) => {
        if (!runtime.diskBookmarks) return
        if (direction < 0) {
          runtime.diskBookmarks.remove(result.identifier)
        } else if (!runtime.diskBookmarks.contains(result.identifier)) {
          runtime.diskBookmarks.set({
            type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
            id: result.identifier,
            title: result.title,
            screenshotUrl: new URL(`https://archive.org/services/img/${result.identifier}`),
            diskUrl: generateUrlFromInternetArchiveId(result.identifier).toString(),
            detailsUrl: new URL(`https://archive.org/details/${result.identifier}`),
            lastUpdated: new Date(),
            cloudData: createInternetArchiveCloudData(result),
          })
        }
        return buildItems(runtime, driveIndex, state)
      },
      action: async runtime => {
        if (await loadInternetArchiveResult(result, driveIndex)) runtime.close()
      },
      loadMoreOnNavigatePastEnd: isLast && state.results.length < state.total
        ? async runtime => {
          await runSearch(state, true)
          return buildItems(runtime, driveIndex, state)
        }
        : undefined,
    })
  })
  return items
}

export const createRetroInternetArchiveControl = (driveIndex: number): RetroControlMetadata => {
  let state = initialState()
  return {
    id: `diskDrives.${driveIndex}.load.internetArchive`,
    label: context => context.t("disk.loadDiskFromInternetArchive"),
    submenuTitle: "Internet Archive",
    actionLabel: "Search",
    dynamicChildren: (context, items) => {
      if (items === undefined) state = initialState()
      return buildItems(context, driveIndex, state)
    },
  }
}
