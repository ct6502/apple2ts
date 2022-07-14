import {  STATE } from "./motherboard";

type DisplayProps = {
  _6502: STATE,
  speed: string,
  delta: string,
  myCanvas: React.RefObject<HTMLCanvasElement>,
  speedCheck: boolean,
  handleSpeedChange: () => void,
  uppercase: boolean,
  handleGoBackInTime: () => void,
  handleGoForwardInTime: () => void,
  handleUpperCaseChange: () => void,
  handlePause: () => void,
  handle6502StateChange: (state: STATE) => void,
  handleFileOpen: () => void,
  handleFileSave: () => void,
}

export default DisplayProps;
