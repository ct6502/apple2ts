import { showGlobalProgressModal } from "../../ui_utilities"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import {
  internetArchiveCollections,
  loadInternetArchiveResult,
  searchInternetArchive,
  type InternetArchiveResult,
} from "./internetarchive"

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
      options: internetArchiveCollections.map(collection => ({ label: collection.title })),
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
    items.push({
      id: `diskDrives.${driveIndex}.internetArchive.result.${result.identifier}`,
      label: result.title,
      contextualActionLabel: "Load",
      keepMenuOpen: true,
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
