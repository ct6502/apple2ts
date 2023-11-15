import { validBreakpointExpression } from "./utility";

test('validBreakpointExpression', () => {
  const vbe = validBreakpointExpression
  expect(vbe("A == 0x20")).toEqual('')
  expect(vbe("A ==")).toEqual('Syntax error in expression')
  expect(vbe("2 + 2")).toEqual('Expression must evaluate to true or false')
  expect(vbe("A == #$2F")).toEqual('')
  expect(vbe("A == X && X == Y && Y == P && P == S")).toEqual('')
  expect(vbe("$2F == 1")).toEqual('')
  expect(vbe("$1234 == 1")).toEqual('')
});
