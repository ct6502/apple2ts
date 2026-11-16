declare module "list-react-files"

declare module "*.png" {
   const value: string
   export = value
}
declare module "*.mp3" {
   const value: string
   export = value
}
declare module "*.woz" {
   const value: string
   export = value
}
declare module "*.po" {
  const value: string
  export = value
}
declare module "*.hdv" {
  const value: string
  export = value
}

type MessagePayload = object | number | string | boolean | EmuGamepad[] | null

type WorkerOperationResult = {
  operationId: number,
  error?: string,
  value?: MessagePayload,
}

type MemorySpace = "active" | "main" | "aux"

type MemoryMappingState = {
  RAMRD: boolean,
  RAMWRT: boolean,
  ALTZP: boolean,
  "80STORE": boolean,
  PAGE2: boolean,
  HIRES: boolean,
}

type MemoryViewRequest = {
  address: number,
  length: number,
  space: MemorySpace,
  auxBank?: number,
}

type MemoryViewSegment = {
  address: number,
  length: number,
  space: "main" | "aux" | "system",
  auxBank?: number,
}

type MemoryView = {
  address: number,
  length: number,
  requestedSpace: MemorySpace,
  requestedAuxBank: number | null,
  effectiveAuxBank: number | null,
  effectiveSegments: MemoryViewSegment[],
  mapping: MemoryMappingState,
  bytes: Uint8Array,
}

type MemorySearchRequest = MemoryViewRequest & {
  bytes: number[],
  maxMatches?: number,
}

type MemorySearchResult = Omit<MemoryView, "bytes"> & {
  matches: number[],
  totalMatchCount: number,
  truncated: boolean,
}

type MemoryWriteWatchpoint = {
  watchpointId: string,
  address: number,
  length: number,
  space: MemorySpace,
  auxBank: number | null,
}

type MemoryWriteEvent = {
  watchpointId: string,
  writerPC: number,
  address: number,
  value: number,
  watchpointSpace: MemorySpace,
  watchpointAuxBank: number | null,
  effectiveSpace: "main" | "aux" | "system",
  effectiveAuxBank: number | null,
  mapping: MemoryMappingState,
}

type KeyboardState = {
  key: number,
  isDown: boolean,
  repeat: boolean,
  saveSnapShot?: boolean,
  domCode?: string,
}

type KeySequenceRequest = {
  keys: string,
  timeoutMs: number,
}

type KeySequenceResult = {
  outcome: "completed" | "timeout" | "interrupted" | "not_running" | "input_busy",
  keysDelivered: number,
  keyMayHaveBeenObserved: boolean,
}

type MemoryPredicate = {
  address: number,
  space: MemorySpace,
  auxBank?: number,
  bytes: number[],
  mask?: number[],
}

type MemoryCondition = MemoryPredicate | {all: MemoryPredicate[]}

type ConditionalKeyPhase = {
  when?: MemoryCondition,
  keys: string,
}

type ConditionalKeySequenceRequest = {
  phases: ConditionalKeyPhase[],
  final: MemoryCondition,
  timeoutMs: number,
  startExecution?: boolean,
  stopConditions?: Array<{name: string, when: MemoryCondition}>,
}

type ConditionalKeyDelivery = KeySequenceResult & {
  phase: number,
  predicateMatchCycle: number | null,
  matchedBytes: number[][],
  keyConsumptionCycles: number[],
}

type ConditionalKeySequenceResult = {
  outcome: "completed" | "timeout" | "cancelled" | "unexpected_stop" | "not_running" | "input_busy" | "condition_triggered",
  completedPhases: number,
  failurePhase: number | null,
  keyDeliveries: ConditionalKeyDelivery[],
  cyclesElapsed: number,
  stopCondition?: {name: string, matchedBytes: number[][]},
  stopConditionsArmed?: number,
  timeout?: {
    waitingFor: "condition" | "key_consumption",
    actualBytes: number[][],
  },
}

type HiresScreenshotSet = {
  plain: Uint8Array,
  keyboard: Uint8Array,
}

type VeraPsgWrite = {
  cycle: number,
  reg: number,
  value: number,
}

type VeraPcmWrite = {
  cycle: number,
  reg: "ctrl" | "rate" | "fifo",
  value: number,
}

type VeraFmWrite = {
  port: 0 | 1
  value: number
}

interface PCodeFunc {
  (valueLo: number, valueHi: number): number;
}

interface PCodeInstr1 {
    name: string
    pcode: number
    mode: number
    bytes: number
    is6502: boolean
}

interface PCodeInstr extends PCodeInstr1 {
    execute: PCodeFunc
}

