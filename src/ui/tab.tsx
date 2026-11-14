import React from "react"

export type TabProps = {
  title: string
  // A plain node, or a render function when the tab's content needs to know
  // whether it is the currently visible tab (e.g. to skip work while hidden).
  children: React.ReactNode | ((isActive: boolean) => React.ReactNode)
}

// Marker component only - TabBase reads its props and renders the content itself.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Tab = (_props: TabProps) => null

export default Tab
