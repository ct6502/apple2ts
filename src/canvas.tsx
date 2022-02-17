import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { getTextPage, getHGR } from "./interp";
import { convertAppleKey } from "./keyboard"
import { addToBuffer, keyPress, toHex, SWITCHES } from "./instructions";

const xmargin = 20
const ymargin = 20
const cwidth = 20
const cheight = 24
const width = cwidth*40 + 2*xmargin
const height = cheight*24 + 2*ymargin
let refresh = 0

const lores = [
  [  0,   0,   0], //black   
  [211,  58,  72], //red     
  [  9,  30, 163], //dk blue 
  [213,  84, 221], //purple  
  [ 54, 133,  57], //dk green
  [104, 104, 104], //gray    
  [ 51,  68, 246], //med blue
  [134, 185, 249], //lt blue 
  [147, 106,  33], //brown   
  [240, 131,  49], //orange  
  [184, 184, 184], //grey    
  [244, 175, 157], //pink    
  [ 97, 219,  64], //lt green
  [254, 251,  82], //yellow  
  [134, 247, 210], //aqua    
  [255, 255, 255], //white   
  ]

let loresHex = new Array<string>(16)
for (let c = 0; c < 16; c++) {
  loresHex[c] = '#' + toHex(lores[c][0]) + toHex(lores[c][1]) + toHex(lores[c][2])
}

 const processTextPage = (ctx: CanvasRenderingContext2D,
  textPage2: boolean, mixedMode = false) => {
  const textPage = getTextPage(textPage2)
  ctx.font = cheight + "px PrintChar21"
  const jstart = mixedMode ? 20 : 0
  const doFlashCycle = (Math.trunc(refresh / 24) % 2) === 0

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymargin + (j + 1)*cheight - 3
    textPage.slice(j * 40, (j + 1) * 40).forEach((value, i) => {
      let v: string
      if (value === 0x60) {
        value = 64 // flashing cursor
        v = "\u00A0"
      } else {
        let v1 = value;
        // Shift Ctrl chars and second ASCII's into correct ASCII range
        if ((v1 >= 0 && v1 <= 0x1f) || (v1 >= 0x61 && v1 <= 0x9f)) {
          v1 += 0x40;
        }
        v = String.fromCharCode(v1 & 0b01111111);
      }
      ctx.fillStyle = "#FFFFFF" // "#39FF14";
      if (value < 64) {
        // Inverse characters
        ctx.fillRect(xmargin + i*cwidth, ymargin + j*cheight, cwidth, cheight);
        ctx.fillStyle = "#000000";
      } else if (value < 128) {
        if (doFlashCycle) {
          ctx.fillRect(xmargin + i*cwidth, ymargin + j*cheight, cwidth, cheight);
          ctx.fillStyle = "#000000";
        }
      }
      ctx.fillText(v, xmargin + i*cwidth, yoffset)
    });
  }
};

const processLoRes = (ctx: CanvasRenderingContext2D,
  textPage2: boolean, mixedMode = false) => {
  const textPage = getTextPage(textPage2)
  const jstop = mixedMode ? 20 : 24

  for (let j = 0; j < jstop; j++) {
    const yposUpper = ymargin + j*cheight
    const yposLower = yposUpper + cheight/2
    textPage.slice(j * 40, (j + 1) * 40).forEach((value, i) => {
      const xpos = xmargin + i*cwidth
      const upperBlock = value % 16
      const lowerBlock = Math.trunc(value / 16)
      ctx.fillStyle = loresHex[upperBlock]
      ctx.fillRect(xpos, yposUpper, cwidth, cheight/2)
      ctx.fillStyle = loresHex[lowerBlock]
      ctx.fillRect(xpos, yposLower, cwidth, cheight/2)
    });
  }
};

const BLACK = [0, 0, 0]
const GREEN = [1, 255, 1]
const VIOLET = [255, 1, 255]
// const WHITE = [255, 255, 255]
const ORANGE = [255, 127, 1]
const BLUE = [ 1, 127, 255] 

