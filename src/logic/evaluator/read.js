'use strict';
exports.__esModule = true;
/**
 * An S-exp reader for the student languages.
 */
var types_1 = require("../types");
var tokenize_1 = require("./tokenize");
var predicates_1 = require("../predicates");
var constructors_1 = require("../constructors");
/**
 * Attempts to read the first SExp from a list of tokens.
 * @param tokens
 */
exports.readSexp = function (tokens) {
    if (tokens.length === 0) {
        return { thing: constructors_1.ReadErr('No Valid SExp', []), remain: [] };
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
                var readRest = exports.readSexps(tokens.slice(1));
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
                        thing: constructors_1.ReadErr('No Closing Paren', tokens),
                        remain: []
                    };
                }
                else {
                    var firstUnprocessedToken = readRest.remain[0];
                    if (predicates_1.isTokenError(firstUnprocessedToken)) {
                        return { thing: constructors_1.ReadErr('No Valid SExp', []), remain: [] };
                    }
                    else if (firstUnprocessedToken.type === types_1.TokenType.CloseParen
                        || firstUnprocessedToken.type === types_1.TokenType.CloseSquareParen
                        || firstUnprocessedToken.type === types_1.TokenType.CloseBraceParen) {
                        if (parensMatch(firstToken.type, firstUnprocessedToken.type))
                            return constructors_1.Res(constructors_1.SExpsFromArray(readRest.thing), readRest.remain.slice(1));
                        return {
                            thing: constructors_1.ReadErr('Mismatched Parens', [firstToken, firstUnprocessedToken]),
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
                return { thing: constructors_1.ReadErr('No Open Paren', [firstToken]), remain: tokens.slice(1) };
            case types_1.TokenType.Number:
                return {
                    thing: constructors_1.NumAtom(Number(firstToken.token)),
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.String:
                return {
                    thing: constructors_1.StringAtom(firstToken.token.slice(1, -1)),
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Identifier:
                return {
                    thing: constructors_1.IdAtom(firstToken.token),
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Boolean:
                return {
                    thing: constructors_1.BooleanAtom(firstToken.token),
                    remain: tokens.slice(1)
                };
            case types_1.TokenType.Whitespace:
                return exports.readSexp(tokens.slice(1));
        }
    }
};
/**
 * Reads as many SExp as possible from the start of the list of tokens.
 * @param tokens
 */
exports.readSexps = function (tokens) {
    if (tokens.length === 0)
        return { thing: [], remain: [] };
    var firstToken = tokens[0];
    if (predicates_1.isTokenError(firstToken)) {
        var thingToReturn = exports.readSexps(tokens.slice(1));
        thingToReturn.thing.unshift(firstToken);
        return { thing: thingToReturn.thing, remain: thingToReturn.remain };
    }
    else if (firstToken.type === types_1.TokenType.Whitespace) {
        return exports.readSexps(tokens.slice(1));
    }
    var readFirst = exports.readSexp(tokens);
    if (predicates_1.isReadError(readFirst.thing)) {
        return { thing: [], remain: tokens };
    }
    var readRest = exports.readSexps(readFirst.remain);
    if (predicates_1.isReadError(readRest.thing)) {
        return { thing: [readFirst.thing], remain: readFirst.remain };
    }
    else {
        readRest.thing.unshift(readFirst.thing);
        return readRest;
    }
};
exports.readTokens = function (ts) {
    var tokens = ts.slice().filter(function (t) { return predicates_1.isTokenError(t) ? true : t.type !== types_1.TokenType.Whitespace; });
    var sexps = [];
    while (tokens.length !== 0) {
        var next = exports.readSexp(tokens);
        if (predicates_1.isReadError(next.thing))
            if (predicates_1.isTokenError(next.thing)) { }
            else if (next.thing.readError === 'No Valid SExp') {
                sexps.push(constructors_1.ReadErr('No Valid SExp', tokens));
                return sexps;
            }
        sexps.push(next.thing);
        tokens = next.remain;
    }
    return sexps;
};
/**
 * Reads as many SExp as possible from the start of an expression.
 * @param exp an expression as a string
 */
exports.read = function (exp) {
    return exports.readTokens(tokenize_1.tokenize(exp));
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
module.exports.read = exports.read;
module.exports.readSexp = exports.readSexp;
module.exports.readSexps = exports.readSexps;
