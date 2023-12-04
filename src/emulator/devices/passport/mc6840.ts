// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
// Motorola 6840 programmable timer

import { interruptRequest } from "../../cpu6502"

const CONTROL =
{
  OUTPUT_ENABLE  : (0x01 << 7), // (NA)
  IRQ_ENABLE     : (0x01 << 6),
  COUNTER_MODE   : (0x07 << 3),
  BIT8_MODE      : (0x01 << 2),
  INTERNAL_CLOCK : (0x01 << 1), // (NA) must use internal clock
  SPECIAL        : (0x01 << 0), // CR1 - Reset, CR2 - Write CR1, CR3 - Prescale / 8 (NA)
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
      case MODE.CONTINUOUS1:
      case MODE.SINGLE_SHOT1:
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
  _slot: number;

  update(cycles: number): void
  {
    // timer0 holds reset flag
    let inreset = this._timer[0].control & CONTROL.SPECIAL;

    if (!inreset)
    {
      for(let i=0;i<3;i++)
      {
        let zeroed = this._timer[i].decrement(cycles);

        if (zeroed)
        {
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
  }

  irq(which: number, tf: boolean): void
  {
    interruptRequest(this._slot, tf)
  }

  constructor(slot:number)
  {
    this._slot = slot;
    this._status = 0;
    this._timer = [new PTMTimer(), new PTMTimer(), new PTMTimer()];
    this.reset()
  }
};

