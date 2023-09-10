
export interface Printer {
  startup(canvas: HTMLCanvasElement): boolean;
  shutdown(): void;
  reset(): void;

  canRead(): boolean;
  read(): Uint8Array;
  write(data: Uint8Array): void;

  print(): boolean;
  formfeed(): void;
}

export const ImageWriterII : Printer = {
  startup: (canvas) => { return initcanvas(canvas) },
  shutdown: () => {},
  reset: () => {
    clearcanvas();
    reset();
    // clear pages too
    _pages = [];
  },

  canRead: () => { return false },
  read: () => { return new Uint8Array(0) },

  write: (data: Uint8Array) => {
    for(let i=0;i<data.length;i++) {
      parseChar(data[i] & _ignoreBit8)
    }
  },

  print: (): boolean => {
    let html = "<html><head>"
    html += "<script>"
    html += "window.addEventListener('load',function() { window.print(); window.close(); });"
    html += "</script></head><body style='margin:0;padding:0;'>"
    // add all previous pages
    for(let i=0;i<_pages.length;i++)
    {
      html += "<div style='width:100%;height:100%;page-break-after:always;'>"
      html += "<img style='width:100%;height:100%;' src='"+_pages[i]+"'/>"
      html += "</div>"
    }
    // add current page, but only if there was rendering
    if( _renders )
    {
      html += "<div style='width:100%;height:100%;page-break-after:always;'>"
      let durl = _canvas.toDataURL("image/png")
      html += "<img style='width:100%;height:100%;' src='"+durl+"'/>"
      html += "</div>"
    }
    html += "</body></html>"

    const printWin = window.open('','','left=0,top=0,width=576,height=792,toolbar=0,scrollbars=0,status  =0')
    printWin?.document.write(html)
    printWin?.document.close()
    printWin?.focus()
    return true
  },

  formfeed: () => {
    ff()
    prerender() // to clear the screen
  },
}

let _canvas: HTMLCanvasElement;
let _ctx: CanvasRenderingContext2D;
let _dbg = false
let _fontWidth = 0
let _fontHeight = 0
let _lfSpacing = 0
let _autoCRonLF = false
let _underline = false
let _swa = 0x50
let _swb = 0x24
let _autoLFonCR = false
let _autoLFonFull = false
let _language = 0  // "american"
let _softSelect = false
let _perfSkip = false
let _ignoreBit8 = 0x7f
let _baseline = 0
let _gfxchars = 0
let _tbm = 0 //10;
let _lrm = 0 //40;  // 1/4" margins
let _lmargin = _lrm
let _rmargin = 0;
let _tmargin = _tbm
let _bmargin = 0
let _dpi = 160
let _tof = _tmargin
let _lm = _lmargin
let _pages: any[] = []
let _renders = 0
let _px = _lm
let _py = _tof
let _unidirectional = true
let command: any = []

function log(msg: string)
{
  console.log(msg);
}

function dbg(msg: string)
{
  if( _dbg )
  {
    log(msg);
  }
}

/*
function createCanvas()
{
  _canvas = document.createElement("canvas");
  _canvas.width = 1360; // 8.5" * 160 dpi
  _canvas.height = 1584; // 11" * 144 dpi
  _canvas.style.width = '100%';
  _canvas.style.height = '100%';

  _ctx = _canvas.getContext('2d', {alpha: false})!;
  _ctx.fillStyle = '#ffffff';
  _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
  _ctx.textBaseline = "top";
  _ctx.lineWidth = 1;
  _ctx.imageSmoothingEnabled = false;
  _ctx.setTransform(1,0,0,
                    2,0,0);
  _rmargin = _canvas.width - _lrm;
  _bmargin = (_canvas.height - _tbm)/2;
}
*/

function initcanvas(canvas: HTMLCanvasElement)
{
  _canvas = canvas;
  _canvas.width = 1360; // 8.5" * 160 dpi
  _canvas.height = 1584; // 11" * 144 dpi
  _canvas.style.width = '100%';
  _canvas.style.height = '100%';
  console.log("in initcanvas: ", _canvas);

  _ctx = _canvas.getContext('2d', {alpha: false})!;
  console.log("ctx: ", _ctx);

  _ctx.fillStyle = '#ffffff';
  _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
  _ctx.textBaseline = "top";
  _ctx.lineWidth = 1;
  _ctx.imageSmoothingEnabled = false;
  _ctx.setTransform(1,0,0,
                    2,0,0);
  _rmargin = _canvas.width - _lrm;
  _bmargin = (_canvas.height - _tbm)/2;

  reset();

  return true;
}

