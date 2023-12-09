import { checkBreakpointExpression } from "./breakpoint";

const testBP = (expression: string) => {
  return checkBreakpointExpression(expression)
}

test('validBreakpointExpression', () => {
  expect(testBP("A == 0x20")).toEqual('')
  expect(testBP("A ==")).toEqual('Syntax error in expression')
  expect(testBP("2 + 2")).toEqual('Expression must evaluate to true or false')
  expect(testBP("A == #$2F")).toEqual('')
  expect(testBP("A == X && X == Y && Y == P && P == S")).toEqual('')
  expect(testBP("$2F == 1")).toEqual('')
  expect(testBP("$1234 == 1")).toEqual('')
});
