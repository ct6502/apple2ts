// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// Motorola 6850 ACIA 

const DEBUG = false

export interface MC6850Ext
{
  // external call to send async data
  sendData(data: Uint8Array): void;

  // external call to interrupt interface
  interrupt(onoff: boolean): void;

  // external call to configuration state changes
  // not needed - always in midi mode
  //configChange(config: ConfigChange): void;
};

// 6850 regs
const STATUS = {
    RX_FULL:  (0x01 << 0), 
    TX_EMPTY: (0x01 << 1), 
    DCD:      (0x01 << 2),  // /DCD - Low is DCD.  High is DCD not asserted (no carrier)
    CTS:      (0x01 << 3),  // /CTS - Low is CTS.  High is CTS not asserted (not clear to send)
    FE:       (0x01 << 4),  // framing error 
    OVRN:     (0x01 << 5),  // overrun error
    PE:       (0x01 << 6),  // parity error
    IRQ:      (0x01 << 7), 
}

const CONTROL = {
    COUNTER_DIV:   (0x03 << 0), // clocks for baud rate
    WORD_SEL:      (0x07 << 2), // we always send 8 data bits
    TX_RTS:        (0x03 << 5), // TX and RTS bits
    RX_INT_ENABLE: (0x01 << 7), 
}

const COUNTER = {
    DIV01: 0x00,
    DIV16: 0x01,
    DIV64: 0x02,
    RESET: 0x03,
}

const WORDSEL = {
    B7E2: (0x00 << 2),
    B7O2: (0x01 << 2),
    B7E1: (0x02 << 2),
    B7O1: (0x03 << 2),
    B8N2: (0x04 << 2),
    B8N1: (0x05 << 2),
    B8E1: (0x06 << 2),
    B8O1: (0x07 << 2),
}

const TXRTS = {
    RTS_NO_INT: (0x00 << 5), // Set /RTS Low, disable interrupt
    RTS_TX_INT: (0x01 << 5), // Set /RTS Low, enable interrupt
    RTS_CLEAR:  (0x02 << 5), // Set /RTS High, disable interrupt. No transmit data in this state
    RTS_BREAK:  (0x03 << 5), // Set /RTS Low, disable interrupt, transmit break, no transmit data
}

// limit output to approxiate midi rates of 3125 bytes/sec
const OUTDELAY_CLOCKS = 320

export class MC6850
{
  _control: number
  _status: number
  _lastRead: number
  _receiveBuffer: number[]
  _extFuncs: MC6850Ext
  _outCount: number
  _outDelay: number

  update(clocks: number)
  {
    if ((this._status & STATUS.TX_EMPTY) === 0)
    {
      this._outDelay += clocks
      if (this._outDelay > OUTDELAY_CLOCKS)
      {
        this._outDelay = 0
        this._status |= STATUS.TX_EMPTY
        if ((this._control & CONTROL.TX_RTS) === TXRTS.RTS_TX_INT)
        {
          this.irq(true)
        }
      }
    }
  }

  buffer(data: Uint8Array): void
  {
    for(let i=0;i<data.length;i++)
      this._receiveBuffer.push(data[i])

    // size of internal buffer of 16 is arbitrary
    let shifts = this._receiveBuffer.length - 16 
    shifts = (shifts < 0) ? 0 : shifts
    
    // if we are longer than desired length, shift out the earlier entries
    for(let i=0;i<shifts;i++)
    {
      this._receiveBuffer.shift()
      // set overrun
      this._status |= STATUS.OVRN
    }

    this._status |= STATUS.RX_FULL
    if (this._control & CONTROL.RX_INT_ENABLE) 
    {
      this.irq(true)
    }
  }

  set data(data: number)
  {
    // we TX_EMPTY and TX ints so that we only transmit ~3125 bytes/sec
    const sendBuffer = new Uint8Array(1).fill(data)
    this._extFuncs.sendData(sendBuffer)

    //console.log(data.toString(16))

    // clear this to start outdelay
    this._status &= ~STATUS.TX_EMPTY
    this._outCount++
  }

