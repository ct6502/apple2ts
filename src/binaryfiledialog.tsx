import { useState } from "react";
import { Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControlLabel, InputAdornment, TextField } from "@mui/material"
import { passSetBinaryBlock } from "./main2worker";

const BinaryFileDialog = (props:
  {displayDialog: boolean,
    displayClose: () => void,
    binaryBuffer: Uint8Array}) => {
  const [runCode, setRunCode] = useState(false);
  const [runAddress, setRunAddress] = useState('07FD');

  const handleSetRunAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value.toUpperCase()
    if (newValue.match(/^([A-F0-9]{0,4})$/)) {
      setRunAddress(newValue)
    } else {
      setRunAddress(runAddress)
    }
  }

  const handleCancel = () => {
    props.displayClose()
  }

  const handleLoadBinary = () => {
    props.displayClose()
    if (props.binaryBuffer.length > 0) {
      const addr = parseInt('0x' + runAddress)
      passSetBinaryBlock(addr, props.binaryBuffer, runCode)
    }
  }

  if (!props.displayDialog) return (<span></span>)
  return (
    <Dialog open={props.displayDialog} onClose={handleCancel}>
    <DialogTitle>Memory Location</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Load into Apple II memory at hex address:
      </DialogContentText>
      <TextField
        autoFocus
        margin="dense"
        id="address"
        value={runAddress}
        type="text"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">0x</InputAdornment>
          ),
        }}
        variant="standard"
        onChange={handleSetRunAddress}
      />
      <FormControlLabel
        control={<Checkbox id="run" checked={runCode}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setRunCode(event.target.checked)
        }}/>}
        label="Run code after loading" />
      </DialogContent>
    <DialogActions>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleLoadBinary}>{runCode ? 'Run' : 'Load'}</Button>
    </DialogActions>
    </Dialog>
  )
}

export default BinaryFileDialog;
