import {
  DefOrExpr, Definition, Expr, Result, TokenError
} from './types';


// Checks to see if a specific DefOrExpr is an Expr.
export const defOrExprIsExpr = (d: DefOrExpr): d is Expr => {
  return (! isDefinition(d));
}

// Tells whether x is a Definition.
export const isDefinition = (x: any): x is Definition => {
  return Array.isArray(x) && x.length > 0 && x[0] === 'define';
}