function setunidirectional(tf: boolean)
{
  dbg("unidirectional("+tf+")");
  _unidirectional = tf;
}

function setswitches( a: number, b: number, sc: string )
{
  dbg("setswitches("+a+","+b+","+sc+")");
  // Z = "open" = 0
  if( sc === 'Z' )
  {
    _swa &= ~a;
    _swb &= ~b;
  }
  // D = "closed" = 1
  else
  {
    _swa |= a;
    _swb |= b;
  }

  _autoLFonCR = (_swa & 0x80) ? true : false;
  _autoLFonFull = (_swa & 0x20) ? true : false;
  _language = _swa & 0x07;
  _softSelect = (_swa & 0x10) ? true : false;
  _perfSkip = (_swb & 0x04) ? true : false;
  _ignoreBit8 = (_swb & 0x20) ? 0x7f : 0xff;
}

const CHCODE = 
{
  ESC: 27,
  cAt: 0,
  cA:  1,
  cD:  4, // end char download
  cG:  7,	// bell
  cH:  8,	// backspace
  cI:  9,	// tab
  cJ:  10,	// linefeed
  cL:  12,  // TOF feed
  cM:  13,	// CR
  cN:  14,  // start double width
  cO:  15,  // end double width
  cQ:  17,  // select printer
  cS:  19,  // deselect printer
  cX:  24,
  c_:  31,
};

class finfo
{
  face: string;
  height: number;
  boldf: string;
  baseline: number;

  constructor(ff: string, fh: number, fb: string, fba: number)
  {
    this.face = ff;
    this.height = fh;
    this.boldf =  fb;
    this.baseline = fba;
  }
};

let fontstack: finfo[] = [];

