"use strict";
exports.__esModule = true;
exports.isTokenError = function (x) {
    if (!(typeof x === 'object'))
        return false;
    if (!(x.tokenError && typeof x.tokenError === 'string'))
        return false;
    if (!x.string)
        return false;
    return x.tokenError === 'Unidentified Token';
};
exports.isReadError = function (x) {
    if (exports.isTokenError(x))
        return true;
    if (!(typeof x === 'object'))
        return false;
    if (!(x.readError && typeof x.readError === 'string'))
        return false;
    if (!x.tokens)
        return false;
    return x.readError === 'No Valid SExp'
        || x.readError === 'No Closing Paren'
        || x.readError === 'No Open Paren'
        || x.readError === 'Mismatched Parens';
};
exports.isExprError = function (x) {
    if (exports.isReadError(x))
        return true;
    if (!(typeof x === 'object'))
        return false;
    if (!(x.exprError && typeof x.exprError === 'string'))
        return false;
    if (!x.sexps)
        return false;
    return x.exprError === 'Empty Expr'
        || x.exprError === 'Defn inside Expr'
        || x.exprError === 'No function name after open paren'
        || x.exprError === 'Function call with no arguments';
};
// Checks to see if a specific DefOrExpr is an Expr.
exports.defOrExprIsExpr = function (d) {
    return (!exports.isDefinition(d));
};
// Tells whether x is a Definition.
exports.isDefinition = function (x) {
    return Array.isArray(x) && x.length > 0 && x[0] === 'define';
};
exports.defOrExprArrayIsExprArray = function (ds) {
    return ds.every(exports.defOrExprIsExpr);
};
