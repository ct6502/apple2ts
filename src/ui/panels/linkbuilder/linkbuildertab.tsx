import "../panels.css"
import { isMinimalTheme } from "../../ui_settings"
import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { RUN_MODE } from "../../../common/utility"
import {
  handleGetMachineName,
  handleGetMemoryDump,
  handleGetRunMode,
} from "../../main2worker"
import {
  buildLinkBuilderUrl,
  createDefaultLinkBuilderUiState,
  encodeLinkBuilderContentBytes,
  getLinkBuilderOmittedOptionsNote,
  machineNameToLinkBuilderMachine,
  parseLinkBuilderStateFromUrl,
  sanitizeLinkBuilderContent,
  type LinkBuilderContentType,
  type LinkBuilderState,
  type LinkBuilderUiState,
} from "./linkbuilder"

const LabeledField = (props: { label: string, children: ReactNode, note?: string }) => (
  <label className="link-builder-row">
    <span className="link-builder-label">{props.label}</span>
    <div className="link-builder-control">
      {props.children}
      {props.note && <div className="link-builder-note">{props.note}</div>}
    </div>
  </label>
)

const LinkBuilderTab = (props: {
  linkState: LinkBuilderState
  setLinkState: Dispatch<SetStateAction<LinkBuilderState>>
  uiState: LinkBuilderUiState
  setUiState: Dispatch<SetStateAction<LinkBuilderUiState>>
}) => {
  const currentMachine = machineNameToLinkBuilderMachine(handleGetMachineName())
  const runMode = handleGetRunMode()
  const { linkState, setLinkState, uiState, setUiState } = props
  const {
    activeCategory,
    statusMessage,
    captureLength,
    showCaptureDetails,
  } = uiState

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
  }

  const generatedUrl = useMemo(() => buildLinkBuilderUrl(linkState), [linkState])
  const contentPlaceholder: Record<LinkBuilderContentType, string> = {
    none: "",
    text: "Paste text to type into the emulator after boot",
    basic: "10 PRINT \"HELLO APPLE II\"\n20 GOTO 10",
    hex: "A9008D00C0",
    binary: "Base64 data, optionally prefixed with GZIP",
  }

  const setField = <K extends keyof LinkBuilderState>(field: K, value: LinkBuilderState[K]) => {
    setLinkState(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const setUiField = <K extends keyof LinkBuilderUiState>(field: K, value: LinkBuilderUiState[K]) => {
    setUiState(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleReset = () => {
    setLinkState(parseLinkBuilderStateFromUrl(window.location.href, currentMachine))
    setUiState(createDefaultLinkBuilderUiState())
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setUiField("statusMessage", "Copied.")
    } catch {
      setUiField("statusMessage", "Copy failed.")
    }
  }

  const handleCapture = () => {
    const source = handleGetMemoryDump().slice(0, 0x10000)
    const start = parseInt(linkState.address || "0", 16) & 0xFFFF
    const requestedLength = Math.max(1, parseInt(captureLength || "1", 10) || 1)

    if (source.length < 1) {
      setUiField("statusMessage", "No machine memory is available yet.")
      return
    }

    const end = Math.min(source.length, start + requestedLength)
    const bytes = source.slice(start, end)
    if (bytes.length < 1) {
      setUiField("statusMessage", "Capture range is empty.")
      return
    }

    setField("contentValue", encodeLinkBuilderContentBytes(linkState.contentType, bytes))
    setUiField("statusMessage", `Captured ${bytes.length} byte${bytes.length === 1 ? "" : "s"} from memory.`)
  }

  const showProgramControls = linkState.contentType !== "none"
  const showAddress = linkState.contentType === "hex" || linkState.contentType === "binary"
  const canCaptureFromMachine = showAddress && (runMode === RUN_MODE.RUNNING || runMode === RUN_MODE.PAUSED)

  const renderLinkCategory = () => (
    <div className="link-builder-group">
      <div className="link-builder-group-title">Link options</div>
      <LabeledField label="Base URL" note="Defaults to the current page so generated links work locally or on the deployed site.">
        <input
          className="link-builder-field"
          type="text"
          value={linkState.baseUrl}
          onChange={event => setField("baseUrl", event.target.value)} />
      </LabeledField>
    </div>
  )

  const renderDisksCategory = () => (
    <div className="link-builder-group">
      <div className="link-builder-group-title">Disks and images</div>
      <LabeledField label="Disk / image / alias" note="This becomes the #fragment. Use a full URL or a built-in alias such as replay for Total Replay. The loader normalizes the fragment and matches it against known disk titles.">
        <input
          className="link-builder-field"
          type="text"
          placeholder="replay or https://example.com/disk.woz"
          value={linkState.fragmentUrl}
          onChange={event => setField("fragmentUrl", event.target.value)} />
      </LabeledField>
      <div className="link-builder-note">
        Example fragments from the help tab include <code>#replay</code> and direct disk/image URLs.
      </div>
    </div>
  )

  const renderContentCategory = () => (
    <div className="link-builder-group">
      <div className="link-builder-group-title">Typed or embedded content</div>
      <LabeledField label="Content type" note="Use text= for typed input after boot, BASIC for numbered programs, or the hex/binary loaders for direct memory injection.">
        <select
          className="link-builder-field"
          value={linkState.contentType}
          onChange={event => {
            const nextType = event.target.value as LinkBuilderContentType
            setField("contentType", nextType)
            setField("contentValue", sanitizeLinkBuilderContent(nextType, linkState.contentValue))
            if (nextType !== "hex" && nextType !== "binary") {
              setUiField("showCaptureDetails", false)
            }
          }}>
          <option value="none">None</option>
          <option value="text">Typed text (text=)</option>
          <option value="basic">BASIC program (basic=)</option>
          <option value="hex">Hex loader</option>
          <option value="binary">Base64 binary</option>
        </select>
      </LabeledField>
      {showProgramControls && (
        <>
          <LabeledField
            label="Content value"
            note={linkState.contentType === "text" ? "The runtime pastes text= after boot. Input that looks like a numbered BASIC program is treated as BASIC by the loader path." : undefined}>
            <textarea
              className="link-builder-field link-builder-textarea"
              value={linkState.contentValue}
              placeholder={contentPlaceholder[linkState.contentType]}
              onChange={event => setField("contentValue", sanitizeLinkBuilderContent(linkState.contentType, event.target.value))} />
          </LabeledField>
          {showAddress && (
            <LabeledField label="Address" note="Hex load address used by the current hex/binary loader path and the machine-memory capture source.">
              <input
                className="link-builder-field"
                type="text"
                value={linkState.address}
                onChange={event => setField("address", event.target.value)} />
            </LabeledField>
          )}
          {showAddress && (
            <div className="link-builder-capture">
              <button
                className={`push-button debug-panel-toggle ${showCaptureDetails ? "button-active" : ""}`}
                onClick={() => setUiField("showCaptureDetails", !showCaptureDetails)}>
                Capture from running machine
              </button>
              {showCaptureDetails && (
                <>
                  <div className="link-builder-note">
                    Available when the emulator is running or paused. This reads bytes from the current 64 KB machine-memory view.
                  </div>
                  {canCaptureFromMachine ? (
                    <>
                      <LabeledField label="Capture length">
                        <input
                          className="link-builder-field"
                          type="number"
                          min="1"
                          step="1"
                          value={captureLength}
                          onChange={event => setUiField("captureLength", event.target.value.replace(/[^0-9]/g, ""))} />
                      </LabeledField>
                      <button className="push-button debug-panel-toggle" onClick={handleCapture}>
                        Capture bytes
                      </button>
                    </>
                  ) : (
                    <div className="link-builder-note">Start or pause the emulator to capture bytes directly from memory.</div>
                  )}
                </>
              )}
            </div>
          )}
          <label className="link-builder-checkbox-row">
            <input
              type="checkbox"
              checked={linkState.run}
              onChange={event => setField("run", event.target.checked)} />
            Run after load
          </label>
        </>
      )}
    </div>
  )

  const renderMachineCategory = () => (
    <div className="link-builder-group">
      <div className="link-builder-group-title">Machine options</div>
      <LabeledField label="Machine" note="Defaults to the currently selected machine when the tab opens or resets.">
        <select
          className="link-builder-field"
          value={linkState.machine}
          onChange={event => setField("machine", event.target.value)}>
          <option value="apple2ee">Apple IIe Enhanced</option>
          <option value="apple2eu">Apple IIe</option>
          <option value="apple2p">Apple II+</option>
        </select>
      </LabeledField>
      <LabeledField label="Speed">
        <select
          className="link-builder-field"
          value={linkState.speed}
          onChange={event => setField("speed", event.target.value)}>
          <option value="">Default</option>
          <option value="snail">Snail</option>
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="two">2 MHz</option>
          <option value="three">3 MHz</option>
          <option value="fast">Fast</option>
          <option value="warp">Warp</option>
        </select>
      </LabeledField>
      <LabeledField label="App mode">
        <select
          className="link-builder-field"
          value={linkState.appMode}
          onChange={event => setField("appMode", event.target.value)}>
          <option value="">Default</option>
          <option value="game">Game</option>
          <option value="embed">Embed</option>
        </select>
      </LabeledField>
      <LabeledField label="RAM disk">
        <select
          className="link-builder-field"
          value={linkState.ramDisk}
          onChange={event => setField("ramDisk", event.target.value)}>
          <option value="">Default</option>
          <option value="64">64 KB</option>
          <option value="512">512 KB</option>
          <option value="1024">1024 KB</option>
          <option value="4096">4096 KB</option>
          <option value="8192">8192 KB</option>
        </select>
      </LabeledField>
      <LabeledField label="Caps lock">
        <select
          className="link-builder-field"
          value={linkState.capsLock}
          onChange={event => setField("capsLock", event.target.value)}>
          <option value="">Default</option>
          <option value="off">Off</option>
        </select>
      </LabeledField>
      <LabeledField label="Sound">
        <select
          className="link-builder-field"
          value={linkState.sound}
          onChange={event => setField("sound", event.target.value)}>
          <option value="">Default</option>
          <option value="off">Off</option>
        </select>
      </LabeledField>
    </div>
  )

  const renderCRTCategory = () => (
    <div className="link-builder-group">
      <div className="link-builder-group-title">CRT and display</div>
      <LabeledField label="Color mode">
        <select
          className="link-builder-field"
          value={linkState.color}
          onChange={event => setField("color", event.target.value)}>
          <option value="">Default</option>
          <option value="color">Color</option>
          <option value="nofringe">No fringe</option>
          <option value="green">Green</option>
          <option value="amber">Amber</option>
          <option value="white">White</option>
          <option value="inverse">Inverse</option>
        </select>
      </LabeledField>
      <LabeledField label="Theme">
        <select
          className="link-builder-field"
          value={linkState.theme}
          onChange={event => setField("theme", event.target.value)}>
          <option value="">Default</option>
          <option value="classic">Classic</option>
          <option value="dark">Dark</option>
          <option value="minimal">Minimal</option>
        </select>
      </LabeledField>
      <LabeledField label="CRT distort">
        <select
          className="link-builder-field"
          value={linkState.crtDistort}
          onChange={event => setField("crtDistort", event.target.value)}>
          <option value="">Default</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </LabeledField>
      <LabeledField label="Ghosting">
        <select
          className="link-builder-field"
          value={linkState.ghosting}
          onChange={event => setField("ghosting", event.target.value)}>
          <option value="">Default</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </LabeledField>
      <LabeledField label="Scanlines">
        <select
          className="link-builder-field"
          value={linkState.scanlines}
          onChange={event => setField("scanlines", event.target.value)}>
          <option value="">Default</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </LabeledField>
    </div>
  )

  const renderAdvancedCategory = () => (
    <div className="link-builder-group">
      <div className="link-builder-group-title">Advanced options</div>
      <LabeledField label="Debug flyout" note="Set debug=on to open it automatically. tab only matters when the flyout is shown.">
        <select
          className="link-builder-field"
          value={linkState.debug}
          onChange={event => setField("debug", event.target.value)}>
          <option value="">Default</option>
          <option value="on">Open debug flyout</option>
        </select>
      </LabeledField>
      <LabeledField label="Debug tab">
        <select
          className="link-builder-field"
          value={linkState.tab}
          onChange={event => setField("tab", event.target.value)}>
          <option value="">Default</option>
          <option value="0">Help</option>
          <option value="1">Debugging</option>
          <option value="2">Applesoft BASIC</option>
          <option value="3">Apple exPectin</option>
          <option value="4">Agent</option>
          <option value="5">Link builder</option>
        </select>
      </LabeledField>
      <LabeledField label="Hot reload">
        <select
          className="link-builder-field"
          value={linkState.hotReload}
          onChange={event => setField("hotReload", event.target.value)}>
          <option value="">Default</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </LabeledField>
      <LabeledField label="Tour">
        <select
          className="link-builder-field"
          value={linkState.tour}
          onChange={event => setField("tour", event.target.value)}>
          <option value="">Default</option>
          <option value="main">Main</option>
          <option value="debug">Debug</option>
          <option value="settings">Settings</option>
        </select>
      </LabeledField>
      <div className="link-builder-note">{getLinkBuilderOmittedOptionsNote()}</div>
    </div>
  )

  const renderActiveCategory = () => {
    switch (activeCategory) {
      case "disks":
        return renderDisksCategory()
      case "content":
        return renderContentCategory()
      case "machine":
        return renderMachineCategory()
      case "crt":
        return renderCRTCategory()
      case "advanced":
        return renderAdvancedCategory()
      default:
        return renderLinkCategory()
    }
  }

  return (
    <div className="flex-column-gap debug-section">
      <div className="round-rect-border flex-column-gap link-builder-panel">
        <div className="flex-row-gap flexwrap debug-panel-toggle-bar link-builder-toolbar">
          <button
            className={`push-button debug-panel-toggle ${activeCategory === "link" ? "button-active" : ""}`}
            onClick={() => setUiField("activeCategory", "link")}>
            Link
          </button>
          <button
            className={`push-button debug-panel-toggle ${activeCategory === "disks" ? "button-active" : ""}`}
            onClick={() => setUiField("activeCategory", "disks")}>
            Disks
          </button>
          <button
            className={`push-button debug-panel-toggle ${activeCategory === "content" ? "button-active" : ""}`}
            onClick={() => setUiField("activeCategory", "content")}>
            Content
          </button>
          <button
            className={`push-button debug-panel-toggle ${activeCategory === "machine" ? "button-active" : ""}`}
            onClick={() => setUiField("activeCategory", "machine")}>
            Machine
          </button>
          <button
            className={`push-button debug-panel-toggle ${activeCategory === "crt" ? "button-active" : ""}`}
            onClick={() => setUiField("activeCategory", "crt")}>
            CRT
          </button>
          <button
            className={`push-button debug-panel-toggle ${activeCategory === "advanced" ? "button-active" : ""}`}
            onClick={() => setUiField("activeCategory", "advanced")}>
            Advanced
          </button>
          <div className="link-builder-toolbar-spacer" />
          <button className="push-button debug-panel-toggle" onClick={handleReset}>
            Reset
          </button>
        </div>

        {renderActiveCategory()}

        <div className="link-builder-group">
          <div className="link-builder-group-title">Generated link</div>
          <textarea
            className="link-builder-field link-builder-output"
            value={generatedUrl}
            readOnly />
          <div className="flex-row-gap flexwrap link-builder-actions">
            <button className="push-button debug-panel-toggle" onClick={handleCopy}>
              Copy URL
            </button>
            <a
              className="push-button debug-panel-toggle link-builder-open-link"
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer">
              Open preview
            </a>
            {statusMessage && <span className="link-builder-copy-state">{statusMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkBuilderTab
