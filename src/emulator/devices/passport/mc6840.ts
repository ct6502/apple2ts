// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// Motorola 6840 programmable timer

const CONTROL =
{
  OUTPUT_ENABLE  : (0x01 << 7), // (NA)
  IRQ_ENABLE     : (0x01 << 6),
  COUNTER_MODE   : (0x07 << 3),
  BIT8_MODE      : (0x01 << 2),
  INTERNAL_CLOCK : (0x01 << 1), // (NA) must use internal clock
  SPECIAL        : (0x01 << 0), // CR1 - Reset, CR2 - Write CR1, CR3 - Prescale / 8 (NA)
};

const STATUS =
{
  TIMER1_IRQ : (0x01 << 0), // (NA)
  TIMER2_IRQ : (0x01 << 1),
  TIMER3_IRQ : (0x01 << 2),
  ANY_IRQ    : (0x01 << 7)
};

enum MODE
{                             // Note: Gate rules ignored
  CONTINUOUS0       = (0<<3), // Write to latches or Reset causes init
  FREQUENCY_CMP0    = (1<<3), // (NA)
  CONTINUOUS1       = (2<<3), // Reset causes init
  PULSE_WIDTH_CMP0  = (3<<3), // (NA)
  SINGLE_SHOT0      = (4<<3), // Write to latches or Reset causes init
  FREQUENCY_CMP1    = (5<<3), // (NA)
  SINGLE_SHOT1      = (6<<3), // Reset causes init
  PULSE_WIDTH_CMP1  = (7<<3), // (NA)
};

class PTMTimer
{
  _latch: number;
  _count: number;
  _control: number;

  // returns true if zero cross
  decrement(count: number): boolean
  {
    // we can't advance if not using internal clock
    if ((this._control & CONTROL.INTERNAL_CLOCK) == 0)
      return false;

    // we reached limit and haven't been reset
    if (this._count === 0xFFFF)
      return false;

    // go ahead and decrement
    this._count -= count;
    if (this._count < 0)
    {
      this._count = 0xFFFF;
      return true;
    }

    return false;
  }

  get count(): number
  {
    return this._count;
  }

  set control(value: number)
  {
    this._control = value;
  }

  get control(): number
  {
    return this._control;
  }

  set latch(value: number)
  {
    this._latch = value;

    switch( this._control & CONTROL.COUNTER_MODE )
    {
      case MODE.CONTINUOUS0:
      case MODE.SINGLE_SHOT0:
        // reload counter with latch
        this.reload();
        break;

      default:
        break;
    }
  }

  get latch(): number
  {
    return this._latch;
  }

  reload(): void
  {
    // transfer to count from latch
    this._count = this._latch;
  }

  reset(): void
  {
    this._latch = 0xFFFF;
    this._control = 0;  
    this.reload();
  }

  constructor()
  {
    this._latch = 0xFFFF;
    this._count = 0xFFFF;
    this._control = 0;  
  }
};

export class MC6840
{
  _timer: Array<PTMTimer>; 
  _status: number;
  _statusRead: boolean;
  _msb: number;
  _lsb: number;
  _div8: number;
  _interrupt: (tf:boolean) => void;

  status(): number
  {
    // set this value if read during an interrupt
    this._statusRead = (this._status) ? true : false;
    return this._status;
  }

  timerControl(idx: number, value: number): void
  {
    // IDX 0 = CR1/CR3 depending on bit 0 of timer CR2 
    // IDX 1 = CR2 always 
    
    // timer2 holds "write to control reg 1" flag
    if (idx === 0)
      idx = (this._timer[1].control & CONTROL.SPECIAL) ? 0 : 2;

    this._timer[idx].control = value;
  }

  timerLSBw(idx: number, value: number): void
  {
    let inreset = this._timer[0].control & CONTROL.SPECIAL;

    const latch = this._msb*256 + value;
    this._timer[idx].latch = latch;

    if (inreset)
      this._timer[idx].reload();

    // writing counter clears int
    // XXX - check if there are other prereqs
    this.irq(idx, false);
  }

  timerLSBr(idx: number): number
  {
    // there is only 1 lsb buffer register
    return this._lsb;
  }

  timerMSBw(idx: number, value: number): void
  {
    // there is only 1 msb buffer register
    this._msb = value;
  }

  timerMSBr(idx: number): number
  {
    // timer0 holds reset flag
    let inreset = this._timer[0].control & CONTROL.SPECIAL;

    const count = (inreset) ? this._timer[idx].latch : this._timer[idx].count;
    this._lsb = count & 0xff;

    // reading counter after reading status clears int
    if (this._statusRead)
    {
      this._statusRead = false;
      this.irq(idx, false);
    }
    return (count >> 8) & 0xff;
  }

  update(cycles: number): void
  {
    // timer1 holds reset flag
    let inreset = this._timer[0].control & CONTROL.SPECIAL;
    this._div8 += cycles;

    if (inreset)
    {
      // clear IRQs if we are in reset, and are asserting an irq
      if (this._status)
      {
        this.irq(0,false);
        this.irq(1,false);
        this.irq(2,false);
      }
    }
    else
    {
      let zeroed = false;

      for(let i=0;i<3;i++)
      {
        let dec = cycles;

        if (i==2)
        {
          // the special bit in timer3 is divide by 8
          if (this._timer[2].control & CONTROL.SPECIAL)
          {
            if (this._div8 > 8)
            {
              // do it this way in case div8 is turned on/off.
              // will miss some counts but sould catch up OK.
              dec = 1;
              this._div8 %= 8;
            }
            else
              dec = 0;
          }
        }

        zeroed = this._timer[i].decrement(dec);

        if (zeroed)
        {
          //console.log("timer[" + i + "] zeroed");
          let control = this._timer[i].control;
          if (control & CONTROL.IRQ_ENABLE)
            this.irq(i, true);

          switch( control & CONTROL.COUNTER_MODE )
          {
            case MODE.CONTINUOUS0:
            case MODE.CONTINUOUS1:
              // reload counter with latch
              this._timer[i].reload();
              break;

            case MODE.SINGLE_SHOT0:
            case MODE.SINGLE_SHOT1:
              // stay at 0xffff
              break;
          }
        }
      }
    }
  }

  reset(): void
  {
    // this is a chip reset
    this._timer.forEach( (f) => {f.reset()} );
    this._status = 0;
    this.irq(0, false)
    this.irq(1, false)
    this.irq(2, false)
    // chip starts in reset state
    this._timer[0].control = CONTROL.SPECIAL;
  }

  irq(which: number, tf: boolean): void
  {
    const bits = (0x01 << which) | STATUS.ANY_IRQ;

    if (tf)
      this._status |= bits;
    else
      this._status &= ~bits;

    if (this._status)
    {
      this._status |= STATUS.ANY_IRQ;
      this._interrupt(true)
      //console.log("IRQ["+which+"]: true")
    }
    else
    {
      this._status &= ~STATUS.ANY_IRQ;
      this._interrupt(false)
      //console.log("IRQ["+which+"]: false")
    }
  }

  constructor(interrupt: (tf:boolean) => void)
  {
    this._interrupt = interrupt;
    this._status = 0;
    this._statusRead = false;
    this._timer = [new PTMTimer(), new PTMTimer(), new PTMTimer()];
    this._msb = this._lsb = 0;
    this._div8 = 0;
    this.reset()
  }
};

