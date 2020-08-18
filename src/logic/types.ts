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
    defnError: 'Invalid definition name'
             | 'Invalid function name'
             | 'Passed a non-definition as definition'
             | 'Expected a variable name, or a function name and its variables (in parentheses), but nothing\'s there'
             | 'Expected a function header and parameters (in parentheses), received nothing'
             | 'A function in BSL cannot have zero parameters',
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