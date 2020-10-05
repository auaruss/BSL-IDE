'use strict';

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
  } else switch (d.type) {
    case 'define-function':
      processExpr(d.body);
      return;
    case 'define-constant':
      processExpr(d.body);
      return;
  }
}

const processExpr = (e: Expr): any => {
  if (isExprError(e)) {
    /* ... */
  } else switch (e.type) {
    case 'String':
      return;
    case 'Num':
      return;
    case 'Id':
      return;
    case 'Bool':
      return;
    case 'Call':
      e.args.map(processExpr);
      return;
  }
}


import {
  DefOrExpr, Definition, Expr, ExprResult,
  Env, ValueError, DefinitionResult, Result,
  Nothing, Just, Maybe
} from '../types';
import { isDefinition, isExpr, isExprError, isValueError, isDefinitionError } from '../predicates';
import { parse } from './parse';
import {
  Bind, BFn, Clos, NFn, ValErr, StringAtom,
  MakeNothing, MakeJust, BindingErr
} from '../constructors';
import Definitions from '../../frames/Definitions';

/**
 * Evaluates a string into a list of results.
 * @param exp 
 */
export const evaluate = (exp: string): Result[] => {
  return evaluateDefOrExprs(parse(exp));
}

/**
 * Evaluates a list of DefOrExpr into a list of results,
 * with a first pass which populates the environment.
 * @param deforexprs 
 */
export const evaluateDefOrExprs = (deforexprs: DefOrExpr[]): Result[] => {
  let env = builtinEnv();
  deforexprs.filter(isDefinition).forEach(
    (d: Definition) => env = extendEnv(d, env)
  );

  return deforexprs.map(e => evaluateDefOrExpr(e, env));
}

/**
 * Evaluates a DefOrExpr into a result.
 * @param d 
 * @param env 
 */
const evaluateDefOrExpr = (d: DefOrExpr, env: Env): Result => {
  if (isDefinition(d)) {
    return evaluateDefinition(d, env);
  } else {
    return evaluateExpr(d, env);
  }
}

/**
 * Second pass over the definitions, which produces a value to be printed. Mutates the env.
 * @param d 
 * @param env 
 */
const evaluateDefinition = (d: Definition, env: Env): DefinitionResult => {
  if (isDefinitionError(d)) {
    return d;
  } else {
    let defnVal = env.get(d.name);
    if (defnVal === undefined) {
      throw new Error('Somehow, the environment was not populated correctly by the first pass');
    } else {
      let sndarg: Maybe<ExprResult>;
      switch (d.type) {
        case 'define-function':
          sndarg = MakeJust(Clos(d.params, env, d.body));
          break;
        case 'define-constant':
          sndarg = MakeJust(evaluateExpr(d.body, env));
      }
      if (defnVal.type === 'nothing') {
        mutateEnv(d.name, sndarg, env);
        return Bind(d.name, sndarg.thing);
      } else {
        return BindingErr('Repeated definition of the same name', d);
      }
    }
  }
}


const evaluateExpr = (e: Expr, env: Env): ExprResult => {
  if (isExprError(e)) {
    return e;
  } else switch (e.type) {

    case 'String':
    case 'Num':
    case 'Bool':
      return NFn(e.const);
    case 'Id':
      let x = getVal(e.const, env);
      if (!x) {
        // Error x not in env
        throw new Error();
      } else if (x.type === 'nothing') {
        // Error x referenced before definition
        throw new Error();
      } else {
        return x.thing;
      }
    case 'Call':
      let maybeBody = getVal(e.op, env);
      if (!maybeBody) {
        // Error f not defined in the program
      } else if (maybeBody.type === 'nothing') {
        // Error f defined later in the program
      } else {
        let body = maybeBody.thing;
        if (isValueError(body)) {
          return body;
        } else if (body.type === 'NonFunction') {
          // Error nonfunction applied to arguments
        } else if (body.type === 'BuiltinFunction') {
          
        } else {
          
        }
      }

  }
}

/**
 * Puts a definition into an environment.
 * @param d 
 * @param env 
 */
const extendEnv = (d: Definition, env: Env): Env => {
  if (isDefinitionError(d)) {
    return env;
  } else {
    let e: Env = new Map(env);
    e.set(d.name, MakeNothing());
    return e;
  }
}

/**
 * Mutates a definition in the environment.
 * @param name definition name
 * @param v definition closure
 * @param env
 */
const mutateEnv = (name: String, v: Maybe<ExprResult>, env: Env): void => {
  env.set(name, v);
};



/**
 * Checks if an identifier is in an enviroment
 * @param id 
 * @param env 
 */
const isInEnv = (id: string, env: Env): boolean => {
  return env.has(id);
}

/**
 * Gets an identifier's value from an environment if it's there.
 * @param id 
 * @param env
 */
const getVal = (id: string, env: Env): Maybe<ExprResult> | false => {
  const a = env.get(id);
  if (a !== undefined) return a;
  return false;
}

const builtinEnv = (): Env => {
  let m = new Map<String, Maybe<ExprResult>>();
  
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