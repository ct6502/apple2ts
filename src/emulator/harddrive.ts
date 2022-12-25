import { parseAssembly } from "./assembler"
import { setSlotDriver, mainMem } from "./memory"
import { diskImageBinary } from "./roms/totalreplay"
import { Buffer } from "buffer";

let diskImage: Uint8Array | null = null

const code1 = `
         LDX   #$20
         LDA   #$00
         LDX   #$03
         LDA   #$01
         STA   $42
         LDA   #$70
         STA   $43
         LDA   #$00
         STA   $44
         LDA   #$08
         STA   $45
         LDA   #$00
         STA   $46
         STA   $47
         JSR   $C7EA
         LDX   #$70
         JMP   $801
`
const code2 = `
         CLC
         LDA   #$00
         RTS
`
const prodos8driver = () => {
  const driver = new Uint8Array(256).fill(0)
  let pcode = parseAssembly(0x0, code1.split("\n"))
  driver.set(pcode, 0)
  pcode = parseAssembly(0x0, code2.split("\n"))
  driver.set(pcode, 0xEA)
  driver[0xFE] = 0b00010011
  driver[0xFF] = 0xEA
  return driver
}

export const enableHardDrive = () => {
  setSlotDriver(7, prodos8driver())
}

export const processHardDriveBlockAccess = () => {
  if (mainMem[0x43] !== 0x70) {
    console.log("illegal value in 0x42: " + mainMem[0x43])
    return
  }
  if (!diskImage) {
    diskImage =  Buffer.from(diskImageBinary.replaceAll("\n", ""), "base64")
  }
  switch (mainMem[0x42]) {
    case 0:
      console.log("status")
      break;
    case 1:
      const blockStart = 512 * (mainMem[0x46] + 256 * mainMem[0x47])
      const addr = mainMem[0x44] + 256 * mainMem[0x45]
      console.log(`read ${blockStart / 512} into ${addr}`)
      const data = diskImage.slice(blockStart, blockStart + 512)
      mainMem.set(data, addr)
      break;
    case 2:
      console.log("write")
      break;
    case 3:
      console.log("format")
      break;
    default:
      console.log("unknown hard drive command")
      break;
  }
}