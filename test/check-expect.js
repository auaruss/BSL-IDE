const { expect } = require('chai');

const checkExpect = (res, expected) => {
  expect(res).to.deep.equal(expected);
}

function checkExpectMultiple(f, res, expected) {
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
})

module.exports = {
  checkExpect: checkExpect,
  checkExpectMultiple, checkExpectMultiple
}