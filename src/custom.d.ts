declare module 'list-react-files'

declare module "*.png" {
   const value: string;
   export = value;
}
declare module "*.mp3" {
   const value: string;
   export = value;
}
declare module "*.woz" {
   const value: string;
   export = value;
}
declare module "*.po" {
  const value: string;
  export = value;
}
declare module "*.hdv" {
  const value: string;
  export = value;
}

type MessagePayload = object | number | string | boolean | EmuGamepad[] | null

interface PCodeFunc {
  (valueLo: number, valueHi: number): number;
}

interface PCodeInstr {
    name: string
    pcode: number,
    mode: number
    bytes: number
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
  softSwitches: {[name: string]: boolean},
  memory: string
}

type UpdateDisplay = (speed = 0, helptext = '') => void

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

type MachineState = {
  addressGetTable: number[],
  altChar: boolean,
  arrowKeysAsJoystick: boolean,
  breakpoints: BreakpointMap,
  button0: boolean,
  button1: boolean,
  c800Slot: number,
  canGoBackward: boolean,
  canGoForward: boolean,
  capsLock: boolean,
  colorMode: COLOR_MODE,
  cout: number,
  cpuSpeed: number,
  darkMode: boolean,
  disassembly: string,
  extraRamSize: number,
  helpText: string,
  hires: Uint8Array,
  iTempState: number,
  isDebugging: boolean,
  lores: Uint8Array,
  memoryDump: Uint8Array,
  nextInstruction: string,
  noDelayMode: boolean,
  ramWorksBank: number,
  runMode: number,
  s6502: STATE6502,
  softSwitches: {[name: string]: boolean},
  speedMode: number,
  stackString: string,
  textPage: Uint8Array,
  timeTravelThumbnails: Array<TimeTravelThumbnail>,
  useOpenAppleKey: boolean,
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
  halftrack: number,
  prevHalfTrack: number,
  writeMode: boolean,
  currentPhase: number,
  trackStart: Array<number>,
  trackNbits: Array<number>,
  trackLocation: number,
  maxHalftrack: number,
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
  diskData: Uint8Array
}

type DriveSaveState = {
  currentDrive: number,
  driveState: DriveState[],
  driveData: string[]
}

type DisplaySaveState = {
  name: string,
  date: string,
  version: number,
  arrowKeysAsJoystick: boolean,
  colorMode: number,
  capsLock: boolean,
  audioEnable: boolean,
  mockingboardMode: number,
  speedMode: number,
  helptext: string,
  isDebugging: boolean,
  runMode: RUN_MODE,
  breakpoints: BreakpointMap,
  stackDump: Array<string>,
}

type EmulatorSaveState = {
  emulator: DisplaySaveState,
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

type diskImage = {
  file: string
  url: string
};

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
  enabled: (addr = 0) => boolean;
}

interface MemoryBanks {
  [key: string]: MemoryBank;
}
