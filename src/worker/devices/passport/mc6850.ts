// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// Motorola 6850 ACIA 

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
    NDCD:     (0x01 << 2),  // /DCD
    NCTS:     (0x01 << 3),  // /CTS
    FE:       (0x01 << 4),  // framing error 
    OVRN:     (0x01 << 5),  // overrun error
    PE:       (0x01 << 6),  // parity error
    IRQ:      (0x01 << 7), 
}

const CONTROL = {
    COUNTER_DIV1:  (0x01 << 0), // clocks for baud rate ignored
    COUNTER_DIV2:  (0x01 << 1), // both set = master reset
    WORD_SEL1:     (0x01 << 2), // ignored - we always send 8 data bits
    WORD_SEL2:     (0x01 << 3), 
    WORD_SEL3:     (0x01 << 4), 
    TX_INT_ENABLE: (0x01 << 5), // If RTS && TX_INT_ENABLE send break
    NRTS:          (0x01 << 6), // /RTS
    RX_INT_ENABLE: (0x01 << 7), 
}

export class MC6850
{
  _control: number
  _status: number
  _lastRead: number
  _receiveBuffer: number[]
  _extFuncs: MC6850Ext

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
    const sendBuffer = new Uint8Array(1).fill(data)
    this._extFuncs.sendData(sendBuffer)
    
    if ((this._control & (CONTROL.TX_INT_ENABLE | CONTROL.NRTS)) === CONTROL.TX_INT_ENABLE)
    {
      this.irq(true)
    }
  }

  get data(): number
  {
    // check if we have any data
    if (this._receiveBuffer.length)
      this._lastRead = this._receiveBuffer.shift()!

    // clear errors on read
    this._status &= ~(STATUS.FE|STATUS.OVRN|STATUS.PE)

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

    return this._lastRead
  }

  set control(val: number)
  {
    this._control = val
    if ((this._control & (CONTROL.COUNTER_DIV1|CONTROL.COUNTER_DIV2)) ===
        (CONTROL.COUNTER_DIV1|CONTROL.COUNTER_DIV2))
    {
      this.reset()
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
      this._status |= STATUS.IRQ
    else
      this._status &= ~STATUS.IRQ

    this._extFuncs.interrupt(set)
  }

  reset(): void
  {
    this._control = 0x00
    // set these permanently: TX empty, /DCD and /CTS
    this._status = (STATUS.TX_EMPTY)
    this.irq(false)
    this._receiveBuffer = []
  }

  constructor(externalFuncs: MC6850Ext)
  {
    this._extFuncs = externalFuncs
    this._lastRead = 0x00
    this._control = 0x00
    this._status = 0x00
    this._receiveBuffer = []
    this.reset()
  }
}
