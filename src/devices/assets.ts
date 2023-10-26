import disk2off from './img/disk2off.png'
import disk2on from './img/disk2on.png'
import disk2offEmpty from './img/disk2off-empty.png'
import disk2onEmpty from './img/disk2on-empty.png'
import hardDriveOff from './img/harddrive.png'
import hardDriveOn from './img/harddriveOn.png'
import mp3DriveMotor from './audio/driveMotor.mp3'
import mp3TrackOffEnd from './audio/driveTrackOffEnd.mp3'
import mp3TrackSeek from './audio/driveTrackSeekLong.mp3'

export const imageList = {disk2off, disk2on, disk2offEmpty, disk2onEmpty,
  hardDriveOff, hardDriveOn}
export const mp3List = {mp3DriveMotor, mp3TrackOffEnd, mp3TrackSeek}

export const preloadAssets = () => {
  let keyImg: keyof typeof imageList
  for (keyImg in imageList) {
    const newImage = new Image()
    newImage.src = imageList[keyImg]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window[imageList[keyImg] as any] = newImage as any
  }
  let mp3Img: keyof typeof mp3List
  for (mp3Img in mp3List) {
    new Audio( mp3List[mp3Img])
  }
}
