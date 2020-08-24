'use strict';
exports.__esModule = true;
var predicates_1 = require("../predicates");
var parse_1 = require("./parse");
var constructors_1 = require("../constructors");
exports.evaluate = function (exp) {
    return exports.evaluateDefOrExprs(parse_1.parse(exp));
};
exports.evaluateDefOrExprs = function (deforexprs) {
    var env = builtinEnv();
    for (var _i = 0, _a = deforexprs.filter(predicates_1.isDefinitionWithoutError); _i < _a.length; _i++) {
        var d = _a[_i];
        env = populateEnv(d, env);
    }
    return deforexprs.filter(predicates_1.defOrExprIsExpr)
        .map(function (e) { return evaluateExpr(e, env); });
};
// const evaluateDefOrExpr = (d: DefOrExpr, env: Env): Value => {
// }
// const evaluateDefinition = (d: Definition, env: Env): DefinitionValue {
// }
// const evaluateExpr = (e: Expr, env: Env): ExprValue => {
//   if (isExprError(e)) {
//     return e;
//   } else if (Array.isArray(e)) {
//     let [f, exprs] = e;
//     let args = exprs.map(_ => evaluateExpr(_, env));
//     let val = getVal(f, env);
//     if (val) {
//       if (isValueError(val)) {
//         // return ValErr: body of function has err in it
//       } else if (val.type === 'Function') {
//           let params = val.value;
//       } else if (val.type === 'BuiltinFunction') {
//       } else {
//         // return ValErr: tried to call a constant as a function
//       }
//     } else {
//       // return ValErr : f not in env
//     }
//   } else if (e.type === 'String') {
//     return NFn(e.expr);
//   } else if (e.type === 'Num') {
//     return NFn(e.expr);
//   } else if (e.type === 'Id') {
//     if (isInEnv(e.expr, env)) {
//       // ...
//     } else {
//       // return ValErr
//     }
//   } else if (e.type === 'Bool') {
//     return NFn(e.expr);
//   }
// }
/**
 * Puts a definition into an environment.
 * @param d
 * @param env
 */
var populateEnv = function (d, env) {
    if (Array.isArray(d)) {
        if (typeof d[1] === 'string') {
            var f = d[1], val = evaluateExpr(d[2], env);
            extendEnv(f, val, env);
            return env;
        }
        else {
            var _a = d[1], f = _a[0], params = _a[1], body = d[2];
            extendEnv(f, constructors_1.Fn(params, env, body), env);
            return env;
        }
    }
    else {
        return env;
    }
};
/**
 * Checks if an identifier is in an enviroment
 * @param id
 * @param env
 */
var isInEnv = function (id, env) {
    return env.has(id);
};
/**
 * Extends an enviroment with a new Id, Value pair.
 * @param id key
 * @param v value
 * @param env
 */
var extendEnv = function (id, v, env) {
    env.set(id, v);
};
/**
 * Gets an identifier's value from an environment if it's there.
 * @param id
 * @param env
 */
var getVal = function (id, env) {
    var a = env.get(id);
    if (a !== undefined)
        return a;
    return false;
};
var processDefOrExpr = function (d) {
    if (predicates_1.defOrExprIsExpr(d)) {
        return processExpr(d);
    }
    else {
        return processDefinition(d);
    }
};
var processExpr = function (e) {
    if (predicates_1.isExprError(e)) {
        /* ... */
    }
    else if (Array.isArray(e)) {
        /* ... */
    }
    else if (e.type === 'String') {
        /* ... */
    }
    else if (e.type === 'Num') {
        /* ... */
    }
    else if (e.type === 'Id') {
        /* ... */
    }
    else if (e.type === 'Bool') {
        /* ... */
    }
};
var processDefinition = function (d) {
    if (Array.isArray(d)) {
        if (typeof d[1] === 'string') {
            /* ... */
            processExpr(d[2]);
        }
        else {
            /* ... */
            processExpr(d[2]);
        }
    }
    else {
        /* ... */
    }
};
var builtinEnv = function () {
    var m = new Map();
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
};
