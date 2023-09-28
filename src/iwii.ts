
// ImageWriter II Driver for Apple2TS - Copyright 2023 Michael Morrison <codebythepound@gmail.com>

import { Font,
         DraftFont,
         CspFont,
         CspPropFont,
         NLQFont,
         NLQPropFont,
       } from "./iwiifonts"

export interface Printer {
  startup(canvas: HTMLCanvasElement): boolean;
  shutdown(): void;
  reset(): void;
  localReset(): void;

  save() : void;
  load() : void;

  canRead(): boolean;
  read(): Uint8Array;
  write(data: Uint8Array): void;

  print(): boolean;
  formfeed(): void;

  incomingData: Uint8Array;
  reprint(): void;
}

export const ImageWriterII : Printer = {
  startup: (canvas) => { return initcanvas(canvas) },
  shutdown: () => {},
  reset: function() {
    this.localReset();
    this.incomingData = new Uint8Array(0);
  },

  localReset: function() {
    clearcanvas();
    clearcustomfonts();
    reset();
    // clear pages too
    _pages = [];
  },

  canRead: () => { return false },
  read: () => { return new Uint8Array(0) },

  write: function (data: Uint8Array) {

    let tmp = new Uint8Array(this.incomingData.length + data.length);
    tmp.set(this.incomingData);
    tmp.set(data, this.incomingData.length);
    this.incomingData = tmp;

    for(let i=0;i<data.length;i++) {
      parseChar(data[i])
    }
  },

  incomingData: new Uint8Array(0),

  reprint: function () {
    _dbg = true
    this.localReset();
    for(let i=0;i<this.incomingData.length;i++) {
      parseChar(this.incomingData[i])
    }
    _dbg = false
  },

  load: function() {},
  save: function() {
    const blob = new Blob([this.incomingData]);
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', "printerdata.blob");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  print: (): boolean => {
    let html = "<html><head>"
    html += "<script>"
    html += "window.addEventListener('load',function() { window.print(); window.close(); });"
    html += "</script></head><body style='margin:0;padding:0;'>"
    // add all previous pages
    for(let i=0;i<_pages.length;i++)
    {
      // the following removes the date/time/page info
      html +="<style> @page { size: auto;  margin: 0mm; } </style>"
      html += "<div style='width:100%;height:100%;page-break-after:always;'>"
      html += "<img style='position:absolute;width:100%;height:100%;' src='"+_pages[i]+"'/>"
      html += "</div>"
    }
    // add current page, but only if there was rendering
    if( _renders )
    {
      html +="<style> @page { size: auto;  margin: 0mm; } </style>"
      html += "<div style='width:100%;height:100%;page-break-after:always;'>"
      let durl = _canvas.toDataURL("image/png")
      html += "<img style='position:absolute;width:100%;height:100%;' src='"+durl+"'/>"
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

let CustomFontData = new Uint8Array(0);
let CustomFontTable = [
  {"width":0, "offset":0},
];

let CustomFont : Font = {
  width: 8,
  height: 8,
  scale: 8/8,
  drawGlyph: function (code) {
    const offset = this.table[code].offset;
    let gwidth = this.table[code].width; 
    let shift = false;
    if (gwidth === 0)
    {
      dbg("no custom font loaded at code: " + code);
      return;
    }
    if (gwidth <0)
    {
      gwidth = -gwidth;
      shift = true;
    }
    for(let i=0;i<gwidth;i++) {
      let byte = this.data[offset+i];
      byte = shift ? (byte << 1) : byte;
      fontGfx(byte);
    }
  },
  data: CustomFontData,
  table: CustomFontTable,
}

let _canvas: HTMLCanvasElement;
let _ctx: CanvasRenderingContext2D;
let _dbg = false
let _lfSpacing = 24 // default 6 "lines" per inch
let _nlfSpacing = 0
let _autoCRonLF = false
let _swa = 0x50
let _swb = 0x24
let _autoLFonCR = false
let _autoLFonFull = false
let _language = 0  // "american"
let _softSelect = false
let _perfSkip = false
let _ignoreBit8 = 0x7f
let _gfxchars = 0
let _tbm = 0 //10;
let _lrm = 0 //40;  // 1/4" margins
let _lmargin = _lrm
let _rmargin = 0;
let _tmargin = _tbm
let _bmargin = 0
const _paperDPI = 180
const _dpih = 144
const _72DPIV = 2 // 2 = force 72dpi vertical (majority of software)
let _dpi = _paperDPI
let _tof = _tmargin
let _lm = _lmargin
let _pages: any[] = []
let _renders = 0
let _px = _lm
let _py = _tof
let command: any = []
let customdata: any = []

let _tabstops = new Array(32);

const SCALE = 
{
  FONTS: 0,
  GFX: 1
};
let _slashZero = false;
let _mapmousetext = false;
let _bold = false;
let _subscript = false;
let _superscript = false;
let _halfHeight = false;
let _underline = false;
let _doubleWidth = false;
let _rawoutput = false;
let _fixedScale = 1;
let _forceCspFont = false;
let _cspFont = CspFont;
let _font = DraftFont;
let _propFont = CspPropFont;
let _usePropFont = false;
let _propScale = 1;
let _useCustomFont = false;
let _mapHighAscii = false;
let _propSpacing = 0;
let _customFont = CustomFont;
let _customGlyphWidth = 0;

function usepropfont(onoff:boolean)
{
  _usePropFont = onoff;

  if (_usePropFont)
  {
    dbg("proportional font");
    _cspFont = CspPropFont;
  }
  else
  {
    _cspFont = CspFont;
  }

  checkforcecsp();
}

function usecustomfont(onoff:boolean)
{
  _mapHighAscii = false;
  _useCustomFont = onoff;
  dbg("custom font: " + _useCustomFont);
}

function usecustomfonthi(onoff:boolean)
{
  _mapHighAscii = onoff;
  _useCustomFont = onoff;
  dbg("custom font hi: " + _useCustomFont);
}

function clearcustomfonts()
{
  CustomFontData = new Uint8Array(0);
  CustomFontTable = [];
  for(let i=0;i<175;i++)
    CustomFontTable.push({"width":0, "offset":0});

  CustomFont.data = CustomFontData;
  CustomFont.table = CustomFontTable;
}

function setcustomfontwidth(n:number)
{
  clearcustomfonts();
  _ignoreBit8 = 0xff;
  _customFont.width = n;
  dbg("custom font width: " + n);
}

function endcustomfontupload()
{
  _ignoreBit8 = 0x7f;
}

function customfontwidth(n:number)
{
  if (n<65 || n >112)
    return 0;

  if (n>80)
    return n-96
  else
    return n-64
}

function loadcustomglyph()
{
  CustomFontData = new Uint8Array(0);
  let key = customdata[0];
  if ((key < 32 || key > 239) ||
      (key > 126 && key < 160))
  {
    dbg("custom key code out of range (32-126,160-239): " + key);
    return;
  }
  let width = customfontwidth(customdata[1]);
  const lower = customdata[1] > 80;
  let glyph = new Uint8Array(width);
  for(let i=0;i<width;i++)
    glyph[i] = customdata[i+2];

  const offset = CustomFontData.length;
  let fd = new Uint8Array(offset + width);
  fd.set(CustomFontData);
  fd.set(glyph, offset);
  CustomFontData = fd;
  if (key > 126)
    key -= (160-127);
  key -= 32;
  width = lower ? -width : width;
  CustomFontTable[key] = {"width":width, "offset":offset};

  CustomFont.data = CustomFontData;
  CustomFont.table = CustomFontTable;
}

const _i18n = [
  // us english
  [0x23, 0x40, 0x58, 0x5c, 0x5d, 0x60, 0x78,  0x7c, 0x7d, 0x7e],
  // italian
  [0x04, 0x05, 0x16, 0x10, 0x09, 0x19, 0x0e,  0x1a, 0x11, 0x1b],
  // danish
  [0x23, 0x40, 0x00, 0x03, 0x08, 0x60, 0x01,  0x02, 0x0b, 0x7e],
  // uk english
  [0x04, 0x40, 0x58, 0x5c, 0x5d, 0x60, 0x78,  0x7c, 0x7d, 0x7e],
  // german
  [0x23, 0x05, 0x06, 0x17, 0x18, 0x60, 0x0a,  0x07, 0x0c, 0x0d],
  // swedish
  [0x23, 0x40, 0x06, 0x17, 0x08, 0x60, 0x0a,  0x07, 0x0b, 0x7e],
  // french
  [0x04, 0x0E, 0x16, 0x10, 0x05, 0x60, 0x09,  0x19, 0x11, 0x0f],
  // spanish
  [0x04, 0x05, 0x12, 0x15, 0x13, 0x60, 0x16,  0x14, 0x10, 0x7e],
];

function i18n(ch:number)
{
  switch (ch)
  {
    case 0x23:  // #
      return _i18n[_language][0];
    case 0x30:  // O/0
      return _slashZero ? 0x03 : 0x30;
    case 0x40:  // @
      return _i18n[_language][1];
    case 0x5B:  // [
      return _i18n[_language][2];
    case 0x5C:  // \
      return _i18n[_language][3];
    case 0x5D:  // ]
      return _i18n[_language][4];
    case 0x60:  // `
      return _i18n[_language][5];
    case 0x7B:  // {
      return _i18n[_language][6];
    case 0x7C:  // |
      return _i18n[_language][7];
    case 0x7D:  // }
      return _i18n[_language][8];
    case 0x7E:  // ~
      return _i18n[_language][9];
    default:
      return ch;
  }
}

function drawChar(ch:number)
{
  // glyphs 0-27 are i18n glyphs
  // glyphs 28-123 are low ascii glyphs which map to ascii 0x20 - 0x7f
  // glyphs 124-156 are mousetext which map to 0xC0 - 0xDF on the apple
  let mappedch = ch;
  _rawoutput = false;
  if (ch < 0x20)
    return;
  else if (ch > 0x7F)
  {
    // prop font doesn't have any high ascii
    if (_usePropFont)
      return;

    if (_useCustomFont)
    {
      // see custom font defs for the math
      mappedch -= (160-127);
    }
    else
    {
      if (ch >= 0xC0 && ch <= 0xDF)
      {
        // map to mousetext in the font
        mappedch -= 0x40;
        _rawoutput = true;
      }
      else
        // no chars in that range
        return;
    }
  }
  else if (_mapmousetext && ((ch >= 0x40) && (ch <= 0x5f)) && !_usePropFont)
  {
    // map to mousetext in the font
    mappedch += 0x40; 
    _rawoutput = true;
  }

  // remap for i18n
  if (!_useCustomFont)
    mappedch = i18n(mappedch);

  // char 32 = 28 in the font
  // custom font starts at zero
  mappedch -= _useCustomFont ? 32 : 4;

  if (_useCustomFont)
  {
    // send low ascii but want high ascii
    if (_mapHighAscii)
      mappedch += (127-32);

    _rawoutput = true;
    _customFont.drawGlyph(mappedch);
  }
  else
  {
    if (_forceCspFont)
      _cspFont.drawGlyph(mappedch);
    else if (_usePropFont)
    {
      _propFont.drawGlyph(mappedch);
      // if propspacing is set, add proportional width as well
      incx(_propSpacing);
    }
    else
      _font.drawGlyph(mappedch);
  }
}

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

function initcanvas(canvas: HTMLCanvasElement)
{
  _canvas = canvas;
  _ctx = _canvas.getContext('2d', {alpha: false})!;
  _canvas.style.width = '100%';
  _canvas.style.height = '100%';
  _ctx.fillStyle = '#FFFFFF';
  _ctx.strokeStyle = '#FFFFFF';
  _ctx.globalCompositeOperation = "source-over";
  _ctx.imageSmoothingEnabled = false;
  _ctx.globalAlpha = 1.0;

  reset();
  clearcustomfonts();

  console.log("canvas: ", _canvas);
  console.log("ctx: ", _ctx);

  return true;
}

/*
 * Character and DPI conversions 
 *
 * 72DPI is 72CPL
 * 72DPI*8I   = 576DPL
 * 72CPL/8I   = 9CPI
 * 72DPI/9CPI = 8DPC
*/

function getCPI()
{
  // all dpi to cpi conversions are based on 8 inch page width
  switch (_dpi)
  {
    case 144:
      return 10;
    case 160:
      return 8;
    default:
      return _dpi/8;
  }
}

function getCPL()
{
  // all dpi to cpi conversions are based on 8 inch page width
  return getCPI()*8;
}

function getDPC()
{
  return _dpi / getCPI();
}

function setinitialtabstops()
{
  // need to determine if there ARE initial tabstops.
  cleartabs();
}

function tab()
{
  const opx = _px;
  // find next tabstop from current position
  for(let i=0;i<_tabstops.length;i++)
  {
    if (_tabstops[i] > _px)
    {
      _px = _tabstops[i];
      break;
    }
  }
  // if no next tab is found, do nothing
  dbg("tab: " + opx + " to " + _px );
}

function cleartabs()
{
  for(let i=0;i<_tabstops.length;i++)
    _tabstops[i] = 0;
}

function settabstop(col:number)
{
  let zero = -1;
  const dotpos = _lmargin + col*getDPC(); 
  for(let i=0;i<_tabstops.length;i++)
  {
    // check if already there
    if (_tabstops[i] === dotpos)
    {
      dbg("Ignoring +tabstop that already exists: " + col + " (" + dotpos + ")");
      return;
    }
    else if (_tabstops[i] === 0)
      zero = i;
  }
  if (zero === -1)
  {
    dbg("No free slots for +tabstop: " + col + " (" + dotpos + ")");
    return;
  }

  _tabstops[zero] = dotpos;

  dbg("+tabstop: " + col + " (" + dotpos + ")");

  // re-sort array
  _tabstops.sort(function(a, b){return a - b});
}

function cleartabstop(col:number)
{
  const dotpos = _lmargin + col*getDPC(); 
  let i=0;
  for(;i<_tabstops.length;i++)
  {
    if (_tabstops[i] === dotpos)
    {
      _tabstops[i] = 0;
      break;
    }
  }
  if (i === _tabstops.length)
  {
    dbg("-tabstop not found: " + col + " (" + dotpos + ")");
    return;
  }

  dbg("-tabstop: " + col + " (" + dotpos + ")");

  // re-sort array
  _tabstops.sort(function(a, b){return a - b});
}

function setleftmargin(column:number)
{
  _lmargin = column / getCPL();
  dbg("lmargin: " + _lmargin);
}

function setpagelength(offset:number)
{
  _bmargin = offset / _dpih;
  dbg("pagelength: " + _bmargin);
}

function setunidirectional(tf: boolean)
{
  dbg("unidirectional("+tf+") ignored");
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
  _slashZero = (_swb & 0x01) ? true : false;

  if (_softSelect)
    dbg("softSelect not supported");
  if (_perfSkip)
    dbg("perfSkip not supported when emulating sheet feeder");
  if (_autoLFonFull)
    dbg("autoLFonFull not supported");

  dbg("language: " + _language);
}

function resizeCanvas(width: number, height:number)
{
  if (_canvas.width !== width || _canvas.height !== height)
  {
    if (_renders)
      ff();

    // context is reset on resize
    _ctx.save();

    _canvas.width = width;
    _canvas.height = height;

    _ctx.fillStyle = '#FFFFFF';
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
    _ctx.imageSmoothingEnabled = false;
    _rmargin = _canvas.width - _lrm;
    _bmargin = _canvas.height - _tbm;

    _ctx.restore();
  }
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
  c_:  31,  // multi-linefeed
};

const DPI = 
{
  F9CPI:   110,
  F10CPI:  78,
  F12CPI:  69,
  F13CPI:  101,
  F15CPI:  113,
  F17CPI:  81,
  F10CPIP: 112,
  F12CPIP: 80,
}

function setprintquality(q:number)
{
  // correspondance, draft, nlq
  switch(q)
  {
    case 0: //correspondence
      dbg("printquality: correspondence font");
      _font = CspFont;
      _propFont = CspPropFont;
      break;
    case 1: //draft
      dbg("printquality: draft font");
      _font = DraftFont;
      _propFont = CspPropFont;
      break;
    case 2: //NLQ
      dbg("printquality: NLQ font");
      _font = NLQFont;
      _propFont = NLQPropFont;
      break;
    default:
      log("Unhandled font code: " + q);
      break;
  }
  setfontscale(q);
  //checkforcecsp does a setxscale
  checkforcecsp();
}

function setfontscale(q:number)
{
  // correspondance, draft, nlq
  switch(q)
  {
    case 0: //correspondence
      dbg("printquality: correspondence font");
      _fixedScale = CspFont.scale;
      _propScale = CspPropFont.scale;
      break;
    case 1: //draft
      dbg("printquality: draft font");
      _fixedScale = DraftFont.scale;
      _propScale = CspPropFont.scale;
      break;
    case 2: //NLQ
      dbg("printquality: NLQ font");
      _fixedScale = NLQFont.scale;
      _propScale = NLQPropFont.scale;
      break;
    default:
      log("Unhandled font code: " + q);
      break;
  }
}

function mapmousetext(onoff:boolean)
{
  dbg("mapmousetext: " + onoff)
  _mapmousetext = onoff;
}

function setpropspacing(m:number)
{
  // m = dots 0..9
  dbg("setpropspacing: " + m);
  _propSpacing = m;
}

function underline(onoff:boolean)
{
  dbg("underline: " + onoff);
  _underline = onoff;
}

function checkforcecsp()
{
  if (_halfHeight || _superscript || _subscript)
    _forceCspFont = true;
  else if ((_font === DraftFont) && (_bold || _doubleWidth || _usePropFont))
    _forceCspFont = true;
  else
    _forceCspFont = false;

  if (_forceCspFont)
  {
    dbg("force csp font");
    _fixedScale = CspFont.scale;
  }
  else
  {
    _fixedScale = _font.scale;
  }
  setxscale(SCALE.FONTS);
}

function bold(onoff:boolean)
{
  dbg("bold: " + onoff);
  _bold = onoff;
  checkforcecsp();
}

function doubleWidth(onoff:boolean)
{
  dbg("doubleWidth: " + onoff);
  _doubleWidth = onoff;
  checkforcecsp();
}

function halfheight(onoff:boolean)
{
  dbg("halfheight: " + onoff);
  _halfHeight = onoff;
  checkforcecsp();
}

function superscript(onoff:boolean)
{
  dbg("superscript: " + onoff);
  _superscript = onoff;
  checkforcecsp();
}

function subscript(onoff:boolean)
{
  dbg("subscript: " + onoff);
  _subscript = onoff;
  checkforcecsp();
}

function setdpi(f:number)
{
  switch(f)
  {
    case DPI.F9CPI:
      usepropfont(false);
      _dpi = 72;
      break;
    case DPI.F10CPI:
      usepropfont(false);
      _dpi = 80;
      break;
    case DPI.F12CPI:
      usepropfont(false);
      _dpi = 96;
      break;
    case DPI.F13CPI:
      usepropfont(false);
      _dpi = 107;
      break;
    case DPI.F15CPI:
      usepropfont(false);
      _dpi = 120;
      break;
    case DPI.F17CPI:
      usepropfont(false);
      _dpi = 136;
      break;
    case DPI.F10CPIP:
      usepropfont(true);
      _dpi = 144;
      break;
    case DPI.F12CPIP:
      usepropfont(true);
      _dpi = 160;
      break;

    default:
      log("Unhandled DPI code: " + f);
      return;
  }

  dbg("setdpi: " + _dpi + " (" + f + ") -> virtual " + _canvas.width + "x" + _canvas.height );

  setxscale(SCALE.FONTS);
}

function setxscale(which:number)
{
  // compute new scale
  let scale = _paperDPI/_dpi;
  
  if (which === SCALE.FONTS)
    scale *= (_usePropFont ? _propScale : _fixedScale);

  let rescale = _ctx.getTransform().a / scale;

  _px *= rescale;

  // I think this is right
  if (which === SCALE.FONTS)
    scaletabs(rescale); 

  // recompute margins
  _lmargin = _lrm;
  _rmargin = _canvas.width - _lrm;

  _lmargin *= (1.0/scale);
  _rmargin *= (1.0/scale);

  dbg("lmargin: " + _lmargin + " _rmargin: " + _rmargin);

  const v = 1.0;
  _ctx.setTransform(scale,0,0,
                    v,    0,0);
}

function scaletabs(scale: number)
{
  for(let i=0;i<_tabstops.length;i++)
  {
    _tabstops[i] *= scale;
  }
}

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
    //dbg("_px: _rmargin: " + _px);
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
  dbg("_py: " + _py);
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
  _ctx.save();
  _ctx.setTransform(1,0,0,
                    1,0,0);
  _ctx.fillStyle = "#FFFFFF";
  _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
  _ctx.restore();
}

function linefeed(n:number = 1)
{
  dbg("(lf)(" + n + ")");
  if(_autoCRonLF && !_autoLFonCR)
    cr();

  // new line feed spacing is applied after current line?
  // unclear from manual.  results seem to be it is applied
  // immediately.
  if (_nlfSpacing)
  {
    //incy(_lfSpacing);
    _lfSpacing = _nlfSpacing;
    _nlfSpacing = 0;
    //n--;
  }

  incy(_lfSpacing*n)
}

function bell()
{
  dbg("bell")
}

function bs()
{
  incx(-_font.width);
}

function autocr(onoff:boolean)
{
  _autoCRonLF = onoff;
}

function dbgchar(ascii:number)
{
  if (!_dbg)
    return;
    
  let font = " F ";
  if (_useCustomFont)
    font = " C ";
  else if (_forceCspFont)
    font = " FC ";
  else if (_usePropFont)
    font = " P ";

  const out = ("char: ").concat("'", String.fromCharCode(ascii), "' ", ascii.toString(16), font, " pos: ", _px.toString(), " ", _py.toString());
  dbg(out)
}

function output(val:number)
{
  prerender();

  const ascii = val & 0x7f;
  dbgchar(ascii);

  if (ascii >= 0x20)
    drawChar(ascii);
  else
    dbg("C: " + ascii.toString(16));
}

// reset defaults
function reset()
{
  resizeCanvas(_paperDPI*8, _dpih*11);

  _lfSpacing = 24;
  _lmargin = 0;
  _tmargin = 0;
  _tof = _tmargin
  _px = _lmargin;
  _py = _tmargin;
  command = [];
  customdata = [];

  _slashZero = false;
  _mapmousetext = false;
  _bold = false;
  _subscript = false;
  _superscript = false;
  _halfHeight = false;
  _underline = false;
  _doubleWidth = false;
  _rawoutput = false;
  _forceCspFont = false;
  _cspFont = CspFont;
  _font = DraftFont;
  _propFont = CspPropFont;
  _usePropFont = false;
  _useCustomFont = false;
  _mapHighAscii = false;
  _propSpacing = 0;
  _customFont = CustomFont;
  _customGlyphWidth = 0;

  setprintquality(0);
  setdpi(DPI.F10CPI);

  // black
  setcolor(48);
  setswitches( 0xff, 0xff, 'Z' );
  // defaults
  setswitches( 0x50, 0x24, 'D' );

  setinitialtabstops();
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
//      _ctx.fillStyle = '#FF00FF';
//      _ctx.strokeStyle = '#FF00FF';
      _ctx.fillStyle = '#9B1525';
      _ctx.strokeStyle = '#9B1525';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 51: // cyan`
//      _ctx.fillStyle = '#00FFFF';
//      _ctx.strokeStyle = '#00FFFF';
      _ctx.fillStyle = '#0B48CB';
      _ctx.strokeStyle = '#0B48CB';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 52: // orange
//      _ctx.fillStyle = '#FFA500';
//      _ctx.strokeStyle = '#FFA500';
      _ctx.fillStyle = '#AC180A';
      _ctx.strokeStyle = '#AC180A';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 53: // green
//      _ctx.fillStyle = '#00FF00';
//      _ctx.strokeStyle = '#00FF00';
      _ctx.fillStyle = '#10361B';
      _ctx.strokeStyle = '#10361B';
      _ctx.globalCompositeOperation = "source-over";
      _ctx.globalAlpha = 0.5;
      break;
    case 54: // purple
//      _ctx.fillStyle = '#800080';
//      _ctx.strokeStyle = '#800080';
      _ctx.fillStyle = '#040A1B';
      _ctx.strokeStyle = '#040A1B';
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
  // bold and double width work for graphics as well
  const boldLoop = _bold ? 4 : 1;
  const doubleLoop = _doubleWidth ? 2 : 1;

  const fgfx = (ch:number, xoff:number) =>
  {
    // draw vertical dot pattern
    if( ch & 0x01 )
      _ctx.fillRect(_px+xoff, _py+2*0, 1, 1);
    if( ch & 0x02 )
      _ctx.fillRect(_px+xoff, _py+2*1, 1, 1);
    if( ch & 0x04 )
      _ctx.fillRect(_px+xoff, _py+2*2, 1, 1);
    if( ch & 0x08 )
      _ctx.fillRect(_px+xoff, _py+2*3, 1, 1);
    if( ch & 0x10 )
      _ctx.fillRect(_px+xoff, _py+2*4, 1, 1);
    if( ch & 0x20 )
      _ctx.fillRect(_px+xoff, _py+2*5, 1, 1);
    if( ch & 0x40 )
      _ctx.fillRect(_px+xoff, _py+2*6, 1, 1);
    if( ch & 0x80 )
      _ctx.fillRect(_px+xoff, _py+2*7, 1, 1);
  }

  const oldPY = _py;
  for(let d=0;d<_72DPIV;d++)
  {
    _py += d;
    for(let i=0;i<doubleLoop;i++)
    {
      let x = i*2;
      for(let j=0;j<boldLoop;j++)
      {
        x += (j*0.25);
        fgfx(ch,x);
      }
    }
  }
  _py = oldPY;

  incx(doubleLoop);
}

export function fontGfx(ch:number)
{
  const boldLoop = _bold ? 4 : 1;
  const doubleLoop = _doubleWidth ? 2 : 1;
  const vdpi = (_halfHeight || _subscript || _superscript) ? 1 : 2;
  let yoff = 0;
  let xoff = 0;

  if (_halfHeight)
    yoff = 4;
  else if (_subscript)
    yoff = 6;

  // the font is technically 9 bits high but the font values are only 8 bit
  // if the high bit is set, it is code to shift by two for descenders
  if (!_rawoutput && (ch & 0x80))
    ch <<= 2;

  const fgfx = (ch:number) =>
  {
    // draw vertical dot pattern
    if( ch & 0x01 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*0, 1, 1);
    if( ch & 0x02 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*1, 1, 1);
    if( ch & 0x04 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*2, 1, 1);
    if( ch & 0x08 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*3, 1, 1);
    if( ch & 0x10 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*4, 1, 1);
    if( ch & 0x20 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*5, 1, 1);
    if( ch & 0x40 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*6, 1, 1);
    if( ch & 0x80 )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*7, 1, 1);
    // ninth wire for descenders and underline
    if( ch & 0x100 || _underline )
      _ctx.fillRect(_px+xoff, _py+yoff+vdpi*8, 1, 1);
  }

  const oldPY = _py;
  for(let d=0;d<_72DPIV;d++)
  {
    _py += d;
    for(let i=0;i<doubleLoop;i++)
    {
      xoff = i*2;
      for(let j=0;j<boldLoop;j++)
      {
        xoff += (j*0.25);
        fgfx(ch);
      }
    }
  }
  _py = oldPY;

  incx(doubleLoop);
}

export function fontGfx16(chh:number, chl:number)
{
  const boldLoop = _bold ? 4 : 1;
  const doubleLoop = _doubleWidth ? 2 : 1;
  let xoff = 0;

  // the font is technically 18 bits high but the font values are only 16 bit
  // so like for the 8 bit fonts, if the high bit is set it is code to shift 
  // by two for descenders
  if (!_rawoutput)
  {
    if (chh & 0x80)
      chh <<= 2;
    if (chl & 0x80)
      chl <<= 2;
  }

  const fgfx = (chh:number, chl:number) =>
  {
    // draw vertical dot pattern
    if( chh & 0x01 )
      _ctx.fillRect(_px+xoff, _py+0, 1, 1);
    if( chl & 0x01 )
      _ctx.fillRect(_px+xoff, _py+1, 1, 1);

    if( chh & 0x02 )
      _ctx.fillRect(_px+xoff, _py+2, 1, 1);
    if( chl & 0x02 )
      _ctx.fillRect(_px+xoff, _py+3, 1, 1);

    if( chh & 0x04 )
      _ctx.fillRect(_px+xoff, _py+4, 1, 1);
    if( chl & 0x04 )
      _ctx.fillRect(_px+xoff, _py+5, 1, 1);

    if( chh & 0x08 )
      _ctx.fillRect(_px+xoff, _py+6, 1, 1);
    if( chl & 0x08 )
      _ctx.fillRect(_px+xoff, _py+7, 1, 1);

    if( chh & 0x10 )
      _ctx.fillRect(_px+xoff, _py+8, 1, 1);
    if( chl & 0x10 )
      _ctx.fillRect(_px+xoff, _py+9, 1, 1);

    if( chh & 0x20 )
      _ctx.fillRect(_px+xoff, _py+10, 1, 1);
    if( chl & 0x20 )
      _ctx.fillRect(_px+xoff, _py+11, 1, 1);

    if( chh & 0x40 )
      _ctx.fillRect(_px+xoff, _py+12, 1, 1);
    if( chl & 0x40 )
      _ctx.fillRect(_px+xoff, _py+13, 1, 1);

    if( chh & 0x80 )
      _ctx.fillRect(_px+xoff, _py+14, 1, 1);
    if( chl & 0x80 )
      _ctx.fillRect(_px+xoff, _py+15, 1, 1);

    // ninth wire for descenders and underline
    if( chh & 0x100 || _underline )
      _ctx.fillRect(_px+xoff, _py+16, 1, 1);
    if( chl & 0x100 || _underline )
      _ctx.fillRect(_px+xoff, _py+17, 1, 1);
  }

  for(let i=0;i<doubleLoop;i++)
  {
    xoff = i*2;
    for(let j=0;j<boldLoop;j++)
    {
      xoff += (j*0.25);
      fgfx(chh, chl);
    }
  }

  incx(doubleLoop);
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
  PLENGTH: 23,
  CHEIGHT: 24,
  TABSTOP: 25,
  SETTABS: 26,
  CLEARTABS: 27,

  cur: 0,
};

function parseChar(raw:number)
{
  const ch = raw & _ignoreBit8;

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
      switch(ch)
      {
        case 27:
          command = [];
          state.cur = state.TABSTOP;
          break;

        case 48:  // clear all tabs
          state.cur = state.OUTER;
          cleartabs();
          break;

        case 40:
          command = [];
          state.cur = state.SETTABS;
          // clears all tabs to start
          cleartabs();
          break;

        case 41:
          command = [];
          state.cur = state.CLEARTABS;
          break;

        case 39:
          state.cur = state.OUTER;
          usecustomfont(true);
          break;

        case 42:
          state.cur = state.OUTER;
          usecustomfonthi(true);
          break;

        case 45:
          state.cur = state.OUTER;
          setcustomfontwidth(8);
          break;

        case 43:
          state.cur = state.OUTER;
          setcustomfontwidth(16);
          break;

        case 36:
          state.cur = state.OUTER;
          mapmousetext(false);
          usecustomfonthi(false);
          break;

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

        case 72:
          command = [];
          state.cur = state.PLENGTH;
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
          state.cur = state.OUTER;
          _nlfSpacing = 24;
          dbg("nlfSpacing: " + _nlfSpacing);
          break;
        case 66: // 8 lines per inch
          state.cur = state.OUTER;
          _nlfSpacing = 18;
          dbg("nlfSpacing: " + _nlfSpacing);
          break;

        case 102: // forward linefeed
          state.cur = state.OUTER;
          _lfSpacing = Math.abs(_lfSpacing)
          dbg("fw lf")
          break;

        case 114: // reverse linefeed
          state.cur = state.OUTER;
          _lfSpacing = -Math.abs(_lfSpacing)
          dbg("rev lf")
          break;

        case 79:  // paper out sensor off
        case 111: // paper out sensor on
          state.cur = state.OUTER;
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
          bold(true);
          state.cur = state.OUTER;
          break;
        case 34:
          bold(false);
          state.cur = state.OUTER;
          break;

        case 88:
          underline(true);
          state.cur = state.OUTER;
          break;
        case 89:
          underline(false);
          state.cur = state.OUTER;
          break;

        case 119:
          halfheight(true);
          state.cur = state.OUTER;
          break;
        case 87:
          halfheight(false);
          state.cur = state.OUTER;
          break;

        case 120:
          superscript(true);
          state.cur = state.OUTER;
          break;
        case 121:
          subscript(true);
          state.cur = state.OUTER;
          break;
        case 122:
          subscript(false);
          superscript(false);
          state.cur = state.OUTER;
          break;

        case 49:  // insert N dots (1-6) for proportional
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
          state.cur = state.OUTER;
          if (_usePropFont)
            incx(ch-48); // 49 = 1
          break;

        case 115:
          state.cur = state.SETPROPSPACING;
          break;

        case 73:
          dbg("begin load custom font");
          state.cur = state.LOADCUSTOM;
          customdata = [];
          break;

        case 108:
          state.cur = state.CRLF;
          break;

        case 118:
          _tof = _py;
          break;

        case 38:
          state.cur = state.OUTER;
          mapmousetext(true);
          break;

        case 97:
          state.cur = state.PRINTQUALITY;
          break;
        case 109:
          state.cur = state.OUTER;
          setprintquality(0);
          break;
        case 77:
          state.cur = state.OUTER;
          setprintquality(1);
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
          state.cur = state.OUTER;
          setdpi(ch);
          break;

        default:
          log("Unknown ESC code: " + ch);
          break;
      }
      break;

    case state.SETTABS:
      // expect 3 chars at a time, ending with comma or period
      if(command.length === 3)
      {
        const cmd = command[0] + command[1] + command[2];
        settabstop(parseInt(cmd));

        if (ch === 46) // period, ends sequence
          state.cur = state.OUTER;
        else if (ch === 44) // comma continues
        {
          command = [];
        }
        else
        {
          state.cur = state.OUTER;
          dbg("Unknown char in ending +tab sequence: " + ch);
        }
      }
      else
        command.push(String.fromCharCode(ch));

      break;

    case state.TABSTOP:
      // expect 3 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 3)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1] + command[2];
        settabstop(parseInt(cmd));
      }
      break;

    case state.CLEARTABS:
      // expect 3 chars at a time, ending with comma or period
      if(command.length === 3)
      {
        const cmd = command[0] + command[1] + command[2];
        cleartabstop(parseInt(cmd));

        if (ch === 46) // period, ends sequence
          state.cur = state.OUTER;
        else if (ch === 44) // comma continues
        {
          command = [];
        }
        else
        {
          state.cur = state.OUTER;
          dbg("Unknown char in ending -tab sequence: " + ch);
        }
      }
      else
        command.push(String.fromCharCode(ch));

      break;

    case state.GFXN:
      // expect 4 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 4)
      {
        setxscale(SCALE.GFX);
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
        setxscale(SCALE.GFX);
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
        setxscale(SCALE.FONTS);
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
      setxscale(SCALE.GFX);
      while(_gfxchars--)
      {
        gfx(ch);
      }
      state.cur = state.OUTER;
      _ignoreBit8 = 0x7f;
      setxscale(SCALE.FONTS);
      break;

    case state.HPOS:
      // expect 4 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 4)
      {
        setxscale(SCALE.GFX);
        state.cur = state.OUTER;
        const cmd = command[0] + command[1] + command[2] + command[3];
        _px = parseInt(cmd);;
        dbg("hpos: " + _px);
        setxscale(SCALE.FONTS);
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
      state.cur = state.OUTER;
      setprintquality(ch-48);
      break;

    case state.LOADCUSTOM:
      // load custom font until ctrl-d
      customdata.push(ch);
      switch (customdata.length)
      {
        case 1:
          if (customdata[0] === CHCODE.cD)
          {
            state.cur = state.OUTER;
            endcustomfontupload();
          }
          else
          {
            dbg("cfont key: " + customdata[0]);
          }
          break;

        case 2:
          _customGlyphWidth = customfontwidth(customdata[1]);
          if (_customGlyphWidth === 0)
          {
            dbg("custom font width error: " + customdata[1]);
            customdata = [];
            state.cur = state.OUTER;
            endcustomfontupload();
          }
          else
          {
            dbg("cfont width: " + _customGlyphWidth);
          }
          break;

        default:
          // loading custom data
          _customGlyphWidth--;
          if (_customGlyphWidth === 0)
          {
            loadcustomglyph();
            customdata = [];
          }
          break;
      }
      break;

    case state.FEEDLINES:
      state.cur = state.OUTER;
      const count = "0123456789:;<=>?";
      const cf = String.fromCharCode(ch);
      const nl = count.indexOf(cf);
      if (nl > 0)
        linefeed(nl);
      break;

    case state.LMARGIN:
      // expect 3 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 3)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1] + command[2];
        setleftmargin(parseInt(cmd));
      }
      break;

    case state.PLENGTH:
      // expect 4 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 4)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1] + command[2] + command[3];
        setpagelength(parseInt(cmd));
      }
      break;

    case state.CHEIGHT:
      // expect 2 chars
      command.push(String.fromCharCode(ch));
      if(command.length === 2)
      {
        state.cur = state.OUTER;
        const cmd = command[0] + command[1];
        _nlfSpacing = Math.floor(parseInt(cmd));
        dbg("nlfSpacing: " + _nlfSpacing);
      }
      break;

    case state.SETPROPSPACING:
      state.cur = state.OUTER;
      setpropspacing(ch-48); // 48 == ascii 0
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

