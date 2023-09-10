import React, { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material"
import PrintIcon from '@mui/icons-material/Print'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { Printer } from "./iwii"

export interface CopyCanvasProps {
  srcCanvas: HTMLCanvasElement
}

const CopyCanvas = (props: CopyCanvasProps) => {
  
  const { srcCanvas, ...rest } = props
  const canvasRef = useRef(null)
  // these dimensions represent a max dpi page
  let width = 1360
  let height = 1584
  
  useEffect(() => {
    let animationFrameId = 0
    
    const render = () => {
      if (canvasRef.current) {
        const destCanvas: HTMLCanvasElement = canvasRef.current
        const destContext: CanvasRenderingContext2D = destCanvas.getContext('2d')!
        // copy internal canvas over the other one
        if (destContext) {
            //copy the data, scale if necessary
            destContext?.drawImage(props.srcCanvas, 0, 0, width, height)
        } else {
          console.log("destinationCtx is NULL!")
        }
      } else {
        console.log("canvasRef.current is NULL!")
      }

      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [canvasRef, props.srcCanvas, height, width])
  
  return <canvas ref={canvasRef} {...rest}
          className="printerCanvas"
          style={{width:'100%', height:'100%'}}
          hidden={false}
          width={width} height={height} />
}

export interface PrinterDialogProps {
  open: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement
  printer: Printer;
}

const PrinterDialog = (props: PrinterDialogProps) => {
  const { open, onClose } = props;
  const [ state, setState ] = useState({
    canvasRef: React.createRef<HTMLCanvasElement>()
  })

  const handleClose = () => {
    onClose()
  };

  const handlePrint = () => {
    props.printer.print()
  };

  const handleClear = () => {
    props.printer.reset()
  };

  const handleSaveData = () => {
    //props.printer.save()
  };

  useEffect(() => {

    return () => {
    }
  }, [state.canvasRef, props.canvas]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>ImageWriter II</DialogTitle>
       <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
       <IconButton
          aria-label="delete"
          onClick={handleClear}
          sx={{
            position: 'absolute',
            right: 50,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <DeleteIcon />
        </IconButton>
       <IconButton
          aria-label="print"
          onClick={handlePrint}
          sx={{
            position: 'absolute',
            right: 92,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <PrintIcon />
        </IconButton>
       <IconButton
          aria-label="save data"
          onClick={handleSaveData}
          sx={{
            position: 'absolute',
            right: 134,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <SaveIcon />
        </IconButton>
        <DialogContent>
        <CopyCanvas srcCanvas={props.canvas} />
        </DialogContent>
    </Dialog>
  );
}

export default PrinterDialog
