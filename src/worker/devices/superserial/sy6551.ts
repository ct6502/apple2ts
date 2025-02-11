// SuperSerial Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// Synertek 6551 ACIA
// The superserial firmware seems configured for synertek 6551, as it requires
// command register to be zeroed on init rather than containing 0x02 like MOS/WD.

export type ConfigChange =
{
  baud: number;
  bits: number;
  stop: number;
  parity: string;
};

export interface SY6551Ext
{
  // external call to send async data
  sendData(data: Uint8Array): void;

  // external call to interrupt interface
  interrupt(onoff: boolean): void;

  // external call to configuration state changes
  configChange(config: ConfigChange): void;
};

// 6551 regs
const STATUS = {            // Description     IRQ on Change  Cleared on Read
    PE:       (0x01 << 0),  // parity error     N              Y
    FE:       (0x01 << 1),  // framing error    N              Y
    OVRN:     (0x01 << 2),  // overrun error    N              Y
    RX_FULL:  (0x01 << 3),  // receiver full    Y              N
    TX_EMPTY: (0x01 << 4),  // transmit empty   Y              N
    NDCD:     (0x01 << 5),  // /DCD             Y              N
    NDSR:     (0x01 << 6),  // /DSR             Y              N
    IRQ:      (0x01 << 7),  // interrupt        Y              Y
    HW_RESET: (0x10),       // value at hard reset
};

const CONTROL = {
    BAUD_RATE:   (0x0F << 0), // clock divisor for baud rate
    INT_CLOCK:   (0x01 << 4), // internal or external clock  
    WORD_LENGTH: (0x03 << 5), // 8,7,6,5
    STOP_BITS:   (0x01 << 7), // 0 - 1, 1 = 2 or 1.5
    HW_RESET:    (0x00),      // value at hard reset
};

const COMMAND = {
    DTR_ENABLE:    (0x01 << 0), // clear /DTR and enable receiver
    RX_INT_DIS:    (0x01 << 1), // RX interrupt disable (0=enable)
    TX_INT_EN:     (0x01 << 2), // TX interrupt enable
    RTS_TX_INT_EN: (0x03 << 2), // /RTS TX interrupt enable
    RX_ECHO:       (0x01 << 4), // echo mode for receiver
    PARITY_EN:     (0x01 << 5), // enable parity  (not changed on reset)
    PARITY_CNF:    (0x03 << 6), // parity config  (not changed on reset)
    HW_RESET:      (0x00),      // synertek zeroes
    HW_RESET_MOS:  (0x02),      // MOS value at reset
};

enum PARITY
{
  ODD      = (0<<6),  // odd
  EVEN     = (1<<6),  // even
  MARK     = (2<<6),  // mark party, check disabled
  SPACE    = (3<<6),  // space party, check disabled
};

enum WORD_LENGTH
{
  W8 = (0<<5),
  W7 = (1<<5),
  W6 = (2<<5),
  W5 = (3<<5),
};

enum BAUD_RATE
{
  EXTERNAL_16X = 0x00,
  B50,
  B75,
  B109,
  B134,
  B150,
  B300,
  B600,
  B1200,
  B1800,
  B2400,
  B3600,
  B4800,
  B7200,
  B9600,
  B19200
};

export class SY6551
{
  _control: number
  _status: number
  _command: number
  _lastRead: number
  _lastConfig: ConfigChange
  _receiveBuffer: number[]
  _extFuncs: SY6551Ext

  buffer(data: Uint8Array): void
  {
    for(let i=0;i<data.length;i++)
      this._receiveBuffer.push(data[i]);

    // size of internal buffer of 16 is arbitrary
    let shifts = this._receiveBuffer.length - 16; 
    shifts = (shifts < 0) ? 0 : shifts;
    
    // if we are longer than desired length, shift out the earlier entries
    for(let i=0;i<shifts;i++)
    {
      this._receiveBuffer.shift();
      // set overrun
      this._status |= STATUS.OVRN;
    }

    this._status |= STATUS.RX_FULL
    if ((this._control & COMMAND.RX_INT_DIS) == 0) 
    {
      this.irq(true);
    }
  }

  set data(data: number)
  {
    const sendBuffer = new Uint8Array(1).fill(data);
    this._extFuncs.sendData(sendBuffer);
    
    // leave TX_EMPTY set, and irq
    if (this._command & COMMAND.TX_INT_EN)
    {
      this.irq(true);
    }
  }

  get data(): number
  {
    // check if we have any data
    if (this._receiveBuffer.length)
      this._lastRead = this._receiveBuffer.shift()!;

    // clear these bits on read of data reg
    this._status &= ~(STATUS.PE|STATUS.FE|STATUS.OVRN);

    // check if we have more data
    if (this._receiveBuffer.length)
    {
      // if we have more data, ring the IRQ bell
      this._status |= STATUS.RX_FULL
      if ((this._control & COMMAND.RX_INT_DIS) == 0) 
      {
        this.irq(true);
      }
    }
    else
    {
      this._status &= ~STATUS.RX_FULL;
    }

    return this._lastRead;
  }

