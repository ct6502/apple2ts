import { expect, test as base } from "@playwright/test"
import type { Locator, Page, TestInfo } from "@playwright/test"

type Rectangle = {
  x: number,
  y: number,
  width: number,
  height: number,
  right: number,
  bottom: number,
}

type LayoutFixtures = {
  browserFailures: string[],
}

const test = base.extend<LayoutFixtures>({
  browserFailures: [async ({ page }, provideFixture) => {
    const failures: string[] = []
    page.on("console", message => {
      if (message.type() === "error") failures.push(`console: ${message.text()}`)
    })
    page.on("pageerror", error => failures.push(`page: ${error.message}`))
    await provideFixture(failures)
  }, { auto: true }],
})

test.afterEach(async ({ browserFailures }, testInfo) => {
  await testInfo.attach("browser-failures.json", {
    body: Buffer.from(JSON.stringify(browserFailures, null, 2)),
    contentType: "application/json",
  })
  expect(browserFailures).toEqual([])
})

const rectangle = async (locator: Locator): Promise<Rectangle> => {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  return {
    ...box!,
    right: box!.x + box!.width,
    bottom: box!.y + box!.height,
  }
}

const descendantBottomOffset = async (container: Locator, selector: string) => (
  container.evaluate((element, childSelector) => {
    const child = element.querySelector(childSelector)
    if (!(child instanceof HTMLElement)) {
      throw new Error(`Missing descendant ${childSelector}`)
    }
    const containerBox = element.getBoundingClientRect()
    return child.getBoundingClientRect().bottom - containerBox.top
  }, selector)
)

const exposedPoint = async (locator: Locator) => locator.evaluate(element => {
  const box = element.getBoundingClientRect()
  const inset = Math.min(4, box.width / 4, box.height / 4)
  const candidates = [
    [box.left + box.width / 2, box.top + box.height / 2],
    [box.left + inset, box.top + inset],
    [box.right - inset, box.top + inset],
    [box.left + inset, box.bottom - inset],
    [box.right - inset, box.bottom - inset],
  ]
  const point = candidates.find(([x, y]) => {
    const target = document.elementFromPoint(x, y)
    return target === element || (target !== null && element.contains(target))
  })
  if (!point) throw new Error("Control has no exposed pointer target")
  return { x: point[0], y: point[1] }
})

const attachGeometry = async (testInfo: TestInfo, value: unknown) => {
  await testInfo.attach("geometry.json", {
    body: Buffer.from(JSON.stringify(value, null, 2)),
    contentType: "application/json",
  })
}

const expectAligned = (actual: number, expected: number, message?: string) => {
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(1)
}

const settleLayout = async (page: Page) => {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  })
}

const openDesktop = async (
  page: Page,
  viewport = { width: 1800, height: 800 },
) => {
  await page.setViewportSize(viewport)
  await page.goto("/?color=white")
  await expect(page.locator(".desktop-emulator-layout")).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.locator(".desktop-panel-orientation-toggle"))
    .toHaveAttribute("aria-pressed", "false")
  await expect(page.locator(".desktop-panel-collapse-toggle"))
    .toHaveAttribute("aria-expanded", "true")
  await expect(page.locator(".desktop-panel-width-toggle"))
    .toHaveAttribute("aria-pressed", "false")
  await settleLayout(page)
}

const selectTab = async (page: Page, title: string) => {
  const tab = page.locator(`.dbg-tab[title="${title}"]`)
  await tab.click()
  await expect(tab).toHaveClass(/dbg-tab-active/)
}

const selectTouchTabAndWaitForResize = async (page: Page, title: string) => {
  await page.evaluate(() => {
    const testWindow = window as Window & { touchTabResizeObserved?: boolean }
    testWindow.touchTabResizeObserved = false
    window.addEventListener("resize", () => {
      testWindow.touchTabResizeObserved = true
    }, { once: true })
  })
  await selectTab(page, title)
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { touchTabResizeObserved?: boolean }).touchTabResizeObserved
  ))).toBe(true)
  await settleLayout(page)
}

test("pins the monitor while Debugger tabs and layout controls scroll together", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 608 })
  await selectTab(page, "Debugging")

  const monitor = page.locator(".desktop-primary-sticky")
  const tabs = page.locator(".dbg-tab-row")
  const controls = page.locator(".desktop-panel-controls")
  const before = {
    monitor: await rectangle(monitor),
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
  }

  await page.locator(".desktop-panel-content-debug").hover()
  await page.mouse.wheel(0, 2_000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  const after = {
    scrollY: await page.evaluate(() => window.scrollY),
    monitor: await rectangle(monitor),
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
  }
  expectAligned(after.monitor.y, before.monitor.y)
  expect(after.tabs.y).toBeLessThan(before.tabs.y)
  expect(after.controls.y).toBeLessThan(before.controls.y)
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth))
  await page.locator(".desktop-panel-collapse-toggle").click()
  const collapsedBefore = await rectangle(page.locator(".desktop-panel-collapse-toggle"))
  await page.mouse.wheel(0, 2_000)
  await settleLayout(page)
  const collapsedAfter = await rectangle(page.locator(".desktop-panel-collapse-toggle"))
  expectAligned(collapsedAfter.y, collapsedBefore.y)
  await attachGeometry(testInfo, { before, after, collapsedBefore, collapsedAfter })
})

