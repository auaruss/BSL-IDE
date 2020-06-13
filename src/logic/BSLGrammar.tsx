// How to more easily check if a name is actually a valid name?

// Helper types.
type Env = ListOf<Var>;
type Name = string;
type FunctionDefinition = [Name, Closure];
type Closure = [Env, Expr];
type Struct = [Name, ListOf<Var>];
type Var = [Name, Expr];

type Empty<T> = [];
type NonEmpty<T> = [T, ListOf<T>];
type ListOf<T>
  = Empty<T>
  | NonEmpty<T>;

// BSL Specification.

type program = ListOf<DefOrExpr>;

type DefOrExpr
  = Definition
  | Expr
  | TestCase
  | LibraryRequire;

type Definition
  = ['define', [Name, Var, ListOf<Var>], Expr]
  | ['define', Name, Expr]
  | ['define', Name, ['lambda'|'λ', ListOf<Var>, Expr]]
  | ['define-struct', Name, ListOf<Name>];

type Expr
  = [Name, ListOf<Expr>]
  | ['cond', ListOf<[Expr, Expr]>, ['else', Expr]?]
  | ['if', Expr, Expr, Expr]
  | ['and', ListOf<Expr>]
  | ['or', ListOf<Expr>]
  | Name
  | symbol
  | Empty<any>
  | number
  | boolean
  | string; //character?

type TestCase
  = ['check-expect', Expr, Expr]
  | ['check-random', Expr, Expr]
  | ['check-within', Expr, Expr, Expr]
  | ['check-member-of', ListOf<Expr>]
  | ['check-range', Expr, Expr, Expr]
  | ['check-satisfied', Expr, Name]
  | ['check-error', Expr, Expr?];
  
type LibraryRequire
  = ['require', string]
  | ['require', ['lib', ListOf<string>]]
  | ['require', ['planet', string, Package]];

type Package
  = [string, string, number, number];