const font = 
{
  F9CPI:   110,
  F10CPI:  78,
  F12CPI:  69,
  F13CPI:  101,
  F15CPI:  113,
  F17CPI:  81,
  F10CPIP: 112,
  F12CPIP: 80,

  FROM:    36,
  FCUSTN:  39,
  FCUSTH:  42,

  cur: 78,// this.F10CPI,

  pushfont: function()
  {
    dbg('pushfont');
    let fd = new finfo(this.face, this.height, this.boldf, _baseline);

    fontstack.push(fd);
  },

  popfont: function()
  {
    if (fontstack.length)
    {
      dbg('popfont');
      const fd = fontstack.pop()!;

      this.face = fd.face;
      _fontHeight = this.height = fd.height;
      this.boldf = fd.boldf;
      _baseline = fd.baseline;
    }
    else
      dbg('popfont - stack empty');
  },

  face: 'Courier',
  height: 14,
  boldf: '',

  spscript: false,
  sbscript: false,
  hheight: false,

  setprintquality: function(q:number)
  {
    // correspondance, draft, nlq
  },

  setmousetext: function(m:boolean)
  {
  },

  setpropspacing: function(m:number)
  {
    // m = dots 0..9
  },

  underline: function(onoff:boolean)
  {
    _underline = onoff;
  },

  doUnderline: function()
  {
    // called before _px is incremented
    if(_underline)
    {
      _ctx.beginPath();
      const yval = _py + _fontHeight + _baseline - 1;
      _ctx.moveTo(_px, yval);
      _ctx.lineTo(_px+_fontWidth, yval);
      _ctx.stroke();
    }
  },

  bold: function(onoff:boolean)
  {
    dbg("bold: " + onoff);

    if(onoff)
    {
      this.boldf = 'bold ';
    }
    else
    {
      this.boldf = '';
    }

    this.setctxfont();
  },

  halfheight: function(onoff:boolean)
  {
    dbg("halfheight: " + onoff);
    if( onoff !== this.hheight )
    {
      this.hheight = onoff;
      if( onoff )
      {
        this.pushfont();
        // this is wrong - we need to leave font width the same
        _fontHeight = this.height = Math.floor(_fontHeight/2);
        _baseline = Math.floor(_fontHeight/2);
        this.setctxfont();
      }
      else
      {
        this.popfont();
        this.setctxfont();
      }
    }
  },

  superscript: function(onoff:boolean)
  {
    dbg("superscript: " + onoff);
    if( onoff !== this.spscript )
    {
      this.spscript = onoff;
      if( onoff )
      {
        // this is wrong - we need to leave font width the same
        this.pushfont();
        _fontHeight = this.height = Math.floor(_fontHeight/2);
        _baseline = -1;
        this.setctxfont();
      }
      else
      {
        this.popfont();
        this.setctxfont();
      }
    }
  },

  subscript: function(onoff:boolean)
  {
    dbg("subscript: " + onoff);
    if( onoff !== this.sbscript )
    {
      this.sbscript = onoff;
      if( onoff )
      {
        // this is wrong - we need to leave font width the same
        this.pushfont();
        _fontHeight = this.height = Math.floor(_fontHeight/2);
        _baseline = _fontHeight;
        this.setctxfont();
      }
      else
      {
        this.popfont();
        this.setctxfont();
      }
    }
  },

  setctxfont: function()
  {
    let fnt = "";
    fnt = this.boldf + this.height + "px " + this.face;
    _ctx.font = fnt;
    _fontWidth = _ctx.measureText("M").width;
    dbg("dpi: " + _dpi + " font: " + this.cur + " " + fnt + " width: " + _fontWidth );
  },

  setdpi: function(f:number)
  {
    dbg("setdpi: " + f );
    switch(f)
    {
      case this.F9CPI:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 72;
        break;
      case this.F10CPI:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 80;
        break;
      case this.F12CPI:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 96;
        break;
      case this.F13CPI:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 107;
        break;
      case this.F15CPI:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 120;
        break;
      case this.F17CPI:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 136;
        break;
      case this.F10CPIP:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 144;
        break;
      case this.F12CPIP:
        this.face = "Courier";
        this.height = _fontHeight = 12;
        _dpi = 160;
        break;

      case this.FCUSTN:
      case this.FCUSTH:
      default:
        return;
    }
    this.cur = f;
    var s = 160.0/_dpi;
    _ctx.setTransform(s,0,0,
                      2,0,0);
    this.setctxfont();
  },
};

function incx( n:number ) 
{
  //dbg("incx: " + n)
  _px += n;
  if (_px < _lmargin)
  {
    _px = _lmargin;
  }
  else if( _px > _rmargin )
  {
    _px = _rmargin;
  }
  //dbg("_px: " + _px);
}

function incy( n:number )
{
  //dbg("incy: " + n)
  _py += n;
  if (_py < _tmargin)
  {
    _py = _tmargin;
  }
  else if( _py > _bmargin )
  {
    // new page
    ff();
  }
  //dbg("_py: " + _py);
}

function cr()
{
  dbg("(cr)");
  _px = _lm;
  if (_autoLFonCR && !_autoCRonLF)
    linefeed()
}

function ff()
{
  prerender();

  dbg("(ff)");
  if(_autoCRonLF && !_autoLFonCR)
    cr(); 

  // save this page
  _pages.push(_canvas.toDataURL("image/png"));

  // defer the clear
  _renders = 0;

  // reset x,y
  _px = _lm;
  _py = _tof;
}

function prerender()
{
  if( _renders === 0 )
  {
    clearcanvas();
  }

  _renders++;
}

function clearcanvas()
{
  // clear the canvas
  var ofs = _ctx.fillStyle;
  _ctx.fillStyle = '#ffffff';
  _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
  _ctx.fillStyle = ofs;
}

function linefeed(n:number = 1)
{
  dbg("(lf)(" + n + ")");
  if(_autoCRonLF && !_autoLFonCR)
    cr();

  incy((_lfSpacing?_lfSpacing:_fontHeight)*n);
}

function tab()
{
  // XXX - assume 10 tabs across, base on width
  const opx = _px;
  const ts = _canvas.width / 10;
  _px = Math.floor(Math.floor((_px + ts + 1) / ts) * ts);
  dbg("tab: " + opx + " to " + _px );
}

