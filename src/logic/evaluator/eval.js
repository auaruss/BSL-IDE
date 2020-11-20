'use strict';
exports.__esModule = true;
var predicates_1 = require("../predicates");
var parse_1 = require("./parse");
var constructors_1 = require("../constructors");
/**
 * Evaluates a string into a list of results.
 * @param exp
 */
exports.evaluate = function (exp) {
    return exports.evaluateDefOrExprs(parse_1.parse(exp));
};
/**
 * Evaluates a list of DefOrExpr into a list of results,
 * with a first pass which populates the environment.
 * @param deforexprs
 */
exports.evaluateDefOrExprs = function (deforexprs) {
    var env = builtinEnv();
    deforexprs.filter(predicates_1.isDefinition).forEach(function (d) { return env = extendEnv(d, env); });
    return deforexprs.map(function (e) { return evaluateDefOrExpr(e, env); });
};
/**
 * Evaluates a DefOrExpr into a result.
 * @param d
 * @param env
 */
var evaluateDefOrExpr = function (d, env) {
    if (predicates_1.isDefinition(d)) {
        return evaluateDefinition(d, env);
    }
    else {
        return evaluateExpr(d, env);
    }
};
/**
 * Second pass over the definitions, which produces a value to be printed. Mutates the env.
 * @param d
 * @param env
 */
var evaluateDefinition = function (d, env) {
    if (predicates_1.isDefinitionError(d)) {
        return d;
    }
    else {
        var defnVal = env.get(d.name);
        if (defnVal === undefined) {
            throw new Error('Somehow, the environment was not populated correctly by the first pass');
        }
        else {
            var sndarg = void 0;
            switch (d.type) {
                case 'define-function':
                    sndarg = constructors_1.MakeJust(constructors_1.Clos(d.params, env, d.body));
                    break;
                case 'define-constant':
                    sndarg = constructors_1.MakeJust(evaluateExpr(d.body, env));
            }
            if (defnVal.type === 'nothing') {
                mutateEnv(d.name, sndarg, env);
                return constructors_1.Bind(d.name, sndarg.thing);
            }
            else {
                return constructors_1.BindingErr('Repeated definition of the same name', d);
            }
        }
    }
};
/**
 * Evaluates an expression.
 * @param e
 * @param env
 */
var evaluateExpr = function (e, env) {
    if (predicates_1.isExprError(e)) {
        return e;
    }
    else
        switch (e.type) {
            case 'String':
            case 'Num':
            case 'Bool':
                return constructors_1.NFn(e["const"]);
            case 'Id':
                var x = getVal(e["const"], env);
                if (!x) {
                    return constructors_1.ValErr('Id not in environment', e);
                }
                else if (x.type === 'nothing') {
                    return constructors_1.ValErr('Id referenced before definition', e);
                }
                else {
                    return x.thing;
                }
            case 'Call':
                if (e.op === 'if') {
                    if (e.args.length !== 3) {
                        return constructors_1.ValErr('Arity mismatch', e);
                    }
                    else {
                        var pred = evaluateExpr(e.args[0], env);
                        if (predicates_1.isValueError(pred)) {
                            return pred;
                        }
                        else if (!(pred.type === 'NonFunction')) {
                            return constructors_1.ValErr('Function used as a predicate', e);
                        }
                        else if (pred.value === true) {
                            return evaluateExpr(e.args[1], env);
                        }
                        else if (pred.value === false) {
                            return evaluateExpr(e.args[2], env);
                        }
                        else {
                            return constructors_1.ValErr('Non-boolean value used as a predicate', e);
                        }
                    }
                }
                var maybeBody = getVal(e.op, env);
                if (!maybeBody) {
                    return constructors_1.ValErr('Expression undefined in program', e);
                }
                else if (maybeBody.type === 'nothing') {
                    return constructors_1.ValErr('Expression defined later in program', e);
                }
                else {
                    var body = maybeBody.thing;
                    if (predicates_1.isValueError(body)) {
                        return body;
                    }
                    else if (body.type === 'NonFunction') {
                        return constructors_1.ValErr('Nonfunction applied as a function', e);
                    }
                    else if (body.type === 'BuiltinFunction') {
                        var valuesWithoutError = [];
                        var possibleErrors_1 = [];
                        valuesWithoutError = e.args.reduce(function (acc, elem) {
                            var t = evaluateExpr(elem, env);
                            if (!predicates_1.isValueError(t))
                                acc.push(t);
                            else
                                possibleErrors_1.push(t);
                            return acc;
                        }, valuesWithoutError);
                        if (possibleErrors_1.length === 0) {
                            return body.value(valuesWithoutError);
                        }
                        else {
                            return possibleErrors_1[0]; // This could return more info, but this works for now.
                        }
                    }
                    else {
                        var clos = body.value;
                        if (clos.args.length === e.args.length) {
                            var localEnv = new Map(clos.env);
                            var zipped = clos.args.map(function (_, i) { return [_, evaluateExpr(e.args[i], env)]; });
                            for (var _i = 0, zipped_1 = zipped; _i < zipped_1.length; _i++) {
                                var elem = zipped_1[_i];
                                var param = elem[0], exp = elem[1];
                                if (predicates_1.isValueError(exp)) {
                                    return exp;
                                }
                                else {
                                    extendEnv(param, localEnv);
                                    mutateEnv(param, constructors_1.MakeJust(exp), localEnv);
                                }
                            }
                            return evaluateExpr(clos.body, localEnv);
                        }
                        else {
                            return constructors_1.ValErr('Arity mismatch', e);
                        }
                    }
                }
        }
};
/**
 * Puts a definition into an environment.
 * @param d a definition (used for top level defines)
 *          or string (used for lexical scoping of function calls)
 * @param env
 */
