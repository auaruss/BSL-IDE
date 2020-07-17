"use strict";
// Types used in the student language evaluator.
exports.__esModule = true;
// | TokenError;
var TokenType;
(function (TokenType) {
    TokenType["OpenParen"] = "OpenParen";
    TokenType["OpenSquareParen"] = "OpenSquareParen";
    TokenType["OpenBraceParen"] = "OpenBraceParen";
    TokenType["CloseParen"] = "CloseParen";
    TokenType["CloseSquareParen"] = "CloseSquareParen";
    TokenType["CloseBraceParen"] = "CloseBraceParen";
    TokenType["Number"] = "Number";
    TokenType["String"] = "String";
    TokenType["Identifier"] = "Identifier";
    TokenType["Whitespace"] = "Whitespace";
    TokenType["Boolean"] = "Boolean";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
;
// ----------------------------------------------------------------------------
var AtomType;
(function (AtomType) {
    AtomType["String"] = "String";
    AtomType["Number"] = "Number";
    AtomType["Boolean"] = "Boolean";
    AtomType["Identifier"] = "Identifier";
})(AtomType = exports.AtomType || (exports.AtomType = {}));
;
var ValueType;
(function (ValueType) {
    ValueType["NonFunction"] = "NonFunction";
    ValueType["BuiltinFunction"] = "BuiltinFunction";
    ValueType["Function"] = "Function";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
;
