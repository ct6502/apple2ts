import { uint32toBytes } from "./utility"
import { crc32 } from "./decodedisk"
import disk2off from './img/disk2off.png'
import disk2on from './img/disk2on.png'
import disk2offEmpty from './img/disk2off-empty.png'
import disk2onEmpty from './img/disk2on-empty.png'

const downloadDisk = (diskData: Uint8Array, filename: string) => {
  const crc = crc32(diskData, 12)
  diskData.set(uint32toBytes(crc), 8)
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

const DiskDrive = (props: DriveProps) => {
  let hiddenFileInput: HTMLInputElement | null
  const img1 = (props.diskData.length > 0) ?
    (props.motorRunning ? disk2on : disk2off) :
    (props.motorRunning ? disk2onEmpty : disk2offEmpty)
  const filename = (props.filename.length > 0) ? props.filename : "(empty)"
  return (
    <span>
      <img className="disk2" src={img1} alt={filename}
        title={filename}
        onClick={() => {
          if (props.diskData.length > 0) {
            if (props.diskHasChanges) {
              downloadDisk(props.diskData, filename)
            }
            props.resetDrive(props.drive)
          }
          if (hiddenFileInput) {
            // Hack - clear out old file so we can pick the same file again
            hiddenFileInput.value = "";
            hiddenFileInput.click()
          }
        }} />
      <input
        type="file"
        ref={input => hiddenFileInput = input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target?.files?.length) {
            props.readDisk(e.target.files[0], props.drive)
          }
        }}
        style={{display: 'none'}}
      />
      <span className="fixedwidth">{props.halftrack / 2}</span>
    </span>
  )
}

export default DiskDrive;
