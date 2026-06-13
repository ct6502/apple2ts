import { memGet } from "./memory"
import { getMountedMediaFilenames } from "./devices/drivestate"
import { passRetroAchievementsState } from "./worker2main"

const achievementGames: RetroAchievementGameDefinition[] = [
  {
    gameId: "hardhatmack",
    title: "Hard Hat Mack",
    mediaMatches: ["hard hat mack", "hardhatmack", "hhm"],
    // Entry point JSR $2204 at $0800 — confirmed by Computist #5 boot trace
    signatureAddress: 0x0800,
    signatureData: [0x20, 0x04, 0x22],
    achievements: [
      {
        id: "hhm_loaded",
        title: "On the Job",
        description: "Boot Hard Hat Mack into gameplay memory.",
        points: 5,
        conditions: [{ address: 0x0800, operator: "==", value: 0x20 }],
      },
      {
        id: "hhm_level2",
        title: "Second Shift",
        description: "Reach the second construction level.",
        points: 15,
        // The game cycles three distinct levels. $0804 holds the current level
        // index (0, 1, 2). Reaching 1 means level 2 is active.
        conditions: [
          { address: 0x0800, operator: "==", value: 0x20 },
          { address: 0x0804, operator: ">=", value: 0x01 },
        ],
      },
      {
        id: "hhm_level3",
        title: "Foreman's Pride",
        description: "Reach the third construction level.",
        points: 25,
        conditions: [
          { address: 0x0800, operator: "==", value: 0x20 },
          { address: 0x0804, operator: ">=", value: 0x02 },
        ],
      },
    ],
  },
  {
    gameId: "karateka",
    title: "Karateka",
    mediaMatches: ["karateka"],
    signatureAddress: 0x6E6C,
    signatureData: [0xAD, 0x00, 0xC0],
    achievements: [
      {
        id: "karateka_loaded",
        title: "The Gate Opens",
        description: "Boot Karateka into gameplay memory.",
        points: 5,
        conditions: [{ address: 0x6E6C, operator: "==", value: 0xAD }],
      },
      {
        id: "karateka_first_hit",
        title: "First Strike",
        description: "Land damage on your opponent.",
        points: 10,
        conditions: [{ address: 0xB7, operator: "<", value: 14 }],
        progress: { address: 0xB7, min: 14, max: 0, direction: "down" },
      },
    ],
  },
  {
    gameId: "princeofpersia",
    title: "Prince of Persia",
    mediaMatches: ["prince", "pop", "persia"],
    // PLP / STA $11 at $0800 — live-debugged. Stable in lower 48K whether
    // POP boots directly or via Total Replay. Menu has [01 8A 48] there.
    signatureAddress: 0x0800,
    signatureData: [0x28, 0x85, 0x11],
    achievements: [
      {
        id: "prince_loaded",
        title: "Dungeon Escape Artist",
        description: "Boot Prince of Persia into gameplay memory.",
        points: 5,
        conditions: [{ address: 0x0800, operator: "==", value: 0x28 }],
      },
      {
        id: "prince_runner",
        title: "Time Is Short",
        description: "Reach the game loop with the timer running.",
        points: 10,
        conditions: [
          { address: 0x0800, operator: "==", value: 0x28 },
          { address: 0x0801, operator: "==", value: 0x85 },
        ],
      },
    ],
  },
  {
    gameId: "robotron",
    title: "Robotron: 2084",
    mediaMatches: ["robotron"],
    signatureAddress: 0x4242,
    signatureData: [0xAD, 0x00, 0xC0],
    achievements: [
      {
        id: "robotron_loaded",
        title: "Factory Reset",
        description: "Boot Robotron: 2084 into gameplay memory.",
        points: 5,
        conditions: [{ address: 0x4242, operator: "==", value: 0xAD }],
      },
      {
        id: "robotron_contact",
        title: "Under Fire",
        description: "Trigger the death pulse once.",
        points: 10,
        conditions: [{ address: 0x39CF, operator: "==", value: 0xFF }],
      },
    ],
  },
]

const defaultState = (): RetroAchievementsState => ({
  enabled: true,
  hardcore: true,
  active: false,
  gameId: null,
  gameTitle: "",
  statusText: "No supported game loaded.",
  trackerText: "",
  achievements: [],
  toasts: [],
})

let raState: RetroAchievementsState = defaultState()
let runtimeState = new Map<string, RetroAchievementRuntimeState>()
let dirty = true

