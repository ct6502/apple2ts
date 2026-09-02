export const OPEN_RETRO_CONTROL_PANEL_EVENT = "apple2ts-open-retro-control-panel"

export const openRetroControlPanel = () => {
	document.getElementById("apple2canvas")?.focus({ preventScroll: true })
	window.dispatchEvent(new Event(OPEN_RETRO_CONTROL_PANEL_EVENT))
}
