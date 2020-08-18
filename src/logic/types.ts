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
  = ReadError | SExp[] | {
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
  };

export type ReadError
  =  {
    readError: 'No Valid SExp'
             | 'No Closing Paren'
             | 'No Open Paren'
             | 'Mismatched Parens',
    tokens: Token[]
  } | TokenError;

// ----------------------------------------------------------------------------

export type DefOrExpr
  = Definition | Expr;

export type Definition
  = ['define', [string, string[]], Expr]
  | ['define', string, Expr]
  | DefinitionError;


export type Expr
  = {
    type: 'String',
    expr: string
  } | {
    type: 'Num',
    expr: number
  } | {
    type: 'Id',
    expr: string
  } | {
    type: 'Bool',
    expr: boolean
  } 
  | [string, Expr[]]
  | ExprError;

export type DefinitionError
  = {
    defnError: 'Invalid expression passed where function name was expected'
             | 'Invalid expression passed where function argument was expected'
             | 'Passed a non-definition as definition'
             | 'Expected a variable name, or a function header'
             | 'Expected a function header with parameters in parentheses, received nothing in parentheses'
             | 'Expected a function header with parameters in parentheses, received a function name with no parameters'
             | 'A function in BSL cannot have zero parameters'
             | 'A definition can\'t have more than 3 parts'
             | 'Cannot have a definition as the body of a definition',
    sexps: SExp[]
  } | ReadError;

export type ExprError
  = {
    exprError: 'Empty Expr'
             | 'Defn inside Expr'
             | 'No function name after open paren'
             | 'Function call with no arguments',
    sexps: SExp[]
  } | ReadError;

// ----------------------------------------------------------------------------

export type Value
  = {
    type: 'NonFunction',
    value: string | number | boolean
  } | {
    type: 'BuiltinFunction',
    value: ((vs: Value[]) => Value)
  } | {
    type: 'Function',
    value: Fn
  } | ValueError;

export type Fn
  = {
    args: string[],
    env: Env,
    body: Expr
  };

export type Env = Map<String,Value>;

export type ValueError
  = {
    valueError: "Id not in environment"
    deforexprs: DefOrExpr[]
  } | DefinitionError | ExprError;