type STATE6502 = {
  cycleCount: number,
  PStatus: number,
  PC: number,
  prevPC: number,
  Accum: number,
  XReg: number,
  YReg: number,
  StackPtr: number,
  flagIRQ: number,
  flagNMI: boolean
}

type CPU65816SaveState = {
  A: number,
  X: number,
  Y: number,
  S: number,
  D: number,
  PC: number,
  PB: number,
  DB: number,
  P: number,
  emulationMode: boolean,
  enteredNativeMode: boolean,
  stopped: boolean,
  waiting: boolean,
  irqPending: boolean,
  cycles: number,
  addrMode: number,
  addrCrossed: boolean,
  blockMoveFirst: boolean,
  slot5Dp?: { dp: number; bytes: number[] } | null
}

type Apple2SaveState = {
  s6502: STATE6502,
  extraRamSize: number,
  machineName: MACHINE_NAME,
  cardStates?: SlotCardSaveState[],
  joystick?: {countStart: number},
  softSwitches: {[name: string]: boolean},
  stackDump: Array<string>,
  memvalid: string,
  memC000: string,
  memory: string,
  // Added with SAVE_STATE_VERSION 2. Old files lack these and fall back to
  // the power-on Mega II contents. Mega II SHR lives here, not in memory[].
  megaIIMain?: string,
  megaIIAux?: string,
  // Raw VGC bank registers ($C020-$C04F): C029 selects SHR linearization and
  // the Mega II bank, C035 shadowing, C036 speed. Without them a restored GS
  // save renders SHR with linear=false and the palette/SCB tables read zero.
  iigsRegisters?: string,
  // The 65816 core keeps its native PC/PB/DB outside the legacy s6502 object,
  // so a GS save without this reloads at PC 0 and reboots over the SHR screen.
  cpu65816?: CPU65816SaveState,
  // The ADB micro-controller's own state. The soft-switch bytes in memory only
  // describe what the CPU wrote, not what the controller latched: a restore
  // without this leaves $C027's mouse/data/keyboard interrupt enables at zero,
  // so the guest's IRQ handler never runs even though $C027 reads enabled.
  // Missing in older saves and reset to power-on state on restore.
  iigsADB?: IIGSADBSaveState,
  // The VGC's own interrupt register and pending flags, which live outside the
  // $C020-$C04F bytes saved in `iigsRegisters`. The scanline-enable bit is what
  // lets GS/OS's Event Manager erase and redraw its cursor. Without it a
  // restored desktop keeps its factory cursor in the top-left corner even
  // though ADB motion reaches the guest.
  iigsVgc?: IIGSVGCSaveState
}

type IIGSVGCSaveState = {
  vgcIntReg: number,
  vblPending: boolean,
  quarterSecondPending: boolean
}

type IIGSADBSaveState = {
  response: number[],
  reportByte: number | null,
  modes: number,
  configuration: number[],
  ucMemory: number[],
  errorByte: number,
  mouseAddr: number,
  mouseCtlAddr: number,
  mouseRegs: number[],
  mouseHasData: boolean,
  keyboardAddr: number,
  keyboardRegs: number[],
  pendingX: number,
  pendingY: number,
  button0Down: number,
  button1Down: number,
  buttonChanged: boolean,
  reportInProgress: boolean,
  modifiers: number,
  interruptEnables: number,
  cmd: number[],
  argumentsExpected: number,
  romTaskPollCycle: number
}

type SlotCardSaveState = {
  slot: number,
  card: SLOT_CARD_ID,
  state: unknown
}

type UpdateDisplay = (speed = 0, helptext = "") => void

type DisplayProps = {
  speed: number,
  renderCount: number,
  setAvgFPS: (fps: string) => void,
  ctrlKeyMode: number,
  openAppleKeyMode: number,
  closedAppleKeyMode: number,
  showFileOpenDialog: {show: boolean, index: number, append?: boolean},
  updateDisplay: UpdateDisplay,
  handleCtrlDown: (mode: number) => void,
  handleOpenAppleDown: (mode: number) => void,
  handleClosedAppleDown: (mode: number) => void,
  setShowFileOpenDialog: (show: boolean, index: number, append?: boolean) => void,
}

type MACHINE_NAME = "APPLE2EU" | "APPLE2EE" | "APPLE2P" | "APPLE2GS"

type IigsRomVersion = "01" | "03"

type VERA_SLOT = 0 | 2 | 4

type Video7Mode = "160x192" | "monochrome" | "mixed"

type Video7Override = {
  mode: Video7Mode,
  enabled: boolean,
}

