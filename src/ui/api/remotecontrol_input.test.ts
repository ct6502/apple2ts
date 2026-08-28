import { parseRemoteKeyboardState } from "./remotecontrol_input"

test.each([
  [{key: "j", isDown: true, repeat: false}, {key: 0x6A, isDown: true, repeat: false}],
  [{key: " ", isDown: true, repeat: true}, {key: 0x20, isDown: true, repeat: true}],
  [{key: 0x41, isDown: false}, {key: 0x41, isDown: false, repeat: false}],
])("parses remote keyboard state", (payload, expected) => {
  expect(parseRemoteKeyboardState(payload)).toEqual(expected)
})