  set control(val: number)
  {
    // need to report this as it changes config
    this._control = val;
    this.configChange(this.buildConfigChange());
  }

  get control(): number
  {
    return this._control;
  }

  set command(val: number)
  {
    // send a state change here for parity
    this._command = val;
    this.configChange(this.buildConfigChange());
  }

  get command(): number
  {
    return this._command;
  }

  get status(): number
  {
    const result = this._status;

    // clear irq on status read
    if (this._status & STATUS.IRQ)
    {
      this.irq(false);
    }

    this._status &= ~STATUS.IRQ;

    return result;
  }

  // writing status resets device
  set status(unused: number)
  {
    this.reset();
  }

  irq(set: boolean): void
  {
    if (set)
      this._status |= STATUS.IRQ;
    else
      this._status &= ~STATUS.IRQ;

    this._extFuncs.interrupt(set);
  }

  buildConfigChange(): ConfigChange
  {
    const change = <ConfigChange>{};

    switch(this._control & CONTROL.BAUD_RATE)
    {
      case  BAUD_RATE.EXTERNAL_16X:
        // this is invalid
        change.baud = 0
        break;
      case  BAUD_RATE.B50:
        change.baud = 50
        break;
      case  BAUD_RATE.B75:
        change.baud = 75
        break;
      case  BAUD_RATE.B109:
        change.baud = 109
        break;
      case  BAUD_RATE.B134:
        change.baud = 134
        break;
      case  BAUD_RATE.B150:
        change.baud = 150
        break;
      case  BAUD_RATE.B300:
        change.baud = 300
        break;
      case  BAUD_RATE.B600:
        change.baud = 600
        break;
      case  BAUD_RATE.B1200:
        change.baud = 1200
        break;
      case  BAUD_RATE.B1800:
        change.baud = 1800
        break;
      case  BAUD_RATE.B2400:
        change.baud = 2400
        break;
      case  BAUD_RATE.B3600:
        change.baud = 3600
        break;
      case  BAUD_RATE.B4800:
        change.baud = 4800
        break;
      case  BAUD_RATE.B7200:
        change.baud = 7200
        break;
      case  BAUD_RATE.B9600:
        change.baud = 9600
        break;
      case  BAUD_RATE.B19200:
        change.baud = 19200
        break;
    }

    switch(this._control & CONTROL.WORD_LENGTH)
    {
      case WORD_LENGTH.W8:
        change.bits = 8;
        break;
      case WORD_LENGTH.W7:
        change.bits = 7;
        break;
      case WORD_LENGTH.W6:
        change.bits = 6; 
        break;
      case WORD_LENGTH.W5:
        change.bits = 5;
        break;
    }

    if(this._control & CONTROL.STOP_BITS)
      change.stop = 2;
    else
      change.stop = 1;

    change.parity = 'none';
    if(this._command & COMMAND.PARITY_EN)
    {
      switch(this._command & COMMAND.PARITY_CNF)
      {
        case PARITY.ODD:
          change.parity = 'odd'; 
          break;
        case PARITY.EVEN:
          change.parity = 'even'; 
          break;
        case PARITY.MARK:
          change.parity = 'mark'; 
          break;
        case PARITY.SPACE:
          change.parity = 'space'; 
          break;
      }
    }

    return change;
  }

  configChange(newconf: ConfigChange)
  {
    let send = false;
    if (newconf.baud != this._lastConfig.baud)
      send = true;
    if (newconf.bits != this._lastConfig.bits)
      send = true;
    if (newconf.stop != this._lastConfig.stop)
      send = true;
    if (newconf.parity != this._lastConfig.parity)
      send = true;

    if (send)
    {
      // note that not all params may be valid, ie: baud could be zero
      this._lastConfig = newconf;
      this._extFuncs.configChange(this._lastConfig);
    }
  }

  reset(): void
  {
    this._control = CONTROL.HW_RESET;
    this._command = COMMAND.HW_RESET;
    this._status = STATUS.HW_RESET;
    this.irq(false);
    this._receiveBuffer = [];
  }

  constructor(extFuncs: SY6551Ext)
  {
    this._extFuncs = extFuncs;
    this._control = CONTROL.HW_RESET;
    this._command = COMMAND.HW_RESET;
    this._status  = STATUS.HW_RESET;
    this._lastConfig = this.buildConfigChange();
    this._lastRead = 0;
    this._receiveBuffer = [];
    this.reset();
  }
};
