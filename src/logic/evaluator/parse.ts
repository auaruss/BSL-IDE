import { SExp, DefOrExpr, Expr, Definition } from '../types';
import { read } from './read';

import {
  isReadError, isExpr, isExprArray, 
} from '../predicates';

import {
  IdAtom, StringExpr, NumExpr, IdExpr, BooleanExpr,
  ExprErr, FunctionExpr, DefnErr, FnDefn, VarDefn
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
  } else { 
    switch (sexp.type) {
      case 'SExp Array':
        let sexps = sexp.sexp;
        if (sexps.length === 0)  return ExprErr('Empty Expr', []);
        let firstSexp = sexps[0];
        if (isReadError(firstSexp) || Array.isArray(firstSexp)) {
          return ExprErr('No function name after open paren', sexps);
        } else if (firstSexp.type === 'Id') {
          if (firstSexp.sexp === 'define') {
            return parseDefinition({type: 'Id', sexp: 'define'}, sexps.slice(1));
          }
          if (sexps.length === 1) return ExprErr('Function call with no arguments', sexp);
          let parseRest = parseSexps(sexps.slice(1));
          if (isExprArray(parseRest))
            return FunctionExpr(firstSexp.sexp, parseRest);
          return ExprErr('Defn inside Expr', sexps);
        } else {
          return ExprErr('No function name after open paren', sexps);
        }
      case 'String':
        return StringExpr(sexp.sexp)
      case 'Num':
        return NumExpr(sexp.sexp);
      case 'Id':
        return IdExpr(sexp.sexp);
      case 'Bool':
        return BooleanExpr(sexp.sexp);  
    }
  }
}

/**
 * Parses some SExps into a Definition.
 * @param d definition Id (only one exists currently, define-struct can exist later)
 * @param sexp array of SExp after definition
 */
export const parseDefinition = (d: {type: 'Id', sexp: 'define'} , sexp: SExp[]): Definition => {
  if (sexp.length === 0) {
    sexp.unshift(d);
    return DefnErr('A definition requires two parts, but found none', sexp);
  } else if (sexp.length === 1) {
    sexp.unshift(d);
    return DefnErr('A definition requires two parts, but found one', sexp);
  } else if (sexp.length === 2) {
    let varOrHeader = sexp[0], body = parseSexp(sexp[1]);
    if (isExpr(body)) {
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
    
          return FnDefn(functionName, functionArgs, body);
        }
      } else if (varOrHeader.type === 'String') {
          return VarDefn(varOrHeader.sexp, body);
      } else {
        return DefnErr('Expected a variable name, or a function header', sexp);
      }
    } else {
      return DefnErr('Cannot have a definition as the body of a definition', sexp);
    }
  }

  sexp.unshift(d);
  return DefnErr('A definition can\'t have more than 3 parts', sexp);
}