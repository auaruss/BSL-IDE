import { 
  Atom, AtomType, Bool, DefOrExpr, Definition,
  Expr, Id, Num, Result, ResultFailure, ResultSuccess, Str
} from './types';

// Checks to see if a specific DefOrExpr is an Expr.
export const defOrExprIsExpr = (d: DefOrExpr): d is Expr => {
  return (! isDefinition(d));
}

// Tells whether x is an Atom.
export const isAtom = (x: any): x is Atom  => {
  if (!(typeof x === "object")) return false;
  if (!(typeof x.type === "string")) return false;
  return (
       (x.type === AtomType.String && (typeof x.value === "string"))
    || (x.type === AtomType.Number && (typeof x.value === "number"))
    || (x.type === AtomType.Identifier && (typeof x.value === "string"))
    || (x.type === AtomType.Boolean && (typeof x.value === "boolean"))
  );
}

// Tells whether x is a Bool.
export const isBool = (x: any): x is Bool => {
  return isAtom(x) && x.type === AtomType.Boolean;
}

// Tells whether x is a Definition.
export const isDefinition = (x: any): x is Definition => {
  return Array.isArray(x) && x.length > 0 && x[0] === 'define';
}

// Determines whether a Result is a ResultFailure.
export const isFailure = (result: Result<any>): result is ResultFailure<any> => {
  return (result as ResultFailure<any>).error !== undefined;
}

// Tells whether x is an Id.
export const isId = (x: any): x is Id => {
  return isAtom(x) && x.type === AtomType.Identifier;
}

// Tells whether x is a Str.
export const isStr = (x: any): x is Str => {
  return isAtom(x) && x.type === AtomType.String;
}

// Determines whether a Result is a ResultSuccess.
export const isSuccess = (result: Result<any>): result is ResultSuccess<any> => {
  return (result as ResultSuccess<any>).thing !== undefined;
}

// Tells whether x is a Num.
export const isNum = (x: any): x is Num => {
  return isAtom(x) && x.type === AtomType.Number;
}

// Tells whether x is a number[].
export const isNumberArray = (x: any): x is number[] => {
  if (! Array.isArray(x)) return false;
  return x.every(_ => typeof _ === 'number');
}

// Tells whether x is an Id[].
export const isIdArray = (x: any): x is Id[] => {
  return Array.isArray(x) && x.every(isId);
}