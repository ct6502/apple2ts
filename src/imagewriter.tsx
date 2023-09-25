import React from "react"
import { Button } from "@mui/material"
import iwiion from "./img/iwiion.png"
import iwiioff from "./img/iwiioff.png"
import PrinterDialog from "./printerdialog"
import { ImageWriterII } from "./iwii"

let doSetPrinting: () => void

const registerSetPrinting = (fn: () => void) => {
  doSetPrinting = fn
}
export const receiveCommData = (data: Uint8Array) => {
  console.log(data.length)
  if (doSetPrinting) doSetPrinting()
  ImageWriterII.write(data)
}

class ImageWriter extends React.Component {
  canvas: HTMLCanvasElement
  state = {
    open: false,
    printingTimeout: 0,
  }

  constructor(props: any)
  {
    super(props)
    this.canvas =  document.createElement("canvas");
  }

  setPrinting = () => {
    if (this.state.printingTimeout !== 0) {
      clearTimeout(this.state.printingTimeout);
    }
    const timeout = window.setTimeout(() => {
      this.setState({printingTimeout: 0})
    }, 1000)
    this.setState({printingTimeout: timeout})
  }

  handleClickOpen = () =>
  {
     this.setState({ open: true })
  }

  componentDidMount = () => {
    ImageWriterII.startup(this.canvas)
    registerSetPrinting(this.setPrinting)
  }

  render() {
    let status = this.state.printingTimeout ? 'PRINTING' : 'IDLE'
    let img1 = this.state.printingTimeout ? iwiion : iwiioff

    return (
      <span className="drive">
        <Button className="imgButton" variant="contained"
          onClick={this.handleClickOpen}>
          <img className="iwii" src={img1} alt="iwii" height="57px"/>
        </Button>
        <span className={"diskStatus"}>{status}</span>
        <PrinterDialog
          open={this.state.open}
          onClose={() => {this.setState({open: false})}}
          canvas={this.canvas} 
          printer={ImageWriterII}
        />
      </span>
    )
  }
}

export default ImageWriter;
