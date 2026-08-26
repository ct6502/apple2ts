import React from "react"

type Translate = (key: string, params?: Record<string, string>) => string

const HelpLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
)

const LinkList = ({ links }: {
  links: ReadonlyArray<{ label: string, href: string }>,
}) => <>{links.map(({ label, href }, index) => (
  <React.Fragment key={href}>
    {index > 0 && "\n"}
    <HelpLink href={href}>{label}</HelpLink>
  </React.Fragment>
))}</>

const ShortcutTable = ({
  rows,
}: {
  rows: ReadonlyArray<readonly [string, string, string, string, boolean?]>,
}) => (
  <span className="help-shortcuts">
    {rows.map(([leftKey, leftLabel, rightKey, rightLabel, emphasizeRight]) => (
      <span className="help-shortcut-row" key={leftKey}>
        <kbd className="help-shortcut-key">{leftKey}</kbd>
        <span className="help-shortcut-separator">: </span>
        <span className="help-shortcut-label">{leftLabel}</span>
        <span className="help-shortcut-separator">; </span>
        <kbd className="help-shortcut-key">{rightKey}</kbd>
        <span className="help-shortcut-separator">: </span>
        <span className="help-shortcut-label">
          {emphasizeRight ? <strong>{rightLabel}</strong> : rightLabel}
        </span>
        <span className="help-shortcut-separator">. </span>
      </span>
    ))}
  </span>
)

export const DefaultHelpContent = ({
  t,
  useOpenAppleKey = false,
  isTouchDevice = "ontouchstart" in document.documentElement,
}: {
  t: Translate,
  useOpenAppleKey?: boolean,
  isTouchDevice?: boolean,
}) => {
  const isMac = navigator.platform.startsWith("Mac")
  const keyMod = isMac ? "⌘" : "Alt+"
  const arrowMod = isMac ? "⌘" : "Ctrl+"
  const shortcutKeyName = isMac ? "Command" : "Alt"
  const shortcutRows = [
    [`${keyMod}B`, t("controls.boot"), `${arrowMod}0`, t("speed.snail")],
    [`${keyMod}C`, t("controls.copyScreen"), `${arrowMod}1`, t("speed.normal"), true],
    [`${keyMod}O`, t("controls.restoreState"), `${arrowMod}2`, t("speed.two")],
    [`${keyMod}R`, t("controls.reset"), `${arrowMod}3`, t("speed.three")],
    [`${keyMod}S`, t("controls.saveState"), `${arrowMod}4`, t("speed.fast")],
    [`${keyMod}V`, t("controls.pasteText"), `${arrowMod}5`, t("speed.warp")],
    [
      `${keyMod}←`, t("debugControls.goBackInTime"),
      `${keyMod}→`, t("debugControls.goForwardInTime"),
    ],
  ] as const
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
    <HelpLink href="https://github.com/ct6502/apple2ts/graphs/contributors?all=1">
      {t("help.credit", { year: String(new Date().getFullYear()) })}
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
      {useOpenAppleKey
        ? <span key="shortcuts-unavailable" className="help-shortcuts-unavailable">
          {t("help.shortcutsUnavailable", { keyMod: shortcutKeyName })}
        </span>
        : <span key="shortcuts-available" className="help-shortcuts-available">
          <ShortcutTable rows={shortcutRows} />
          {"\n"}{t("help.controlPanelShortcut")}
          {"\n\n"}{t("help.openAppleKey")}
          {"\n"}{t("help.closedAppleKey")}
          {"\n"}{t("help.joystickKeys")}
          {"\n\n"}{t("help.onScreenKeyboard")}
        </span>}{"\n"}
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
