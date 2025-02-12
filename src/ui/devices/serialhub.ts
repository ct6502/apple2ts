import { receivePrinterData } from "./iwii"
import { passRxCommData } from "../main2worker"

const wsSupported = ("serial" in navigator);
let useWebSerial = false;
let writer: WritableStreamDefaultWriter | null = null;
let reader: ReadableStreamDefaultReader | null = null;
let port: SerialPort | null = null;

export const getSerialNames = () : string[] => {
  return ["Builtin ImageWriter", (port == null) ? "Select External Port" : "External Port"]
}

export const changeSerialMode = (i: number) => {
  if (!wsSupported)
  {
    setUseWebSerial(false);
  }
  else
  {
    if (i>0)
      requestSerialPort();
    else
      setUseWebSerial(false);
  }
}

export const getSerialMode = () : number => {
  return useWebSerial ? 1 : 0;
}

const requestSerialPort = () => {
  if (!wsSupported)
    return;
  
  navigator.serial.requestPort()
    .then((sp: SerialPort) => {
      port = sp;
      setUseWebSerial(true);
      console.log("Port Request Success")
    })
    .catch((err) => {
      port = null;
      setUseWebSerial(false);
      console.log("Port Request error:", err);
    });
}

export const setUseWebSerial = (tf: boolean) => {
  useWebSerial = tf && (port != null);

  if (useWebSerial) {
    // Wait for the serial port to open.
    port?.open({ bufferSize: 1024, baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none', flowControl: 'hardware' })
      .then(() => {
        console.log("Port Open Success")
        writer = port?.writable ? port.writable.getWriter() : null;
        reader = port?.readable ? port.readable.getReader() : null;
        queueRead();
      })
      .catch((err) => {
        console.log("Port Open error:", err);
      });
  }
  else {
    port = null;
  }
}

const queueRead = () => {
  if (reader == null)
    return;

  reader?.read().then(({done, value}) => {
    // stream closed
    if (done === true)
    {
      return;
    }

    passRxCommData(value);

    queueRead();
  });
}

export const receiveCommData = (data: Uint8Array) => {
  if (useWebSerial)
    receiveWebSerial2(data);
  else
    receivePrinterData(data);
}

const receiveWebSerial2 = async (data: Uint8Array) => {
  if (writer == null)
    return;

  await writer?.ready;
  await writer?.write(data);
}

