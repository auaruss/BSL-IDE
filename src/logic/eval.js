'use strict';
exports.__esModule = true;
/**
 * An evaluator for the student languages.
 * @author: Alice Russell, Sam Soucie
 *
 * @todo implement better error messages for builtins
 *       such as "/: expects a number as 2nd argument, given #true"
 */
var types_1 = require("./types");
var predicates_1 = require("./predicates");
var parse_1 = require("./parse");
/**
 * Constructor for a BuiltinFunction case of Value.
 * @param v an anonymous function which takes a list of values and returns a value
 */
var NFn = function (v) {
    return { type: types_1.ValueType.NonFunction, value: v };
};
/**
 * Constructor for a BuiltinFunction case of Value.
 * @param v an anonymous function which takes a list of values and returns a value
 */
var BFn = function (v) {
    return { type: types_1.ValueType.BuiltinFunction, value: v };
};
var builtinEnv = function () {
    var m = new Map();
    m.set('+', BFn(function (vs) {
        var ns = vs.map(function (v) { return v.value; });
        if (predicates_1.isNumberArray(ns)) {
            return NFn(ns.reduce(function (acc, elem) { return acc + elem; }, 0));
        }
        else {
            throw new Error('+: All arguments to + must be numbers.');
        }
    }));
    m.set('*', BFn(function (vs) {
        var ns = vs.map(function (v) { return v.value; });
        if (predicates_1.isNumberArray(ns)) {
            return NFn(ns.reduce(function (acc, elem) { return acc * elem; }, 1));
        }
        else {
            throw new Error('*: All arguments to * must be numbers.');
        }
    }));
    m.set('-', BFn(function (vs) {
        var ns = vs.map(function (v) { return v.value; });
        if (predicates_1.isNumberArray(ns)) {
            if (ns.length === 0)
                throw new Error('-: expects at least 1 argument, but found none');
            return NFn(ns.slice(1).reduce(function (acc, elem) { return acc - elem; }, ns[0]));
        }
        else {
            throw new Error('-: All arguments to - must be numbers.');
        }
    }));
    m.set('/', BFn(function (vs) {
        var ns = vs.map(function (v) { return v.value; });
        if (predicates_1.isNumberArray(ns)) {
            if (ns.length === 0)
                throw new Error('-: expects at least 1 argument, but found none');
            return NFn(ns.slice(1).reduce(function (acc, elem) { return acc / elem; }, ns[0]));
        }
        else {
            throw new Error('/: All arguments to / must be numbers.');
        }
    }));
    m.set('=', BFn(function (vs) {
        if (vs.length === 0)
            throw new Error('=: expects at least 1 argument, but found none');
        var valToBeEqualTo = vs[0].value;
        return NFn(vs.slice(1).reduce(function (acc, elem) { return acc && elem.value === valToBeEqualTo; }, true));
    }));
    return m;
};
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
var syntaxCheckExpr = function (sexp) {
    if (predicates_1.isAtom(sexp)) {
        return sexp;
    }
    else if (Array.isArray(sexp)) {
        if (sexp.length === 0) {
            throw new Error('Invalid Expression: Found an empty expression.');
        }
        if (predicates_1.isId(sexp[0])) {
            if (sexp[0].value === 'define') {
                // We know the definition is inside an expression because the only intended way for this function
                // to be called is by syntaxCheckDefOrExpr, which would already let us know that the top level thing
                // that called this was not a definition itself, which is the only valid location for a definition in BSL.
                throw new Error('Invalid Expression: Found a definition inside an expression.');
            }
            var restOfExprs = sexp.slice(1).map(syntaxCheckExpr);
            return [sexp[0].value, restOfExprs];
        }
        else {
            throw new Error('Invalid expression: Expression missing a starting identifier.');
        }
    }
    throw new Error('Invalid expression: Unknown error.');
};
/**
 * Checks to make sure the parsed SExps have the proper structure of a Definition.
 * @remark This function changes the input SExp to a Definition, namely separating
 *         the first identifier in a function definition from its arguments.
 * @param sexp
 * @throws error when checking non-definitions
 */
