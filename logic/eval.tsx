'use strict';

const parse = require('./parse').parse;
// TODO: Check for functions-as-values in syntax checker

const builtinEnv = (): Env => {
  let m = new Map<String, Value>();


  return m;
}

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
  = ['define', [string, string[]], Expr]
  | ['define', string, Expr];

type Expr
  = Atom
  | [string, Expr[]];

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
  } else if (Array.isArray(sexp)) {
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
      return [sexp[0].value, restOfExprs];
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
      return ['define', [sexp[1][0].value, sexp[1].slice(1).map(x => x.value)], syntaxCheckExpr(sexp[2])]
    } else if (isId(sexp[1])) {
      return ['define', sexp[1].value, syntaxCheckExpr(sexp[2])];
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

enum ValueType {
  NonFunction='NonFunction',
  BuiltinFunction='BuiltinFunction',
  Function='Function',
};


type Value
  = {
    type: ValueType.NonFunction,
    value: string | number | boolean
  } | {
    type: ValueType.BuiltinFunction,
    value: Fn
  } | {
    type: ValueType.Function,
    value: Fn
  };

type Env = Map<String,Value>;

type Fn
  = {
    args: string[],
    env: Env,
    body: Expr
  };

// Computes the value of an expression with respect to an enviroment.
const valOf = (exp: Expr, env: Env): Value => {
  if (isAtom(exp)) {
    if (isId(exp)) {
      if (isInEnv(exp.value, env)) {
        return getVal(exp.value, env);
      }
    }
    return { type: ValueType.NonFunction, value: exp.value };

  } else if (exp[0] === 'if') {
    if (exp[1].length !== 3) {
      throw new Error('Invalid invocation of "if".');
    }
    const pred = valOf(exp[1][0], env);
    
    if (pred.type === ValueType.NonFunction && typeof pred.value === 'boolean') {
      if (pred.value) {
        return valOf(exp[1][1], env);
      } else {
        return valOf(exp[1][2], env);
      }
    } else {
      throw new Error('Invalid invocation of "if".');
    }
  } else if (exp[0] === '+') {
    if (exp[1].length !== 2) {
      throw new Error('Invalid invocation of "+" 1.');
    }
    let a = valOf(exp[1][0], env).value;
    let b = valOf(exp[1][1], env).value;
    if (typeof a === 'number' && typeof b === 'number') {
      return {type: ValueType.NonFunction, value: a + b};
    }
    throw new Error('Invalid invocation of "+" 2.');
  } else if (exp[0] === '-') {
    if (exp[1].length !== 2) {
      throw new Error('Invalid invocation of "-".');
    }
    let a = valOf(exp[1][0], env).value;
    let b = valOf(exp[1][1], env).value;
    if (typeof a === 'number' && typeof b === 'number') {
      return {type: ValueType.NonFunction, value: a - b};
    }
    throw new Error('Invalid invocation of "-".');
  } else if (exp[0] === '=') {
    if (exp[1].length !== 2) {
      throw new Error('Invalid invocation of "=".');
    }
    let a = valOf(exp[1][0], env).value;
    let b = valOf(exp[1][1], env).value;
    return {type: ValueType.NonFunction, value: a === b};
  } else {
    const f = getVal(exp[0], env);
    let vals = exp[1].map(ex => valOf(ex, env));

    if (f.type === ValueType.Function) {
      if (f.value.args.length !== exp[1].length) throw new Error('Arity mismatch.');
      let e: Env = new Map<String, Value>(f.value.env);
      
      for (let i = 0; i < exp[1].length; i++) {
        extendEnv(f.value.args[i], vals[i], e);
      }

      return valOf(f.value.body, e);
    } else {
      throw new Error('Tried to invoke a non-function.');
    }
  } 
}

// Checks if an identifier is in an enviroment.
const isInEnv = (id: string, env: Env): boolean => {
  return env.has(id);
}

// Gets an identifier's value from an environment and fails if it's not there.
const getVal = (id: string, env: Env): Value => {
  const a = env.get(id);
  if (a !== undefined) return a;
  throw new Error(id + ' is not in the current environmnent.');
}

const extendEnv = (id: string, v: Value, env: Env): void => {
  env.set(id, v);
}

// Populate the env with the definitions in defns.
const populateEnv = (defns: Definition[], env: Env): Env => {
  for (let defn of defns) {
    if (Array.isArray(defn[1])) {
      extendEnv(
        defn[1][0],
        {
          type: ValueType.Function,
          value: {
            args: defn[1][1],
            env: env,
            body: defn[2] 
          }
        },
        env
      );
    } else {
      extendEnv(defn[1], valOf(defn[2], env), env);
    }
  }

  return env;
}

const isDefinition = (x: any): x is Definition => {
  if (! (Array.isArray(x))) return false;
  return x[0] === 'define';
}

const defOrExprIsExpr = (d: DefOrExpr): d is Expr => {
  return (! isDefinition(d));
}

const evalDefOrExprs = (p: DefOrExpr[]): Value[] => {
  let defns = p.filter(isDefinition);
  let exprs = p.filter(defOrExprIsExpr);
  let e = populateEnv(defns, new Map<String, Value>());

  return exprs.map(x => valOf(x, e));
}

const evaluate = (s: string): Value[] => {
  return evalDefOrExprs(parse(s).map(syntaxCheckDefOrExpr));
}

module.exports = {
  'syntaxCheckExpr': syntaxCheckExpr,
  'syntaxCheckDefinition': syntaxCheckDefinition,
  'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr,
  'valOf': valOf,
  'evaluate': evaluate
};