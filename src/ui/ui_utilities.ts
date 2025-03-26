import { UI_THEME } from "../common/utility"

export const handleSetTheme = (theme: UI_THEME) => {
  if (theme == UI_THEME.DARK) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }
}

export const isFileSystemApiSupported = () => {
  return "showOpenFilePicker" in self && "showSaveFilePicker" in self
}

export const showGlobalProgressModal = (show: boolean = true) => {
  document.body.style.setProperty("--global-progress-visibility", show ? "visible" : "hidden")
}
