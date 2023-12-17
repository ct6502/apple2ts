import React from "react"
import iwiion from "./img/iwiion.png"
import iwiioff from "./img/iwiioff.png"
import PrinterDialog from "./printerdialog"
import { ImageWriterII } from "./iwii"

let doSetPrinting: () => void

const registerSetPrinting = (fn: () => void) => {
  doSetPrinting = fn
}

// eslint-disable-next-line react-refresh/only-export-components
export const receivePrinterData = (data: Uint8Array) => {
  if (doSetPrinting) doSetPrinting()
  ImageWriterII.write(data)
}

class ImageWriter extends React.Component {
  canvas: HTMLCanvasElement
  state = {
    open: false,
    printingTimeout: 0,
  }

  constructor(props: object)
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
    const img1 = this.state.printingTimeout ? iwiion : iwiioff

    return (
      <span className="driveClass">
        <img className="multi-disk"
          src={img1} alt="iwii"
          title="ImageWriter II"
          height="57px"
          onClick={this.handleClickOpen} />
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
