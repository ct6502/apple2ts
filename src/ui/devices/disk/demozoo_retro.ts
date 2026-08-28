import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import { showGlobalProgressModal } from "../../ui_utilities"
import {
  createDemoZooCloudData,
  demoZooTypeFilters,
  filterDemoZooItems,
  loadDemoZooResult,
  loadDemoZooSnapshot,
  type DemoZooItem,
} from "./demozoodialog"

const PAGE_SIZE = 50

type DemoZooRetroState = {
  items: DemoZooItem[]
  query: string
  typeIndex: number
  page: number
  loading: boolean
}

const initialState = (): DemoZooRetroState => ({ items: [], query: "", typeIndex: 0, page: 1, loading: false })

const ensureItems = async (state: DemoZooRetroState) => {
  if (state.loading || state.items.length > 0) return
  state.loading = true
  showGlobalProgressModal(true, "Fetching DemoZoo productions")
  try {
    state.items = await loadDemoZooSnapshot()
  } finally {
    state.loading = false
    showGlobalProgressModal(false)
  }
}

const buildItems = (context: RetroMenuContext, driveIndex: number, state: DemoZooRetroState): RetroControlMetadata[] => {
  const type = demoZooTypeFilters[state.typeIndex].id
  const results = filterDemoZooItems(state.items, type, state.query)
  const visibleResults = results.slice(0, state.page * PAGE_SIZE)
  const controls: RetroControlMetadata[] = [
    {
      id: `diskDrives.${driveIndex}.demoZoo.type`,
      kind: "action",
      label: "Type",
      options: demoZooTypeFilters.map(filter => ({ label: context.t(filter.labelKey) })),
      optionIndex: state.typeIndex,
      keepMenuOpen: true,
      refreshAfterAction: true,
      action: async () => { await ensureItems(state) },
      refreshOptions: (runtime, index) => {
        state.typeIndex = index
        state.page = 1
        return buildItems(runtime, driveIndex, state)
      },
    },
    {
      id: `diskDrives.${driveIndex}.demoZoo.title`,
      kind: "action",
      label: "Title",
      textInput: true,
      textValue: state.query,
      keepMenuOpen: true,
      refreshAfterAction: true,
      onTextInput: (runtime, value) => {
        state.query = value
        state.page = 1
        return buildItems(runtime, driveIndex, state)
      },
      action: async () => { await ensureItems(state) },
    },
  ]

  if (visibleResults.length === 0) return controls
  controls.push({
    id: `diskDrives.${driveIndex}.demoZoo.resultsSeparator`,
    label: "Results",
    separator: true,
    selectable: false,
  })
  visibleResults.forEach((item, index) => {
    const itemId = `demozoo_${item.id}`
    const isLast = index === visibleResults.length - 1
    controls.push({
      id: `diskDrives.${driveIndex}.demoZoo.result.${item.id}`,
      label: item.title,
      indicator: context.diskBookmarks?.contains(itemId) ? "*" : undefined,
      contextualActionLabel: "Load",
      keepMenuOpen: true,
      onHorizontalInput: (runtime, direction) => {
        if (!runtime.diskBookmarks) return
        if (direction < 0) runtime.diskBookmarks.remove(itemId)
        else if (!runtime.diskBookmarks.contains(itemId)) {
          runtime.diskBookmarks.set({
            type: DISK_COLLECTION_ITEM_TYPE.DEMOZOO,
            id: itemId,
            title: item.title,
            screenshotUrl: new URL(item.screenshotUrl || "https://demozoo.org/static/images/demozoo-logo.png"),
            diskUrl: item.demozooUrl,
            detailsUrl: new URL(item.demozooUrl),
            lastUpdated: new Date(),
            cloudData: createDemoZooCloudData(item),
          })
        }
        return buildItems(runtime, driveIndex, state)
      },
      action: async runtime => {
        showGlobalProgressModal(true, runtime.t("disk.downloadingDisk"))
        try {
          if (await loadDemoZooResult(item, driveIndex)) runtime.close()
        } finally {
          showGlobalProgressModal(false)
        }
      },
      loadMoreOnNavigatePastEnd: isLast && visibleResults.length < results.length
        ? async runtime => {
          state.page += 1
          return buildItems(runtime, driveIndex, state)
        }
        : undefined,
    })
  })
  return controls
}

export const createRetroDemoZooControl = (driveIndex: number): RetroControlMetadata => {
  let state = initialState()
  return {
    id: `diskDrives.${driveIndex}.load.demoZoo`,
    label: context => context.t("disk.loadDiskFromDemoZoo"),
    submenuTitle: "DemoZoo",
    actionLabel: "Search",
    dynamicChildren: (context, items) => {
      if (items === undefined) state = initialState()
      return buildItems(context, driveIndex, state)
    },
  }
}