import { uint32toBytes } from "./utility"
import { crc32 } from "./diskinterface"
import disk2off from './img/disk2off.png'
import disk2on from './img/disk2on.png'
import disk2offEmpty from './img/disk2off-empty.png'
import disk2onEmpty from './img/disk2on-empty.png'

const emptyDisk = "(empty)"

const downloadDisk = (diskData: Uint8Array, fileName: string) => {
  const crc = crc32(diskData, 12)
  diskData.set(uint32toBytes(crc), 8)
  const blob = new Blob([diskData]);
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const DiskDrive = (props: any) => {
  let hiddenFileInput: HTMLInputElement | null
  const img1 = (props.diskData.length > 0) ?
    (props.driveState.motorIsRunning ? disk2on : disk2off) :
    (props.driveState.motorIsRunning ? disk2onEmpty : disk2offEmpty)
  return (
    <span>
      <img className="disk2" src={img1} alt={props.driveState.fileName}
        title={props.driveState.fileName}
        onClick={() => {
          if (props.diskData.length > 0) {
            if (props.driveState.diskImageHasChanges) {
              downloadDisk(props.diskData, props.driveState.fileName)
            }
            props.diskData = new Uint8Array()
            props.driveState.fileName = emptyDisk
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
      <span className="fixedwidth">{props.driveState.halftrack / 2}</span>
    </span>
  )
}

export default DiskDrive;
