

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

const isAtom = (x: any): x is Atom  => {
  return (
       ((x as Atom).type === AtomType.String && (typeof (x as Atom).value === "string"))
    || ((x as Atom).type === AtomType.Number && (typeof (x as Atom).value === "number"))
    || ((x as Atom).type === AtomType.Identifier && (typeof (x as Atom).value === "string"))
    || ((x as Atom).type === AtomType.Boolean && (typeof (x as Atom).value === "boolean"))
  );
}

// Tells whether an Atom is a Str.
const isStr = (x: any): x is Str => {
  return isAtom(x) && x.type === AtomType.String;
}

// Tells whether an Atom is a Num.
const isNum = (x: any): x is Num => {
  return isAtom(x) && x.type === AtomType.Number;
}

// Tells whether an Atom is a Id.
const isId = (x: any): x is Id => {
  return isAtom(x) && x.type === AtomType.Identifier;
}

// Tells whether an Atom is a Bool.
const isBool = (x: any): x is Bool => {
  return isAtom(x) && x.type === AtomType.Boolean;
}

// Checks to make sure the parsed SExps have the proper structure of a BSL program.
// Note: This function makes some adjustments to the structure of its input, namely separating
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
      const restOfExprs = sexp.slice(1).map(x => syntaxCheckExpr(x));
      return [sexp[0], restOfExprs];
    } else {
      throw new Error('Invalid expression: Expression missing a starting identifier.')
    }
  }
  throw new Error('Invalid expression: Unknown error.');
}

module.exports = {
  'syntaxCheckExpr': syntaxCheckExpr
};