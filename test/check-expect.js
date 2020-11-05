"use strict";
exports.__esModule = true;
var expect = require('chai').expect;
function checkExpect(res, expected) {
    expect(res).to.deep.equal(expected);
}
exports.checkExpect = checkExpect;
function checkExpectMultiple(f, res, expected) {
    res.map(function (input, idx) { return checkExpect(f(input), expected[idx]); });
}
exports.checkExpectMultiple = checkExpectMultiple;
describe('checkExpectMultiple', function () {
    it('should test obviously equal things correctly', function () {
        checkExpectMultiple(function (x) { return x + 1; }, [1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7]);
    });
});