const cloneAchievementView = (achievement: RetroAchievementDefinition): RetroAchievementView => {
  const runtime = runtimeState.get(achievement.id) || {
    unlocked: false,
    unlockedAt: null,
    measuredValue: null,
    measuredPercent: 0,
  }
  return {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    points: achievement.points,
    unlocked: runtime.unlocked,
    unlockedAt: runtime.unlockedAt,
    measuredValue: runtime.measuredValue,
    measuredPercent: runtime.measuredPercent,
    category: achievement.category || "core",
  }
}

const publishState = (force = false) => {
  if (!dirty && !force) return
  dirty = false
  passRetroAchievementsState({
    ...raState,
    achievements: [...raState.achievements],
    toasts: [...raState.toasts],
  })
}

const setStatusText = (statusText: string) => {
  if (raState.statusText !== statusText) {
    raState.statusText = statusText
    dirty = true
  }
}

const pushToast = (toast: Omit<RetroAchievementToast, "createdAt">) => {
  raState.toasts = [
    ...raState.toasts.filter((item) => item.id !== toast.id).slice(-3),
    { ...toast, createdAt: Date.now() },
  ].slice(-4)
  dirty = true
}

const purgeToasts = () => {
  const next = raState.toasts.filter((toast) => (Date.now() - toast.createdAt) < 6000)
  if (next.length !== raState.toasts.length) {
    raState.toasts = next
    dirty = true
  }
}

const compareValue = (left: number, operator: RetroAchievementOperator, right: number) => {
  switch (operator) {
    case "==": return left === right
    case "!=": return left !== right
    case ">": return left > right
    case ">=": return left >= right
    case "<": return left < right
    case "<=": return left <= right
  }
}

const matchesSignature = (game: RetroAchievementGameDefinition) => {
  for (let i = 0; i < game.signatureData.length; i++) {
    if (memGet(game.signatureAddress + i, false) !== game.signatureData[i]) {
      return false
    }
  }
  return true
}

const getMatchingGame = () => {
  const filenames = getMountedMediaFilenames().map((name) => name.toLowerCase())
  // First pass: require both a filename hint and a matching memory signature.
  for (const game of achievementGames) {
    const mediaMatch = filenames.some((filename) =>
      game.mediaMatches.some((match) => filename.includes(match.toLowerCase())))
    if (mediaMatch && matchesSignature(game)) {
      return game
    }
  }
  // Second pass: filename gave no hint (e.g. "00playable.woz" from WOZ-a-day),
  // so fall back to memory-signature matching alone.
  for (const game of achievementGames) {
    if (matchesSignature(game)) {
      return game
    }
  }
  return null
}

const setActiveGame = (game: RetroAchievementGameDefinition | null) => {
  const previousGameId = raState.gameId
  if (!game) {
    if (raState.active || raState.gameId) {
      raState.active = false
      raState.gameId = null
      raState.gameTitle = ""
      raState.achievements = []
      raState.trackerText = ""
      setStatusText("No supported game loaded.")
      dirty = true
    }
    return
  }

  if (previousGameId === game.gameId && raState.active) {
    return
  }

  runtimeState = new Map<string, RetroAchievementRuntimeState>()
  raState.active = true
  raState.gameId = game.gameId
  raState.gameTitle = game.title
  raState.achievements = game.achievements.map((achievement) => cloneAchievementView(achievement))
  raState.trackerText = ""
  setStatusText(`Achievements active for ${game.title}.`)
  pushToast({
    id: `status:${game.gameId}`,
    title: game.title,
    description: "Achievements are now active.",
    kind: "status",
  })
  dirty = true
}

const updateTracker = (game: RetroAchievementGameDefinition) => {
  let bestTracker = ""
  let bestPercent = -1
  for (const achievement of game.achievements) {
    const runtime = runtimeState.get(achievement.id)
    if (!runtime || runtime.unlocked || !achievement.progress) continue
    if (runtime.measuredPercent > bestPercent && runtime.measuredPercent < 100) {
      bestPercent = runtime.measuredPercent
      bestTracker = `${achievement.title}: ${runtime.measuredPercent}%`
    }
  }
  if (raState.trackerText !== bestTracker) {
    raState.trackerText = bestTracker
    dirty = true
  }
}