test("keeps ordinary wide panels pinned without making their content scroll", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 608 })
  await page.locator(".desktop-panel-width-toggle").click()
  const shell = page.locator(".desktop-panel-shell")
  const tabs = page.locator(".dbg-tab-row")
  const before = {
    shell: await rectangle(shell),
    tabs: await rectangle(tabs),
  }

  await page.locator(".desktop-panel-content").hover()
  await page.mouse.wheel(0, 2_000)
  await settleLayout(page)
  const after = {
    scrollY: await page.evaluate(() => window.scrollY),
    shell: await rectangle(shell),
    tabs: await rectangle(tabs),
  }
  expect(after.scrollY).toBe(0)
  expectAligned(after.shell.y, before.shell.y)
  expectAligned(after.tabs.y, before.tabs.y)
  await attachGeometry(testInfo, { before, after })
})

test("keeps status and device controls usable beside the emulator controls", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 608 })
  const layoutToggles = page.locator(".desktop-panel-toggle")
  await expect(layoutToggles).toHaveCount(3)
  const toggleBoxes = await layoutToggles.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { height: rect.height, width: rect.width }
  }))
  expect(new Set(toggleBoxes.map(box => `${box.width}x${box.height}`)).size).toBe(1)
  const controlStrip = await rectangle(page.locator(".desktop-control-strip").first())
  const controls = await rectangle(page.locator(".control-panel-two-rows"))
  const deviceStrip = await rectangle(page.locator(".desktop-device-strip"))
  const diskStrip = await rectangle(page.locator(".desktop-disk-strip"))
  const disks = await rectangle(page.locator(".disk-interface-single-row"))
  const status = await rectangle(page.locator(".desktop-status-strip"))
  const diskOverflow = await page.locator(".desktop-disk-strip").evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  const statusOverflow = await page.locator(".desktop-status-strip").evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expectAligned(status.y, controlStrip.y)
  expectAligned(deviceStrip.y, controlStrip.bottom)
  expectAligned(
    deviceStrip.bottom,
    await page.evaluate(() => window.innerHeight - 10),
  )
  expectAligned(
    disks.bottom,
    await page.evaluate(() => window.innerHeight - 10),
  )
  expect(disks.y - controls.bottom).toBeGreaterThanOrEqual(0)
  const statusLines = page.locator(".desktop-status-strip .footer-item > div")
  expect(await statusLines.count()).toBeGreaterThan(0)
  const statusLineRectangles = await statusLines.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { bottom: rect.bottom, left: rect.left, right: rect.right, top: rect.top }
  }))
  for (const line of statusLineRectangles) {
    expect(line.left).toBeGreaterThanOrEqual(status.x)
    expect(line.right).toBeLessThanOrEqual(status.right)
    expect(line.top).toBeGreaterThanOrEqual(status.y)
    expect(line.bottom).toBeLessThanOrEqual(status.bottom)
  }
  expect(
    diskOverflow.scrollWidth,
    `device row requires ${diskOverflow.scrollWidth}px but has ${diskOverflow.clientWidth}px`,
  ).toBeLessThanOrEqual(diskOverflow.clientWidth)
  expect(statusOverflow.scrollWidth).toBeLessThanOrEqual(statusOverflow.clientWidth)
  const pageHeight = await page.evaluate(() => ({
    body: document.body.getBoundingClientRect().height,
    canvas: document.querySelector("#apple2canvas")?.getBoundingClientRect().height,
    controls: document.querySelector(".desktop-controls-and-status")?.getBoundingClientRect().height,
    devices: document.querySelector(".desktop-device-strip")?.getBoundingClientRect().height,
    document: document.documentElement.scrollHeight,
    layout: document.querySelector(".desktop-emulator-layout")?.getBoundingClientRect().height,
    primary: document.querySelector(".desktop-primary-sticky")?.getBoundingClientRect().height,
    viewport: window.innerHeight,
  }))
  expect(pageHeight.document, JSON.stringify(pageHeight))
    .toBeLessThanOrEqual(pageHeight.viewport)
  await page.mouse.wheel(0, 2_000)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  await openDesktop(page, { width: 900, height: 800 })
  const narrowDiskOverflow = await page.locator(".desktop-disk-strip").evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(
    narrowDiskOverflow.scrollWidth,
    `narrow device row requires ${narrowDiskOverflow.scrollWidth}px but has ${narrowDiskOverflow.clientWidth}px`,
  ).toBeLessThanOrEqual(narrowDiskOverflow.clientWidth)
  await page.locator(".desktop-disk-strip img[alt=disks]").click()
  const overlay = await rectangle(page.locator(".desktop-disk-strip .modal-overlay"))
  const dialog = await rectangle(page.locator(".desktop-disk-strip .floating-dialog"))
  const narrowViewport = await page.evaluate(() => ({
    height: window.visualViewport?.height ?? document.documentElement.clientHeight,
    width: window.visualViewport?.width ?? document.documentElement.clientWidth,
  }))
  expectAligned(overlay.x, 0)
  expectAligned(overlay.y, 0)
  expect(overlay.width).toBeGreaterThanOrEqual(narrowViewport.width - 15)
  expect(overlay.height).toBeGreaterThanOrEqual(narrowViewport.height - 15)
  expect(dialog.x).toBeGreaterThanOrEqual(overlay.x)
  expect(dialog.y).toBeGreaterThanOrEqual(overlay.y)
  expect(dialog.right).toBeLessThanOrEqual(overlay.right)
  expect(dialog.bottom).toBeLessThanOrEqual(overlay.bottom)
  expect(dialog.width).toBeGreaterThan(0)
  expect(dialog.height).toBeGreaterThan(0)
  await expect(page.locator(".desktop-disk-strip .floating-dialog .dcp-tab-active"))
    .toBeVisible()
  await attachGeometry(testInfo, {
    deviceStrip,
    controlStrip,
    controls,
    disks,
    diskStrip,
    status,
    diskOverflow,
    statusOverflow,
    pageHeight,
    narrowDiskOverflow,
    narrowDialog: { dialog, overlay, viewport: narrowViewport },
  })
})

