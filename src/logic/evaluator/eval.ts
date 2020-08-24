'use strict';

import { DefOrExpr, Definition, Expr, ExprValue, Env, Value, DefinitionValue } from '../types';
import { isDefinition, isExpr, isExprError, isValueError, isDefinitionError } from '../predicates';
import { parse } from './parse';
import { DefnVal, BFn, Fn, NFn, ValErr} from '../constructors';

const processDefOrExpr = (d: DefOrExpr): any => {
  if (isDefinition(d)) {
    processDefinition(d);
  } else {
    processExpr(d);
  }
}

const processDefinition = (d: Definition): any => {
  if (isDefinitionError(d)) {
    /* ... */
  } else if (typeof d.header === 'string') {
    processExpr(d.body);
  } else {
    processExpr(d.body);
  }
}

const processExpr = (e: Expr): any => {
  if (isExprError(e)) {
    /* ... */
  } else switch (e.type) {
    case 'String':
      break;
    case 'Num':
      break;
    case 'Id':
      break;
    case 'Bool':
      break;
    case 'Call':
      e.expr.args.map(processExpr);
      break;
  }
}

export const evaluate = (exp: string): Value[] => {
  return evaluateDefOrExprs(parse(exp));
}

export const evaluateDefOrExprs = (deforexprs: DefOrExpr[]): Value[] => {
  let env = builtinEnv();

  for (let d of deforexprs.filter(isDefinition)) {
    env = populateEnv(d, env);
  }

  return deforexprs.map(e => evaluateDefOrExpr(e, env));
}

const evaluateDefOrExpr = (d: DefOrExpr, env: Env): Value => {
  if (isDefinition(d)) {
    return evaluateDefinition(d, env);
  } else {
    return evaluateExpr(d, env);
  }
}

const evaluateDefinition = (d: Definition, env: Env): DefinitionValue => {
  if (isDefinitionError(d)) {
    return d;
  } else if (typeof d.header === 'string') {
  } else {
  }
}

const evaluateExpr = (e: Expr, env: Env): ExprValue => {
  if (isExprError(e)) {
    return e;
  } else if (Array.isArray(e)) {
    let [f, exprs] = e;
    let args = exprs.map(_ => evaluateExpr(_, env));
    let val = getVal(f, env);
    if (val) {
      if (isValueError(val)) {
        // return ValErr: body of function has err in it
      } else if (val.type === 'Function') {
          let params = val.value;
      } else if (val.type === 'BuiltinFunction') {

      } else {
        // return ValErr: tried to call a constant as a function
      }
    } else {
      // return ValErr : f not in env
    }
  } else if (e.type === 'String') {
    return NFn(e.expr);
  } else if (e.type === 'Num') {
    return NFn(e.expr);
  } else if (e.type === 'Id') {
    if (isInEnv(e.expr, env)) {
      // ...
    } else {
      // return ValErr
    }
  } else if (e.type === 'Bool') {
    return NFn(e.expr);
  }
}

/**
 * Puts a definition into an environment.
 * @param d 
 * @param env 
 */
