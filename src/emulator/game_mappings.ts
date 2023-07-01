import { matchMemory } from "./memory"
import { setGamepad0, setGamepad1,
  setGamepad2,
  setGamepad3,
  setLeftButtonDown, setPushButton2, setRightButtonDown } from "./joystick"
import { passHelptext } from "./worker2main"
import { aztec } from "./games/aztec"
import { firebug } from "./games/firebug"
import { karateka } from "./games/karateka"
import { noxarchaist } from "./games/noxarchaist"
import { wolfenstein } from "./games/wolfenstein"

const gameLibrary = new Array<GameLibraryItem>()

gameLibrary.push(aztec)
gameLibrary.push(firebug)
gameLibrary.push(karateka)
gameLibrary.push(noxarchaist)
gameLibrary.push(wolfenstein)

export const defaultButtons: GamePadMapping = (button: number,
  dualJoysticks: boolean, isJoystick2: boolean) => {
  if (isJoystick2) {
    switch (button) {
      case 0: setPushButton2(); break  // button #0 becomes push button 2
      case 1: break  // ignore button #1
      case 12: setGamepad3(-1); break   // D-pad U
      case 13: setGamepad3(1); break    // D-pad D
      case 14: setGamepad2(-1); break   // D-pad L
      case 15: setGamepad2(1); break    // D-pad R
      default: break;
    }
  } else {
    switch (button) {
      case 0: setLeftButtonDown(); break
      case 1: if (!dualJoysticks) setRightButtonDown(); break
      case 12: setGamepad1(-1); break   // D-pad U
      case 13: setGamepad1(1); break    // D-pad D
      case 14: setGamepad0(-1); break   // D-pad L
      case 15: setGamepad0(1); break    // D-pad R
      default: break;
    }
  }
}

const defaultGame: GameLibraryItem = {
  address: 0,
  data: [],
  keymap: {},
  gamepad: null,
  joystick: (axes: number[]) => axes,
  rumble: null,
  setup: null,
  helptext: ''
}

export const handleKeyMapping = (key: string) => {
  for (let game of gameLibrary) {
    if (matchMemory(game.address, game.data)) {
      return (key in game.keymap) ? game.keymap[key] : key
    }   
  }
  return key
}

export const getGameMapping = () => {
  for (let game of gameLibrary) {
    if (matchMemory(game.address, game.data)) {
      return game
    }   
  }
  return defaultGame
}

export const handleGameSetup = (reset = false) => {
  for (let game of gameLibrary) {
    if (matchMemory(game.address, game.data)) {
      passHelptext(game.helptext ? game.helptext : ' ')
      if (game.setup) game.setup()
      return
    }   
  }
  if (reset) passHelptext(' ')
}
