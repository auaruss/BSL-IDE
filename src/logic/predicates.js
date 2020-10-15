"use strict";
exports.__esModule = true;
exports.isBindingError = exports.isValueError = exports.isEnv = exports.isBinding = exports.isClos = exports.isValue = exports.isExprValue = exports.isDefinitionResult = exports.isResult = exports.isExprError = exports.isDefinitionError = exports.isExprArray = exports.isExpr = exports.isDefinition = exports.isDefOrExpr = exports.isReadError = exports.isSExp = exports.isTokenError = exports.isToken = void 0;
exports.isToken = function (x) {
    return (typeof x === 'object'
        && (x.type === 'OpenParen'
            || x.type === 'OpenSquareParen'
            || x.type === 'OpenBraceParen'
            || x.type === 'CloseParen'
            || x.type === 'CloseSquareParen'
            || x.type === 'CloseBraceParen'
            || x.type === 'Number'
            || x.type === 'String'
            || x.type === 'Identifier'
            || x.type === 'Whitespace'
            || x.type === 'Boolean')
        && typeof x.token === 'string') || exports.isTokenError(x);
};
exports.isTokenError = function (x) {
    return typeof x === 'object'
        && x.tokenError === 'Unidentified Token'
        && typeof x.string === 'string';
};
// ----------------------------------------------------------------------------
exports.isSExp = function (x) {
    return (typeof x === 'object'
        && (x.type === 'SExp Array'
            && Array.isArray(x.sexp)
            && x.sexp.every(exports.isSExp))
        || (x.type === 'String'
            && typeof x.sexp === 'string')
        || (x.type === 'Num'
            && typeof x.sexp === 'number')
        || (x.type === 'Id'
            && typeof x.sexp === 'string')
        || (x.type === 'Bool'
            && typeof x.sexp === 'boolean')) || exports.isReadError(x);
};
exports.isReadError = function (x) {
    return (typeof x === 'object'
        && (x.readError === 'No Valid SExp'
            || x.readError === 'No Closing Paren'
            || x.readError === 'No Open Paren'
            || x.readError === 'Mismatched Parens')
        && Array.isArray(x.tokens)
        && x.tokens.every(exports.isToken))
        || exports.isTokenError(x);
};
// ----------------------------------------------------------------------------
exports.isDefOrExpr = function (x) {
    return exports.isDefinition(x) || exports.isExpr(x);
};
exports.isDefinition = function (x) {
    return (typeof x === 'object'
        && (x.type === 'define-constant'
            || (x.type === 'define-function'
                && x.params && x.params.every(function (_) { return typeof _ === 'string'; })))
        && exports.isExpr(x.body)) || exports.isDefinitionError(x);
};
exports.isExpr = function (x) {
    return (typeof x === 'object'
        && x.type
        || (x.type === 'String'
            && typeof x["const"] === 'string')
        || (x.type === 'Num'
            && typeof x["const"] === 'number')
        || (x.type === 'Id'
            && typeof x["const"] === 'string')
        || (x.type === 'Bool'
            && typeof x["const"] === 'boolean')
        || (x.type === 'Call'
            && typeof x.op === 'string'
            && Array.isArray(x.args)
            && x.args.every(exports.isExpr))) || exports.isExprError(x);
};
exports.isExprArray = function (x) {
    return Array.isArray(x) && x.every(exports.isExpr);
};
var isCall = function (x) {
    return typeof x === 'object'
        && typeof x.op === 'string'
        && Array.isArray(x.args)
        && x.args.every(exports.isExpr);
};
exports.isDefinitionError = function (x) {
    return (typeof x === 'object'
        && (x.defnError === 'Invalid expression passed where function name was expected'
            || x.defnError === 'Invalid expression passed where function argument was expected'
            || x.defnError === 'A definition requires two parts, but found none'
            || x.defnError === 'A definition requires two parts, but found one'
            || x.defnError === 'Passed a non-definition as definition'
            || x.defnError === 'Expected a variable name, or a function header'
            || x.defnError === 'Expected a function header with parameters in parentheses, received nothing in parentheses'
            || x.defnError === 'Expected a function header with parameters in parentheses, received a function name with no parameters'
            || x.defnError === 'A function in BSL cannot have zero parameters'
            || x.defnError === 'A definition can\'t have more than 3 parts'
            || x.defnError === 'Cannot have a definition as the body of a definition'
            || x.defnError === 'The body given is not a valid Expr')
        && Array.isArray(x.sexps)
        && x.sexps.every(exports.isSExp))
        || exports.isReadError(x);
};
exports.isExprError = function (x) {
    return (typeof x === 'object'
        && (x.exprError === 'Empty Expr'
            || x.exprError === 'Defn inside Expr'
            || x.exprError === 'No function name after open paren'
            || x.exprError === 'Function call with no arguments')
        && Array.isArray(x.sexps)
        && x.sexps.every(exports.isSExp))
        || exports.isReadError(x);
};
// ----------------------------------------------------------------------------
exports.isResult = function (x) {
    return exports.isDefinitionResult(x) || exports.isExprValue(x);
};
exports.isDefinitionResult = function (x) {
    return exports.isBinding(x) || exports.isBindingError(x);
};
exports.isExprValue = function (x) {
    return exports.isValue(x) || exports.isValueError(x);
};
exports.isValue = function (x) {
    return typeof x === 'object'
        && ((x.type === 'NonFunction'
            && (typeof x.value === 'string'
                || typeof x.value === 'number'
                || typeof x.value === 'boolean'))
            || (x.type === 'BuiltinFunction'
                && typeof x.value === 'function')
            || (x.type === 'Function'
                && exports.isClos(x.value)));
};
exports.isClos = function (x) {
    return typeof x === 'object'
        && Array.isArray(x.args)
        && x.args.every(function (_) { return typeof _ === 'string'; })
        && exports.isEnv(x.env)
        && exports.isExpr(x.body);
};
exports.isBinding = function (x) {
    return typeof x === 'object'
        && x.type === 'define'
        && typeof x.defined === 'string'
        && exports.isExprValue(x.toBe);
};
exports.isEnv = function (x) {
    return x instanceof Map;
};
exports.isValueError = function (x) {
    return (typeof x === 'object'
        && x.valueError === 'Id not in environment'
        && Array.isArray(x.deforexprs)
        && x.deforexprs.every(exports.isDefOrExpr))
        || exports.isExprError(x);
};
exports.isBindingError = function (x) {
    return (typeof x === 'object'
        && x.bindingError === 'Repeated definition of the same name'
        && exports.isDefinition(x.definition))
        || exports.isDefinitionError(x);
};
