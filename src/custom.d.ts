declare module "*.svg" {
   const value: any;
   export = value;
}
declare module "*.png" {
   const value: any;
   export = value;
}
declare module "*.mp3" {
   const value: any;
   export = value;
}

interface PCodeFunc {
  (valueLo: number, valueHi: number): number;
}

interface PCodeInstr {
    name: string
    pcode: number,
    mode: MODE
    PC: number
    execute: PCodeFunc
}

type STATE6502 = {
  PStatus: number,
  PC: number,
  Accum: number,
  XReg: number,
  YReg: number,
  StackPtr: number
}

type DisplayProps = {
  _6502: number,
  s6502: STATE6502,
  advance: () => void,
  speed: string,
  delta: string,
  myCanvas: React.RefObject<HTMLCanvasElement>,
  speedCheck: boolean,
  handleSpeedChange: () => void,
  uppercase: boolean,
  isColor: boolean,
  handleColorChange: () => void,
  handleCopyToClipboard: () => void,
  saveTimeSlice: () => void,
  handleGoBackInTime: () => void,
  handleGoForwardInTime: () => void,
  handleUpperCaseChange: () => void,
  handlePause: () => void,
  handle6502StateChange: (state: number) => void,
  handleFileOpen: () => void,
  handleFileSave: () => void,
}

type DriveState = {
  fileName: string,
  halftrack: number,
  prevHalfTrack: number,
  writeMode: boolean,
  currentPhase: number,
  diskImageHasChanges: boolean,
  motorIsRunning: boolean,
  trackStart: Array<number>,
  trackNbits: Array<number>,
  trackLocation: number,
  isWriteProtected: boolean
}

type DriveProps = {
  drive: number,
  driveState: DriveState,
  diskData: Uint8Array,
  readDisk: (file: File, drive: number) => void,
  resetDrive: (drive: number) => void,
}
