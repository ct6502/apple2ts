// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// Motorola 6840 programmable timer

const DEBUG = false

const CONTROL =
{
  OUTPUT_ENABLE  : (0x01 << 7), // Not used
  IRQ_ENABLE     : (0x01 << 6),
  COUNTER_MODE   : (0x07 << 3), // see below
  BIT8_MODE      : (0x01 << 2), // "dual 8 bit mode" is not implemented
  INTERNAL_CLOCK : (0x01 << 1), // Not sure what external clock lines are tied to, assuming same as E
  SPECIAL        : (0x01 << 0), // CR0 - Reset, CR1 - Write CR0, CR2 - Prescale / 8
}

const STATUS =
{
  TIMER1_IRQ : (0x01 << 0),
  TIMER2_IRQ : (0x01 << 1),
  TIMER3_IRQ : (0x01 << 2),
  ANY_IRQ    : (0x01 << 7)
}

enum MODE
{                             // Note: Gate rules are ignored, since Gates are tied low
  CONTINUOUS0       = (0<<3), // Write to latches or Reset causes init
  FREQUENCY_CMP0    = (1<<3), // (NA)
  CONTINUOUS1       = (2<<3), // Reset causes init
  PULSE_WIDTH_CMP0  = (3<<3), // (NA)
  SINGLE_SHOT0      = (4<<3), // Write to latches or Reset causes init
  FREQUENCY_CMP1    = (5<<3), // (NA)
  SINGLE_SHOT1      = (6<<3), // Reset causes init
  PULSE_WIDTH_CMP1  = (7<<3), // (NA)
}

const getControlString = (timer: number, ctrl: number): string => 
{
  let ret : string = ""

  if (ctrl & CONTROL.OUTPUT_ENABLE)
    ret += "OE   "
  else
    ret += "/OE  "
  if (ctrl & CONTROL.IRQ_ENABLE)
    ret += "IRQ  "
  else
    ret += "/IRQ "
  if (ctrl & CONTROL.BIT8_MODE)
    ret += "D8BIT "
  else
    ret += "16BIT "
  if (ctrl & CONTROL.INTERNAL_CLOCK)
    ret += "ICLK "
  else
    ret += "ECLK "
  if (ctrl & CONTROL.SPECIAL)
    switch(timer)
    {
      case 0:
        ret += "RST  "
        break;
      case 1:
        ret += "WR0  "
        break;
      case 2:
        ret += "DIV8 "
        break;
    }
  else
    switch(timer)
    {
      case 0:
        ret += "RUN  "
        break;
      case 1:
        ret += "WR2  "
        break;
      case 2:
        ret += "DIV1 "
        break;
    }

  ret += "-> "

  switch (ctrl & CONTROL.COUNTER_MODE)
  {
    case MODE.CONTINUOUS0:
      ret += "CONTINUOUS0"
      break;
    case MODE.FREQUENCY_CMP0:
      ret += "FREQUENCY_CMP0"
      break;
    case MODE.CONTINUOUS1:
      ret += "CONTINUOUS1"
      break;
    case MODE.PULSE_WIDTH_CMP0:
      ret += "PULSE_WIDTH_CMP0"
      break;
    case MODE.SINGLE_SHOT0:
      ret += "SINGLE_SHOT0"
      break;
    case MODE.FREQUENCY_CMP1:
      ret += "FREQUENCY_CMP1"
      break;
    case MODE.SINGLE_SHOT1:
      ret += "SINGLE_SHOT1"
      break;
    case MODE.PULSE_WIDTH_CMP1:
      ret += "PULSE_WIDTH_CMP1"
      break;
  }
   
  return ret
}

class PTMTimer
{
  _latch: number
  _count: number
  _control: number
  _enabled: boolean

  // returns true if zero cross
  decrement(count: number): boolean
  {
    // For now, assume E and Cx lines are connected to same source
    //if ((this._control & CONTROL.INTERNAL_CLOCK) == 0)
    //  return false

    // we reached limit and haven't been reset
    if (!this._enabled)
      return false

    // go ahead and decrement
    this._count -= count
    if (this._count < 0)
    {
      this._count = 0xFFFF
      this._enabled = false
      return true
    }

    return false
  }

  get count(): number
  {
    return this._count
  }

  set control(value: number)
  {
    this._control = value
  }

  get control(): number
  {
    return this._control
  }

  set latch(value: number)
  {
    this._latch = value

    switch( this._control & CONTROL.COUNTER_MODE )
    {
      case MODE.CONTINUOUS0:
      case MODE.SINGLE_SHOT0:
        // reload counter with latch
        this.reload()
        break

      default:
        break
    }
  }

  get latch(): number
  {
    return this._latch
  }

  reload(): void
  {
    // transfer to count from latch
    this._count = this._latch
    this._enabled = true
  }

  reset(): void
  {
    this._latch = 0xFFFF
    this._control = 0  
    this._enabled = true
    this.reload()
  }

  constructor()
  {
    this._latch = 0xFFFF
    this._count = 0xFFFF
    this._control = 0  
    this._enabled = true
  }
}

export class MC6840
{
  _timer: Array<PTMTimer> 
  _status: number
  _irqMask: number
  _debugStatus: boolean
  _debugStatusCount: number
  _statusRead: number
  _msb: number
  _lsb: number
  _div8: number
  _interrupt: (tf:boolean) => void

  status(): number
  {
    // set this value if read during an interrupt
    this._statusRead = this._status & 0x07
    return this._status
  }

