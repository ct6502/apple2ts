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

type KeyboardState = {
  key: number,
  isDown: boolean,
  repeat: boolean,
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
  Accum: number,
  XReg: number,
  YReg: number,
  StackPtr: number,
  flagIRQ: number,
  flagNMI: boolean
}

type Apple2SaveState = {
  s6502: STATE6502,
  extraRamSize: number,
  machineName: MACHINE_NAME,
  softSwitches: {[name: string]: boolean},
  stackDump: Array<string>,
  memvalid: string,
  memC000: string,
  memory: string
}

type UpdateDisplay = (speed = 0, helptext = "") => void

type DisplayProps = {
  speed: number,
  renderCount: number,
  setAvgFPS: (fps: number) => void,
  ctrlKeyMode: number,
  openAppleKeyMode: number,
  closedAppleKeyMode: number,
  showFileOpenDialog: {show: boolean, index: number},
  updateDisplay: UpdateDisplay,
  handleCtrlDown: (mode: number) => void,
  handleOpenAppleDown: (mode: number) => void,
  handleClosedAppleDown: (mode: number) => void,
  setShowFileOpenDialog: (show: boolean, index: number) => void,
}

type MACHINE_NAME = "APPLE2EU" | "APPLE2EE" | "APPLE2P"

type VERA_SLOT = 0 | 2 | 4

type Video7Mode = "160x192" | "monochrome" | "mixed"

type Video7Override = {
  mode: Video7Mode,
  enabled: boolean,
}

type TOUCH_JOYSTICK_MODE = "off" | "left" | "right"

type SLOT_CARD_ID = "none" | "ssc" | "softcard" | "aux" | "videoterm" | "mockingboard" | "mouse" | "vera" | "passport" | "disk2" | "smartport"

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
  addressGetTable: number[],
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
  extraRamSize: number,
  hires: Uint8Array,
  iTempState: number,
  isDebugging: boolean,
  isTracing: boolean,
  lores: Uint8Array,
  machineName: MACHINE_NAME,
  memoryDump: Uint8Array,
  noDelayMode: boolean,
  prodosFloppy: boolean,
  ramWorksBank: number,
  runMode: number,
  s6502: STATE6502,
  showDebugTab: boolean,
  slotConfig: SlotConfig,
  softSwitches: {[name: string]: boolean},
  speedMode: number,
  stackString: string,
  textPage: Uint8Array,
  timeTravelThumbnails: Array<TimeTravelThumbnail>,
  tracelog: Array<string>,
  veraSlot: VERA_SLOT,
  zeroPage: Uint8Array
}

type UIState = {
  appMode: string,
  arrowKeysAsJoystick: boolean,
  manualNumbering: boolean,
  capitalizeBasic: boolean,
  lowercaseMode: boolean,
  colorMode: COLOR_MODE,
  crtDistortion: boolean,
  debugMode: boolean,
  ghosting: boolean,
  helpText: string,
  hotReload: boolean,
  infoPanel: boolean,
  prodosFloppy: boolean,
  reverseYAxis: boolean,
  showScanlines: boolean,
  siriusJoyport: boolean,
  tabView: number,
  theme: UI_THEME,
  tiltSensorJoystick: boolean,
  touchJoystickMode: TOUCH_JOYSTICK_MODE,
  touchJoystickSensitivity: number,
  useOpenAppleKey: boolean,
}

type CloudData = {
  providerName: string,
  syncStatus: number,
  syncInterval: number,
  lastSyncTime: number,
  fileName: string,
  parentId?: string,
  itemId: string,
  apiEndpoint: string,
  downloadUrl: string,
  detailsUrl: string,
  fileSize: number
}

type CloudProvider = {
  download(filter: string): Promise<[Blob, CloudData] | null>,
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
}

type DriveProps = {
  index: number,
  hardDrive: boolean,
  drive: number,
  filename: string,
  status: string,
  motorRunning: boolean,
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
type RegisterValues = "" | "$" | "A" | "X" | "Y" | "S" | "P" | "C"
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
}

type VtocType = "dos" | "prodos" | "other" | "dosup" | "4cade"

type CaptureBootStateRequest = {
  diskImage: Uint8Array
  filename: string
  entryAddress: number
  timeoutMs?: number
  captureMemory?: boolean
  /** When true, don't capture at the entry breakpoint. Instead, resume execution
   *  and capture after an additional delay (letting disk reads finish). */
  waitForDiskIo?: boolean
  /** Extra milliseconds to run after hitting entryAddress before capturing (default 3000). */
  postEntryDelayMs?: number
}

type CaptureBootResult = {
  zeroPage: Uint8Array
  memoryDump?: Uint8Array
  /** The PC at the time of capture (only set when waitForDiskIo is used). */
  capturedPC?: number
  /** Low memory ($0000-$0FFF) captured at the entry breakpoint BEFORE disk I/O
   *  overwrites it. Used for RWTS detection since the late capture may have
   *  overwritten the floppy routine. Only set when waitForDiskIo is used. */
  earlyLowMemory?: Uint8Array
}

type DiskCollectionItem = {
  type: DISK_COLLECTION_ITEM_TYPE,
  title: string,
  lastUpdated: Date,
  imageUrl?: string,
  diskUrl: string,
  helpFile?: string,
  detailsUrl?: string,
  bookmarkId?: string,
  cloudData?: CloudData,
  params?: string,
  fileSize: number,
  vtocType?: VtocType,
  vtocVersion?: number,
  exportDisabled?: boolean
}

interface OpenerWindow {
  accessToken: string
}

type PopupMenuItem = {
  label: string,
  isDisabled?: boolean | (() => boolean),
  isHeading?: boolean,
  icon?: IconDefinition,
  svg?: JSX.Element,
  isVisible?: () => boolean,
  isSelected?: () => boolean,
  onClick?: () => void,
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
