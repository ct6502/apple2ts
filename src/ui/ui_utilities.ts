import { UI_THEME } from "../common/utility"

export const handleSetTheme = (theme: UI_THEME) => {
  if (theme == UI_THEME.DARK) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }
}

export const isFileSystemApiSupported = () => {
  return "showOpenFilePicker" in window && "showSaveFilePicker" in window
}

// Check if we have enhanced file access (either Electron or File System Access API)
export const hasEnhancedFileAccess = () => {
  // Check for Electron API first
  if (typeof window !== "undefined" && typeof window.electronAPI !== "undefined") {
    return true
  }
  // Fall back to File System Access API
  return isFileSystemApiSupported()
}

export const showGlobalProgressModal = (show: boolean = true) => {
  document.body.style.setProperty("--global-progress-visibility", show ? "visible" : "hidden")
}
