// Global asset registry for preloaded assets
declare global {
  interface Window {
    assetRegistry: {
      // Images
      bgImage: string;
      disk2off: string;
      disk2on: string;
      disk2offEmpty: string;
      disk2onEmpty: string;
      hardDriveOff: string;
      hardDriveOn: string;
      diskicons: string;
      runningGuy: string;
      // Audio
      driveMotor: string;
      driveTrackOffEnd: string;
      driveTrackSeekLong: string;
    };
  }
}

export {}