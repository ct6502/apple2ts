import React from "react"

export type TabProps = {
  title: string
  children: React.ReactNode
}

// Marker component only - TabBase reads its props and renders the content itself.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Tab = (_props: TabProps) => null

export default Tab
