import React from "react"
import { uint32toBytes } from "./emulator/utility"
import { crc32 } from "./emulator/decodedisk"
import { handleGetDriveProps, handleSetDiskData } from "./main2worker"
import { imageList } from "./assets"

const downloadDisk = (diskData: Uint8Array, filename: string) => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith('.woz')) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  const blob = new Blob([diskData]);
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const readDisk = async (file: File, drive: number) => {
  const buffer = await file.arrayBuffer();
  handleSetDiskData(drive, new Uint8Array(buffer), file.name)
}

const resetDrive = (drive: number) => {
//  const dprops = handleGetDriveProps(drive)
  handleSetDiskData(drive, new Uint8Array(), "")
}

class DiskDrive extends React.Component<{drive: number}, {}> {
  hiddenFileInput: HTMLInputElement | null = null

  // https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929
  handleDrop = (e: any) => {this.dropHandler(e as DragEvent)}
  handleDrag = (e: DragEvent) => 
    {e.preventDefault(); e.stopPropagation()}

  componentDidMount() {
    if (this.props.drive === 0) {
      window.addEventListener('drop', this.handleDrop)
      window.addEventListener('dragover', this.handleDrag)
    }
  }

  componentWillUnmount() {
    if (this.props.drive === 0) {
      window.removeEventListener('drop', this.handleDrop)
      window.removeEventListener('dragover', this.handleDrag)
    }
  }

  dropHandler = (e: DragEvent) => {    
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files
    if (f && f.length > 0) {
      readDisk(f[0], 0)
    }
  }

  render() {
    const dprops = handleGetDriveProps(this.props.drive)
    let img1: any
    if (dprops.hardDrive) {
      img1 = dprops.motorRunning ? imageList.hardDriveOn : imageList.hardDriveOff
    } else {
      img1 = (dprops.filename.length > 0) ?
        (dprops.motorRunning ? imageList.disk2on : imageList.disk2off) :
        (dprops.motorRunning ? imageList.disk2onEmpty : imageList.disk2offEmpty)
    }
    const filename = (dprops.filename.length > 0) ? dprops.filename : "(empty)"
    let status = ['S7D1', 'S6D1', 'S6D2'][this.props.drive]
    status += dprops.status
    return (
      <span className="drive">
        <img className="disk2"
          src={img1} alt={filename}
          title={filename}
          onClick={() => {
            if (dprops.filename.length > 0) {
              if (dprops.diskHasChanges) {
                downloadDisk(dprops.diskData, filename)
              }
              resetDrive(this.props.drive)
            }
            if (this.hiddenFileInput) {
              // Hack - clear out old file so we can pick the same file again
              this.hiddenFileInput.value = "";
              this.hiddenFileInput.click()
            }
          }} />
        <input
          type="file"
          accept=".hdv,.2mg,.dsk,.woz,.po,.do"
          ref={input => this.hiddenFileInput = input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target?.files?.length) {
              readDisk(e.target.files[0], this.props.drive)
            }
          }}
          style={{display: 'none'}}
        />
        <span className={"diskLabel"}>{dprops.filename}</span>
        <span className={"diskStatus"}>{status}</span>
      </span>
    )
  }
}

export default DiskDrive;
