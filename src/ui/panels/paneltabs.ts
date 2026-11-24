/**
 * Which optional tabs the right-hand panel should offer for the current
 * machine and slot layout.
 *
 * - The VERA monitor is only meaningful while a VERA card is in one of the
 *   card slots, so the tab disappears when the card is removed.
 * - The 65816 debugger is not available on the IIgs, so that tab stays out of
 *   the IIgs Control Panel's tab row.
 * - Apple exPectin matches what it "sees" against the Mega II text page. GS/OS
 *   draws its screen through SHR, so scripts written for a text screen never
 *   match on the IIgs and the tab cannot do its job there.
 */
export const getPanelTabVisibility = (
  machineName: MACHINE_NAME,
  slotConfig: SlotConfig,
): { showDebugTab: boolean, showExpectinTab: boolean, showVeraTab: boolean } => {
  const hasVeraCard = slotConfig[2] === "vera" || slotConfig[4] === "vera"
  return {
    showDebugTab: machineName !== "APPLE2GS",
    showExpectinTab: machineName !== "APPLE2GS",
    showVeraTab: hasVeraCard,
  }
}