  timerControl(idx: number, value: number): void
  {
    // IDX 0 = CR0/CR2 depending on bit 0 of timer CR1 
    // IDX 1 = CR1 always 
    
    // timer1 holds "write to control reg" flag
    if (idx === 0)
      idx = (this._timer[1].control & CONTROL.SPECIAL) ? 0 : 2

    let prev = this._timer[idx].control
    this._timer[idx].control = value

    // check for various changes
    if (prev != value)
    {
      if (DEBUG)
      {
        console.log("["+idx+"]: " + value.toString(16) + " " + getControlString(idx,value) + " : " + this._timer[idx].latch.toString(16)
                  + " : " + this._timer[idx].count.toString(16) )
      }

      if (value & CONTROL.IRQ_ENABLE)
      {
        this._irqMask |= (1<<idx)
      }
      else
      {
        this._irqMask &= ~(1<<idx)
      }

      if (idx == 0)
      {
        let state = (prev & CONTROL.SPECIAL) << 1 | value & CONTROL.SPECIAL

        switch(state)
        {
          case 0: // not set or same state
          case 3:
            break;

          case 1: // enter reset
          case 2: // leave reset
            this._timer[0].reload()
            this._timer[1].reload()
            this._timer[2].reload()
            this.irq(0,false)
            this.irq(1,false)
            this.irq(2,false)
            break;
        }
      }
    }
  }

  timerLSBw(idx: number, value: number): void
  {
    const inreset = this._timer[0].control & CONTROL.SPECIAL
    let reload = false

    switch(this._timer[idx].control & CONTROL.COUNTER_MODE)
    {
      case MODE.CONTINUOUS1:
      case MODE.SINGLE_SHOT1:
        reload = true
        break
    }

    const latch = this._msb*256 + value
    this._timer[idx].latch = latch

    if (inreset || reload)
      this._timer[idx].reload()

    // writing always clears interrupt
    this.irq(idx, false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timerLSBr(idx: number): number
  {
    // there is only 1 lsb buffer register
    return this._lsb
  }

  timerMSBw(idx: number, value: number): void
  {
    // there is only 1 msb buffer register
    this._msb = value
  }

  timerMSBr(idx: number): number
  {
    // timer0 holds reset flag
    const inreset = this._timer[0].control & CONTROL.SPECIAL

    const count = (inreset) ? this._timer[idx].latch : this._timer[idx].count
    this._lsb = count & 0xff

    // reading counter after reading status clears int
    if (this._statusRead & (1<<idx))
    {
      this._statusRead &= ~(1<<idx)
      this.irq(idx, false)
    }
    return (count >> 8) & 0xff
  }

  update(cycles: number): void
  {
    // timer1 holds reset flag
    const inreset = this._timer[0].control & CONTROL.SPECIAL

    if (this._debugStatus)
    {
      this._debugStatusCount++
      if (this._debugStatusCount > 1020300)
      {
        this._debugStatusCount = 0
        this.printStatus()
      }
    }

    if (!inreset)
    {
      this._div8 += cycles
      let zeroed = false

      for(let i=0;i<3;i++)
      {
        let dec = cycles

        if (i==2)
        {
          // the special bit in timer3 is divide by 8
          if (this._timer[2].control & CONTROL.SPECIAL)
          {
            if (this._div8 > 8)
            {
              // do it this way in case div8 is turned on/off.
              // will miss some counts but sould catch up OK.
              dec = Math.floor(this._div8 / 8)
              this._div8 %= 8
            }
            else
              // no point in decrementing by zero
              continue
          }
        }

        zeroed = this._timer[i].decrement(dec)

        if (zeroed)
        {
          //console.log("timer[" + i + "] zeroed");
          this.irq(i, true)

          switch( this._timer[i].control & CONTROL.COUNTER_MODE )
          {
            case MODE.CONTINUOUS0:
            case MODE.CONTINUOUS1:
              // reload counter with latch
              this._timer[i].reload()
              break

            case MODE.SINGLE_SHOT0:
            case MODE.SINGLE_SHOT1:
            default:
              // stay at 0xffff
              break
          }
        }
      }
    }
  }

  irq(which: number, tf: boolean): void
  {
    const bits = (0x01 << which)

    // always set or reset the bits
    if (tf)
      this._status |= bits
    else
      this._status &= ~bits

    // if any bits are set and their corresponding irq mask is also
    // set, then interrupt
    if (this._status & this._irqMask)
    {
      this._status |= STATUS.ANY_IRQ
      this._statusRead &= ~bits
      this._interrupt(true)
      //console.log("IRQ["+which+"]: true")
    }
    else
    {
      this._status &= ~STATUS.ANY_IRQ
      this._interrupt(false)
      //console.log("IRQ["+which+"]: false")
    }
  }

  printStatus(): void
  {
    console.log("Status : " + this._status.toString(16))
    console.log("IRQMask: " + this._irqMask.toString(16))
    for(let idx=0;idx<3;idx++)
      console.log("["+idx+"]: " + getControlString(idx,this._timer[idx].control) + " : " + this._timer[idx].latch
                  + " : " + this._timer[idx].count )

  }

  reset(): void
  {
    // this is a chip reset
    this._timer.forEach( (f) => {f.reset()} )
    this._status = 0
    this._irqMask = 0
    this.irq(0, false)
    this.irq(1, false)
    this.irq(2, false)
    // chip starts in reset state
    this._timer[0].control = CONTROL.SPECIAL
  }

  constructor(interrupt: (tf:boolean) => void)
  {
    this._interrupt = interrupt
    this._status = 0
    this._irqMask = 0
    this._statusRead = 0
    this._timer = [new PTMTimer(), new PTMTimer(), new PTMTimer()]
    this._msb = this._lsb = 0
    this._div8 = 0
    this._debugStatus = false
    this._debugStatusCount = 0
    this.reset()
  }
}

