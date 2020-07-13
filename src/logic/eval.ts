'use strict';

/**
 * An evaluator for the student languages.
 * @author: Alice Russell, Sam Soucie 
 * 
 * @todo implement better error messages for builtins 
 *       such as "/: expects a number as 2nd argument, given #true"
 */ 

import {
  AtomType, Atom, Bool, Definition,
  DefOrExpr, Env, Expr, Id, Num,
  SExp, Str, Value, ValueType
} from './types';

import {
  defOrExprIsExpr, isAtom, isBool, isDefinition, isId,
  isIdArray, isNum, isNumberArray, isStr
} from './predicates';

import {
  parse
} from './parse';

/**
 * Constructor for a BuiltinFunction case of Value.
 * @param v an anonymous function which takes a list of values and returns a value
 */
const NFn = (v: number|string|boolean): Value => {
  return {type: ValueType.NonFunction, value: v};
}

/**
 * Constructor for a BuiltinFunction case of Value.
 * @param v an anonymous function which takes a list of values and returns a value
 */
const BFn = (v: (vs: Value[]) => Value): Value => {
  return {type: ValueType.BuiltinFunction, value: v};
}

const builtinEnv = (): Env => {
  let m = new Map<String, Value>();
  
  m.set('+',
    BFn(
      (vs: Value[]) => {
        let ns = vs.map(v => v.value);
        if (isNumberArray(ns)) {
          return NFn(
            ns.reduce((acc: number, elem: number) => acc + elem, 0)
          );
        } else {
          throw new Error('+: All arguments to + must be numbers.');
        }
      }
    )
  );

  m.set('*',
    BFn(
    (vs: Value[]) => {
        let ns = vs.map(v => v.value);
        if (isNumberArray(ns)) {
          return NFn(
            ns.reduce((acc: number, elem: number) => acc * elem, 1)
          );
        } else {
          throw new Error('*: All arguments to * must be numbers.');
        }
      }
    )
  );

  m.set('-',
    BFn(
      (vs: Value[]) => {
        let ns = vs.map(v => v.value);
        if (isNumberArray(ns)) {
          if (ns.length === 0) throw new Error('-: expects at least 1 argument, but found none');
          if (ns.length === 1) return NFn(-ns[0]);
          return NFn(
            ns.slice(1).reduce((acc: number, elem: number) => acc - elem, ns[0])
          );
        } else {
          throw new Error('-: All arguments to - must be numbers.');
        }
      }
    )
  );

  m.set('/',
    BFn(
      (vs: Value[]) => {
        let ns = vs.map(v => v.value);
        if (isNumberArray(ns)) {
          if (ns.length === 0) throw new Error('-: expects at least 1 argument, but found none');
          if (ns.length === 1) return NFn(1/ns[0]);
          return NFn(
            ns.slice(1).reduce((acc: number, elem: number) => acc / elem, ns[0])
          );
        } else {
          throw new Error('/: All arguments to / must be numbers.');
        }
      }
    )
  );

  m.set('=',
    BFn(
      (vs: Value[]) => {
        if (vs.length === 0) throw new Error('=: expects at least 1 argument, but found none');
        let valToBeEqualTo = vs[0].value;
        return NFn(
          vs.slice(1).reduce((acc: boolean, elem: Value) => acc && elem.value === valToBeEqualTo, true)
        );
      }
    )
  );

  return m;
}

/**
 * Checks to make sure the parsed SExps have the proper structure of an Expr.
 * @remark This function changes the input SExp to an Expr, by separating
 *         the first identifier in a valid expression call from the rest of them.
 * @param sexp
 * @throws error if the expression contains nothing
 * @throws error if the sexp is actually a Definition
 * @throws error if function call is missing a starting Id.
 * @throws error if expression is neither an Atom or array.
 */
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

/**
 * Checks to make sure the parsed SExps have the proper structure of a Definition.
 * @remark This function changes the input SExp to a Definition, namely separating
 *         the first identifier in a function definition from its arguments.
 * @param sexp 
 * @throws error when checking non-definitions
 */
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

/**
 * Checks to make sure the parsed SExps have the proper structure of a Single BSL DefOrExpr.
 * @param sexp 
 */
const syntaxCheckDefOrExpr = (sexp: SExp): DefOrExpr => {
  if (Array.isArray(sexp) && sexp.length > 0 && isId(sexp[0]) && sexp[0].value === 'define') {
    return syntaxCheckDefinition(sexp);
  } else {
    return syntaxCheckExpr(sexp);
  }
}

/**
 * Computes the value of an expression with respect to an environment.
 * @param exp 
 * @param env 
 * @throws error if 'if' does not have exactly 3 arguments passed to it
 * @throws error if functions are not passed the correct number of arguments
 * @throws error if trying to call a non-function 
 */
const valOf = (exp: Expr, env: Env): Value => {
  if (isAtom(exp)) {
    if (isId(exp)) {
      if (isInEnv(exp.value, env)) {
        return getVal(exp.value, env);
      }
      throw new Error(exp.value + ' is not in the environment.');
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
    } else if (f.type === ValueType.BuiltinFunction) {
      return f.value(vals);      
    } else {
      throw new Error('Tried to invoke a non-function.');
    }
  } 
}

/**
 * Checks if an identifier is in an enviroment
 * @param id 
 * @param env 
 */
const isInEnv = (id: string, env: Env): boolean => {
  return env.has(id);
}

/**
 * Gets an identifier's value from an environment and fails if it's not there.
 * @param id 
 * @param env 
 * @throws error if the Id isnt defined in the Env
 */
const getVal = (id: string, env: Env): Value => {
  const a = env.get(id);
  if (a !== undefined) return a;
  throw new Error(id + ' is not in the current environmnent.');
}

/**
 * Extends an enviroment with a new Id, Value pair.
 * @param id key
 * @param v value
 * @param env 
 */
const extendEnv = (id: string, v: Value, env: Env): void => {
  env.set(id, v);
}

/**
 * Populate the env with the definitions in defns.
 * @param defns 
 * @param env 
 */
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

/**
 * Evaluates a a program.
 * @param p the DefOrExpr[] (program) to be evaluated
 */
const evalDefOrExprs = (p: DefOrExpr[]): Value[] => {
  let defns = p.filter(isDefinition);
  let exprs = p.filter(defOrExprIsExpr);
  let e = populateEnv(defns, builtinEnv());

  return exprs.map(x => valOf(x, e));
}

/**
 * Evaluates a well-formed BSL program.
 * @param s program as a string
 */
export const evaluate = (s: string): Value[] => {
  return evalDefOrExprs(parse(s).map(syntaxCheckDefOrExpr));
}

export const valToString = (v: Value): string => {
  switch (v.type) {
    case ValueType.BuiltinFunction:
      return '...';
    case ValueType.Function:
      
    case ValueType.NonFunction:
      return v.value.toString();
  }
} 

module.exports = {
  'builtinEnv': builtinEnv,
  'evaluate': evaluate,
  'syntaxCheckDefinition': syntaxCheckDefinition,
  'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr,
  'syntaxCheckExpr': syntaxCheckExpr,
  'valOf': valOf
};