const populateEnv = (d: Definition, env: Env): Env => {
  if (Array.isArray(d)) {
    if (typeof d[1] === 'string') {
      let f = d[1], val = evaluateExpr(d[2], env);
      extendEnv(f, val, env);
      return env;
    } else {
      let [f, params] = d[1], body = d[2];
      extendEnv(f, Fn(params, env, body), env);
      return env;
    }
  } else {
    return env;
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
 * Extends an enviroment with a new Id, Value pair.
 * @param id key
 * @param v value
 * @param env 
 */
const extendEnv = (id: string, v: ExprValue, env: Env): void => {
  env.set(id, v);
}

/**
 * Gets an identifier's value from an environment if it's there.
 * @param id 
 * @param env
 */
const getVal = (id: string, env: Env): ExprValue | false => {
  const a = env.get(id);
  if (a !== undefined) return a;
  return false;
}

const builtinEnv = (): Env => {
  let m = new Map<String, ExprValue>();
  
  // m.set('+',
  //   BFn(
  //     (vs: Value[]) => {
  //       let ns = vs.map(v => v.value);
  //       if (ns) {
  //         return NFn(
  //           ns.reduce((acc: number, elem: number) => acc + elem, 0)
  //         );
  //       } else {
  //         throw new Error('+: All arguments to + must be numbers.');
  //       }
  //     }
  //   )
  // );

  // m.set('*',
  //   BFn(
  //   (vs: Value[]) => {
  //       let ns = vs.map(v => v.value);
  //       if (isNumberArray(ns)) {
  //         return NFn(
  //           ns.reduce((acc: number, elem: number) => acc * elem, 1)
  //         );
  //       } else {
  //         throw new Error('*: All arguments to * must be numbers.');
  //       }
  //     }
  //   )
  // );

  // m.set('-',
  //   BFn(
  //     (vs: Value[]) => {
  //       let ns = vs.map(v => v.value);
  //       if (isNumberArray(ns)) {
  //         if (ns.length === 0) throw new Error('-: expects at least 1 argument, but found none');
  //         if (ns.length === 1) return NFn(-ns[0]);
  //         return NFn(
  //           ns.slice(1).reduce((acc: number, elem: number) => acc - elem, ns[0])
  //         );
  //       } else {
  //         throw new Error('-: All arguments to - must be numbers.');
  //       }
  //     }
  //   )
  // );

  // m.set('/',
  //   BFn(
  //     (vs: Value[]) => {
  //       let ns = vs.map(v => v.value);
  //       if (isNumberArray(ns)) {
  //         if (ns.length === 0) throw new Error('-: expects at least 1 argument, but found none');
  //         if (ns.length === 1) return NFn(1/ns[0]);
  //         return NFn(
  //           ns.slice(1).reduce((acc: number, elem: number) => acc / elem, ns[0])
  //         );
  //       } else {
  //         throw new Error('/: All arguments to / must be numbers.');
  //       }
  //     }
  //   )
  // );

  // m.set('=',
  //   BFn(
  //     (vs: Value[]) => {
  //       if (vs.length === 0) throw new Error('=: expects at least 1 argument, but found none');
  //       let valToBeEqualTo = vs[0].value;
  //       return NFn(
  //         vs.slice(1).reduce((acc: boolean, elem: Value) => acc && elem.value === valToBeEqualTo, true)
  //       );
  //     }
  //   )
  // );

  return m;
}

// /**
//  * Computes the value of an expression with respect to an environment.
//  * @param exp 
//  * @param env 
//  * @throws error if 'if' does not have exactly 3 arguments passed to it
//  * @throws error if functions are not passed the correct number of arguments
//  * @throws error if trying to call a non-function 
//  */
// const valOf = (exp: Expr, env: Env): Value => {
//   if (isAtom(exp)) {
//     if (isId(exp)) {
//       if (isInEnv(exp.value, env)) {
//         return getVal(exp.value, env);
//       }
//       throw new Error(exp.value + ' is not in the environment.');
//     }
//     return { type: ValueType.NonFunction, value: exp.value };

//   } else if (exp[0] === 'if') {
//     if (exp[1].length !== 3) {
//       throw new Error('Invalid invocation of "if".');
//     }
//     const pred = valOf(exp[1][0], env);
    
//     if (pred.type === ValueType.NonFunction && typeof pred.value === 'boolean') {
//       if (pred.value) {
//         return valOf(exp[1][1], env);
//       } else {
//         return valOf(exp[1][2], env);
//       }
//     } else {
//       throw new Error('Invalid invocation of "if".');
//     }
//   } else {
//     const f = getVal(exp[0], env);
//     let vals = exp[1].map(ex => valOf(ex, env));

//     if (f.type === ValueType.Function) {
//       if (f.value.params.length !== exp[1].length) throw new Error('Arity mismatch.');
//       let e: Env = new Map<String, Value>(f.value.env);
      
//       for (let i = 0; i < exp[1].length; i++) {
//         extendEnv(f.value.params[i], vals[i], e);
//       }

//       return valOf(f.value.body, e);
//     } else if (f.type === ValueType.BuiltinFunction) {
//       return f.value(vals);      
//     } else {
//       throw new Error('Tried to invoke a non-function.');
//     }
//   } 
// }

// /**
//  * Checks if an identifier is in an enviroment
//  * @param id 
//  * @param env 
//  */
// const isInEnv = (id: string, env: Env): boolean => {
//   return env.has(id);
// }

// /**
//  * Gets an identifier's value from an environment and fails if it's not there.
//  * @param id 
//  * @param env 
//  * @throws error if the Id isnt defined in the Env
//  */
// const getVal = (id: string, env: Env): Value => {
//   const a = env.get(id);
//   if (a !== undefined) return a;
//   throw new Error(id + ' is not in the current environmnent.');
// }

// /**
//  * Extends an enviroment with a new Id, Value pair.
//  * @param id key
//  * @param v value
//  * @param env 
//  */
// const extendEnv = (id: string, v: Value, env: Env): void => {
//   env.set(id, v);
// }

// /**
//  * Populate the env with the definitions in defns.
//  * @param defns 
//  * @param env 
//  */
// const populateEnv = (defns: Definition[], env: Env): Env => {
//   for (let defn of defns) {
//     if (Array.isArray(defn[1])) {
//       extendEnv(
//         defn[1][0],
//         {
//           type: ValueType.Function,
//           value: {
//             params: defn[1][1],
//             env: env,
//             body: defn[2] 
//           }
//         },
//         env
//       );
//     } else {
//       extendEnv(defn[1], valOf(defn[2], env), env);
//     }
//   }

//   return env;
// }

// /**
//  * Evaluates a a program.
//  * @param p the DefOrExpr[] (program) to be evaluated
//  */
// const evalDefOrExprs = (p: DefOrExpr[]): Value[] => {
//   let defns = p.filter(isDefinition);
//   let exprs = p.filter(defOrExprIsExpr);
//   let e = populateEnv(defns, builtinEnv());

//   return exprs.map(x => valOf(x, e));
// }

// /**
//  * Evaluates a well-formed BSL program.
//  * @param s program as a string
//  */
// export const evaluate = (s: string): Value[] => {
//   return evalDefOrExprs(parse(s).map(syntaxCheckDefOrExpr));
// }

// export const valToString = (v: Value): string => {
//   switch (v.type) {
//     case ValueType.BuiltinFunction:
//       return '...';
//     case ValueType.Function:
      
//     case ValueType.NonFunction:
//       return v.value.toString();
//   }
// } 

// module.exports = {
//   'builtinEnv': builtinEnv,
//   'evaluate': evaluate,
//   'valOf': valOf
// };