function cleartabs()
{
}

function doubleWidth(onoff:boolean)
{
}

function bell()
{
  dbg("bell")
}

function bs()
{
  incx(-_fontWidth);
}

function autocr(onoff:boolean)
{
  _autoCRonLF = onoff;
}

function output(val:number)
{
  prerender();

  const ascii = val & 0x7f;
  const out = ("char: ").concat("'", String.fromCharCode(ascii), "' ", val.toString(), " pos: ", (_px+_baseline).toString(), " ", _py.toString());
  dbg(out)
  if (ascii >= 32) {
      var c = String.fromCharCode(ascii);
      _ctx.fillText(c, _px, _py+_baseline);
      font.doUnderline();
      incx( _fontWidth );
  }
  else
  {
    dbg("C: " + ascii.toString());
  }
}

// reset defaults
function reset()
{
  font.setdpi(font.F10CPI);
  // black
  setcolor(48);
  setswitches( 0xff, 0xff, 'Z' );
  // defaults
  setswitches( 0x50, 0x24, 'D' );
  _baseline = 0;
  _px = _lm = _lmargin;
  _py = _tof = _tmargin;
}

function setcolor(c:number)
{
  dbg("setcolor: " + c );
  switch(c)
  {
    case 48: // black`
      _ctx.fillStyle = '#000000';
      _ctx.strokeStyle = '#000000';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 1.0;
      break;
    case 49: // yellow`
      _ctx.fillStyle = '#FFFF00';
      _ctx.strokeStyle = '#FFFF00';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 50: // magenta`
      _ctx.fillStyle = '#FF00FF';
      _ctx.strokeStyle = '#FF00FF';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 51: // cyan`
      _ctx.fillStyle = '#00FFFF';
      _ctx.strokeStyle = '#00FFFF';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 52: // orange
      _ctx.fillStyle = '#FFA500';
      _ctx.strokeStyle = '#FFA500';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 53: // green
      _ctx.fillStyle = '#00FF00';
      _ctx.strokeStyle = '#00FF00';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 54: // purple
      _ctx.fillStyle = '#800080';
      _ctx.strokeStyle = '#800080';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    default:
      log("invalid color: " + c );
      break;
  }
}

function gfx(ch:number)
{
  // draw vertical dot pattern
  if( ch & 0x01 )
    _ctx.fillRect(_px, _py+0, 1, 1);
  if( ch & 0x02 )
    _ctx.fillRect(_px, _py+1, 1, 1);
  if( ch & 0x04 )
    _ctx.fillRect(_px, _py+2, 1, 1);
  if( ch & 0x08 )
    _ctx.fillRect(_px, _py+3, 1, 1);
  if( ch & 0x10 )
    _ctx.fillRect(_px, _py+4, 1, 1);
  if( ch & 0x20 )
    _ctx.fillRect(_px, _py+5, 1, 1);
  if( ch & 0x40 )
    _ctx.fillRect(_px, _py+6, 1, 1);
  if( ch & 0x80 )
    _ctx.fillRect(_px, _py+7, 1, 1);

  //log("gfx[" + _gfxchars + "]: 0x" + ch.toString(16));

  incx(1);
}

function sendidstring()
{
  // return the id string "IW10CF"
  // for ImageWriter, 10 inch carriage width, color ribbon, sheet feeder
}

const state = 
{
  OUTER: 0,
  CMD: 1,
  PRINTQUALITY: 2,
  LOADCUSTOM: 3,
  SETPROPSPACING: 4,
  FEEDLINES: 5,
  CRLF: 6,
  COLOR: 7,
  CRINSERT: 8,
  EZ0: 9,
  EZ1: 10,
  ED0: 11,
  ED1: 12,
  GFXN: 13,
  GFX8N: 14,
  GFX: 15,
  GFXRN: 16,
  GFXR: 17,
  HPOS: 18,
  VPOS: 19,
  RCHARN: 20,
  RCHAR: 21,
  LMARGIN: 22,
  CHEIGHT: 24,

  cur: 0,
};

