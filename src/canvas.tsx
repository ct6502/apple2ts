import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { getTextPage } from "./interp";
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

// const hiresColors = [
//   [  0,   0,   0], //black1
//   [ 20, 245,  60], //green 
//   [255,  68, 253], //purple
//   [255, 255, 255], //white1
//   [  0,   0,   0], //black2
//   [255, 106,  60], //orange
//   [ 20, 207, 253], //blue  
//   [255, 255, 255], //white2
//   ] 

 const processTextPage = (ctx: CanvasRenderingContext2D,
  textPage2: boolean, mixedMode = false) => {
  const textPage = getTextPage(textPage2)
  ctx.font = cheight + "px PrintChar21"
  ctx.fillStyle = "#39FF14";
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
      ctx.fillStyle = "#39FF14";
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
//  const imgData = ctx.getImageData(0, 0, width, height)
//  const data = imgData.data

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
//      for (let y=0; y < cheight/2; y++) {
//        data.set(loresBlocks[upperBlock], yposUpper)
//      }
    });
  }
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
    ctx.fillStyle = "black";
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
