// Types, enums and related predicates used in the student language evaluator.
// Sorted alphabetically.

export type SourceLocation 
  = {
    row: number,
    col: number
  };

// ----------------------------------------------------------------------------

export type Token
  = {
    type: TokenType
    value: string,
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  } 
  | TokenError;

export enum TokenType {
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

export type TokenError
  = {
    error: 'Unidentified Token',
    value: string
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  };

// ----------------------------------------------------------------------------

export enum AtomType {
  String='String',
  Number='Number',
  Boolean='Boolean',
  Identifier='Identifier'
};

export type Atom
  = Str | Num | Id | Bool;

export type Str
  = {
    type: AtomType.String,
    value: string
  };

export type Num
  = {
    type: AtomType.Number,
    value: number
  };

export type Id
  = {
    type: AtomType.Identifier,
    value: string
  };

export type Bool = {
    type: AtomType.Boolean,
    value: boolean
  };

// ----------------------------------------------------------------------------

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
  = {
    val: Atom
        | SExp[]
        | SExpError,
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  };

export type SExpError
  = TokenError
  | {
    error: 'No Closing Paren',
    remain: Token[]
  } | {
    error: 'No Open Paren',
    remain: Token[]
  } | {
    error: 'Mismatched Parens',
    remain: Token[]
  } | {
    error: 'Parsed non-token (should never be seen)'
    remain: Token[];
  } | {
    error: 'Parsed non-result (should never be seen)',
    remain: Token[]
  } | {
    error: 'Non-boolean was processed as a boolean (should never be seen)',
    remain: Token[]
  };

// ----------------------------------------------------------------------------

export type DefOrExpr
  = {
    val: Definition | Expr,
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  }

export type Definition
  = ['define', [string, string[]], Expr]
  | ['define', string, Expr]
  | SyntaxError

export type Expr
  = Atom
  | [string, Expr[]]
  | SyntaxError;

export type SyntaxError
  = {
    error: 'Empty Expr'
  }; //...

// ----------------------------------------------------------------------------

export type Value
  = {
    type: ValueType.NonFunction,
    value: string | number | boolean | Error
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  } | {
    type: ValueType.BuiltinFunction,
    value: ((vs: Value[]) => Value)
  } | {
    type: ValueType.Function,
    value: Fn
    loc: {
      start: SourceLocation
      end: SourceLocation
    }
  };

export enum ValueType {
  NonFunction='NonFunction',
  BuiltinFunction='BuiltinFunction',
  Function='Function',
};

export type Fn
  = {
    args: string[],
    env: Env,
    body: Expr
  };

export type Env = Map<String,Value>;

type Error
  = SyntaxError
  | {
    error: "Id Not in Env"
    id: string
  } // ...