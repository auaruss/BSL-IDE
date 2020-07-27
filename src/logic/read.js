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
                return { thing: [], remain: [] };
            // let i = 1;
            // let insideSexps: Token[] = [];
            // for (let token of tokens.slice(1)) {
            //   if ((! isTokenError(token))
            //   &&
            //     (token.type === TokenType.CloseParen
            //   || token.type === TokenType.CloseSquareParen
            //   || token.type === TokenType.CloseBraceParen)) {
            //     if (parensMatch(firstToken.type, token.type)) {
            //       return {
            //         // What to do with readSexps.remain here?
            //         thing: readSexps(insideSexps).thing,
            //         remain: []
            //       };
            //     } else {
            //       return {
            //         thing: {readError: 'Mismatched Parens', tokens: [firstToken, token]},
            //         remain: []
            //       };
            //     }
            //   } else {
            //     insideSexps.push(token);
            //     i += 1;
            //   }
            // }
            // return {
            //   thing: {readError:'No Closing Paren', tokens:insideSexps},
            //   remain: tokens
            // };
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
                return {
                    thing: { readError: 'Read non-result (should never be seen)', tokens: [] },
                    remain: tokens
                };
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
        return { thing: firstToken, remain: tokens.slice(1) };
    }
    else if (firstToken.type === types_1.TokenType.Whitespace) {
        return readSexps(tokens.slice(1));
    }
    var readFirst = readSexp(tokens);
    if (predicates_1.isReadError(readFirst.thing)) {
        return { thing: readFirst.thing, remain: tokens.slice(1) };
    }
    // throw new Error('doesnt reach')
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
    var sexpsRead = readSexps(tokenize(exp)).thing;
    return sexpsRead;
};
/**
 * Given two token types, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 *
 * @param op open paren token
 * @param cp close paren token
 * @return True if the tokens match in the correct order,
 *         False if given any other tokens, or given the tokens in the wrong order.
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
