'use strict';
var isSuccess = function (result) {
    return result.thing !== undefined;
};
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
})(TokenType || (TokenType = {}));
;
// Regexp Definitions.
var tokenExpressions = [
    [TokenType.OpenParen, /^\(/],
    [TokenType.OpenSquareParen, /^\[/],
    [TokenType.OpenBraceParen, /^\{/],
    [TokenType.CloseParen, /^\)/],
    [TokenType.CloseSquareParen, /^]/],
    [TokenType.CloseBraceParen, /^}/],
    [TokenType.Number, /^\d+/],
    [TokenType.String, /^".*"/],
    [TokenType.Identifier, /^[^",'`\(\)\[\]{};#\+\s]+/],
    [TokenType.Whitespace, /^\s+/],
    [TokenType.Boolean, /^#t\b|#T\b|#f\b|#F\b|#true\b|#false\b/]
];
var tokenize = function (exp) {
    if (exp == '') {
        return [];
    }
    for (var _i = 0, tokenExpressions_1 = tokenExpressions; _i < tokenExpressions_1.length; _i++) {
        var _a = tokenExpressions_1[_i], tokenType = _a[0], expression = _a[1];
        if (expression.test(exp)) {
            var result = expression.exec(exp);
            return [{ type: tokenType, value: result ? result[0] : '' }]
                .concat(tokenize(result ? result.input.slice(result[0].length) : ''));
        }
    }
    return [{ type: TokenType.Error, value: exp[0] }]
        .concat(tokenize(exp.slice(1)));
};
// type SExp = string | SExp[];
// type Result<T>
//   = {
//   thing: T,
//   remain: Token[]
// } | {
//   error: string,
//   remain: Token[]
// };
var parseSexp = function (tokens) {
    if (tokens.length === 0)
        return { thing: [], remain: [] };
    switch (tokens[0].type) {
        case TokenType.OpenParen:
        case TokenType.OpenSquareParen:
        case TokenType.OpenBraceParen:
            var partsOfSexp = parseSexps(tokens.slice(1));
            if (isSuccess(partsOfSexp)) {
                if (isClosingParen(partsOfSexp.remain[0])) {
                    return ({
                        thing: partsOfSexp.thing,
                        remain: partsOfSexp.remain.slice(1)
                    });
                }
                else {
                    return ({
                        thing: [],
                        remain: tokens
                    });
                }
            } // else handle failure here
            break;
        case TokenType.CloseParen:
        case TokenType.CloseSquareParen:
        case TokenType.CloseBraceParen:
        // return {thing: [], remain: tokens};
        case TokenType.Number:
        case TokenType.String:
        case TokenType.Identifier:
        case TokenType.Boolean:
            return {
                thing: tokens[0],
                remain: tokens.slice(1)
            };
    }
    throw new Error('dunno?');
    // return {
    //   : 'dunno?',
    //   remain: tokens
    // };
};
var parseSexps = function (tokens) {
    if (tokens.length === 0)
        return { thing: [], remain: [] };
    var result = parseSexp(tokens);
    if (isSuccess(result)) {
        var nextParse = parseSexps(result.remain);
        if (isSuccess(nextParse)) {
            return ({
                thing: [result.thing].concat(nextParse.thing),
                remain: nextParse.remain
            });
        }
    } // else handle failure here
};
var parse = function (exp) {
    var parsed = parseSexps(tokenize(exp).filter(function (x) { return x.type !== TokenType.Whitespace; }));
    if (isSuccess(parsed)) {
        return parsed.thing;
    }
};
var isClosingParen = function (t) {
    if (t.type) {
        return (t.type === TokenType.CloseParen
            || t.type === TokenType.CloseSquareParen
            || t.type === TokenType.CloseBraceParen);
    }
    return false;
};
module.exports = {
    'tokenize': tokenize,
    'parse': parse,
    'parseSexp': parseSexp,
    'parseSexps': parseSexps
};
