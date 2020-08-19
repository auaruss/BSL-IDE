"use strict";
exports.__esModule = true;
var read_1 = require("./read");
var predicates_1 = require("../predicates");
var constructors_1 = require("../constructors");
/**
 * Given a program, parses the string into a set of definitions and expressions.
 * @param exp program to be parsed
 */
exports.parse = function (exp) {
    return exports.parseSexps(read_1.read(exp));
};
/**
 * Given a program's SExp form, parses the string into a set of definitions and expressions.
 * @param sexps program to be parsed
 */
exports.parseSexps = function (sexps) {
    return sexps.map(function (sexps) { return exports.parseSexp(sexps); });
};
/**
 * Parses a single S-Expression into a definition or expression.
 * @param sexp
 */
exports.parseSexp = function (sexp) {
    if (predicates_1.isReadError(sexp)) {
        return sexp;
    }
    else if (Array.isArray(sexp)) {
        if (sexp.length === 0)
            return constructors_1.ExprErr('Empty Expr', []);
        var firstSexp = sexp[0];
        if (predicates_1.isReadError(firstSexp) || Array.isArray(firstSexp)) {
            return constructors_1.ExprErr('No function name after open paren', sexp);
        }
        else if (firstSexp.type === 'Id') {
            if (firstSexp.sexp === 'define') {
                return exports.parseDefinition({ type: 'Id', sexp: 'define' }, sexp.slice(1));
            }
            if (sexp.length === 1)
                return constructors_1.ExprErr('Function call with no arguments', sexp);
            var parseRest = exports.parseSexps(sexp.slice(1));
            if (predicates_1.defOrExprArrayIsExprArray(parseRest))
                return constructors_1.FunctionExpr(firstSexp.sexp, parseRest);
            return constructors_1.ExprErr('Defn inside Expr', sexp);
        }
        else {
            return constructors_1.ExprErr('No function name after open paren', sexp);
        }
    }
    else if (sexp.type === 'String') {
        return constructors_1.StringExpr(sexp.sexp);
    }
    else if (sexp.type === 'Num') {
        return constructors_1.NumExpr(sexp.sexp);
    }
    else if (sexp.type === 'Id') {
        return constructors_1.IdExpr(sexp.sexp);
    }
    else {
        return constructors_1.BooleanExpr(sexp.sexp);
    }
};
/**
 * Parses some SExps into a Definition.
 * @param d definition Id (only one exists currently, define-struct can exist later)
 * @param sexp array of SExp after definition
 */
exports.parseDefinition = function (d, sexp) {
    if (sexp.length === 0) {
        sexp.unshift(d);
        return constructors_1.DefnErr('A definition requires two parts, but found none', sexp);
    }
    else if (sexp.length === 1) {
        sexp.unshift(d);
        return constructors_1.DefnErr('A definition requires two parts, but found one', sexp);
    }
    else if (sexp.length === 2) {
        var varOrHeader = sexp[0], body = exports.parseSexp(sexp[1]);
        if (predicates_1.defOrExprIsExpr(body)) {
            if (predicates_1.isReadError(varOrHeader)) {
                return constructors_1.DefnErr('Expected a variable name, or a function header', sexp);
            }
            else if (Array.isArray(varOrHeader)) {
                if (varOrHeader.length === 0) {
                    return constructors_1.DefnErr('Expected a function header with parameters in parentheses, received nothing in parentheses', sexp);
                }
                else if (varOrHeader.length === 1) {
                    return constructors_1.DefnErr('Expected a function header with parameters in parentheses, received a function name with no parameters', sexp);
                }
                else {
                    var functionNameSExp = varOrHeader[0];
                    var functionArgsSExp = varOrHeader.slice(1);
                    var functionName = void 0;
                    var functionArgs = [];
                    if (predicates_1.isReadError(functionNameSExp)) {
                        return constructors_1.DefnErr('Invalid expression passed where function name was expected', sexp);
                    }
                    else if (Array.isArray(functionNameSExp)) {
                        return constructors_1.DefnErr('Invalid expression passed where function name was expected', sexp);
                    }
                    else if (functionNameSExp.type === 'Id') {
                        functionName = functionNameSExp.sexp;
                    }
                    else {
                        return constructors_1.DefnErr('Invalid expression passed where function name was expected', sexp);
                    }
                    for (var _i = 0, functionArgsSExp_1 = functionArgsSExp; _i < functionArgsSExp_1.length; _i++) {
                        var s = functionArgsSExp_1[_i];
                        if (predicates_1.isReadError(s)) {
                            return constructors_1.DefnErr('Invalid expression passed where function argument was expected', sexp);
                        }
                        else if (Array.isArray(s)) {
                            return constructors_1.DefnErr('Invalid expression passed where function argument was expected', sexp);
                        }
                        else if (s.type === 'Id') {
                            functionArgs.push(s.sexp);
                        }
                        else {
                            return constructors_1.DefnErr('Invalid expression passed where function argument was expected', sexp);
                        }
                    }
                    return ['define', [functionName, functionArgs], body];
                }
            }
            else if (varOrHeader.type === 'String') {
                return ['define', varOrHeader.sexp, body];
            }
            else {
                return constructors_1.DefnErr('Expected a variable name, or a function header', sexp);
            }
        }
        else {
            return constructors_1.DefnErr('Cannot have a definition as the body of a definition', sexp);
        }
    }
    sexp.unshift(d);
    return constructors_1.DefnErr('A definition can\'t have more than 3 parts', sexp);
};
exports.processSexp = function (sexp) {
    if (predicates_1.isReadError(sexp)) {
        /* ... */
    }
    else if (Array.isArray(sexp)) {
        /* ... */
    }
    else if (sexp.type === 'String') {
        /* ... */
    }
    else if (sexp.type === 'Num') {
        /* ... */
    }
    else if (sexp.type === 'Id') {
        /* ... */
    }
    else if (sexp.type === 'Bool') {
        /* ... */
    }
};