test("keeps Minimal Help text inside the lined paper", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await page.goto("/?color=white&theme=minimal")
  await page.locator(".flyout-top-right .flyout-button").click()
  const paper = page.locator(".help-paper")
  const text = page.locator(".help-text-light")
  await expect(paper).toBeVisible()
  await settleLayout(page)
  const geometry = {
    paper: await rectangle(paper),
    text: await rectangle(text),
  }
  expect(geometry.text.x).toBeGreaterThanOrEqual(geometry.paper.x + 40)
  expect(geometry.text.bottom).toBeLessThanOrEqual(geometry.paper.bottom + 1)
  await attachGeometry(testInfo, geometry)
})

test("keeps viewport anchors aligned across tabs and BASIC variables", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 608 })
  const tabs = page.locator(".dbg-tab-row")
  const controls = page.locator(".desktop-panel-controls")
  const keyboard = page.locator(".keyboard-toggle-button")
  const monitor = page.locator(".desktop-primary-sticky")
  const baseline = {
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
    keyboard: await rectangle(keyboard),
    monitor: await rectangle(monitor),
  }
  const observations = []

  // Help is initially active. Clicking an active tab closes it, so use its
  // initial geometry as the baseline and visit only the other tabs here.
  for (const title of [
    "Debugging",
    "Applesoft BASIC",
    "Apple exPectin",
    "VERA Monitor",
    "Agent",
  ]) {
    await selectTab(page, title)
    await settleLayout(page)
    const current = {
      title,
      scrollY: await page.evaluate(() => window.scrollY),
      tabs: await rectangle(tabs),
      controls: await rectangle(controls),
      keyboard: await rectangle(keyboard),
      monitor: await rectangle(monitor),
    }
    expectAligned(
      current.tabs.y,
      baseline.tabs.y,
      `${title}: tab rail moved at scrollY=${current.scrollY} (${current.tabs.y} vs ${baseline.tabs.y})`,
    )
    expectAligned(current.controls.y, baseline.controls.y, `${title}: layout controls moved`)
    expectAligned(current.keyboard.y, baseline.keyboard.y, `${title}: keyboard control moved`)
    expectAligned(current.monitor.y, baseline.monitor.y, `${title}: monitor moved`)
    observations.push(current)
  }

  await selectTab(page, "Applesoft BASIC")
  await page.locator(".basic-variables-toggle").click()
  await expect(page.locator(".desktop-basic-workspace"))
    .toHaveClass(/desktop-basic-variables-visible/)
  await settleLayout(page)
  const variables = {
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
    keyboard: await rectangle(keyboard),
    monitor: await rectangle(monitor),
  }
  expectAligned(variables.tabs.y, baseline.tabs.y)
  expectAligned(variables.controls.y, baseline.controls.y)
  expectAligned(variables.keyboard.y, baseline.keyboard.y)
  expectAligned(variables.monitor.y, baseline.monitor.y)
  await page.locator(".desktop-basic-variables-visible").hover()
  await page.mouse.wheel(0, 2_000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  const variablesScrolled = {
    scrollY: await page.evaluate(() => window.scrollY),
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
    monitor: await rectangle(monitor),
  }
  expect(variablesScrolled.tabs.y).toBeLessThan(baseline.tabs.y)
  expect(variablesScrolled.controls.y).toBeLessThan(baseline.controls.y)
  expectAligned(variablesScrolled.monitor.y, baseline.monitor.y)
  await attachGeometry(testInfo, { baseline, observations, variables, variablesScrolled })
})

