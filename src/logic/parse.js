'use strict';
exports.__esModule = true;
/**
 * An S-exp parser for the student languages.
 * @author: Alice Russell, Sam Soucie
 *
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and parser must handle '().
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
 * @throws error if a non-token is in the Token[].
 */
var parseSexp = function (tokens) {
    if (tokens.length === 0) {
        return { thing: { error: 'No Valid SExp', value: '' }, remain: [] };
    }
    if (predicates_1.isTokenError(tokens[0])) {
        var result = {
            thing: tokens[0],
            remain: tokens.slice(1)
        };
        return result;
    }
    else {
        switch (tokens[0].type) {
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
                // Note that parseRest always returns a success, so we can assume that an SExp exists at the
                // start of the expression if and only if the remain from parsing the rest starts with a closing paren
                // which matches our current open paren.
                // This also means if the remain is empty we return a failure.
                if (parseRest.remain.length === 0) {
                    return { thing: { error: 'No Closing Paren', value: '' }, remain: tokens };
                }
                else if (parseRest.remain[0] === ')'
                    || parseRest.remain[0] === ']'
                    || parseRest.remain[0] === '}') {
                    if (parensMatch(tokens[0], parseRest.remain[0]))
                        return {
                            thing: parseRest.thing,
                            remain: parseRest.remain.slice(1)
                        };
                    return {
                        thing: {
                            error: 'Mismatched Parens',
                            value: tokens[0].value + ' ' + parseRest.remain[0].value
                        },
                        remain: parseRest.remain[0].value
                    };
                }
                else if (parensMatch(tokens[0], parseRest.remain[0])) {
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
                        value: tokens[0].value.slice(1, -1)
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
                    thing: {
                        type: 'Bool',
                        value: whichBool(tokens[0])
                    },
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
    if (tokens[0].type === types_1.TokenType.Whitespace) {
        return parseSexps(tokens.slice(1));
    }
    var parseFirst = parseSexp(tokens);
    if (isSuccess(parseFirst)) {
        var parseRest = parseSexps(parseFirst.remain);
        return {
            thing: [parseFirst.thing].concat(parseRest.thing),
            remain: parseRest.remain
        };
    }
    else if (isFailure(parseFirst)) {
        return { thing: [], remain: tokens };
    }
    else {
        throw new Error('Not a ResultSuccess or ResultFailure somehow.');
    }
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
 * Given two tokens, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 *
 * @param op open paren token
 * @param cp close paren token
 * @return True if the tokens match in the correct order,
 *         False if given any other tokens, or given the tokens in the wrong order.
 */
var parensMatch = function (op, cp) {
    if (op.type === types_1.TokenType.OpenParen) {
        return cp.type === types_1.TokenType.CloseParen;
    }
    else if (op.type === types_1.TokenType.OpenSquareParen) {
        return cp.type === types_1.TokenType.CloseSquareParen;
    }
    else if (op.type === types_1.TokenType.OpenBraceParen) {
        return cp.type === types_1.TokenType.CloseBraceParen;
    }
    return false;
};
/**
 * Checks whether a given boolean token is true or false.
 * @param t token
 * @throws error when called on non-boolean token
 */
var whichBool = function (t) {
    switch (t.value) {
        case '#T':
        case '#t':
        case '#true':
            return true;
        case '#F':
        case '#f':
        case '#false':
            return false;
        default:
            throw new Error("Called whichBool on a non-boolean token.");
    }
};
module.exports = {
    'tokenize': tokenize,
    'parse': exports.parse,
    'parseSexp': parseSexp,
    'parseSexps': parseSexps
};