var extendEnv = function (d, env) {
    if (predicates_1.isDefinitionError(d)) {
        return env;
    }
    else if (typeof d === 'string') {
        var e = new Map(env);
        e.set(d, constructors_1.MakeNothing());
        return e;
    }
    else {
        var e = new Map(env);
        e.set(d.name, constructors_1.MakeNothing());
        return e;
    }
};
/**
 * Mutates a definition in the environment.
 * @param name definition name
 * @param v definition closure
 * @param env
 */
var mutateEnv = function (name, v, env) {
    env.set(name, v);
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
var builtinEnv = function () {
    var m = new Map();
    m.set('+', constructors_1.MakeJust(constructors_1.BFn(function (vs) {
        var ns = vs.map(function (v) {
            if (typeof v.value == 'number') {
                return v.value;
            }
            else {
                return 0;
                // error non-num passed to +
            }
        });
        if (ns) {
            return constructors_1.NFn(ns.reduce(function (acc, elem) { return acc + elem; }, 0));
        }
        else {
            //  Error '+: All arguments to + must be numbers.'
            return constructors_1.NFn(0);
        }
    })));
    //special thanks to Leona
    m.set('string-append', constructors_1.MakeJust(constructors_1.BFn(function (vs) {
        var strings = vs.map(function (v) {
            if (typeof v.value == 'string') {
                return v.value;
            }
            else {
                return '';
                // error non-num passed to +
            }
        });
        if (strings) {
            return constructors_1.NFn(strings.reduce(function (acc, elem) { return acc.concat(elem); }, ''));
        }
        else {
            //  Error '+: All arguments to + must be numbers.'
            return constructors_1.NFn('');
        }
    })));
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
    m.set('-', constructors_1.MakeJust(constructors_1.BFn(function (vs) {
        var ns = vs.map(function (v) {
            if (typeof v.value == 'number') {
                return v.value;
            }
            else {
                return 0;
                // error non-num passed to +
            }
        });
        if (ns) {
            return constructors_1.NFn(ns.slice(1).reduce(function (acc, elem) { return acc - elem; }, ns[0]));
        }
        else {
            //  Error '-: All arguments to - must be numbers.'
            return constructors_1.NFn(0);
        }
    })));
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
    m.set('=', constructors_1.MakeJust(constructors_1.BFn(function (vs) {
        if (vs.length === 0)
            throw new Error('=: expects at least 1 argument, but found none');
        var valToBeEqualTo = vs[0].value;
        return constructors_1.NFn(vs.slice(1).reduce(function (acc, elem) { return acc && elem.value === valToBeEqualTo; }, true));
    })));
    return m;
};
