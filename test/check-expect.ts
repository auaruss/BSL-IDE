const { expect } = require('chai');

export function checkExpect<T, U> (res: T, expected: U): void {
  expect(res).to.deep.equal(expected);
}

export function checkExpectMultiple<T, U> (f: (res: T) => U, res: T[], expected: U[]) {
  res.map((input, idx) => checkExpect(f(input), expected[idx]));
}

describe('checkExpectMultiple', () => {
  it('should test obviously equal things correctly', () => {
      checkExpectMultiple(
          x => x+1,
          [1, 2, 3, 4, 5, 6],
          [2, 3, 4, 5, 6, 7]
      )
  });
});