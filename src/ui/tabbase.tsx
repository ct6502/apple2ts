import React, { useState } from "react"
import { TabProps } from "./tab"

type TabBaseProps = {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[]
}

const TabBase = (props: TabBaseProps) => {
  const tabs = React.Children.toArray(props.children) as React.ReactElement<TabProps>[]
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="tab-base">
      <div className="tab-base-header">
        {tabs.map((tab, i) => (
          <button
            key={tab.props.title}
            className={`tab-button${i === activeIndex ? " tab-active" : ""}`}
            onClick={() => setActiveIndex(i)}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div className="tab-base-body">
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex
          const content = typeof tab.props.children === "function"
            ? tab.props.children(isActive)
            : tab.props.children
          return (
            <div
              key={tab.props.title}
              className="tab-base-panel"
              // Keep inactive panels in the layout (so height reflects the tallest tab)
              // but hide them visually and from interaction/screen readers.
              style={{ visibility: isActive ? "visible" : "hidden" }}
              inert={isActive ? undefined : true}
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TabBase
