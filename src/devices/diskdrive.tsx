import { crc32, uint32toBytes } from "../emulator/utility/utility"
import { handleGetDriveProps, handleSetDiskData } from "../main2worker"
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

const resetDrive = (drive: number) => {
  //  const dprops = handleGetDriveProps(drive)
  handleSetDiskData(drive, new Uint8Array(), "")
}

type DiskDriveProps = {
  drive: number,
  renderCount: number,
  setShowFileOpenDialog: (show: boolean, drive: number) => void
}

const DiskDrive = (props: DiskDriveProps) => {
  const dprops = handleGetDriveProps(props.drive)
  let img1: string
  if (dprops.hardDrive) {
    img1 = dprops.motorRunning ? imageList.hardDriveOn : imageList.hardDriveOff
  } else {
    img1 = (dprops.filename.length > 0) ?
      (dprops.motorRunning ? imageList.disk2on : imageList.disk2off) :
      (dprops.motorRunning ? imageList.disk2onEmpty : imageList.disk2offEmpty)
  }
  const filename = (dprops.filename.length > 0) ? dprops.filename : "(empty)"
  let status = ['S7D1', 'S6D1', 'S6D2'][props.drive]
  status += dprops.status
  return (
    <span className="driveClass">
      <img className="disk-image"
        src={img1} alt={filename}
        title={filename}
        onClick={() => {
          if (dprops.filename.length > 0) {
            if (dprops.diskHasChanges) {
              downloadDisk(dprops.diskData, filename)
            }
            resetDrive(props.drive)
          } else {
            props.setShowFileOpenDialog(true, props.drive)
          }
        }} />
      <span className={"disk-label"}>{dprops.filename}</span>
      <span className={"default-font diskStatus"}>{status}</span>
    </span>
  )
}

export default DiskDrive;
