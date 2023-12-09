// Super Serial Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// MOS 6551 (without transmit bug)

let command = 0x00 // should be 0x02 but hack to force reset
let control = 0x00
let status = 0x00


let receiveBuffer = []
const receiveLength = 16; // arbitrarily chosen

export const receiveCommData = (data: Uint8Array) => {
  for(let i=0;i<data.length;i++)
  {
    receiveBuffer.push(data)

    // if we have exceeded buffer size, shift first byte out
    if(receiveBuffer.length > receiveLength)
    {
      receiveBuffer.shift()
      // set overflow
    }
  }

  // set interrupt flags
}

const sendCommChar = (data: number) => {
  const sendBuffer = new Uint8Array(1).fill(data)
  passTxCommData(sendBuffer)
}

const handleSerialIO = (addr: number, val = -1): number => {

  // We don't manage the ROM
  if (addr >= 0xC100)
    return -1

  const REG = {
      DIPSW1:   0x01,
      DIPSW2:   0x02,
      IOREG:    0x08,
      STATUS:   0x09,
      COMMAND:  0x0A,
      CONTROL:  0x0B,
  }

  switch (addr & 0x0f) {
    case REG.DIPSW1:
        //       off = 1
        // SW:   1   2   3   4      5   6  7
        // Val:  off off off on     off on on
        //       1   1   1   0  0 0 1   0  0
        // Bit:  7   6   5   4  3 2 1   0
        return 0xE2
    case REG.DIPSW2:
        // SW:   1    2     3   4  5  6   7
        // Val:  on   off   off on on off off cts
        //       0  0 1   0 1   0  0  1   1   0 = on
        // Bit:  7  6 5   4 3   2  1          0
        return 0x28
    case REG.IOREG:
        if (val >= 0) {
          sendCommChar(val);
        } else {
          if (receivePos >= 0)
            return receiveBuffer[receivePos--]
          else
            // error
            return 0
        }
        break

    case REG.STATUS:
        if(val >= 0)
        {
          // a write resets the 6551
          console.log('SSC RESET')
          command = 0x02
          control = 0x00
        }
        else
        {
          // ignore all status and errors except recv/send registers.
          // bit 4 = transmit reg empty
          // bit 3 = receive reg ful
          let stat = 0x10
          stat |= (receivePos >= 0) ? 0x08 : 0  
          return stat
        }
        break

    case REG.COMMAND:
        if(val >= 0)
        {
          // ignored
          console.log('SSC COMMAND: 0x' + val.toString(16) )
          command = val
          break
        }
        else
          return command

    case REG.CONTROL:
        if(val >= 0)
        {
          // ignored
          console.log('SSC CONTROL: 0x' + val.toString(16) )
          control = val
          break
        }
        else
          return control

    default:
        console.log('SSC unknown softswitch', (addr&0xf).toString(16))
        break
    }

    return -1
}
