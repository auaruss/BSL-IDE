"use strict";
// Types, enums and related predicates used in the student language evaluator.
// Sorted alphabetically.
exports.__esModule = true;
var AtomType;
(function (AtomType) {
    AtomType["String"] = "String";
    AtomType["Number"] = "Number";
    AtomType["Boolean"] = "Boolean";
    AtomType["Identifier"] = "Identifier";
})(AtomType = exports.AtomType || (exports.AtomType = {}));
;
var TokenType;
(function (TokenType) {
    TokenType["Error"] = "Error";
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
var ValueType;
(function (ValueType) {
    ValueType["NonFunction"] = "NonFunction";
    ValueType["BuiltinFunction"] = "BuiltinFunction";
    ValueType["Function"] = "Function";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
;
