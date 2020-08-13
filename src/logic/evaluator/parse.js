"use strict";
exports.__esModule = true;
exports.parse = function (exp) {
    return [];
};
exports.parseSexps = function (sexps) {
    return [];
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