test("aligns BASIC, exPectin, and Agent actions without moving BASIC for variables", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 608 })

  await selectTab(page, "Applesoft BASIC")
  const basicControls = page.locator(".desktop-code-controls")
  const basicPrimary = page.locator(".desktop-basic-primary")
  const monitor = page.locator(".desktop-primary-sticky")
  const tabs = page.locator(".dbg-tab-row")
  const layoutControls = page.locator(".desktop-panel-controls")
  const basicBefore = {
    controls: await rectangle(basicControls),
    primary: await rectangle(basicPrimary),
  }
  await page.locator(".basic-variables-toggle").click()
  await expect(page.locator(".desktop-basic-workspace"))
    .toHaveClass(/desktop-basic-variables-visible/)
  await settleLayout(page)
  const basicAfter = {
    controls: await rectangle(basicControls),
    primary: await rectangle(basicPrimary),
    variables: await rectangle(page.locator(".basic-debug-view")),
  }
  expectAligned(basicAfter.controls.bottom, basicBefore.controls.bottom)
  expectAligned(basicAfter.primary.y, basicBefore.primary.y)
  expectAligned(basicAfter.primary.height, basicBefore.primary.height)

  const anchoredBeforeScroll = {
    monitor: await rectangle(monitor),
    tabs: await rectangle(tabs),
    controls: await rectangle(layoutControls),
  }
  await page.locator(".basic-debug-view").hover()
  await page.mouse.wheel(0, 2_000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  const anchoredAfterScroll = {
    monitor: await rectangle(monitor),
    tabs: await rectangle(tabs),
    controls: await rectangle(layoutControls),
  }
  expectAligned(anchoredAfterScroll.monitor.y, anchoredBeforeScroll.monitor.y)
  expect(anchoredAfterScroll.tabs.y).toBeLessThan(anchoredBeforeScroll.tabs.y)
  expect(anchoredAfterScroll.controls.y).toBeLessThan(anchoredBeforeScroll.controls.y)

  await page.locator(".desktop-panel-orientation-toggle").click()
  await expect(page.locator(".desktop-panel-shell")).toHaveClass(/desktop-panel-below/)
  await settleLayout(page)
  const belowWithVariables = {
    controls: await rectangle(basicControls),
    contentOverflow: await page.locator(".desktop-panel-content").evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    })),
    panel: await rectangle(page.locator(".desktop-panel-shell")),
    primary: await rectangle(basicPrimary),
    controlBottomOffset: await descendantBottomOffset(
      basicPrimary,
      ".desktop-code-controls",
    ),
  }
  await page.locator(".basic-variables-toggle").click()
  await expect(page.locator(".desktop-basic-workspace"))
    .not.toHaveClass(/desktop-basic-variables-visible/)
  await settleLayout(page)
  const belowWithoutVariables = {
    controls: await rectangle(basicControls),
    panel: await rectangle(page.locator(".desktop-panel-shell")),
    primary: await rectangle(basicPrimary),
    controlBottomOffset: await descendantBottomOffset(
      basicPrimary,
      ".desktop-code-controls",
    ),
  }
  await attachGeometry(testInfo, { belowWithVariables, belowWithoutVariables })
  expectAligned(belowWithoutVariables.primary.height, belowWithVariables.primary.height)
  expect(belowWithVariables.contentOverflow.scrollHeight)
    .toBeLessThanOrEqual(belowWithVariables.contentOverflow.clientHeight)
  expectAligned(
    belowWithoutVariables.controlBottomOffset,
    belowWithVariables.controlBottomOffset,
    `below BASIC control offset changed (${belowWithVariables.controlBottomOffset} -> ${belowWithoutVariables.controlBottomOffset})`,
  )

  await selectTab(page, "Apple exPectin")
  const expectin = await rectangle(page.locator(".desktop-code-controls"))
  const expectinWorkspace = await rectangle(page.locator(".desktop-code-workspace"))
  await selectTab(page, "Agent")
  const agent = await rectangle(page.locator(".agent-controls"))
  const agentWorkspace = await rectangle(page.locator(".agent-container"))

  const basicControlBottom = belowWithoutVariables.controls.bottom
    - belowWithoutVariables.primary.y
  expectAligned(expectin.bottom - expectinWorkspace.y, basicControlBottom)
  expectAligned(agent.bottom - agentWorkspace.y, basicControlBottom)
  await attachGeometry(testInfo, {
    basicBefore,
    basicAfter,
    anchoredBeforeScroll,
    anchoredAfterScroll,
    belowWithVariables,
    belowWithoutVariables,
    expectin,
    expectinWorkspace,
    agent,
    agentWorkspace,
  })
})

test("moves the panel below and immediately reveals its new location", async ({ page }, testInfo) => {
  await openDesktop(page)
  const shell = page.locator(".desktop-panel-shell")
  await page.locator(".desktop-panel-orientation-toggle").click()

  await expect(page.locator(".desktop-emulator-layout"))
    .toHaveClass(/desktop-panel-layout-below/)
  await expect(shell).toHaveClass(/desktop-panel-below/)

  const footer = await rectangle(page.locator(".desktop-status-strip"))
  const panel = await rectangle(shell)
  const tabs = await rectangle(shell.locator(".dbg-tab-row"))
  const activeTab = await rectangle(shell.locator(".dbg-tab-active"))
  const panelContent = await rectangle(shell.locator(".desktop-panel-content"))
  expectAligned(panelContent.y, activeTab.bottom)
  const belowToggleRectangles = await page.locator(".desktop-panel-toggle")
    .evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect()
      return { bottom: rect.bottom, height: rect.height }
    }))
  for (const toggle of belowToggleRectangles) {
    expectAligned(toggle.bottom, panelContent.y)
    expectAligned(toggle.height, tabs.height)
  }
  expect(panel.y).toBeGreaterThan(footer.bottom)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  expect(tabs.y).toBeGreaterThanOrEqual(0)
  expect(tabs.bottom).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight + 1))
  expect(panel.y).toBeGreaterThan(0)
  await expect(page.locator(".dbg-tab-horizontal").first()).toBeVisible()
  const revealedScrollY = await page.evaluate(() => window.scrollY)
  const canvas = page.locator("#apple2canvas")
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error("Apple II canvas has no browser geometry")
  await page.mouse.move(
    canvasBox.x + canvasBox.width / 2,
    canvasBox.y + canvasBox.height / 2,
  )
  await expect(canvas).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(revealedScrollY)
  await attachGeometry(testInfo, { footer, panel, tabs })
})

