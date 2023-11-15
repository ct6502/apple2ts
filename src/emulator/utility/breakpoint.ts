export class Breakpoint {
  address: number;
  disabled: boolean;
  hidden: boolean;
  once: boolean;
  expression: string;
  hitcount: number;

  constructor() {
    this.address = 0
    this.disabled = false
    this.hidden = false
    this.once = false
    this.expression = ''
    this.hitcount = 0
  }
}