const updateAchievementRuntime = (achievement: RetroAchievementDefinition) => {
  const currentRuntime = runtimeState.get(achievement.id) || {
    unlocked: false,
    unlockedAt: null,
    measuredValue: null,
    measuredPercent: 0,
  }
  let changed = false

  if (achievement.progress) {
    const value = memGet(achievement.progress.address, false)
    let percent = 0
    if (achievement.progress.direction === "down") {
      const span = Math.max(1, achievement.progress.min - achievement.progress.max)
      percent = Math.round(((achievement.progress.min - value) / span) * 100)
    } else {
      const span = Math.max(1, achievement.progress.max - achievement.progress.min)
      percent = Math.round(((value - achievement.progress.min) / span) * 100)
    }
    percent = Math.max(0, Math.min(100, percent))
    if (currentRuntime.measuredValue !== value || currentRuntime.measuredPercent !== percent) {
      currentRuntime.measuredValue = value
      currentRuntime.measuredPercent = percent
      changed = true
    }
  }

  const isUnlocked = achievement.conditions.every((condition) => compareValue(memGet(condition.address, false), condition.operator, condition.value))
  if (isUnlocked && !currentRuntime.unlocked) {
    currentRuntime.unlocked = true
    currentRuntime.unlockedAt = Date.now()
    currentRuntime.measuredPercent = 100
    pushToast({
      id: `unlock:${achievement.id}`,
      title: achievement.title,
      description: achievement.description,
      kind: "unlock",
    })
    changed = true
  }

  runtimeState.set(achievement.id, currentRuntime)
  return changed
}

const syncViews = (game: RetroAchievementGameDefinition) => {
  const nextAchievements = game.achievements.map((achievement) => cloneAchievementView(achievement))
  const previous = JSON.stringify(raState.achievements)
  const next = JSON.stringify(nextAchievements)
  if (previous !== next) {
    raState.achievements = nextAchievements
    dirty = true
  }
}

export const getRetroAchievementsState = () => {
  return raState
}

export const configureRetroAchievements = (config: RetroAchievementsConfig) => {
  if (typeof config.enabled === "boolean" && raState.enabled !== config.enabled) {
    raState.enabled = config.enabled
    dirty = true
  }
  if (typeof config.hardcore === "boolean" && raState.hardcore !== config.hardcore) {
    raState.hardcore = config.hardcore
    dirty = true
    pushToast({
      id: `status:hardcore:${Number(config.hardcore)}`,
      title: config.hardcore ? "Hardcore Enabled" : "Hardcore Disabled",
      description: config.hardcore ? "Restricted features are locked while achievements are active." : "Save states, debugger tools, and time travel are available again.",
      kind: "status",
    })
  }
  publishState(true)
}

export const resetRetroAchievements = () => {
  runtimeState = new Map<string, RetroAchievementRuntimeState>()
  raState = {
    ...defaultState(),
    enabled: raState.enabled,
    hardcore: raState.hardcore,
  }
  dirty = true
  publishState(true)
}

export const serializeRetroAchievements = (): RetroAchievementsSaveState => {
  return {
    enabled: raState.enabled,
    hardcore: raState.hardcore,
    gameId: raState.gameId,
    runtime: Object.fromEntries(runtimeState.entries()),
  }
}

export const restoreRetroAchievements = (saveState?: RetroAchievementsSaveState | null) => {
  if (!saveState) {
    runtimeState = new Map<string, RetroAchievementRuntimeState>()
    raState.enabled = true
    raState.hardcore = true
    setActiveGame(null)
    publishState(true)
    return
  }

  raState.enabled = saveState.enabled
  raState.hardcore = saveState.hardcore
  runtimeState = new Map<string, RetroAchievementRuntimeState>(Object.entries(saveState.runtime || {}))
  const game = achievementGames.find((item) => item.gameId === saveState.gameId) || null
  if (game) {
    raState.active = true
    raState.gameId = game.gameId
    raState.gameTitle = game.title
    raState.achievements = game.achievements.map((achievement) => cloneAchievementView(achievement))
    updateTracker(game)
    setStatusText(`Achievements restored for ${game.title}.`)
  } else {
    setActiveGame(null)
  }
  dirty = true
  publishState(true)
}

export const doRetroAchievementsFrame = () => {
  purgeToasts()
  if (!raState.enabled) {
    setStatusText("RetroAchievements are disabled.")
    publishState()
    return
  }

  const game = getMatchingGame()
  setActiveGame(game)
  if (!game) {
    publishState()
    return
  }

  let changed = false
  for (const achievement of game.achievements) {
    changed = updateAchievementRuntime(achievement) || changed
  }
  updateTracker(game)
  syncViews(game)

  const allUnlocked = game.achievements.length > 0 && game.achievements.every((achievement) => runtimeState.get(achievement.id)?.unlocked)
  if (allUnlocked && !raState.toasts.some((toast) => toast.id === `mastery:${game.gameId}`)) {
    pushToast({
      id: `mastery:${game.gameId}`,
      title: `Completed ${game.title}`,
      description: raState.hardcore ? "Mastery complete." : "Softcore completion complete.",
      kind: "mastery",
    })
    setStatusText(raState.hardcore ? `Mastered ${game.title}.` : `Completed ${game.title}.`)
    changed = true
  }

  if (changed) {
    dirty = true
  }
  publishState()
}
