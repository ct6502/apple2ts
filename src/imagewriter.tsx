import React from "react"
import { Button } from "@mui/material"
import iwiion from "./img/iwiion.png"
import iwiioff from "./img/iwiioff.png"
import PrinterDialog from "./printerdialog"
import { ImageWriterII } from "./iwii"

let printing = false
let printingTimeout = 0
let iwcomponent: any = 0

const setPrinting = (state: boolean) => {
  if (state === printing)
    return

  if (state === true) {
    window.clearTimeout(printingTimeout)
    printingTimeout = window.setTimeout(setPrinting, 1000, false)
    printing = true;
    // HACK
    iwcomponent?.forceUpdate()
  }
  else if (state === false) {
    printing = false;
    // HACK
    iwcomponent?.forceUpdate()
  }
}

export const receiveCommData = (data: Uint8Array) => {
  setPrinting(true)

  ImageWriterII.write(data)
}

class ImageWriter extends React.Component {
  
  canvas: HTMLCanvasElement

  state = {
    open: false,
  }

  constructor(props: any)
  {
    super(props)
    this.canvas =  document.createElement("canvas");
    // HACK
    iwcomponent = this
  }

  handleClickOpen = () =>
  {
     this.setState({ open: true })
  }

  componentDidMount = () => {
    ImageWriterII.startup(this.canvas)
  }

  render() {
    let status = printing ? 'PRINTING' : 'IDLE'
    let img1 = printing ? iwiion : iwiioff

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
