import { SExp, DefOrExpr, Expr } from '../types';
import { read } from './read';

import {
  isReadError, isTokenError, isDefinition, defOrExprArrayIsExprArray, defOrExprIsExpr
} from '../predicates';

import {
  StringExpr, NumExpr, IdExpr, BooleanExpr, ExprErr, FunctionExpr, DefnErr
} from '../constructors';

/**
 * Given a program, parses the string into a set of definitions and expressions.
 * @param exp program to be parsed
 */
export const parse = (exp: string): DefOrExpr[] => {
  return parseSexps(read(exp));
}

/**
 * Given a program's SExp form, parses the string into a set of definitions and expressions.
 * @param sexps program to be parsed
 */
export const parseSexps = (sexps: SExp[]): DefOrExpr[] => {
  return sexps.map(sexps => parseSexp(sexps));
}

/**
 * Parses a single S-Expression into a definition or expression.
 * @param sexp
 */
export const parseSexp = (sexp: SExp): DefOrExpr => {
  if (isReadError(sexp)) { 
    return sexp;
  } else if (Array.isArray(sexp)) {
    if (sexp.length === 0)  return ExprErr('Empty Expr', []);
    let firstSexp = sexp[0];
    if (isReadError(firstSexp) || Array.isArray(firstSexp)) {
      return ExprErr('No function name after open paren', sexp);
    } else if (firstSexp.type === 'String') {
      if (firstSexp.sexp === 'define') {
        return parseDefinition(sexp);
      }
      if (sexp.length === 1) return ExprErr('Function call with no arguments', sexp);
      let parseRest = parseSexps(sexp.slice(1));
      if (defOrExprArrayIsExprArray(parseRest))
        return FunctionExpr(firstSexp.sexp, parseRest);
      return ExprErr('Defn inside Expr', sexp);
    } else {
      return ExprErr('No function name after open paren', sexp);
    }
  } else if (sexp.type === 'String') {
    return StringExpr(sexp.sexp);
  } else if (sexp.type === 'Num') {
    return NumExpr(sexp.sexp);
  } else if (sexp.type === 'Id') {
    return IdExpr(sexp.sexp);
  } else {
    return BooleanExpr(sexp.sexp);
  }
}

export const parseDefinition = (sexp: SExp): DefOrExpr => {
  if (Array.isArray(sexp)) {
    if (sexp.length === 0)  return ExprErr('Empty Expr', []);
    else if (sexp.length === 1) return DefnErr(
      'Expected a function header with parameters in parentheses, received nothing in parentheses',
      sexp
    );
    else if (sexp.length > 3) return DefnErr('A definition can\'t have more than 3 parts', sexp);
    else {
      let varOrHeader = sexp[1];
      let body = parseSexp(sexp[2]);
      if (defOrExprIsExpr(body)) {
        if (isReadError(varOrHeader)) { 
          return DefnErr('Expected a variable name, or a function header', sexp);
        } else if (Array.isArray(varOrHeader)) {
          if (varOrHeader.length === 0) {
            return DefnErr(
              'Expected a function header with parameters in parentheses, received nothing in parentheses',
              sexp
            );
          } else if (varOrHeader.length === 1) {
            return DefnErr(
              'Expected a function header with parameters in parentheses, received a function name with no parameters',
              sexp
            );
          } else {
            let functionNameSExp = varOrHeader[0];
            let functionArgsSExp = varOrHeader.slice(1);

            let functionName: string;
            let functionArgs: string[] = [];

            if (isReadError(functionNameSExp)) { 
              return DefnErr('Invalid expression passed where function name was expected', sexp);
            } else if (Array.isArray(functionNameSExp)) {
              return DefnErr('Invalid expression passed where function name was expected', sexp);
            } else if (functionNameSExp.type === 'Id') {
              functionName = functionNameSExp.sexp;
            } else {
              return DefnErr('Invalid expression passed where function name was expected', sexp);
            }

            for (let s of functionArgsSExp) {
              if (isReadError(s)) { 
                return DefnErr('Invalid expression passed where function argument was expected', sexp);
              } else if (Array.isArray(s)) {
                return DefnErr('Invalid expression passed where function argument was expected', sexp);
              } else if (s.type === 'Id') {
                functionArgs.push(s.sexp);
              } else {
                return DefnErr('Invalid expression passed where function argument was expected', sexp);
              }
            }

            return ['define', [functionName, functionArgs], body];
          }
        } else if (varOrHeader.type === 'String') {
          
        } else {
          return DefnErr('Expected a variable name, or a function header', sexp);
        }
      } else {
        return DefnErr('Cannot have a definition as the body of a definition', sexp);
      }
    }
  }
  
  return parseSexp(sexp);
}

export const processSexp = (sexp: SExp): any => {
  if (isReadError(sexp)) { 
    /* ... */
  } else if (Array.isArray(sexp)) {
    /* ... */
  } else if (sexp.type === 'String') {
    /* ... */
  } else if (sexp.type === 'Num') {
    /* ... */
  } else if (sexp.type === 'Id') {
    /* ... */
  } else if (sexp.type === 'Bool') {
    /* ... */
  }
}
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