// "gs*" ids are the Apple IIgs Control Panel's built-in slot functions: the
// motherboard's own slot firmware stays mapped ($C02D bit clear). Every other
// id is a card in the slot ("Your Card" in the Control Panel), including "none"
// which leaves an empty card slot. "disk35" is retained only so old saved
// configurations still parse; it migrates to "gsSmartPort".
type SLOT_CARD_ID = "none" | "ssc" | "softcard" | "aux" | "videoterm" | "mockingboard" | "mouse" | "vera" | "passport" | "disk2" | "disk35" | "smartport" | "vidhd" | "gsPrinter" | "gsModem" | "gsText80" | "gsMouse" | "gsSmartPort" | "gsDiskPort"


type SlotConfig = {
  1: SLOT_CARD_ID,
  2: SLOT_CARD_ID,
  3: SLOT_CARD_ID,
  4: SLOT_CARD_ID,
  5: SLOT_CARD_ID,
  6: SLOT_CARD_ID,
  7: SLOT_CARD_ID,
}

type MachineState = {
  addressGetTable: Uint32Array,
  altChar: boolean,
  basicMemory: Uint8Array,
  breakpoints: BreakpointMap,
  button0: boolean,
  button1: boolean,
  c800Slot: number,
  canGoBackward: boolean,
  canGoForward: boolean,
  cout: number,
  cpuSpeed: number,
  currentMemory: Uint8Array<ArrayBuffer>,
  extraRamSize: number,
  execution?: ExecutionSnapshot,
  heatMapCPU: Float64Array,
  heatMapCPUMax: { value: number, index: number },
  heatMapGetMem: Float64Array,
  heatMapGetMemMax: { value: number, index: number },
  heatMapSetMem: Float64Array,
  heatMapSetMemMax: { value: number, index: number },
  hires: Uint8Array,
  iTempState: number,
  isDebugging: boolean,
  isTracing: boolean,
  lores: Uint8Array,
  machineName: MACHINE_NAME,
  memoryDump: Uint8Array<ArrayBuffer>,  // use ArrayBuffer so it is assignable to BlobPart/BufferSource
  noDelayMode: boolean,
  ramWorksBank: number,
  runMode: number,
  s6502: STATE6502,
  showDebugTab: boolean,
  shr?: Uint8Array,
  slotConfig: SlotConfig,
  softSwitches: import("../worker/softswitches").SoftSwitchStates,
  speedMode: number,
  stackString: string,
  textPage: Uint8Array,
  timeTravelThumbnails: Array<TimeTravelThumbnail>,
  tracelog: Array<string>,
  veraSlot: VERA_SLOT,
  vidhdActive?: boolean,
  zeroPage: Uint8Array
}

type ExecutionPauseReason =
  "idle" |
  "explicit" |
  "breakpoint" |
  "watchpoint" |
  "input-sequence" |
  "step" |
  "cycle-limit"

type ExecutionStopDescriptor = {
  reason: Exclude<ExecutionPauseReason, "idle">,
  breakpointAddress?: number,
  memoryWrite?: MemoryWriteEvent,
}

type ExecutionSnapshot = {
  executionSequence: number,
  state: "running" | "paused",
  pauseReason: ExecutionPauseReason | null,
  breakpoint: {
    breakpointId: string,
    address: number,
  } | null,
  memoryWrite: MemoryWriteEvent | null,
  PC: number,
  A: number,
  X: number,
  Y: number,
  S: number,
  PStatus: number,
  machineName: MACHINE_NAME,
  memoryConfiguration: {
    slot3Card: SLOT_CARD_ID,
    ramWorksKb: number,
  },
}

type UIState = {
  appMode: string,
  arrowKeysAsJoystick: boolean,
  autoSnapshot: AUTO_SNAPSHOT,
  cyclesToRun: number,
  manualNumbering: boolean,
  capitalizeBasic: boolean,
  lowercaseMode: boolean,
  colorMode: COLOR_MODE,
  crtDistortion: boolean,
  debugMode: boolean,
  enableGamePatches: boolean,
  ghosting: boolean,
  helpText: string,
  infoPanel: boolean,
  monitorMode: MONITOR_MODE,
  reverseYAxis: boolean,
  saveStateToLocalStorage: boolean,
  showScanlines: boolean,
  siriusJoyport: boolean,
  snapshotOnKeyPress: boolean,
  tabView: number,
  theme: UI_THEME,
  tiltSensorJoystick: boolean,
  touchJoystick: boolean,
  useOpenAppleKey: boolean,
}