var syntaxCheckDefinition = function (sexp) {
    if (Array.isArray(sexp) && sexp.length === 3 && predicates_1.isId(sexp[0]) && sexp[0].value === 'define') {
        if (predicates_1.isIdArray(sexp[1]) && sexp[1].length >= 2) {
            return ['define', [sexp[1][0].value, sexp[1].slice(1).map(function (x) { return x.value; })], syntaxCheckExpr(sexp[2])];
        }
        else if (predicates_1.isId(sexp[1])) {
            return ['define', sexp[1].value, syntaxCheckExpr(sexp[2])];
        }
        else {
            throw new Error('Invalid Definition: The defintion provided matches no case of Definition');
        }
    }
    else {
        throw new Error('Invalid Definition: Tried to syntax-check a non-definition.');
    }
};
/**
 * Checks to make sure the parsed SExps have the proper structure of a Single BSL DefOrExpr.
 * @param sexp
 */
var syntaxCheckDefOrExpr = function (sexp) {
    if (Array.isArray(sexp) && sexp.length > 0 && predicates_1.isId(sexp[0]) && sexp[0].value === 'define') {
        return syntaxCheckDefinition(sexp);
    }
    else {
        return syntaxCheckExpr(sexp);
    }
};
/**
 * Computes the value of an expression with respect to an environment.
 * @param exp
 * @param env
 * @throws error if 'if' does not have exactly 3 arguments passed to it
 * @throws error if functions are not passed the correct number of arguments
 * @throws error if trying to call a non-function
 */
var valOf = function (exp, env) {
    if (predicates_1.isAtom(exp)) {
        if (predicates_1.isId(exp)) {
            if (isInEnv(exp.value, env)) {
                return getVal(exp.value, env);
            }
            throw new Error(exp.value + ' is not in the environment.');
        }
        return { type: types_1.ValueType.NonFunction, value: exp.value };
    }
    else if (exp[0] === 'if') {
        if (exp[1].length !== 3) {
            throw new Error('Invalid invocation of "if".');
        }
        var pred = valOf(exp[1][0], env);
        if (pred.type === types_1.ValueType.NonFunction && typeof pred.value === 'boolean') {
            if (pred.value) {
                return valOf(exp[1][1], env);
            }
            else {
                return valOf(exp[1][2], env);
            }
        }
        else {
            throw new Error('Invalid invocation of "if".');
        }
    }
    else {
        var f = getVal(exp[0], env);
        var vals = exp[1].map(function (ex) { return valOf(ex, env); });
        if (f.type === types_1.ValueType.Function) {
            if (f.value.args.length !== exp[1].length)
                throw new Error('Arity mismatch.');
            var e = new Map(f.value.env);
            for (var i = 0; i < exp[1].length; i++) {
                extendEnv(f.value.args[i], vals[i], e);
            }
            return valOf(f.value.body, e);
        }
        else if (f.type === types_1.ValueType.BuiltinFunction) {
            return f.value(vals);
        }
        else {
            throw new Error('Tried to invoke a non-function.');
        }
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
 * Gets an identifier's value from an environment and fails if it's not there.
 * @param id
 * @param env
 * @throws error if the Id isnt defined in the Env
 */
var getVal = function (id, env) {
    var a = env.get(id);
    if (a !== undefined)
        return a;
    throw new Error(id + ' is not in the current environmnent.');
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
 * Populate the env with the definitions in defns.
 * @param defns
 * @param env
 */
var populateEnv = function (defns, env) {
    for (var _i = 0, defns_1 = defns; _i < defns_1.length; _i++) {
        var defn = defns_1[_i];
        if (Array.isArray(defn[1])) {
            extendEnv(defn[1][0], {
                type: types_1.ValueType.Function,
                value: {
                    args: defn[1][1],
                    env: env,
                    body: defn[2]
                }
            }, env);
        }
        else {
            extendEnv(defn[1], valOf(defn[2], env), env);
        }
    }
    return env;
};
/**
 * Evaluates a a program.
 * @param p the DefOrExpr[] (program) to be evaluated
 */
var evalDefOrExprs = function (p) {
    var defns = p.filter(predicates_1.isDefinition);
    var exprs = p.filter(predicates_1.defOrExprIsExpr);
    var e = populateEnv(defns, builtinEnv());
    return exprs.map(function (x) { return valOf(x, e); });
};
/**
 * Evaluates a well-formed BSL program.
 * @param s program as a string
 */
exports.evaluate = function (s) {
    return evalDefOrExprs(parse_1.parse(s).map(syntaxCheckDefOrExpr));
};
module.exports = {
    'builtinEnv': builtinEnv,
    'evaluate': exports.evaluate,
    'syntaxCheckDefinition': syntaxCheckDefinition,
    'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr,
    'syntaxCheckExpr': syntaxCheckExpr,
    'valOf': valOf
};