function parseChar(ch:number)
{
  switch( state.cur )
  {
    case state.OUTER:
      switch(ch)
      {
        case CHCODE.ESC:
          state.cur = state.CMD;
          break;
        case CHCODE.c_:
          state.cur = state.FEEDLINES;
          dbg("c_");
          break;
        case CHCODE.cH:
          dbg("cH");
          bs();
          break;
        case CHCODE.cI:
          tab(); 
          break;
        case CHCODE.cJ:
          linefeed(1);
          break;
        case CHCODE.cL:
          ff();
          break;
        case CHCODE.cM:
          cr();
          break;
        case CHCODE.cN:
          doubleWidth(true);
          break;
        case CHCODE.cO:
          doubleWidth(false);
          break;
        case CHCODE.cX: // erase current line from buffer.
          dbg("cX");
          break;
        case CHCODE.cG:
          bell();
          break;
        default:
          output(ch);
          break;
      }
      break;

    case state.CMD:
      dbg("ESC-"+ch);
      switch(ch)
      {
        case 71:
        case 83:
          command = [];
          state.cur = state.GFXN;
          break;

        case 103:
          command = [];
          state.cur = state.GFX8N;
          break;

        case 86:
          command = [];
          state.cur = state.GFXRN;
          break;

        case 70:
          command = [];
          state.cur = state.HPOS;
          break;

        case 76:
          command = [];
          state.cur = state.LMARGIN;
          break;

        case 90:
          state.cur = state.EZ0;
          break;

        case 68:
          state.cur = state.ED0;
          break;

        case 99:
          state.cur = state.OUTER;
          reset();
          break;

        case 75:
          state.cur = state.COLOR;
          break;

        case 82:
          command = [];
          state.cur = state.RCHAR;
          break;

        case 84:
          command = [];
          state.cur = state.CHEIGHT;
          break;

        case 65: // 6 lines per inch
        case 66: // 8 lines per inch
          state.cur = state.OUTER;
          break;

        case 102: // forward linefeed
        case 114: // reverse linefeed
          state.cur = state.OUTER;
          break;

        case 79:  // paper out sensor off
        case 111: // paper out sensor on
          state.cur = state.OUTER;
          break;

        case 48:  // clear all tabs
          state.cur = state.OUTER;
          cleartabs();
          break;

        case 62:  // set unidirectional print
          setunidirectional(true);
          state.cur = state.OUTER;
          break;

        case 60:  // set bidirectional print
          setunidirectional(false);
          state.cur = state.OUTER;
          break;

        case 33:
          font.bold(true);
          state.cur = state.OUTER;
          break;
        case 34:
          font.bold(false);
          state.cur = state.OUTER;
          break;

        case 88:
          font.underline(true);
          state.cur = state.OUTER;
          break;
        case 89:
          font.underline(false);
          state.cur = state.OUTER;
          break;

        case 119:
          font.halfheight(true);
          state.cur = state.OUTER;
          break;
        case 87:
          font.halfheight(false);
          state.cur = state.OUTER;
          break;

        case 120:
          font.superscript(true);
          state.cur = state.OUTER;
          break;
        case 121:
          font.subscript(true);
          state.cur = state.OUTER;
          break;
        case 122:
          font.subscript(false);
          font.superscript(false);
          state.cur = state.OUTER;
          break;

        case 49:  // insert N dots (1-6) for proportional
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
          state.cur = state.OUTER;
          break;

        case 115:
          state.cur = state.SETPROPSPACING;
          break;

        case 45:  // custom font max width 8
        case 43:  // custom font max width 16
          break;

        case 73:
          state.cur = state.LOADCUSTOM;
          break;

        case 108:
          state.cur = state.CRLF;
          break;

        case 118:
          _tof = _py;
          break;

        case 36:
          state.cur = state.OUTER;
          font.setmousetext(false);
          break;
        case 38:
          state.cur = state.OUTER;
          font.setmousetext(true);
          break;

        case 97:
          state.cur = state.PRINTQUALITY;
          break;
        case 109:
          state.cur = state.OUTER;
          font.setprintquality(0);
          break;
        case 77:
          state.cur = state.OUTER;
          font.setprintquality(1);
          break;

        case 63:
          state.cur = state.OUTER;
          sendidstring();
          break;

        case 110:
        case 78:
        case 69:
        case 112:
        case 80:
        case 101:
        case 113:
        case 81:
        case 39:
        case 42:
          state.cur = state.OUTER;
          font.setdpi(ch);
          break;
        default:
          log("Unknown ESC code: " + ch);
          break;
      }
      break;

    case state.GFXN:
      // expect 4 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 4)
      {
        state.cur = state.GFX;
        _ignoreBit8 = 0xff;
        const cmd = command[0] + command[1] + command[2] + command[3];
        _gfxchars = parseInt(cmd);
        dbg("cmd: " + cmd + " gfxchars: " + _gfxchars);
        prerender();
      }
      break;

    case state.GFX8N:
      // expect 3 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 3)
      {
        state.cur = state.GFX;
        _ignoreBit8 = 0xff;
        const cmd = command[0] + command[1] + command[2];
        _gfxchars = parseInt(cmd)*8;
        dbg("gfx8chars: " + _gfxchars);
        prerender();
      }
      break;

    case state.GFX:
      gfx(ch);
      _gfxchars--;
      if(_gfxchars === 0)
      {
        state.cur = state.OUTER;
        _ignoreBit8 = 0x7f;
        dbg("gfxend");
      }
      break;

    case state.GFXRN:
      // expect 4 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 4)
      {
        state.cur = state.GFXR;
        _ignoreBit8 = 0xff;
        const cmd = command[0] + command[1] + command[2] + command[3];
        _gfxchars = parseInt(cmd);;
        dbg("repeatGfx: " + _gfxchars);
        prerender();
      }
      break;

    case state.GFXR:
      while(_gfxchars--)
      {
        gfx(ch);
      }
      state.cur = state.OUTER;
      _ignoreBit8 = 0x7f;
      break;

    case state.HPOS:
      // expect 4 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 4)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1] + command[2] + command[3];
        _px = parseInt(cmd);;
        dbg("hpos: " + _px);
      }
      break;

    case state.RCHARN:
      // expect 3 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 3)
      {
        state.cur = state.RCHAR;
        const cmd = command[0] + command[1] + command[2];
        _gfxchars = parseInt(cmd);;
        dbg("repeatChar: " + _gfxchars);
      }
      break;

    case state.RCHAR:
      while(_gfxchars--)
      {
        output(ch);
      }
      state.cur = state.OUTER;
      break;

    case state.PRINTQUALITY:
      switch(ch)
      {
        case 0: //correspondance
        case 1: //draft
        case 2: //NLQ
          state.cur = state.OUTER;
          font.setprintquality(ch);
          break;
      }
      break;

    case state.LOADCUSTOM:
      // load custom font until ctrl-d
      switch(ch)
      {
        case CHCODE.cD:
          state.cur = state.OUTER;
          break;
      }
      break;

    case state.FEEDLINES:
      state.cur = state.OUTER;
      linefeed(ch-48);  // 48 == ascii 0
      break;

    case state.LMARGIN:
      // expect 3 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 3)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1] + command[2];
        _lm = _lmargin + parseInt(cmd);
        dbg("lmargin: " + _lm);
      }
      break;

    case state.CHEIGHT:
      // expect 2 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 2)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1];
        // note: assumes 72dpi
        _lfSpacing = Math.floor(parseInt(cmd) / 2);
        dbg("lfSpacing: " + _lfSpacing);
      }
      break;

    case state.SETPROPSPACING:
      state.cur = state.OUTER;
      font.setpropspacing(ch-48); // 48 == ascii 0
      break;

    case state.CRLF:
      state.cur = state.OUTER;
      switch(ch)
      {
        case 49:
          autocr(false);
          break;
        case 48:
          autocr(true);
          break;
      }
      break;

    case state.COLOR:
      state.cur = state.OUTER;
      setcolor(ch);
      break;

    case state.EZ0:
      state.cur = state.EZ1;
      command[0] = ch;
      break;

    case state.EZ1:
      state.cur = state.OUTER;
      setswitches(command[0], ch, 'Z');
      break;

    case state.ED0:
      state.cur = state.ED1;
      break;

    case state.ED1:
      state.cur = state.OUTER;
      setswitches(command[0], ch, 'D');
      break;

    default:
      log('invalid state!');
      break;
  }
}
