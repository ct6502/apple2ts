import { faClock, faCloud, faDownload, faEject, faFolderOpen, faLock, faPause, faSync, IconDefinition } from "@fortawesome/free-solid-svg-icons"

type MenuItem = {
  label: string,
  icon?: IconDefinition,
  index?: number,
}

export const driveMenuItems: Array<Array<MenuItem>> = [
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
      label: "Load Disk from OneDrive",
      icon: faCloud,
      index: 1
    },
    {
      label: "Load Disk from Google Drive",
      icon: faCloud,
      index: 2
    }
  ]
]