test("keeps wide code-tab action rows and the BASIC variable header visible", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 608 })
  await page.locator(".desktop-panel-width-toggle").click()
  await expect(page.locator(".desktop-panel-shell")).toHaveClass(/desktop-panel-wide/)
  const viewportBottom = await page.evaluate(() => window.innerHeight)
  const helpOverflow = await page.locator(".desktop-panel-content").evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(helpOverflow.scrollHeight).toBeLessThanOrEqual(helpOverflow.clientHeight)

  await selectTab(page, "Applesoft BASIC")
  await settleLayout(page)
  const basicControls = await rectangle(page.locator(".desktop-code-controls"))
  const scrollBeforeVariables = await page.evaluate(() => window.scrollY)
  expect(basicControls.bottom).toBeLessThanOrEqual(viewportBottom)
  const variablesToggle = page.locator(".basic-variables-toggle")
  const variablesTogglePoint = await exposedPoint(variablesToggle)
  await page.mouse.click(variablesTogglePoint.x, variablesTogglePoint.y)
  await expect(page.locator(".desktop-basic-workspace"))
    .toHaveClass(/desktop-basic-variables-visible/)
  await settleLayout(page)
  const basicWithVariables = {
    controls: await rectangle(page.locator(".desktop-code-controls")),
    variables: await rectangle(page.locator(".basic-debug-view")),
    scrollY: await page.evaluate(() => window.scrollY),
  }
  expectAligned(
    basicWithVariables.controls.bottom,
    basicControls.bottom,
    `BASIC controls moved after showing variables (scroll ${scrollBeforeVariables} -> ${basicWithVariables.scrollY})`,
  )
  expect(basicWithVariables.variables.y).toBeLessThan(viewportBottom)

  await selectTab(page, "Apple exPectin")
  const expectin = await rectangle(page.locator(".desktop-code-controls"))
  expect(expectin.bottom).toBeLessThanOrEqual(viewportBottom)
  await selectTab(page, "Agent")
  const agent = await rectangle(page.locator(".agent-controls"))
  expect(agent.bottom).toBeLessThanOrEqual(viewportBottom)
  expectAligned(expectin.bottom, basicControls.bottom)
  expectAligned(agent.bottom, basicControls.bottom)
  await attachGeometry(testInfo, {
    helpOverflow,
    basicControls,
    basicWithVariables,
    expectin,
    agent,
  })
})

test("bounds wide ordinary tabs and gives VERA a stable internal viewport", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 800 })
  const shell = page.locator(".desktop-panel-shell")
  const tabs = page.locator(".dbg-tab-row")
  const controls = page.locator(".desktop-panel-controls")
  const widthToggle = page.locator(".desktop-panel-width-toggle")

  await widthToggle.click()
  await expect(widthToggle).toHaveAttribute("aria-pressed", "true")
  const info = {
    shell: await rectangle(shell),
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
    documentWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    viewportWidth: await page.evaluate(() => window.innerWidth),
  }
  expect(info.shell.right).toBeLessThanOrEqual(info.viewportWidth)
  expect(info.documentWidth).toBeLessThanOrEqual(info.viewportWidth)

  await selectTab(page, "VERA Monitor")
  await settleLayout(page)
  const veraContent = page.locator(".desktop-panel-content")
  const before = {
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
    documentHeight: await page.evaluate(() => document.documentElement.scrollHeight),
    viewportHeight: await page.evaluate(() => window.innerHeight),
  }
  await veraContent.hover()
  await page.mouse.wheel(0, 2_000)
  const after = {
    tabs: await rectangle(tabs),
    controls: await rectangle(controls),
    scrollY: await page.evaluate(() => window.scrollY),
  }
  expectAligned(after.tabs.y, before.tabs.y)
  expectAligned(after.controls.y, before.controls.y)
  expect(after.scrollY).toBe(0)
  expect(before.documentHeight).toBeLessThanOrEqual(before.viewportHeight)
  await attachGeometry(testInfo, { info, before, after })
})

