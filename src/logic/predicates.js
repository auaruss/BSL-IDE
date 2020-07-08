"use strict";
exports.__esModule = true;
var types_1 = require("./types");
// Checks to see if a specific DefOrExpr is an Expr.
exports.defOrExprIsExpr = function (d) {
    return (!exports.isDefinition(d));
};
// Tells whether x is an Atom.
exports.isAtom = function (x) {
    if (!(typeof x === "object"))
        return false;
    if (!(typeof x.type === "string"))
        return false;
    return ((x.type === types_1.AtomType.String && (typeof x.value === "string"))
        || (x.type === types_1.AtomType.Number && (typeof x.value === "number"))
        || (x.type === types_1.AtomType.Identifier && (typeof x.value === "string"))
        || (x.type === types_1.AtomType.Boolean && (typeof x.value === "boolean")));
};
// Tells whether x is a Bool.
exports.isBool = function (x) {
    return exports.isAtom(x) && x.type === types_1.AtomType.Boolean;
};
// Tells whether x is a Definition.
exports.isDefinition = function (x) {
    return Array.isArray(x) && x.length > 0 && x[0] === 'define';
};
// Determines whether a Result is a ResultFailure.
exports.isFailure = function (result) {
    return result.error !== undefined;
};
// Tells whether x is an Id.
exports.isId = function (x) {
    return exports.isAtom(x) && x.type === types_1.AtomType.Identifier;
};
// Tells whether x is a Str.
exports.isStr = function (x) {
    return exports.isAtom(x) && x.type === types_1.AtomType.String;
};
// Determines whether a Result is a ResultSuccess.
exports.isSuccess = function (result) {
    return result.thing !== undefined;
};
// Tells whether x is a Num.
exports.isNum = function (x) {
    return exports.isAtom(x) && x.type === types_1.AtomType.Number;
};
// Tells whether x is a number[].
exports.isNumberArray = function (x) {
    if (!Array.isArray(x))
        return false;
    return x.every(function (_) { return typeof _ === 'number'; });
};
// Tells whether x is an Id[].
exports.isIdArray = function (x) {
    return Array.isArray(x) && x.every(exports.isId);
};
