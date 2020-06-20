'use strict';
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
        return { thing: [], remain: tokens };
    switch (tokens[0].type) {
        case TokenType.OpenParen:
        case TokenType.OpenSquareParen:
        case TokenType.OpenBraceParen:
            var lookForMatchingParenIndex = matchParens(tokens);
            if (lookForMatchingParenIndex === -1) {
                return { error: 'Too few parens in prefix Sexp.', remain: tokens };
            }
            if (!parensMatching(tokens[0].type, tokens[lookForMatchingParenIndex].type)) {
                return { error: 'The wrong type of paren is matching your prefix paren.', remain: tokens };
            }
            return {
                thing: parseSexps(tokens.slice(1, lookForMatchingParenIndex)),
                remain: tokens.slice(lookForMatchingParenIndex + 1)
            };
        case TokenType.CloseParen:
        case TokenType.CloseSquareParen:
        case TokenType.CloseBraceParen:
            return { error: 'Found a close paren with no match.', remain: tokens };
        case TokenType.Number:
        case TokenType.String:
        case TokenType.Identifier:
        case TokenType.Boolean:
            return {
                thing: tokens[0],
                remain: tokens.slice(1)
            };
    }
    return {
        error: 'dunno?',
        remain: tokens
    };
};
var parseSexps = function (tokens) {
    var result = parseSexp(tokens);
    if (tokens.length === 0)
        return [];
    if (result.thing) {
        return [result.thing].concat(parseSexps(result.remain));
    }
    else {
        throw new Error(result.error);
    }
};
var parse = function (exp) {
    return parseSexps(tokenize(exp).filter(function (x) { return x.type !== TokenType.Whitespace; }));
};
// This function can ONLY be guaranteed to work when tokens[0] is a left paren!
var matchParens = function (tokens) {
    var leftParens = 1, i = 1;
    while (leftParens > 0 && i < tokens.length) {
        if (tokens[i].type === TokenType.OpenParen
            || tokens[i].type === TokenType.OpenSquareParen
            || tokens[i].type === TokenType.OpenBraceParen) {
            leftParens += 1;
        }
        else if (tokens[i].type === TokenType.CloseParen
            || tokens[i].type === TokenType.CloseSquareParen
            || tokens[i].type === TokenType.CloseBraceParen) {
            leftParens -= 1;
        }
        i++;
    }
    return (leftParens > 0) ? -1 : i - 1;
};
var parensMatching = function (p1, p2) {
    if (p1 === TokenType.OpenParen)
        return p2 === TokenType.CloseParen;
    if (p1 === TokenType.OpenSquareParen)
        return p2 === TokenType.CloseSquareParen;
    if (p1 === TokenType.OpenBraceParen)
        return p2 === TokenType.CloseBraceParen;
    return false;
};
module.exports = {
    'tokenize': tokenize,
    'parse': parse
};