test("keeps HGR magnifier geometry independent of the panel underneath it", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1404, height: 800 })
  await page.locator("button[title=\"Boot\"]").click()
  await expect(page.locator("button[title=\"Pause\"]")).toBeEnabled()
  await page.locator("button[title=\"Pause\"]").click()
  await settleLayout(page)
  const debugTab = page.locator(".dbg-tab[title=\"Debugging\"]")
  if (!(await debugTab.getAttribute("class"))?.includes("dbg-tab-active")) {
    await selectTab(page, "Debugging")
  }
  await page.locator("#tour-debug-memorydump select").selectOption({
    label: "HGR page 1 (screen order)",
  })

  const monitor = await rectangle(page.locator(".main-canvas"))
  const magnifier = page.locator(".hgr-view")
  const sourceBox = page.locator(".hgr-view-box")
  const pixelCanvas = page.locator("#hgr-info-canvas")
  const sample = async (xRatio: number) => {
    await page.mouse.move(
      monitor.x + monitor.width * xRatio,
      monitor.y + monitor.height / 2,
    )
    await expect(magnifier).toBeVisible()
    await settleLayout(page)
    return {
      canvas: await rectangle(pixelCanvas),
      source: await rectangle(sourceBox),
    }
  }

  const overMonitor = await sample(0.25)
  const overPanel = await sample(0.75)
  expectAligned(overPanel.canvas.width, overMonitor.canvas.width)
  expectAligned(overPanel.canvas.height, overMonitor.canvas.height)
  expectAligned(overPanel.source.width, overMonitor.source.width)
  expectAligned(overPanel.source.height, overMonitor.source.height)
  expect(await magnifier.evaluate(element => element.parentElement === document.body)).toBe(true)
  expect(await magnifier.evaluate(element => getComputedStyle(element).position)).toBe("fixed")
  const placeMagnifierOver = async (target: Locator) => page.evaluate(
    ([magnifierElement, targetElement]) => {
      const magnifier = magnifierElement as HTMLElement
      const targetRect = (targetElement as HTMLElement).getBoundingClientRect()
      const previous = {
        left: magnifier.style.left,
        top: magnifier.style.top,
        pointerEvents: magnifier.style.pointerEvents,
      }
      magnifier.style.left = `${targetRect.left}px`
      magnifier.style.top = `${targetRect.top}px`
      magnifier.style.pointerEvents = "auto"
      const point = {
        x: targetRect.left + Math.min(10, targetRect.width / 2),
        y: targetRect.top + Math.min(10, targetRect.height / 2),
      }
      const topElement = document.elementFromPoint(point.x, point.y)
      magnifier.style.left = previous.left
      magnifier.style.top = previous.top
      magnifier.style.pointerEvents = previous.pointerEvents
      return {
        magnifierIsTop: topElement !== null && magnifier.contains(topElement),
        targetIsTop: topElement !== null && (targetElement as HTMLElement).contains(topElement),
      }
    },
    [await magnifier.elementHandle(), await target.elementHandle()],
  )
  const panelStacking = await placeMagnifierOver(page.locator(".desktop-panel-shell"))
  expect(panelStacking.magnifierIsTop).toBe(true)
  await page.locator(".control-panel-two-rows button[title=\"Display Settings\"]").click()
  const floatingDialog = page.locator(".desktop-primary-column .floating-dialog")
  await expect(floatingDialog).toBeVisible()
  const dialogStacking = await placeMagnifierOver(floatingDialog)
  expect(dialogStacking.targetIsTop).toBe(true)
  await page.mouse.click(1, 1)
  await expect(floatingDialog).toHaveCount(0)

  await page.locator(".desktop-panel-orientation-toggle").click()
  await expect(page.locator(".desktop-emulator-layout"))
    .toHaveClass(/desktop-panel-layout-below/)
  await page.evaluate(() => window.scrollTo(0, 0))
  await settleLayout(page)
  const belowMonitor = await rectangle(page.locator(".main-canvas"))
  await page.mouse.move(
    belowMonitor.x + belowMonitor.width * 0.25,
    belowMonitor.y + belowMonitor.height / 2,
  )
  await page.mouse.down()
  await page.mouse.up()
  await settleLayout(page)
  const beforeScroll = {
    monitor: await rectangle(page.locator(".main-canvas")),
    magnifier: await rectangle(magnifier),
  }
  await page.evaluate(() => window.scrollBy(0, 100))
  await settleLayout(page)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  const afterScroll = {
    monitor: await rectangle(page.locator(".main-canvas")),
    magnifier: await rectangle(magnifier),
  }
  expectAligned(
    afterScroll.magnifier.y - afterScroll.monitor.y,
    beforeScroll.magnifier.y - beforeScroll.monitor.y,
  )

  await page.locator("#tour-debug-memorydump select").selectOption({
    label: "Current memory",
  })
  await expect(magnifier).toHaveCount(0)
  await page.locator("#tour-debug-memorydump select").selectOption({
    label: "HGR page 1 (screen order)",
  })
  await page.mouse.move(monitor.x + monitor.width * 0.75, monitor.y + monitor.height / 2)
  await expect(magnifier).toBeVisible()
  await selectTab(page, "Help")
  await expect(magnifier).toHaveCount(0)
  await attachGeometry(testInfo, {
    monitor,
    overMonitor,
    overPanel,
    stacking: { panel: panelStacking, dialog: dialogStacking },
  })
})

test("collapse reclaims the grid track and restore preserves tab and width", async ({ page }, testInfo) => {
  await openDesktop(page)
  await selectTab(page, "Agent")
  const monitor = page.locator(".main-canvas")
  const shell = page.locator(".desktop-panel-shell")
  const widthToggle = page.locator(".desktop-panel-width-toggle")
  const collapseToggle = page.locator(".desktop-panel-collapse-toggle")

  await widthToggle.click()
  await expect(widthToggle).toHaveAttribute("aria-pressed", "true")
  const expanded = {
    monitor: await rectangle(monitor),
    panel: await rectangle(shell),
    layout: await rectangle(page.locator(".desktop-emulator-layout")),
    collapse: await rectangle(collapseToggle),
  }

  await collapseToggle.click()
  await expect(shell).toHaveClass(/desktop-panel-collapsed/)
  await expect(collapseToggle).toHaveAttribute("aria-expanded", "false")
  const collapsed = {
    monitor: await rectangle(monitor),
    panel: await rectangle(shell),
    layout: await rectangle(page.locator(".desktop-emulator-layout")),
    collapse: await rectangle(collapseToggle),
  }
  expect(collapsed.panel.width).toBeLessThan(expanded.panel.width)
  expect(collapsed.layout.width).toBeLessThan(expanded.layout.width)
  expectAligned(collapsed.monitor.width, expanded.monitor.width)
  expectAligned(collapsed.collapse.y, expanded.collapse.y)

  await collapseToggle.click()
  await expect(shell).not.toHaveClass(/desktop-panel-collapsed/)
  await expect(page.locator(".dbg-tab[title=\"Agent\"]")).toHaveClass(/dbg-tab-active/)
  await expect(widthToggle).toHaveAttribute("aria-pressed", "true")
  const restored = {
    monitor: await rectangle(monitor),
    panel: await rectangle(shell),
  }
  expectAligned(restored.panel.width, expanded.panel.width)
  await attachGeometry(testInfo, { expanded, collapsed, restored })
})

