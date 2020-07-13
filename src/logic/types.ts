// Types, enums and related predicates used in the student language evaluator.
// Sorted alphabetically.

export enum AtomType {
  String='String',
  Number='Number',
  Boolean='Boolean',
  Identifier='Identifier'
};

export enum TokenType {
  Error='Error',
  OpenParen='OpenParen',
  OpenSquareParen='OpenSquareParen',
  OpenBraceParen='OpenBraceParen',
  CloseParen='CloseParen',
  CloseSquareParen='CloseSquareParen',
  CloseBraceParen='CloseBraceParen',
  Number='Number',
  String='String',
  Identifier='Identifier',
  Whitespace='Whitespace',
  Boolean='Boolean'
};

export enum ValueType {
  NonFunction='NonFunction',
  BuiltinFunction='BuiltinFunction',
  Function='Function',
};

export enum ParseError {
  MismatchedParen='MismatchedParen',
  CharactersRemain='CharactersRemain'
}

export enum TokenizeError {
  
}

export type Atom
  = Str | Num | Id | Bool;
  
export type Bool = {
    type: AtomType.Boolean,
    value: boolean
  };

export type Definition
  = ['define', [string, string[]], Expr]
  | ['define', string, Expr];

export type DefOrExpr
  = Definition | Expr;

export type Env = Map<String,Value>;

export type Error
 = TokenizeError
 | ParseError

export type Expr
  = Atom
  | [string, Expr[]];

export type Fn
  = {
    args: string[],
    env: Env,
    body: Expr
  };

export type Id
  = {
    type: AtomType.Identifier,
    value: string
  };

export type Num
  = {
    type: AtomType.Number,
    value: number
  };

export type Result<T> = ResultSuccess<T> | ResultFailure<T>;

export type ResultFailure<T>
  = {
    error: string,
    remain: Token[]
  };

export type ResultSuccess<T>
  = {
    thing: T,
    remain: Token[]
  };

export type SExp
  = Atom | SExp[] | ParseError;
  
export type Str
  = {
    type: AtomType.String,
    value: string
  };

export type SourceLocation 
  = {
    row: number,
    col: number
  };  

export type Token
  = {
    type: TokenType
    value: string,
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  };

export type Value
  = {
    type: ValueType.NonFunction,
    value: string | number | boolean
  } | {
    type: ValueType.BuiltinFunction,
    value: ((vs: Value[]) => Value)
  } | {
    type: ValueType.Function,
    value: Fn
  };