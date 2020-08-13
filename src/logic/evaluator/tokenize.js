"use strict";
/**
 * An S-exp tokenizer for the student languages.
 *
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and reader must handle '().
 * @todo The tokenizer should remove the quotes around a string.
 * @todo The tokenizer should transform booleans
 */
exports.__esModule = true;
var types_1 = require("../types");
// Regexp Definitions.
exports.tokenExpressions = [
    [types_1.TokenType.OpenParen, /^\(/],
    [types_1.TokenType.OpenSquareParen, /^\[/],
    [types_1.TokenType.OpenBraceParen, /^\{/],
    [types_1.TokenType.CloseParen, /^\)/],
    [types_1.TokenType.CloseSquareParen, /^]/],
    [types_1.TokenType.CloseBraceParen, /^}/],
    [types_1.TokenType.Number, /^\d+/],
    [types_1.TokenType.String, /^"[^"]*"/],
    [types_1.TokenType.Identifier, /^[^",'`\(\)\[\]{};#\s]+/],
    [types_1.TokenType.Whitespace, /^\s+/],
    [types_1.TokenType.Boolean, /^#t\b|#T\b|#f\b|#F\b|#true\b|#false\b/]
];
/**
 * Transforms a string into a list of tokens.
 * @param exp expression as a string
 */
exports.tokenize = function (exp) {
    if (exp == '') {
        return [];
    }
    for (var _i = 0, tokenExpressions_1 = exports.tokenExpressions; _i < tokenExpressions_1.length; _i++) {
        var _a = tokenExpressions_1[_i], tokenType = _a[0], expression = _a[1];
        var result = expression.exec(exp);
        if (result) {
            var firstToken_1 = [{ type: tokenType, token: result[0] }];
            var restString_1 = exp.slice(result[0].length);
            return firstToken_1.concat(exports.tokenize(restString_1));
        }
    }
    var firstToken = [{ tokenError: 'Unidentified Token', string: exp[0] }];
    var restString = exp.slice(1);
    return firstToken.concat(exports.tokenize(restString));
};
module.exports.tokenize = exports.tokenize;