test("wide Debugger uses meaningful root scrolling without phantom width", async ({ page }, testInfo) => {
  await openDesktop(page, { width: 1024, height: 700 })
  await page.locator(".desktop-panel-width-toggle").click()
  await selectTab(page, "Debugging")

  const layout = page.locator(".desktop-emulator-layout")
  const panel = page.locator(".desktop-panel-shell")
  const before = {
    documentWidth: await page.evaluate(() => document.documentElement.scrollWidth),
    viewportWidth: await page.evaluate(() => window.innerWidth),
    layout: await rectangle(layout),
    panel: await rectangle(panel),
  }
  expect(Math.abs(before.documentWidth - before.layout.right))
    .toBeLessThanOrEqual(2)
  expect(before.documentWidth).toBeGreaterThan(before.viewportWidth)

  await page.mouse.wheel(2_000, 0)
  await expect.poll(() => page.evaluate(() => window.scrollX)).toBeGreaterThan(0)
  const afterHorizontal = {
    scrollX: await page.evaluate(() => window.scrollX),
    panel: await rectangle(panel),
  }
  expect(afterHorizontal.panel.right).toBeLessThanOrEqual(before.viewportWidth + 1)

  await page.locator(".desktop-panel-content-debug").hover()
  await page.mouse.wheel(0, 2_000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await attachGeometry(testInfo, {
    before,
    afterHorizontal,
    scrollY: await page.evaluate(() => window.scrollY),
  })
})

const expectOverlayAbovePoint = async (
  overlay: Locator,
  target: Locator,
) => {
  const targetBox = await rectangle(target)
  expect(await overlay.evaluate((element, point) => {
    const top = document.elementFromPoint(point.x, point.y)
    return top !== null && element.contains(top)
  }, {
    x: targetBox.x + targetBox.width / 2,
    y: Math.min(100, targetBox.y + targetBox.height / 2),
  })).toBe(true)
}

test("primary configuration dialogs appear above the side panel", async ({ page }) => {
  await openDesktop(page)
  await page.locator(".control-panel-two-rows button[title=\"Display Settings\"]").click()
  const overlay = page.locator(".desktop-primary-column .modal-overlay")
  await expect(overlay).toBeVisible()
  await expectOverlayAbovePoint(overlay, page.locator(".desktop-panel-shell"))
})

test("Agent configuration dialogs center over the Agent panel", async ({ page }, testInfo) => {
  await openDesktop(page)
  await selectTab(page, "Agent")
  await page.locator(".agent-controls button[title=\"Change configuration\"]").click()
  const overlay = page.locator(".desktop-panel-shell .modal-overlay")
  const shell = page.locator(".desktop-panel-shell")
  const dialog = page.locator(".agent-config-dialog")
  await expect(overlay).toBeVisible()
  const panelBox = await rectangle(shell)
  const dialogBox = await rectangle(dialog)
  expectAligned(dialogBox.x + dialogBox.width / 2, panelBox.x + panelBox.width / 2)
  expectAligned(dialogBox.y + dialogBox.height / 2, panelBox.y + panelBox.height / 2)
  expect(Number(await shell.evaluate(element => getComputedStyle(element).zIndex)))
    .toBeGreaterThan(Number(await page.locator(".desktop-primary-column")
      .evaluate(element => getComputedStyle(element).zIndex)))
  await attachGeometry(testInfo, { panelBox, dialogBox })
})

test("collects browser errors before page interaction", async ({ page, browserFailures }) => {
  const probe = "layout-acceptance-error-probe"
  await page.goto("/?color=white")
  await page.evaluate(message => console.error(message), probe)
  await expect.poll(() => browserFailures.includes(`console: ${probe}`)).toBe(true)
  browserFailures.splice(browserFailures.indexOf(`console: ${probe}`), 1)
})

for (const viewport of [
  { name: "normal", width: 1200, height: 800 },
  { name: "short", width: 1200, height: 600 },
  { name: "narrow", width: 900, height: 700 },
]) {
  test(`${viewport.name} desktop viewport retains usable panel controls`, async ({ page }, testInfo) => {
    await openDesktop(page, viewport)
    const shell = page.locator(".desktop-panel-shell")
    const collapseToggle = page.locator(".desktop-panel-collapse-toggle")
    const before = {
      panel: await rectangle(shell),
      monitor: await rectangle(page.locator(".main-canvas")),
      document: await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      })),
    }
    expect(before.panel.width).toBeGreaterThan(100)
    expect(before.panel.height).toBeGreaterThan(100)

    await collapseToggle.click()
    await expect(collapseToggle).toHaveAttribute("aria-expanded", "false")
    await collapseToggle.click()
    await expect(collapseToggle).toHaveAttribute("aria-expanded", "true")
    await attachGeometry(testInfo, { viewport, before })
  })
}

