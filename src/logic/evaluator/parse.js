"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
    else
        switch (sexp.type) {
            case 'SExp Array':
                var sexps = sexp.sexp;
                if (sexps.length === 0)
                    return constructors_1.ExprErr('Empty Expr', []);
                var firstSexp = sexps[0];
                if (predicates_1.isReadError(firstSexp) || Array.isArray(firstSexp)) {
                    return constructors_1.ExprErr('No function name after open paren', sexps);
                }
                else if (firstSexp.type === 'Id') {
                    if (firstSexp.sexp === 'define') {
                        return exports.parseDefinition({ type: 'Id', sexp: 'define' }, sexps.slice(1));
                    }
                    if (sexps.length === 1)
                        return constructors_1.ExprErr('Function call with no arguments', sexps);
                    var parseRest = exports.parseSexps(sexps.slice(1));
                    if (predicates_1.isExprArray(parseRest))
                        return constructors_1.Call(firstSexp.sexp, parseRest);
                    return constructors_1.ExprErr('Defn inside Expr', sexps);
                }
                else {
                    return constructors_1.ExprErr('No function name after open paren', sexps);
                }
            case 'String':
                return constructors_1.StringExpr(sexp.sexp);
            case 'Num':
                return constructors_1.NumExpr(sexp.sexp);
            case 'Id':
                return constructors_1.IdExpr(sexp.sexp);
            case 'Bool':
                return constructors_1.BooleanExpr(sexp.sexp);
        }
};
/**
 * Parses some SExps into a Definition.
 * @param d definition Id (only one exists currently, define-struct can exist later)
 * @param sexps array of SExp after definition
 */
exports.parseDefinition = function (d, sexps) {
    if (sexps.length === 0) {
        return constructors_1.DefnErr('A definition requires two parts, but found none', __spreadArrays([d], sexps));
    }
    else if (sexps.length === 1) {
        return constructors_1.DefnErr('A definition requires two parts, but found one', __spreadArrays([d], sexps));
    }
    else if (sexps.length === 2) {
        var varOrHeader = sexps[0], body = exports.parseSexp(sexps[1]);
        if (predicates_1.isExpr(body)) {
            if (predicates_1.isReadError(varOrHeader)) {
                sexps.unshift(d);
                return constructors_1.DefnErr('Expected a variable name, or a function header', sexps);
            }
            else
                switch (varOrHeader.type) {
                    case 'SExp Array':
                        var header = varOrHeader.sexp;
                        if (header.length === 0) {
                            sexps.unshift(d);
                            return constructors_1.DefnErr('Expected a function header with parameters in parentheses, received nothing in parentheses', sexps);
                        }
                        else if (header.length === 1) {
                            sexps.unshift(d);
                            return constructors_1.DefnErr('Expected a function header with parameters in parentheses, received a function name with no parameters', sexps);
                        }
                        else {
                            var functionNameSExp = header[0];
                            var functionArgsSExp = header.slice(1);
                            if (predicates_1.isReadError(functionNameSExp)) {
                                return constructors_1.DefnErr('Invalid expression passed where function name was expected', __spreadArrays([d], sexps));
                            }
                            else
                                switch (functionNameSExp.type) {
                                    case 'SExp Array':
                                        return constructors_1.DefnErr('Invalid expression passed where function name was expected', __spreadArrays([d], sexps));
                                    case 'Id':
                                        var functionArgs = [];
                                        for (var _i = 0, functionArgsSExp_1 = functionArgsSExp; _i < functionArgsSExp_1.length; _i++) {
                                            var s = functionArgsSExp_1[_i];
                                            if (predicates_1.isReadError(s)) {
                                                return constructors_1.DefnErr('Invalid expression passed where function argument was expected', __spreadArrays([d], sexps));
                                            }
                                            else if (Array.isArray(s)) {
                                                return constructors_1.DefnErr('Invalid expression passed where function argument was expected', __spreadArrays([d], sexps));
                                            }
                                            else if (s.type === 'Id') {
                                                functionArgs.push(s.sexp);
                                            }
                                            else {
                                                return constructors_1.DefnErr('Invalid expression passed where function argument was expected', __spreadArrays([d], sexps));
                                            }
                                        }
                                        return constructors_1.FnDefn(functionNameSExp.sexp, functionArgs, body);
                                    case 'String':
                                    case 'Num':
                                    case 'Bool':
                                        return constructors_1.DefnErr('Invalid expression passed where function name was expected', __spreadArrays([d], sexps));
                                }
                        }
                    case 'String':
                        var x = varOrHeader.sexp;
                        return constructors_1.VarDefn(varOrHeader.sexp, body);
                    case 'Num':
                    case 'Id':
                    case 'Bool':
                        return constructors_1.DefnErr('Expected a variable name, or a function header', __spreadArrays([d], sexps));
                }
        }
        else {
            return constructors_1.DefnErr('Cannot have a definition as the body of a definition', __spreadArrays([d], sexps));
        }
    }
    else {
        return constructors_1.DefnErr('A definition can\'t have more than 3 parts', __spreadArrays([d], sexps));
    }
};
