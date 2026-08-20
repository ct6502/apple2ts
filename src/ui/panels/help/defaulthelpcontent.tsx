import React from "react"

type Translate = (key: string, params?: Record<string, string>) => string

const HelpLink = ({ href, children }: {href: string, children: React.ReactNode}) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
)

const LinkList = ({ links }: {
  links: ReadonlyArray<{label: string, href: string}>,
}) => <>{links.map(({ label, href }, index) => (
  <React.Fragment key={href}>
    {index > 0 && "\n"}
    <HelpLink href={href}>{label}</HelpLink>
  </React.Fragment>
))}</>

export const DefaultHelpContent = ({ t }: {t: Translate}) => {
  const isMac = navigator.platform.startsWith("Mac")
  const keyMod = isMac ? "⌘" : "Alt+"
  const arrowMod = isMac ? "⌘" : "Ctrl+"
  const isTouchDevice = "ontouchstart" in document.documentElement
  const helpExamples = [
    {
      label: t("help.exampleLinks.totalReplayDebugging"),
      href: "https://apple2ts.com/?debug=on#Replay",
    },
    {
      label: t("help.exampleLinks.totalReplayChoplifter"),
      href: "https://apple2ts.com/?speed=normal&appmode=embed&text=chop#Replay",
    },
    {
      label: t("help.exampleLinks.a2Desktop"),
      href: "https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.4-en_800k.2mg",
    },
    {
      label: t("help.exampleLinks.embeddedBasic"),
      href: "https://apple2ts.com/?color=green&text=10%3F%22Welcome%20to%20Apple2TS%21%22%3AGOTO10",
    },
    {
      label: t("help.exampleLinks.binaryHexAddress"),
      href: "https://apple2ts.com/?address=07FD#https://github.com/ct6502/apple2ts/raw/refs/heads/main/public/disks/snoggle_0x7FD.bin",
    },
  ] as const
  const helpResources = [
    {
      label: t("help.resourceLinks.desktopApp"),
      href: "https://ct6502.org/apple2ts/",
    },
    {
      label: t("help.resourceLinks.corsProxy"),
      href: "https://corsfix.com",
    },
    {
      label: t("help.resourceLinks.silverCjkFont"),
      href: "https://poppyworks.itch.io/silver",
    },
  ] as const

  return <>
    {t("help.title")} - {t("help.subtitle")}{"\n"}
    (c) {new Date().getFullYear()} Chris Torrence and{" "}
    <HelpLink href="https://github.com/ct6502/apple2ts/graphs/contributors?all=1">
      contributors
    </HelpLink>
    {isTouchDevice ? "\n\n\n" : "\n\n"}
    {isTouchDevice ? <>
      <b>{t("help.mobileInstructions")}</b>{"\n"}
      {t("help.tapScreen")}{"\n"}
      {t("help.arrowKeys")}{"\n"}
      {t("help.ctrlKey")}{"\n"}
      {t("help.ctrlLock")}{"\n"}
      {t("help.appleKeys")}{"\n"}
    </> : <>
      <b>{t("help.keyboardShortcuts")}</b>{"\n"}
      {t("help.shortcutsTable", { keyMod, arrowMod })}{"\n"}
    </>}
    {"\n"}<b>{t("help.diskImages")}</b>{" "}hdv, 2mg, dsk, woz, po, do, bin, bas
    {"\n\n"}<b>{t("help.urlParameters")}</b>{"\n"}
    {t("help.urlParametersBody")}
    {"\n\n"}<b>{t("help.examples")}</b>{"\n"}
    <LinkList links={helpExamples} />
    {"\n\n"}<b>{t("help.links")}</b>{"\n"}
    <LinkList links={helpResources} />
  </>
}
