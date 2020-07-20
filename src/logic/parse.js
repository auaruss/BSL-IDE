'use strict';
exports.__esModule = true;
/**
 * An S-exp parser for the student languages.
 * @author: Alice Russell, Sam Soucie
 *
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and parser must handle '().
 * @todo The tokenizer should remove the quotes around a string.
 * @todo The tokenizer should transform booleans
 * @todo Rename parse functions to read functions
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
            var firstToken_1 = [{ type: tokenType, value: result[0] }];
            var restString_1 = exp.slice(result[0].length);
            return firstToken_1.concat(tokenize(restString_1));
        }
    }
    var firstToken = [{ error: 'Unidentified Token', value: exp[0] }];
    var restString = exp.slice(1);
    return firstToken.concat(tokenize(restString));
};
/**
 * Attempts to parse the first SExp from a list of tokens.
 * @remark A failure is produced when no starting SExp is found.
 * @remark Note that this function does not deal with whitespace as we expect to always be calling parse
 *         first and we deal with the whitespace completely in there.
 * @param tokens
 */
var parseSexp = function (tokens) {
    if (tokens.length === 0) {
        return { thing: { error: 'No Valid SExp', value: '' }, remain: [] };
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
                var parseRest = parseSexps(tokens.slice(1));
                // this means parseRest is the rest of the current SExp. so for
                // '(define hello 1) (define x 10)'
                // parseRest should be equal to
                // {
                //   thing: [Id('define'), Id('hello'), Num('1').
                //   remain: tokenize(') (define x 10)')
                // } (ignoring whitespace in the tokenization)
                if (parseRest.remain.length === 0) {
                    return { thing: { error: 'No Closing Paren', value: '' }, remain: tokens };
                }
                var firstTokenAfterSExps = parseRest.remain[0];
                if ((!predicates_1.isTokenError(firstTokenAfterSExps))
                    &&
                        (firstTokenAfterSExps.type === types_1.TokenType.CloseParen
                            || firstTokenAfterSExps.type === types_1.TokenType.CloseSquareParen
                            || firstTokenAfterSExps.type === types_1.TokenType.CloseBraceParen)) {
                    if (parensMatch(firstToken.type, firstTokenAfterSExps.type))
                        return {
                            thing: parseRest.thing,
                            remain: parseRest.remain.slice(1)
                        };
                    return {
                        thing: {
                            error: 'Mismatched Parens',
                            value: firstToken.value + ' ' + firstTokenAfterSExps.value
                        },
                        remain: parseRest.remain.slice(1)
                    };
                }
                else {
                    return { thing: { error: 'No Closing Paren', value: '' }, remain: tokens };
                }
            case types_1.TokenType.CloseParen:
            case types_1.TokenType.CloseSquareParen:
            case types_1.TokenType.CloseBraceParen:
                return { thing: { error: 'No Closing Paren', value: '' }, remain: tokens };
            case types_1.TokenType.Number:
                return {
                    thing: {
                        type: 'Num',
                        value: Number(tokens[0].value)
                    },
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.String:
                return {
                    thing: {
                        type: 'String',
                        value: tokens[0].value.slice(1, -1) // removes "" from string
                    },
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Identifier:
                return {
                    thing: {
                        type: 'Id',
                        value: tokens[0].value
                    },
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Boolean:
                return {
                    thing: whichBool(tokens[0]),
                    remain: tokens.slice(1)
                };
            default:
                return { thing: { error: 'Parsed non-result (should never be seen)', value: '' }, remain: tokens };
        }
    }
};
/**
 * Parses as many SExp as possible from the start of the list of tokens.
 * @param tokens
 * @throws error when the Result is neither a ResultSuccess nor ResultFailure
 */
var parseSexps = function (tokens) {
    if (tokens.length === 0)
        return { thing: [], remain: [] };
    var firstToken = tokens[0];
    if (predicates_1.isTokenError(firstToken)) {
        var parseRest_1 = parseSexps(tokens.slice(1));
        parseRest_1.thing.unshift([firstToken]);
        return { thing: parseRest_1.thing, remain: parseRest_1.remain };
    }
    else if (firstToken.type === types_1.TokenType.Whitespace) {
        return parseSexps(tokens.slice(1));
    }
    var parseFirst = parseSexp(tokens);
    var parseRest = parseSexps(parseFirst.remain);
    parseRest.thing.unshift([parseFirst.thing]);
    return {
        thing: parseRest.thing,
        remain: parseRest.remain
    };
};
/**
 * Parses as many SExp as possible from the start of an expression.
 * @param exp an expression as a string
 */
exports.parse = function (exp) {
    var parsed = parseSexps(tokenize(exp)).thing;
    return parsed;
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
    switch (t.value) {
        case '#T':
        case '#t':
        case '#true':
            return {
                type: 'Bool',
                value: true
            };
        case '#F':
        case '#f':
        case '#false':
            return {
                type: 'Bool',
                value: false
            };
    }
    return { error: 'Non-boolean was processed as a boolean (should never be seen)', value: t.value };
};
module.exports = {
    'tokenize': tokenize,
    'parse': exports.parse,
    'parseSexp': parseSexp,
    'parseSexps': parseSexps
};