type CloudData = {
  providerName: string,
  syncStatus: number,
  syncInterval: number,
  lastSyncTime: number,
  fileName: string,
  title?: string,
  parentId?: string,
  itemId: string,
  apiEndpoint: string,
  downloadUrl: string,
  detailsUrl: string,
  fileSize: number,
  isArchive?: boolean
}

type CloudProvider = {
  download(filter: string): Promise<Array<[Blob, CloudData]> | [Blob, CloudData] | null>,
  upload(fileName: string, blob: Blob): Promise<CloudData | null>,
  sync(blob: Blob, cloudData: CloudData): Promise<boolean>,
  requestAuthToken(callback: (authToken: string) => void): void,
  hasAuthToken(): boolean
}

// Custom writable file handle type that supports both browser FileSystemFileHandle
// and Electron IPC-based save handlers
type CustomWritableHandler = {
  requestPermission: () => Promise<{ state: PermissionState }>,
  createWritable: () => Promise<{
    write: (data: Uint8Array | Blob) => Promise<void>,
    close: () => Promise<void>
  }>
}

type WritableFileHandle = FileSystemFileHandle | CustomWritableHandler

type DriveState = {
  index: number,
  hardDrive: boolean,
  drive: number,
  status: string,
  filename: string,
  diskHasChanges: boolean,
  motorRunning: boolean,
  isWriteProtected: boolean,
  isSynchronized: boolean,
  quarterTrack: number,
  prevQuarterTrack: number,
  writeMode: boolean,
  currentPhase: number,
  trackStart: Array<number>,
  trackNbits: Array<number>,
  trackLocation: number,
  maxQuarterTrack: number,
  lastAppleWriteTime: number,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  lastLocalFileWriteTime: number
  optimalTiming: number,
  // Apple IIgs 3.5" (Sony) drive state. is35 marks the drive/media family;
  // blockMedia35 means driveData holds a raw 800K block image and the GCR bit
  // stream the IWM reads was generated separately (see
  // getDriveBitstreamByIndex). Spindle/track mechanics are separate from the
  // 5.25" motor and stepper phases.
  is35: boolean,
  blockMedia35: boolean,
  spindleOn: boolean,
  stepDirection: number,
  diskSwitched: boolean,
  stepEnd: number,
  readyEnd: number,
}

type DriveProps = {
  index: number,
  hardDrive: boolean,
  drive: number,
  filename: string,
  status: string,
  motorRunning: boolean,
  // The IIgs 3.5" drive has its own spindle latch (CONT35), so its activity lamp
  // cannot follow the 5.25" motor line. Optional because the 3.5" bays are the
  // only consumers and most fixtures describe a 5.25"/SmartPort drive.
  spindleOn?: boolean,
  diskHasChanges: boolean,
  isWriteProtected: boolean,
  diskData: Uint8Array,
  lastAppleWriteTime: number,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  lastLocalFileWriteTime: number
}

type DriveSaveState = {
  currentDrive: number,
  driveState: (DriveState | object)[],
  driveData: string[]
}

type DisplaySaveState = UIState & {
  name: string,
  date: string,
  version: number,
  audioEnable: boolean,
  mockingboardMode: number,
  speedMode: number,
  isDebugging: boolean,
  runMode: RUN_MODE,
  breakpoints: BreakpointMap,
}

type EmulatorSaveState = {
  emulator: DisplaySaveState | null,
  state6502: Apple2SaveState,
  driveState: DriveSaveState,
  thumbnail: string,
  snapshots: Array<EmulatorSaveState> | null
}

type SessionSnapshotReceipt = {
  snapshotId: string,
  cycleCount: number,
}

type SessionMemoryComparisonRequest = MemoryViewRequest & {
  snapshotId: string,
  maxChanges?: number,
}

type SessionMemoryComparison = Omit<MemoryView, "bytes" | "mapping"> & {
  snapshotId: string,
  baselineCycleCount: number,
  currentCycleCount: number,
  currentMapping: MemoryMappingState,
  changes: {address: number, before: number, after: number}[],
  totalChangeCount: number,
  truncated: boolean,
}

type TimeTravelThumbnail = {
  s6502: STATE6502,
  thumbnail: string
}

type SetMemoryBlock = {
  address: number,
  data: Uint8Array,
  run: boolean
}

type RunBinary = {
  address: number,
  data: Uint8Array,
  entryAddress: number
}

type LoadBinary = {
  address: number,
  data: Uint8Array
}

type AudioDevice = {
  context: AudioContext,
  element: HTMLAudioElement,
  timeout: number
}

type EmuGamepad = {
  axes: Array<number>,
  buttons: Array<boolean>
}

