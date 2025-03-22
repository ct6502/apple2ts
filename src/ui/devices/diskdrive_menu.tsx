import { faClock, faCloud, faDownload, faEject, faFloppyDisk, faFolderOpen, faLock, faPause, faStar, faSync, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { JSX } from "react"
import { svgInternetArchiveLogo } from "../img/icon_internetarchive"

type MenuItem = {
  label: string,
  icon?: IconDefinition,
  index?: number,
  svg?: JSX.Element
}

export const driveMenuItems: Array<Array<MenuItem>> = [
  // menuNumber = 0
  [
    {
      label: "Write Protect Disk",
      icon: faLock,
      index: 3
    },
    {
      label: "-"
    },
    {
      label: "Download Disk",
      icon: faDownload,
      index: 0
    },
    {
      label: "Download and Eject Disk",
      icon: faDownload,
      index: 1
    },
    {
      label: "Eject Disk",
      icon: faEject,
      index: 2
    },
    {
      label: "-"
    },
    {
      label: "Save Disk to OneDrive",
      icon: faCloud,
      index: 4
    },
    {
      label: "Save Disk to Google Drive",
      icon: faCloud,
      index: 5
    }
  ],
  // menuNumber = 1
  [
    {
      label: "Write Protect Disk",
      icon: faLock,
      index: 3
    },
    {
      label: "-"
    },
    {
      label: "Eject Disk",
      icon: faEject,
      index: 2
    },
    {
      label: "-"
    },
    {
      label: "Sync Every Minute",
      icon: faClock,
      index: 60000
    },
    {
      label: "Sync Every 5 Minutes",
      icon: faClock,
      index: 300000
    },
    {
      label: "Pause Syncing",
      icon: faPause,
      index: Number.MAX_VALUE
    },
    {
      label: "-"
    },
    {
      label: "Sync Now",
      icon: faSync,
      index: Number.MIN_VALUE
    }
  ],
  // menuNumber = 2
  [
    {
      label: "Load Disk from Device (Read-Only)",
      icon: faFolderOpen,
      index: 0
    },
    {
      label: "-"
    },
    {
      label: "Load Disk from Internet Archive",
      svg: svgInternetArchiveLogo,
      index: 4
    },
    {
      label: "-"
    },
    {
      label: "Load Disk from OneDrive",
      icon: faCloud,
      index: 1
    },
    {
      label: "Load Disk from Google Drive",
      icon: faCloud,
      index: 2
    }
  ],
  // menuNumber = 3
  [
    {
      label: "Load Disk from Device (Read/Write)",
      icon: faFolderOpen,
      index: 3
    },
    {
      label: "-"
    },
    {
      label: "Load Disk from Internet Archive",
      svg: svgInternetArchiveLogo,
      index: 4
    },
    {
      label: "-"
    },
    {
      label: "Load Disk from OneDrive",
      icon: faCloud,
      index: 1
    },
    {
      label: "Load Disk from Google Drive",
      icon: faCloud,
      index: 2
    }
  ],
  // menuNumber = 4
  [
    {
      label: "Write Protect Disk",
      icon: faLock,
      index: 3
    },
    {
      label: "-"
    },
    {
      label: "Save Disk to Device",
      icon: faFloppyDisk,
      index: 6
    },
    {
      label: "-"
    },
    {
      label: "Download Disk",
      icon: faDownload,
      index: 0
    },
    {
      label: "Download and Eject Disk",
      icon: faDownload,
      index: 1
    },
    {
      label: "Eject Disk",
      icon: faEject,
      index: 2
    },
    {
      label: "-"
    },
    {
      label: "Save Disk to OneDrive",
      icon: faCloud,
      index: 4
    },
    {
      label: "Save Disk to Google Drive",
      icon: faCloud,
      index: 5
    }
  ],
  // menuNumber = 5
  [
    {
      label: "Write Protect Disk",
      icon: faLock,
      index: 3
    },
    {
      label: "-"
    },
    {
      label: "Eject Disk",
      icon: faEject,
      index: 2
    },
    {
      label: "-"
    },
    {
      label: "Add to Disk Collection",
      icon: faStar,
      index: 7
    },
    {
      label: "-"
    },
    {
      label: "Sync Every Minute",
      icon: faClock,
      index: 60000
    },
    {
      label: "Sync Every 5 Minutes",
      icon: faClock,
      index: 300000
    },
    {
      label: "Pause Syncing",
      icon: faPause,
      index: Number.MAX_VALUE
    },
    {
      label: "-"
    },
    {
      label: "Sync Now",
      icon: faSync,
      index: Number.MIN_VALUE
    }
  ],
  // menuNumber = 6
  [
    {
      label: "Write Protect Disk",
      icon: faLock,
      index: 3
    },
    {
      label: "-"
    },
    {
      label: "Eject Disk",
      icon: faEject,
      index: 2
    },
    {
      label: "-"
    },
    {
      label: "Remove Disk from Collection",
      icon: faStar,
      index: 8
    },
    {
      label: "-"
    },
    {
      label: "Sync Every Minute",
      icon: faClock,
      index: 60000
    },
    {
      label: "Sync Every 5 Minutes",
      icon: faClock,
      index: 300000
    },
    {
      label: "Pause Syncing",
      icon: faPause,
      index: Number.MAX_VALUE
    },
    {
      label: "-"
    },
    {
      label: "Sync Now",
      icon: faSync,
      index: Number.MIN_VALUE
    }
  ]
]