test("keeps the touch monitor stable across horizontal debug tabs", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, "ontouchstart", {
      configurable: true,
      value: null,
    })
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?color=white")
  await expect(page.locator(".desktop-emulator-layout")).toHaveCount(0)
  await settleLayout(page)

  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const canvasBefore = await rectangle(page.locator("#apple2canvas"))
  expectAligned(canvasBefore.width, viewportWidth)

  const language = await rectangle(page.locator("button[title*=\"Language\"]"))
  const secondRow = await rectangle(page.locator(".control-panel-row").nth(1))
  expect(language.y).toBeGreaterThanOrEqual(secondRow.y)
  expect(language.bottom).toBeLessThanOrEqual(secondRow.bottom + 1)
  await page.locator("button[title*=\"Language\"]").click()
  const languageLabelPositions = await page.locator(
    ".modal-overlay > .floating-dialog > .droplist-option .popup-item-label",
  ).evaluateAll(elements => elements.map(element => element.getBoundingClientRect().x))
  expect(languageLabelPositions).toHaveLength(14)
  expect(Math.max(...languageLabelPositions) - Math.min(...languageLabelPositions))
    .toBeLessThanOrEqual(1)
  await page.locator(".modal-overlay").click({ position: { x: 1, y: 1 } })
  await expect(page.locator(".modal-overlay")).toHaveCount(0)
  const deviceRow = await rectangle(page.locator(".mobile-device-row"))
  const divider = await rectangle(page.locator(".mobile-divider"))
  expect(divider.y - deviceRow.bottom).toBeGreaterThanOrEqual(0)
  const mobileStatus = page.locator(".mobile-status")
  const status = await rectangle(mobileStatus)
  const panel = await rectangle(page.locator("#debug-section"))
  expect(status.y).toBeGreaterThanOrEqual(panel.bottom)
  expect(status.right).toBeLessThanOrEqual(viewportWidth)

  await selectTouchTabAndWaitForResize(page, "Debugging")
  const canvasDebug = await rectangle(page.locator("#apple2canvas"))
  const debugScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  await selectTouchTabAndWaitForResize(page, "Help")
  const canvasInfo = await rectangle(page.locator("#apple2canvas"))
  expectAligned(canvasDebug.width, canvasBefore.width)
  expectAligned(canvasInfo.width, canvasBefore.width)
  expect(debugScrollWidth).toBeLessThanOrEqual(viewportWidth)
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(viewportWidth)

  await selectTouchTabAndWaitForResize(page, "Agent")
  await page.locator("button[title=\"Change configuration\"]").click()
  const agentDialog = page.locator(".agent-config-dialog")
  await expect(agentDialog).toBeVisible()
  await expect(page.locator(".agent-config-overlay-mobile")).toHaveCSS("position", "fixed")
  const agentDialogBox = await rectangle(agentDialog)
  const portraitAgentDialogContent = await agentDialog.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(portraitAgentDialogContent.scrollHeight)
    .toBeLessThanOrEqual(portraitAgentDialogContent.clientHeight + 1)
  expect(agentDialogBox.y).toBeGreaterThanOrEqual(0)
  expect(agentDialogBox.bottom).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerHeight),
  )
  await agentDialog.locator("button").first().click()
  await expect(agentDialog).toHaveCount(0)

  await page.setViewportSize({ width: 844, height: 390 })
  await settleLayout(page)
  const landscapeViewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const landscapeCanvas = await rectangle(page.locator("#apple2canvas"))
  const landscapeSidebar = await rectangle(page.locator(".mobile-landscape-sidebar"))
  const landscapePanel = await rectangle(page.locator("#debug-section"))
  const landscapeStatus = await rectangle(mobileStatus)
  expect(landscapeCanvas.width + landscapeSidebar.width).toBeLessThanOrEqual(landscapeViewportWidth)
  expect(landscapeSidebar.right).toBeLessThanOrEqual(landscapeViewportWidth)
  expect(landscapeStatus.y).toBeGreaterThanOrEqual(landscapePanel.bottom)
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(landscapeViewportWidth)

  await page.locator("button[title=\"Change configuration\"]").click()
  const landscapeAgentDialogLocator = page.locator(".agent-config-dialog")
  const landscapeAgentDialog = await rectangle(landscapeAgentDialogLocator)
  const landscapeAgentDialogContent = await landscapeAgentDialogLocator.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(landscapeAgentDialogContent.scrollHeight)
    .toBeLessThanOrEqual(landscapeAgentDialogContent.clientHeight + 1)
  await page.locator(".agent-config-dialog button").first().click()

  await page.setViewportSize({ width: 844, height: 330 })
  await settleLayout(page)
  const browserChromeCanvas = await rectangle(page.locator("#apple2canvas"))
  expectAligned(browserChromeCanvas.width, landscapeCanvas.width)
  expectAligned(browserChromeCanvas.height, landscapeCanvas.height)

  // A page initially opened while browser chrome consumes viewport height must
  // still grow when that space becomes visible. Reload to clear the remembered
  // landscape maximum before exercising the inverse transition.
  await page.reload()
  await settleLayout(page)
  const initiallyContractedCanvas = await rectangle(page.locator("#apple2canvas"))
  await page.setViewportSize({ width: 844, height: 390 })
  await settleLayout(page)
  const expandedCanvas = await rectangle(page.locator("#apple2canvas"))
  expect(expandedCanvas.height).toBeGreaterThan(initiallyContractedCanvas.height)
  expect(expandedCanvas.width).toBeGreaterThan(initiallyContractedCanvas.width)
  await attachGeometry(testInfo, {
    canvasBefore,
    canvasDebug,
    canvasInfo,
    browserChromeCanvas,
    initiallyContractedCanvas,
    expandedCanvas,
    deviceRow,
    divider,
    debugScrollWidth,
    language,
    languageLabelPositions,
    agentDialogBox,
    landscapeCanvas,
    landscapeAgentDialog,
    landscapeAgentDialogContent,
    landscapePanel,
    landscapeSidebar,
    landscapeStatus,
    landscapeViewportWidth,
    panel,
    secondRow,
    status,
    portraitAgentDialogContent,
    viewportWidth,
  })
})
