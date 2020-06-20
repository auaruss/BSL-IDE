// // How to more easily check if a name is actually a valid name?

// // Helper types.
// type BSLName = string;
// // type FunctionDefinition = [BSLName, Closure];
// // type Struct = [BSLName, ListOf<Var>];
// type Var = [BSLName, Expr];

// type Empty<T> = [];
// type NonEmpty<T> = [T, ListOf<T>];
// type ListOf<T>
//   = Empty<T>
//   | NonEmpty<T>;

// // BSL Specification.
// type program = ListOf<DefOrExpr>;

// type DefOrExpr
//   = Definition
//   | Expr
//   | TestCase
//   | LibraryRequire;

// type Definition
//   = ['define', [BSLName, Var, ListOf<Var>], Expr]
//   | ['define', BSLName, Expr]
//   | ['define', BSLName, ['lambda'|'λ', ListOf<Var>, Expr]]
//   | ['define-struct', BSLName, ListOf<BSLName>];

// type Expr
//   = [BSLName, ListOf<Expr>]
//   | ['cond', ListOf<[Expr, Expr]>, ['else', Expr]?]
//   | ['if', Expr, Expr, Expr]
//   | ['and', ListOf<Expr>]
//   | ['or', ListOf<Expr>]
//   | BSLName
//   | symbol
//   | Empty<any>
//   | number
//   | boolean
//   | string; //character?

// type TestCase
//   = ['check-expect', Expr, Expr]
//   | ['check-random', Expr, Expr]
//   | ['check-within', Expr, Expr, Expr]
//   | ['check-member-of', ListOf<Expr>]
//   | ['check-range', Expr, Expr, Expr]
//   | ['check-satisfied', Expr, BSLName]
//   | ['check-error', Expr, Expr?];
  
// type LibraryRequire
//   = ['require', string]
//   | ['require', ['lib', ListOf<string>]]
//   | ['require', ['planet', string, Package]];

// type Package
//   = [string, string, number, number];