type GamePadActuatorEffect = {
  startDelay: number,
  duration: number,
  weakMagnitude: number,
  strongMagnitude: number,
}

type KeyMap = {
  [key: string]: string;
}

type GameLibraryItem = {
  address: number,
  data: number[],
  keymap: KeyMap,
  joystick: null | ((axes: number[], isKeyboardJoystick: boolean) => number[]),
  gamepad: null | ((button: number, dualJoysticks: boolean, isJoystick2: boolean) => void),
  rumble: null | (() => void),
  setup: null | (() => void),
  helptext: string
}

type GamePadMapping = (button: number, dualJoysticks: boolean, isJoystick2: boolean) => void

interface AddressCallback {
  (addr: number, value: number): number;
}

type MockingboardSound = {
  slot: number,
  chip: number,
  params: number[]
}

// This LaunchParams and LaunchQueue are part of the Web App Launch Handler API.
// Needed to add my own types to avoid using "any".
type LaunchParams = {
  files: FileSystemFileHandle[]
}
type LaunchQueue = {
  setConsumer: (consumer: (launchParams: LaunchParams) => Promise<void>) => void
}

interface MemoryBank {
  name: string;
  min: number;
  max: number;
  enabled?: (addr = 0) => boolean;
}

interface MemoryBanks {
  [key: string]: MemoryBank;
}

type ExpressionOperator = "" | "&&" | "||"
type RegisterValues = "" | "$" | "A" | "X" | "Y" | "S" | "P" | "C" | "@"
type OperatorValues = "==" | "!=" | ">" | ">=" | "<" | "<="

type BreakpointExpression = {
  register: RegisterValues,
  address: number,
  operator: OperatorValues,
  value: number
}

type BPActions = "" | "set" | "jump" | "print" | "snapshot"

type BreakpointAction = {
  action: BPActions,
  register: RegisterValues,
  address: number,
  value: number
}

type Breakpoint = {
  address: number,
  watchpoint: boolean,
  instruction: boolean,
  disabled: boolean,
  hidden: boolean,
  once: boolean,
  memget: boolean,
  memset: boolean,
  expression1: BreakpointExpression,
  expression2: BreakpointExpression,
  expressionOperator: "" | "&&" | "||",
  hexvalue: number,
  hitcount: number,
  nhits: number,
  memoryBank: string,
  action1: BreakpointAction,
  action2: BreakpointAction,
  halt: boolean,
  basic: boolean
}

type StepCallbackFunction = () => boolean

type DisassemblyProps = {
  update: number,
  refresh: () => void,
  isShort: boolean,
  height: number,
}

type VtocType = "dos" | "prodos" | "other" | "dosup" | "4cade"

type MultiDiskMap = {
  s6d1?: string | string[]
  s6d2?: string | string[]
  s7d1?: string | string[]
  s7d2?: string | string[]
  s2d1?: string | string[]
  s4d1?: string | string[]
  verasd?: string | string[]
  [key: string]: string | string[] | undefined
}

type DiskCollectionItem = {
  type: "builtin" | "internet" | "new" | "cloud" | "demozoo",
  title: string,
  lastUpdated: Date,
  imageUrl?: string,
  diskUrl?: string | MultiDiskMap | string[],
  disks?: MultiDiskMap | string[],
  helpFile?: string,
  detailsUrl?: string,
  bookmarkId?: string,
  cloudData?: CloudData,
  params?: string,
  fileSize: number,
  vtocType?: VtocType,
  vtocVersion?: number,
  exportDisabled?: boolean,
}

interface OpenerWindow {
  accessToken: string
}

type PopupMenuItem = {
  label: string,
  isDisabled?: boolean | (() => boolean),
  isHeading?: boolean,
  icon?: IconDefinition | JSX.Element,
  svg?: JSX.Element,
  isVisible?: () => boolean,
  isSelected?: () => boolean,
  onClick?: () => void,
  hover?: () => void,
  subMenu?: Array<PopupMenuItem>
}

type MessageLoadProgram = {
  address: number,
  format: string,
  runProgram: boolean,
  data: Uint8Array,
}

type TraceSettings = {
  numLines: number,
  collapseLoops: boolean,
  ignoreRegisters: boolean,
}

type SerialConfig =
{
  baud: number
  bits: number
  stop: number
  parity: string
}

type DownloadedExportDisk = {
  item: DiskCollectionItem,
  buffer: Uint8Array,
  filename: string,
}

type ErrorMsg = {
  message: string,
  code?: number,
}

type DialogMessageContext = {
  title: string,
  message: string,
  code: number,
  actionCancel: () => void,
  actionConfirm: () => void,
}
