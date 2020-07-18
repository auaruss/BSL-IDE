import {
  DefOrExpr, Definition, Expr, Result, TokenError
} from './types';

export const isTokenError = (x: any): x is TokenError => {
  if (! (typeof x === 'object')) return false;
  if (! (x.error && typeof x.error === 'string')) return false;
  if (! (x.value && typeof x.value === 'string')) return false;
  return x.error === 'Unidentified Token';
}

// Checks to see if a specific DefOrExpr is an Expr.
export const defOrExprIsExpr = (d: DefOrExpr): d is Expr => {
  return (! isDefinition(d));
}

// Tells whether x is a Definition.
export const isDefinition = (x: any): x is Definition => {
  return Array.isArray(x) && x.length > 0 && x[0] === 'define';
}
