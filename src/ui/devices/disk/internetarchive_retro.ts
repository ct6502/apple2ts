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
import { controlFromJson, type RetroControlBindings } from "../../retro/retrocontrolmetadata"

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

const iaTemplateBindings: RetroControlBindings = {
  "diskDrives.internetArchive.collection": { label: (): string => "Collection" },
  "diskDrives.internetArchive.title": { label: (): string => "Title" },
  "diskDrives.internetArchive.resultsSeparator": { label: (): string => "Results" },
  "diskDrives.internetArchive.result": { label: (): string => "" },
}

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
  const collectionBase = controlFromJson("diskTemplates", "diskDrives.{{driveIndex}}.internetArchive.collection", iaTemplateBindings, { driveIndex })
  const titleBase = controlFromJson("diskTemplates", "diskDrives.{{driveIndex}}.internetArchive.title", iaTemplateBindings, { driveIndex })
  const items: RetroControlMetadata[] = [
    {
      ...collectionBase,
      options: internetArchiveCollections.map(collection => ({ label: collectionTitle(collection.title) })),
      optionIndex: state.collectionIndex,
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
      ...titleBase,
      textValue: state.query,
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

  const resultsSepBase = controlFromJson("diskTemplates", "diskDrives.{{driveIndex}}.internetArchive.resultsSeparator", iaTemplateBindings, { driveIndex })
  items.push(resultsSepBase)
  const resultBase = controlFromJson("diskTemplates", "diskDrives.internetArchive.result", iaTemplateBindings)
  state.results.forEach((result, index) => {
    const isLast = index === state.results.length - 1
    const isFavorite = context.diskBookmarks?.contains(result.identifier) ?? false
    items.push({
      ...resultBase,
      id: `diskDrives.${driveIndex}.internetArchive.result.${result.identifier}`,
      label: result.title,
      indicator: isFavorite ? "*" : undefined,
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
  const template = controlFromJson(
    "diskTemplates",
    "diskDrives.{{driveIndex}}.load.internetArchive",
    {},
    { driveIndex },
  )
  return {
    ...template,
    dynamicChildren: (context, items) => {
      if (items === undefined) state = initialState()
      return buildItems(context, driveIndex, state)
    },
  }
}
