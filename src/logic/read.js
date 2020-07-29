'use strict';
exports.__esModule = true;
/**
 * An S-exp reader for the student languages.
 * @author: Alice Russell, Sam Soucie
 *
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and reader must handle '().
 * @todo The tokenizer should remove the quotes around a string.
 * @todo The tokenizer should transform booleans
 * @todo Rename read functions to read functions
 */
var types_1 = require("./types");
var predicates_1 = require("./predicates");
// Regexp Definitions.
var tokenExpressions = [
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
var tokenize = function (exp) {
    if (exp == '') {
        return [];
    }
    for (var _i = 0, tokenExpressions_1 = tokenExpressions; _i < tokenExpressions_1.length; _i++) {
        var _a = tokenExpressions_1[_i], tokenType = _a[0], expression = _a[1];
        var result = expression.exec(exp);
        if (result) {
            var firstToken_1 = [{ type: tokenType, token: result[0] }];
            var restString_1 = exp.slice(result[0].length);
            return firstToken_1.concat(tokenize(restString_1));
        }
    }
    var firstToken = [{ tokenError: 'Unidentified Token', string: exp[0] }];
    var restString = exp.slice(1);
    return firstToken.concat(tokenize(restString));
};
/**
 * Attempts to read the first SExp from a list of tokens.
 * @remark A failure is produced when no starting SExp is found.
 * @remark Note that this function does not deal with whitespace as we expect to always be calling read
 *         first and we deal with the whitespace completely in there.
 * @param tokens
 */
var readSexp = function (tokens) {
    if (tokens.length === 0) {
        return { thing: { readError: 'No Valid SExp', tokens: [] }, remain: [] };
    }
    var firstToken = tokens[0];
    if (predicates_1.isTokenError(firstToken)) {
        var result = {
            thing: firstToken,
            remain: tokens.slice(1)
        };
        return result;
    }
    else {
        switch (firstToken.type) {
            case types_1.TokenType.OpenParen:
            case types_1.TokenType.OpenSquareParen:
            case types_1.TokenType.OpenBraceParen:
                var readRest = readSexps(tokens.slice(1));
                // this means parseRest is the rest of the current SExp. so for
                // '(define hello 1) (define x 10)'
                // parseRest should be equal to
                // {
                //   thing: [Id('define'), Id('hello'), Num('1').
                //   remain: tokenize(') (define x 10)')
                // } (ignoring whitespace in the tokenization)
                // Note that parseRest always returns a success, so we can assume that an SExp exists at the
                // start of the expression if and only if the remain from parsing the rest starts with a closing paren
                // which matches our current open paren.
                // This also means if the remain is empty we return a failure.
                if (readRest.remain.length === 0) {
                    return {
                        thing: {
                            readError: 'No Closing Paren',
                            tokens: tokens
                        },
                        remain: []
                    };
                }
                else {
                    var firstUnprocessedToken = readRest.remain[0];
                    if (predicates_1.isTokenError(firstUnprocessedToken)) {
                        return { thing: { readError: 'No Valid SExp', tokens: [] }, remain: [] };
                    }
                    else if (firstUnprocessedToken.type === types_1.TokenType.CloseParen
                        || firstUnprocessedToken.type === types_1.TokenType.CloseSquareParen
                        || firstUnprocessedToken.type === types_1.TokenType.CloseBraceParen) {
                        if (parensMatch(firstToken.type, firstUnprocessedToken.type))
                            return { thing: readRest.thing, remain: readRest.remain.slice(1) };
                        return {
                            thing: { readError: 'Mismatched Parens', tokens: [firstToken, firstUnprocessedToken] },
                            remain: readRest.remain.slice(1)
                        };
                    }
                    else {
                        return { thing: { readError: 'No Valid SExp', tokens: [] }, remain: [] };
                    }
                }
            case types_1.TokenType.CloseParen:
            case types_1.TokenType.CloseSquareParen:
            case types_1.TokenType.CloseBraceParen:
                return { thing: { readError: 'No Open Paren', tokens: [firstToken] }, remain: tokens.slice(1) };
            case types_1.TokenType.Number:
                return {
                    thing: {
                        type: 'Num',
                        sexp: Number(firstToken.token)
                    },
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.String:
                return {
                    thing: {
                        type: 'String',
                        sexp: firstToken.token.slice(1, -1) // removes "" from string
                    },
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Identifier:
                return {
                    thing: {
                        type: 'Id',
                        sexp: firstToken.token
                    },
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Boolean:
                return {
                    thing: whichBool(firstToken),
                    remain: tokens.slice(1)
                };
            default:
                return readSexp(tokens.slice(1));
        }
    }
};
/**
 * Reads as many SExp as possible from the start of the list of tokens.
 * @param tokens
 */
var readSexps = function (tokens) {
    if (tokens.length === 0)
        return { thing: [], remain: [] };
    var firstToken = tokens[0];
    if (predicates_1.isTokenError(firstToken)) {
        var thingToReturn = readSexps(tokens.slice(1));
        thingToReturn.thing.unshift(firstToken);
        return { thing: thingToReturn.thing, remain: thingToReturn.remain };
    }
    else if (firstToken.type === types_1.TokenType.Whitespace) {
        return readSexps(tokens.slice(1));
    }
    var readFirst = readSexp(tokens);
    if (predicates_1.isReadError(readFirst.thing)) {
        return { thing: [], remain: tokens };
    }
    var readRest = readSexps(readFirst.remain);
    if (predicates_1.isReadError(readRest.thing)) {
        return { thing: [readFirst.thing], remain: readFirst.remain };
    }
    else {
        readRest.thing.unshift(readFirst.thing);
        return readRest;
    }
};
/**
 * Reads as many SExp as possible from the start of an expression.
 * @param exp an expression as a string
 */
exports.read = function (exp) {
    var tokens = tokenize(exp);
    var sexps = [];
    while (tokens.length !== 0) {
        var next = readSexp(tokens);
        sexps.push(next.thing);
        tokens = next.remain;
    }
    return sexps;
};
/**
 * Given two token types, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 *
 * @param op open paren token type
 * @param cp close paren token type
 * @return True if the types in the correct order and the paren types match,
 *         False if given any other token types, or given the types in the wrong order.
 */
var parensMatch = function (op, cp) {
    if (op === types_1.TokenType.OpenParen) {
        return cp === types_1.TokenType.CloseParen;
    }
    else if (op === types_1.TokenType.OpenSquareParen) {
        return cp === types_1.TokenType.CloseSquareParen;
    }
    else if (op === types_1.TokenType.OpenBraceParen) {
        return cp === types_1.TokenType.CloseBraceParen;
    }
    return false;
};
/**
 * Converts a boolean token into a Boolean SExp.
 * @param t token
 */
var whichBool = function (t) {
    if (predicates_1.isTokenError(t))
        return t;
    switch (t.token) {
        case '#T':
        case '#t':
        case '#true':
            return {
                type: 'Bool',
                sexp: true
            };
        case '#F':
        case '#f':
        case '#false':
            return {
                type: 'Bool',
                sexp: false
            };
    }
    return { readError: 'Non-boolean was processed as a boolean (should never be seen)', tokens: [t] };
};
module.exports = {
    'tokenize': tokenize,
    'read': exports.read,
    'readSexp': readSexp,
    'readSexps': readSexps
};
