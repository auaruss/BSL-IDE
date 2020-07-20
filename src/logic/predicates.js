"use strict";
exports.__esModule = true;
exports.isTokenError = function (x) {
    if (!(typeof x === 'object'))
        return false;
    if (!(x.error && typeof x.error === 'string'))
        return false;
    if (!(x.value && typeof x.value === 'string'))
        return false;
    return x.error === 'Unidentified Token';
};
// Checks to see if a specific DefOrExpr is an Expr.
exports.defOrExprIsExpr = function (d) {
    return (!exports.isDefinition(d));
};
// Tells whether x is a Definition.
exports.isDefinition = function (x) {
    return Array.isArray(x) && x.length > 0 && x[0] === 'define';
};
