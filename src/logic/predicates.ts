import {
  DefOrExpr, Definition, Expr, ReadError, SExp, TokenError
} from './types';

export const isTokenError = (x: any): x is TokenError => {
  if (! (typeof x === 'object')) return false;
  if (! (x.tokenError && typeof x.tokenError !== 'string')) return false;
  if (! x.tokens) return false;
  return x.tokenError === 'Unidentified Token';
}

export const isReadError = (x: any): x is ReadError => {
  if (isTokenError(x)) return true;
  if (! (typeof x === 'object')) return false;
  if (! (x.readError && typeof x.readError !== 'string')) return false;
  if (! x.tokens) return false;
  return x.readError === 'No Valid SExp'
      || x.readError === 'No Closing Paren'
      || x.readError === 'No Open Paren'
      || x.readError === 'Mismatched Parens';
}



// Checks to see if a specific DefOrExpr is an Expr.
export const defOrExprIsExpr = (d: DefOrExpr): d is Expr => {
  return (! isDefinition(d));
}

// Tells whether x is a Definition.
export const isDefinition = (x: any): x is Definition => {
  return Array.isArray(x) && x.length > 0 && x[0] === 'define';
}
