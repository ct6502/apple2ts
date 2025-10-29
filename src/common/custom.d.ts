declare module "list-react-files"

declare module "*.png" {
   const value: string
   export = value;
}
declare module "*.mp3" {
   const value: string
   export = value;
}
declare module "*.woz" {
   const value: string
   export = value;
}
declare module "*.po" {
  const value: string
  export = value;
}
declare module "*.hdv" {
  const value: string
  export = value;
}

type MessagePayload = object | number | string | boolean | EmuGamepad[] | null

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
  memory: string
}

type UpdateDisplay = (speed = 0, helptext = "") => void

type DisplayProps = {
  speed: number,
  renderCount: number,
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

type MACHINE_NAME = "APPLE2EU" | "APPLE2EE"

type TOUCH_JOYSTICK_MODE = "off" | "left" | "right"

type MachineState = {
  addressGetTable: number[],
  altChar: boolean,
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
  lores: Uint8Array,
  machineName: MACHINE_NAME,
  memoryDump: Uint8Array,
  noDelayMode: boolean,
  ramWorksBank: number,
  runMode: number,
  s6502: STATE6502,
  showDebugTab: boolean,
  softSwitches: {[name: string]: boolean},
  speedMode: number,
  stackString: string,
  textPage: Uint8Array,
  timeTravelThumbnails: Array<TimeTravelThumbnail>,
}

type UIState = {
  appMode: string,
  arrowKeysAsJoystick: boolean,
  capsLock: boolean,
  colorMode: COLOR_MODE,
  helpText: string,
  hotReload: boolean,
  showScanlines: boolean,
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
  requestAuthToken(callback: (authToken: string) => void): void
}

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
  lastWriteTime: number,
  cloudData: CloudData | null,
  writableFileHandle: FileSystemFileHandle | null,
  lastLocalWriteTime: number
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
  lastWriteTime: number,
  cloudData: CloudData | null,
  writableFileHandle: FileSystemFileHandle | null,
  lastLocalWriteTime: number
}

type DriveSaveState = {
  currentDrive: number,
  driveState: DriveState[],
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
};

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
  memoryBank: string
}

type StepCallbackFunction = () => boolean

type DisassemblyProps = {
  update: number,
  refresh: () => void,
}

type DiskCollectionItem = {
  type: DISK_COLLECTION_ITEM_TYPE,
  title: string,
  lastUpdated: Date,
  imageUrl?: string,
  diskUrl: string,
  detailsUrl?: string,
  bookmarkId?: string,
  cloudData?: CloudData,
  params?: string,
  fileSize: number
}

interface OpenerWindow {
  accessToken: string
}

type PopupMenuItem = {
  label: string,
  icon?: IconDefinition,
  svg?: JSX.Element,
  isVisible?: () => boolean,
  isSelected?: () => boolean,
  onClick?: () => void
}