  get data(): number
  {
    // check if we have any data
    if (this._receiveBuffer.length)
      this._lastRead = this._receiveBuffer.shift()!

    // clear errors and DCD on read
    this._status &= ~(STATUS.DCD|STATUS.FE|STATUS.OVRN|STATUS.PE)

    // check if we have more data
    if (this._receiveBuffer.length)
    {
      // if we have more data, ring the IRQ bell again
      this._status |= STATUS.RX_FULL
      if (this._control & CONTROL.RX_INT_ENABLE) 
      {
        this.irq(true)
      }
    }
    else
    {
      // if we are empty, then a read clears IRQ
      this._status &= ~STATUS.RX_FULL
      this.irq(false)
    }

    //console.log("Read: "+this._lastRead.toString(16))
    return this._lastRead
  }

  set control(val: number)
  {
    let lastctrl = this._control
    this._control = val
    if ((this._control & CONTROL.COUNTER_DIV) === COUNTER.RESET)
    {
      this.reset()
    } 
    else if ((this._control & CONTROL.TX_RTS) == TXRTS.RTS_TX_INT)
    {
      // clear TRDE to cause int later
      this._status &= ~STATUS.TX_EMPTY
    }

    if (DEBUG)
    {
      if (lastctrl != val)
      {
        let str: string = "CTRL: " + val.toString(16) + " "
        switch(val & CONTROL.COUNTER_DIV)
        {
          case COUNTER.DIV01:
            str += "DIV01 "
            break
          case COUNTER.DIV16:
            str += "DIV16 "
            break
          case COUNTER.DIV64:
            str += "DIV64 "
            break
          case COUNTER.RESET:
            str += "RESET "
            break;
        }
        switch(val & CONTROL.WORD_SEL)
        {
          case WORDSEL.B7E2:
            str += "7E2 "
            break 
          case WORDSEL.B7O2:
            str += "7O2 "
            break 
          case WORDSEL.B7E1:
            str += "7E1 "
            break 
          case WORDSEL.B7O1:
            str += "7O1 "
            break 
          case WORDSEL.B8N2:
            str += "8N2 "
            break 
          case WORDSEL.B8N1:
            str += "8N1 "
            break 
          case WORDSEL.B8E1:
            str += "8E1 "
            break 
          case WORDSEL.B8O1:
            str += "8O1 "
            break 
        }
        switch(val & CONTROL.TX_RTS)
        {
          case TXRTS.RTS_NO_INT:
            str += "RTS /TX_INT "
            break;
          case TXRTS.RTS_TX_INT:
            str += "RTS TX_INT "
            break;
          case TXRTS.RTS_CLEAR:
            str += "RTS_CLEAR  "
            break;
          case TXRTS.RTS_BREAK:
            str += "RTS_BREAK  "
            break;
        }
        if (val & CONTROL.RX_INT_ENABLE)
          str += "RX_INT"
        else
          str += "/RX_INT"

        console.log(str)
      }
    }

    if ((this._status & STATUS.RX_FULL) && (this._control & CONTROL.RX_INT_ENABLE)) 
    {
      this.irq(true)
    }
  }

  get status(): number
  {
    const result = this._status

    // clear irq on status read
    if (this._status & STATUS.IRQ)
    {
      this.irq(false)
    }

    return result
  }

  irq(set: boolean): void
  {
    if (set)
    {
      this._status |= STATUS.IRQ
      //console.log("irq")
    }
    else
      this._status &= ~STATUS.IRQ

    this._extFuncs.interrupt(set)
  }

  reset(): void
  {
    this._control = 0x00
    // set these permanently: TX empty, /CTS
    this._status = (STATUS.TX_EMPTY | STATUS.DCD)
    this.irq(false)
    this._receiveBuffer = []
    this._outCount = 0
    this._outDelay = 0
  }

  constructor(externalFuncs: MC6850Ext)
  {
    this._extFuncs = externalFuncs
    this._lastRead = 0x00
    this._control = 0x00
    this._status = 0x00
    this._receiveBuffer = []
    this._outCount = 0
    this._outDelay = 0
    this.reset()
  }
}
