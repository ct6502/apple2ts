import { Fragment, createElement, type HTMLAttributes, type ReactNode } from "react"
import panelConfig from "./retrocontrolpanel.json"

export type RetroPanelSlotName = "border" | "title" | "submenu" | "clock" | "menu" | "footer"

type RetroPanelSlots = Record<RetroPanelSlotName, ReactNode>

type LayoutElement = {
  element: string
  id?: string
  className?: string
  attributes?: Record<string, string>
  children?: LayoutNode[]
}

type LayoutSlot = {
  slot: RetroPanelSlotName
}

type LayoutNode = LayoutElement | LayoutSlot

const renderLayoutNode = (
  node: LayoutNode,
  slots: RetroPanelSlots,
  nodeProps: Record<string, HTMLAttributes<HTMLElement>>,
  key: string,
): ReactNode => {
  if ("slot" in node) {
    return <Fragment key={key}>{slots[node.slot]}</Fragment>
  }

  const dynamicProps = node.id ? nodeProps[node.id] : undefined
  const className = [node.className, dynamicProps?.className].filter(Boolean).join(" ") || undefined
  return createElement(
    node.element,
    {
      ...node.attributes,
      ...dynamicProps,
      className,
      key,
    },
    node.children?.map((child, index) => renderLayoutNode(child, slots, nodeProps, `${key}.${index}`)),
  )
}

export const renderRetroPanelLayout = (
  slots: RetroPanelSlots,
  panelProps: HTMLAttributes<HTMLElement>,
) => renderLayoutNode(panelConfig.layout as LayoutNode, slots, { panel: panelProps }, "panel")