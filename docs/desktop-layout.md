# Desktop Layout Behavior

The desktop layout keeps the emulator usable while its side-panel content
changes size. These rules describe visible behavior rather than a particular
CSS implementation.

## Stable geometry

- Switching tabs does not move or resize the monitor, panel shell, tab rail,
  layout controls, or fixed virtual-keyboard control.
- BASIC, exPectin, and Agent keep their primary action rows at the same vertical
  position within a given panel orientation.
- Showing BASIC variables appends the variable table below the primary BASIC
  workspace. It does not move or resize the editor or action row, and the
  appended table uses document scrolling rather than adding a tab scrollbar.
- BASIC, exPectin, and Agent action rows remain fully visible in both normal
  and wide modes. Showing BASIC variables also leaves its header visible.
- The normal panel starts at a compact minimum and consumes width left unused
  after the monitor reaches its height limit. Long translated Help actions may
  wrap at that minimum. Wide mode may take
  additional width from the monitor, but the panel remains inside the available
  desktop row until that row reaches its minimum supported width. Tab content
  does not choose either width.

## Viewport anchors

- The monitor remains fixed while a side panel makes the document scroll
  vertically.
- The side-panel tab rail and layout controls belong to the same panel plane.
  They stay put with a pinned panel; when the Debugger or
  BASIC variables extend the document, the layout controls do not remain
  pinned over the scrolling tabs.
- Ordinary bounded tabs remain pinned with the monitor and do not create
  document scrolling. The Debugger and an expanded BASIC variable table may
  extend the document when their content needs the space.
- Collapsing the side panel keeps the yellow restore control at the same
  vertical position and releases the panel's grid track.
- Moving the panel changes the layout immediately and scrolls only far enough
  to reveal the relocated tab and layout-control row. The move does not use a
  decorative transition.

## Scroll ownership

- Every visible scrollbar reveals content along its axis.
- Bounded tab content uses the panel's internal scrolling.
- Content deliberately taller or wider than the panel, such as the wide
  Debugger or BASIC variables, can use document scrolling.
- Nested scrolling remains limited to the controls needed to reach distinct
  content. Empty or duplicate scroll ranges are defects.

## Debug overlays

- The HGR magnifier uses viewport coordinates and keeps the same dimensions
  regardless of the content underneath it.
- The magnifier paints above the monitor and panel controls, but below dialogs.
- Leaving an HGR memory range or leaving the Debugger removes the magnifier.

## Primary status and devices

- The monitor, emulator controls, devices, and status readout share
  one fixed primary footprint.
- The monitor receives the available height first. The compact control and
  device rows follow it. When viewport height limits the monitor, the device
  controls end at the page's bottom margin.
- The status readout fits beside the controls, while the device row uses the
  full width below them.
- The device row scales its disk and printer controls enough to show them
  without its own scrollbar.
- Narrow desktop windows preserve the device row's minimum width and let the
  page scroll horizontally instead of clipping controls.
- Panel-owned dialogs are centered over their panel and paint above the primary
  column.

## Acceptance

`npm run test:ui-layout` verifies geometry relationships, scroll ownership,
state transitions, input behavior, overlays, and browser errors in an isolated
Chromium context. Unit tests continue to own exact layout-policy calculations.

Human review remains responsible for visual balance, typography and translated
text fit, native browser zoom, Safari, Electron, and real touch gestures.
