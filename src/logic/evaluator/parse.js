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
        else if (firstSexp.type === 'String') {
            if (firstSexp.sexp === 'define') {
                return exports.parseDefinition(sexp);
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
exports.parseDefinition = function (sexp) {
    if (Array.isArray(sexp)) {
        if (sexp.length === 0)
            return constructors_1.ExprErr('Empty Expr', []);
        else if (sexp.length === 1)
            return constructors_1.DefnErr('Expected a function header with parameters in parentheses, received nothing in parentheses', sexp);
        else if (sexp.length > 3)
            return constructors_1.DefnErr('A definition can\'t have more than 3 parts', sexp);
        else {
            var varOrHeader = sexp[1];
            var body = exports.parseSexp(sexp[2]);
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
                }
                else {
                    return constructors_1.DefnErr('Expected a variable name, or a function header', sexp);
                }
            }
            else {
                return constructors_1.DefnErr('Cannot have a definition as the body of a definition', sexp);
            }
        }
    }
    return exports.parseSexp(sexp);
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
// /**
//  * Checks to make sure the parsed SExps have the proper structure of an Expr.
//  * @remark This function changes the input SExp to an Expr, by separating
//  *         the first identifier in a valid expression call from the rest of them.
//  * @param sexp
//  * @throws error if the expression contains nothing
//  * @throws error if the sexp is actually a Definition
//  * @throws error if function call is missing a starting Id.
//  * @throws error if expression is neither an Atom or array.
//  */
// const syntaxCheckExpr = (sexp: SExp): Expr => {
//   if (isAtom(sexp)) {
//     return sexp;
//   } else if (Array.isArray(sexp)) {
//     if (sexp.length === 0) {
//       throw new Error('Invalid Expression: Found an empty expression.');
//     }
//     if (isId(sexp[0])) {
//       if (sexp[0].value === 'define') {
//         // We know the definition is inside an expression because the only intended way for this function
//         // to be called is by syntaxCheckDefOrExpr, which would already let us know that the top level thing
//         // that called this was not a definition itself, which is the only valid location for a definition in BSL.
//         throw new Error('Invalid Expression: Found a definition inside an expression.');
//       }
//       const restOfExprs = sexp.slice(1).map(syntaxCheckExpr);
//       return [sexp[0].value, restOfExprs];
//     } else {
//       throw new Error('Invalid expression: Expression missing a starting identifier.')
//     }
//   }
//   throw new Error('Invalid expression: Unknown error.');
// }
// /**
//  * Checks to make sure the parsed SExps have the proper structure of a Definition.
//  * @remark This function changes the input SExp to a Definition, namely separating
//  *         the first identifier in a function definition from its arguments.
//  * @param sexp 
//  * @throws error when checking non-definitions
//  */
// const syntaxCheckDefinition = (sexp: SExp): Definition => {
//   if (Array.isArray(sexp) && sexp.length === 3 && isId(sexp[0]) && sexp[0].value === 'define') {
//     if (isIdArray(sexp[1]) && sexp[1].length >= 2) {
//       return ['define', [sexp[1][0].value, sexp[1].slice(1).map(x => x.value)], syntaxCheckExpr(sexp[2])]
//     } else if (isId(sexp[1])) {
//       return ['define', sexp[1].value, syntaxCheckExpr(sexp[2])];
//     } else {
//       throw new Error ('Invalid Definition: The defintion provided matches no case of Definition');
//     }
//   } else {
//     throw new Error('Invalid Definition: Tried to syntax-check a non-definition.');
//   }
// }
// /**
//  * Checks to make sure the parsed SExps have the proper structure of a Single BSL DefOrExpr.
//  * @param sexp 
//  */
// const syntaxCheckDefOrExpr = (sexp: SExp): DefOrExpr => {
//   if (Array.isArray(sexp) && sexp.length > 0 && isId(sexp[0]) && sexp[0].value === 'define') {
//     return syntaxCheckDefinition(sexp);
//   } else {
//     return syntaxCheckExpr(sexp);
//   }
// }