const decodeColor = (byte: number, bit: number, highBit: boolean, isEven: boolean) => {
  if ((byte >> bit) & 1) {
    return highBit ? (isEven ? BLUE : ORANGE) : (isEven ? VIOLET : GREEN)
  }
  return BLACK
}

const processHiRes = async (ctx: CanvasRenderingContext2D,
  page2: boolean, mixedMode = false) => {
  const hgrPage = getHGR(page2)  // 40 x 192 array
  const hgr = new Uint8ClampedArray(280 * 192 * 4).fill(255);
  for (let j = 0; j < 192; j++) {
    const line = hgrPage.slice(j*40, j*40 + 40)
    const joffset = j * 280 * 4
    let isEven = true
    for (let i = 0; i < 40; i++) {
      const ioffset = joffset + i * 28
      const byte = line[i]
      const highBit = (byte & 128) === 128
      for (let b = 0; b <= 6; b++) {
        const color = decodeColor(byte, b, highBit, isEven)
        hgr[ioffset + 4*b] = color[0]
        hgr[ioffset + 4*b + 1] = color[1]
        hgr[ioffset + 4*b + 2] = color[2]
        isEven = !isEven
      }
    }
    for (let i = 0; i < 280; i += 2) {
      const ioffset = joffset + i * 4
      if (hgr[ioffset]) {
        if (hgr[ioffset + 4]) {
          hgr.fill(255, ioffset, ioffset + 8)
        } else {
          hgr[ioffset + 4] = hgr[ioffset]
          hgr[ioffset + 5] = hgr[ioffset + 1]
          hgr[ioffset + 6] = hgr[ioffset + 2]
        }
      } else if (hgr[ioffset + 4]) {
          hgr[ioffset] = hgr[ioffset + 4]
          hgr[ioffset + 1] = hgr[ioffset + 5]
          hgr[ioffset + 2] = hgr[ioffset + 6]
      }
    }
  }
  const image = new ImageData(hgr, 280, 192);
  let imgHeight = height - 2*ymargin
  if (mixedMode) {
    imgHeight = Math.trunc(imgHeight * 160 / 192)
  }
  ctx.drawImage(await createImageBitmap(image),
    0, 0, 280, mixedMode ? 160 : 192,
    xmargin, ymargin, width - 2*xmargin, imgHeight);
};

const processDisplay = (ctx: CanvasRenderingContext2D) => {
  if (SWITCHES.TEXTON.set) {
    processTextPage(ctx, SWITCHES.PAGE2ON.set)
    return
  }
  if (SWITCHES.MIXEDON.set) {
    processTextPage(ctx, SWITCHES.PAGE2ON.set, true)
  }
  if (SWITCHES.HIRESON.set) {
    processHiRes(ctx, SWITCHES.PAGE2ON.set, SWITCHES.MIXEDON.set)
  } else {
    processLoRes(ctx, SWITCHES.PAGE2ON.set, SWITCHES.MIXEDON.set)
  }
}

const handleAppleKey = (e: KeyboardEvent<HTMLCanvasElement>) => {
  if (e.key === "v" && e.metaKey) {
    return;
  }
  const key = convertAppleKey(e);
  if (key > 0) {
    keyPress(key);
  } else {
    console.log("key=" + e.key + " code=" + e.code + " ctrl=" + e.ctrlKey + " shift=" + e.shiftKey + " meta=" + e.metaKey);
  }
};

const pasteHandler = (e: ClipboardEvent) => {
  if (e.clipboardData) {
    const data = e.clipboardData.getData("text");
    if (data !== "") {
      addToBuffer(data);
    }
    e.preventDefault();
  }
};

const Apple2Canvas = (props: any) => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  // This code only runs once when the component first renders
  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
    }
    const paste = (e: any) => {pasteHandler(e as ClipboardEvent)}
    window.addEventListener("paste", paste)
    // Return a cleanup function when component unmounts
    return () => {
      window.removeEventListener("paste", paste)
    }
  }, []);

  refresh++
  const ctx = canvasCtxRef.current;
  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    processDisplay(ctx)
  }
  return <canvas ref={canvasRef}
    height={height} width={width}
    tabIndex={0}
    onKeyDown={handleAppleKey}>
    </canvas>
};

export default Apple2Canvas;
