// Types used in the student language evaluator.

export type Token
  = {
    type: TokenType
    token: string,
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
    tokenError: 'Unidentified Token',
    string: string
  };

// ----------------------------------------------------------------------------

export type Result<T>
  = {
    thing: T,
    remain: Token[]
  };

export type SExp
  = {
    type: 'String'
    sexp: string
  } | {
    type: 'Num'
    sexp: number
  } | {
    type: 'Id',
    sexp: string
  } | {
    type: 'Bool',
    sexp: boolean
  } | SExp[] | ReadError;

export type ReadError
  =  {
    readError: 'No Valid SExp'
             | 'No Closing Paren'
             | 'No Open Paren'
             | 'Mismatched Parens'
             | 'Read non-result (should never be seen)'
             | 'Non-boolean was processed as a boolean (should never be seen)',
    tokens: Token[]
  } | TokenError;

// ----------------------------------------------------------------------------

export type DefOrExpr
  = Definition | Expr;

export type Definition
  = ['define', [string, string[]], Expr]
  | ['define', string, Expr]
  | { case:'definition', err: DefinitionError };


export type Expr
  = {
    type: 'String'
    expr: string
  } | {
    type: 'Num'
    expr: number
  } | {
    type: 'Id',
    expr: string
  } | {
    type: 'Bool',
    expr: boolean
  } 
  | [string, Expr[]] 
  | { case: 'Expr', err: ExprError };

export type DefinitionError
  = {
    error: 'Invalid definition'
         | 'Passed a non-definition as definition',
    sexps: SExp[]
  }; //...

export type ExprError
  = {
    error: 'Empty Expr'
         | 'Defn inside Expr'
         | 'Missing starting ID',
    sexps: SExp[]
  };

// ----------------------------------------------------------------------------

export type Value
  = {
    type: ValueType.NonFunction,
    value: string | number | boolean | Error
  } | {
    type: ValueType.BuiltinFunction,
    value: ((vs: Value[]) => Value)
  } | {
    type: ValueType.Function,
    value: Fn
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
  = /*ParseError
  | */{
    error: "Id Not in Env"
    id: string
  } // ...