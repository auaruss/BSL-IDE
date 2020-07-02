enum AtomType {
  String='String',
  Number='Number',
  Boolean='Boolean',
  Identifier='Identifier'
}

type Str
  = {
    type: AtomType.String,
    value: string
  };

type Num
  = {
    type: AtomType.Number,
    value: number
  };

type Id
  = {
    type: AtomType.Identifier,
    value: string
  };

type Bool = {
  type: AtomType.Boolean,
  value: boolean
};

type Atom
  = Str | Num | Id | Bool;

type SExp
  = Atom | SExp[];


// BSL Grammar
type DefOrExpr
  = Definition | Expr;

type Definition
  = ['define', [Id, Id[]], Expr]
  | ['define', Id, Expr];

type Expr
  = Atom
  | [Id, Expr[]]

// Tells whether x is an Atom.
const isAtom = (x: any): x is Atom  => {
  if (!(typeof x === "object")) return false;
  if (!(typeof x.type === "string")) return false;
  return (
       (x.type === AtomType.String && (typeof x.value === "string"))
    || (x.type === AtomType.Number && (typeof x.value === "number"))
    || (x.type === AtomType.Identifier && (typeof x.value === "string"))
    || (x.type === AtomType.Boolean && (typeof x.value === "boolean"))
  );
}

// Tells whether x is a Str.
const isStr = (x: any): x is Str => {
  return isAtom(x) && x.type === AtomType.String;
}

// Tells whether x is a Num.
const isNum = (x: any): x is Num => {
  return isAtom(x) && x.type === AtomType.Number;
}

// Tells whether x is an Id.
const isId = (x: any): x is Id => {
  return isAtom(x) && x.type === AtomType.Identifier;
}

// Tells whether x is a Bool.
const isBool = (x: any): x is Bool => {
  return isAtom(x) && x.type === AtomType.Boolean;
}

// Tells whether x is an Id[].
const isIdArray = (x: any): x is Id[] => {
  return Array.isArray(x) && x.every(isId);
}

// Checks to make sure the parsed SExps have the proper structure of an Expr.
// Note: This function changes the input SExp to an Expr, by separating
//       the first identifier in a valid expression call from the rest of them.
const syntaxCheckExpr = (sexp: SExp): Expr => {
  if (isAtom(sexp)) {
    return sexp;
  } else if (Array.isArray(sexp)){
    if (sexp.length === 0) {
      throw new Error('Invalid Expression: Found an empty expression.');
    }
    if (isId(sexp[0])) {
      if (sexp[0].value === 'define') {
        // We know the definition is inside an expression because the only intended way for this function
        // to be called is by syntaxCheckDefOrExpr, which would already let us know that the top level thing
        // that called this was not a definition itself, which is the only valid location for a definition in BSL.
        throw new Error('Invalid Expression: Found a definition inside an expression.');
      }
      const restOfExprs = sexp.slice(1).map(syntaxCheckExpr);
      return [sexp[0], restOfExprs];
    } else {
      throw new Error('Invalid expression: Expression missing a starting identifier.')
    }
  }
  throw new Error('Invalid expression: Unknown error.');
}

// Checks to make sure the parsed SExps have the proper structure of a Definition.
// Note: This function changes the input SExp to a Definition, namely separating
//       the first identifier in a function definition from its arguments.
const syntaxCheckDefinition = (sexp: SExp): Definition => {
  if (Array.isArray(sexp) && sexp.length === 3 && isId(sexp[0]) && sexp[0].value === 'define') {
    if (isIdArray(sexp[1]) && sexp[1].length >= 2) {
      return ['define', [sexp[1][0], sexp[1].slice(1)], syntaxCheckExpr(sexp[2])]
    } else if (isId(sexp[1])) {
      return ['define', sexp[1], syntaxCheckExpr(sexp[2])];
    } else {
      throw new Error ('Invalid Definition: The defintion provided matches no case of Definition');
    }
  } else {
    throw new Error('Invalid Definition: Tried to syntax-check a non-definition.');
  }
}

// Checks to make sure the parsed SExps have the proper structure of a Single BSL DefOrExpr.
const syntaxCheckDefOrExpr = (sexp: SExp): DefOrExpr => {
  if (Array.isArray(sexp) && sexp.length > 0 && isId(sexp[0]) && sexp[0].value === 'define') {
    return syntaxCheckDefinition(sexp);
  } else {
    return syntaxCheckExpr(sexp);
  }
}

module.exports = {
  'syntaxCheckExpr': syntaxCheckExpr,
  'syntaxCheckDefinition': syntaxCheckDefinition,
  'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr
};