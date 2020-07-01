type Identifier = string;

// BSL Grammar
type Program = DefOrExpr[];

type DefOrExpr
  = Definition
  | Expr
  | TestCase
  | LibraryRequire;

type Definition
  = ['define', [Identifier, Identifier, Identifier[]?], Expr]
  | ['define', Identifier, Expr]
  | ['define', Identifier, ['lambda'|'λ', Identifier[], Expr]]
  | ['define-struct', Identifier, Identifier[]]

type Cond = ['cond', [Expr, Expr][], ['else', Expr]?]

type Expr
  = symbol
  | number
  | boolean
  | string
  | Identifier
  | []
  | [Identifier, Expr[]]
  | Cond
  | ['if', Expr, Expr, Expr]
  | ['and', Expr[]]
  | ['or', Expr[]];

type TestCase
  = ['check-expect', Expr, Expr]
  | ['check-random', Expr, Expr]
  | ['check-within', Expr, Expr, Expr]
  | ['check-member-of', Expr[]]
  | ['check-range', Expr, Expr, Expr]
  | ['check-satisfied', Expr, Identifier]
  | ['check-error', Expr, Expr?];
  
type LibraryRequire
  = ['require', string]
  | ['require', ['lib', string[]]]
  | ['require', ['planet', string, Package]];

type Package
  = [string, string, number, number];

// type SExp
//   = {
//     thing:
//   } | SExp[];

// const syntaxCheckDefOrExpr