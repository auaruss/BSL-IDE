import {
  TokenType, Token, TokenError,
  SExp, ReadError, Expr, ExprResult,
  DefOrExpr, ExprError, DefinitionError, Closure, Env,
  Definition, ReadResult, DefinitionResult, ValueError
} from './types';
import { isDefinitionValue } from './predicates';

// ----------------------------------------------------------------------------
// | Token constructors                                                       |
// ----------------------------------------------------------------------------

export const Tok = (t: TokenType, v: string): Token => {
  return { type: t, token: v};
}

export const NumTok     = (v: string): Token => { return Tok(TokenType.Number,       v.toString()); }
export const IdTok      = (v: string): Token => { return Tok(TokenType.Identifier,   v);            }
export const StringTok  = (v: string): Token => { return Tok(TokenType.String, '"' + v + '"');      }
export const BooleanTok = (v: string): Token => { return Tok(TokenType.Boolean,      v);            }

export const TokErr = (v: string): TokenError => { 
  return { tokenError: 'Unidentified Token', string: v };
}

// ----------------------------------------------------------------------------
// | SExp constructors                                                        |
// ----------------------------------------------------------------------------

export const Atom = (t: 'String'|'Num'|'Id'|'Bool',
              v: string|number|boolean): SExp => {
  if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
    return { type:  t, sexp: v };
  } else if (t === 'Num' && (typeof v === 'number')) {
    return { type:  t, sexp: v };
  } else if (t === 'Bool' && (typeof v === 'boolean')) {
    return { type:  t, sexp: v };
  }
  throw new Error('Mismatch in atom type/value');
}

export const NumAtom     = (v: number): SExp => { return Atom('Num',            v);  }
export const IdAtom      = (v: string): SExp => { return Atom('Id',             v);  }
export const StringAtom  = (v: string): SExp => { return Atom('String',         v);  }
export const BooleanAtom = (v: string): SExp => { return Atom('Bool', whichBool(v)); }

export const SExps = (...args: SExp[]): SExp => {
  return {
    type: 'SExp Array',
    sexp: args
  };
}

export const SExpsFromArray = (sexps: SExp[]): SExp => {
  return {
    type: 'SExp Array',
    sexp: sexps
  };
}

export function Res<T> (t: T, r: Token[]): ReadResult<T> {
  return { thing: t, remain: r };
}

export const ReadErr = (
  e: 'No Valid SExp'
  | 'No Closing Paren'
  | 'No Open Paren'
  | 'Mismatched Parens',
  v: Token[]): ReadError => { 
  return { readError: e, tokens: v }; 
}

// ----------------------------------------------------------------------------
// | Definition constructors                                                  |
// ----------------------------------------------------------------------------

export const VarDefn = (name: string, body: Expr): Definition => {
  return {
    type: 'define-constant',
    name: name,
    body: body
  };
}

export const FnDefn = (
  name: string,
  params: string[],
  body: Expr
): Definition => {
  return {
    type: 'define-function',
    name: name,
    params: params,
    body: body
  };
}


// ----------------------------------------------------------------------------
// | Expr constructors                                                        |
// ----------------------------------------------------------------------------

export const PrimitiveExpr = (t:'String'|'Num'|'Id'|'Bool',
              v: string|number|boolean): Expr => {
  if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
    return { type:  t, const: v };
  } else if (t === 'Num' && (typeof v === 'number')) {
    return { type:  t, const: v };
  } else if (t === 'Bool' && (typeof v === 'boolean')) {
    return { type:  t, const: v };
  }
  throw new Error('Mismatch in primitive Expr type/value');
}

export const NumExpr     = (v: number):  Expr => { return PrimitiveExpr('Num',    v);  }
export const IdExpr      = (v: string):  Expr => { return PrimitiveExpr('Id',     v);  }
export const StringExpr  = (v: string):  Expr => { return PrimitiveExpr('String', v);  }
export const BooleanExpr = (v: boolean): Expr => { return PrimitiveExpr('Bool',   v); }

export const Call = (op: string, args: Expr[]): Expr => {
  return {
    type: 'Call',
    op: op,
    args: args
  }
}

export const ExprErr = (
  e: 'Empty Expr'
   | 'Defn inside Expr'
   | 'No function name after open paren'
   | 'Function call with no arguments',
  v: SExp[]): ExprError => { 
  return { exprError: e, sexps: v }; 
}

export const DefnErr = (
  e: 'Invalid expression passed where function name was expected'
   | 'Invalid expression passed where function argument was expected'
   | 'A definition requires two parts, but found none'
   | 'A definition requires two parts, but found one' 
   | 'Passed a non-definition as definition'
   | 'Expected a variable name, or a function header'
   | 'Expected a function header with parameters in parentheses, received nothing in parentheses'
   | 'Expected a function header with parameters in parentheses, received a function name with no parameters'
   | 'A function in BSL cannot have zero parameters'
   | 'A definition can\'t have more than 3 parts'
   | 'Cannot have a definition as the body of a definition',
  v: SExp[]): DefinitionError => {
    return { defnError: e, sexps: v };
} 


// ----------------------------------------------------------------------------
// | Value constructors                                                       |
// ----------------------------------------------------------------------------

export const DefnVal = (d: string, v: ExprResult): DefinitionResult => {
  return {
    type: 'define',
    defined: d,
    toBe: v
  }
}

export const NFn = (v: string|number|boolean): ExprResult => {
  return { type: 'NonFunction', value: v };
}

export const BFn = (v: ((vs: ExprResult[]) => ExprResult)): ExprResult => {
  return { type: 'BuiltinFunction', value: v };
}

export function Fn(a: string[], e: Env, b: Expr): ExprResult {
  return {
    type: 'Function',
    value: {
      args: a,
      env: e,
      body: b
    }
  };
}


export const ValErr = (err: 'Id not in environment', e: Expr): ValueError => {
  return { valueError: err, expr: e };
}


/**
 * Converts a boolean string in BSL into a boolean.
 * @param t token
 */
const whichBool = (s: string): boolean => {
  switch (s) {
    case '#T':
    case '#t':
    case '#true':
       return true;
    case '#F':
    case '#f':
    case '#false':
      return false;
  }
  return false;
}

export const [ CP, OP, SPACE, OSP, CSP, OBP, CBP, NL ]: Token[] =
    [
        Tok(TokenType.CloseParen,       ')'),
        Tok(TokenType.OpenParen,        '('), 
        Tok(TokenType.Whitespace,       ' '),
        Tok(TokenType.OpenSquareParen,  '['),
        Tok(TokenType.CloseSquareParen, ']'),
        Tok(TokenType.OpenBraceParen,   '{'),
        Tok(TokenType.CloseBraceParen,  '}'),
        Tok(TokenType.Whitespace,       '\n')
    ];