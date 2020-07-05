'use strict';
// TODO: Check for functions-as-values in syntax checker
var builtinEnv = function () {
    var m = new Map();
    return m;
};
var BUILTIN_ENV = builtinEnv();
var AtomType;
(function (AtomType) {
    AtomType["String"] = "String";
    AtomType["Number"] = "Number";
    AtomType["Boolean"] = "Boolean";
    AtomType["Identifier"] = "Identifier";
})(AtomType || (AtomType = {}));
// Tells whether x is an Atom.
var isAtom = function (x) {
    if (!(typeof x === "object"))
        return false;
    if (!(typeof x.type === "string"))
        return false;
    return ((x.type === AtomType.String && (typeof x.value === "string"))
        || (x.type === AtomType.Number && (typeof x.value === "number"))
        || (x.type === AtomType.Identifier && (typeof x.value === "string"))
        || (x.type === AtomType.Boolean && (typeof x.value === "boolean")));
};
// Tells whether x is a Str.
var isStr = function (x) {
    return isAtom(x) && x.type === AtomType.String;
};
// Tells whether x is a Num.
var isNum = function (x) {
    return isAtom(x) && x.type === AtomType.Number;
};
// Tells whether x is an Id.
var isId = function (x) {
    return isAtom(x) && x.type === AtomType.Identifier;
};
// Tells whether x is a Bool.
var isBool = function (x) {
    return isAtom(x) && x.type === AtomType.Boolean;
};
// Tells whether x is an Id[].
var isIdArray = function (x) {
    return Array.isArray(x) && x.every(isId);
};
// Checks to make sure the parsed SExps have the proper structure of an Expr.
// Note: This function changes the input SExp to an Expr, by separating
//       the first identifier in a valid expression call from the rest of them.
var syntaxCheckExpr = function (sexp) {
    if (isAtom(sexp)) {
        return sexp;
    }
    else if (Array.isArray(sexp)) {
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
            var restOfExprs = sexp.slice(1).map(syntaxCheckExpr);
            return [sexp[0].value, restOfExprs];
        }
        else {
            throw new Error('Invalid expression: Expression missing a starting identifier.');
        }
    }
    throw new Error('Invalid expression: Unknown error.');
};
// Checks to make sure the parsed SExps have the proper structure of a Definition.
// Note: This function changes the input SExp to a Definition, namely separating
//       the first identifier in a function definition from its arguments.
var syntaxCheckDefinition = function (sexp) {
    if (Array.isArray(sexp) && sexp.length === 3 && isId(sexp[0]) && sexp[0].value === 'define') {
        if (isIdArray(sexp[1]) && sexp[1].length >= 2) {
            return ['define', [sexp[1][0].value, sexp[1].slice(1).map(function (x) { return x.value; })], syntaxCheckExpr(sexp[2])];
        }
        else if (isId(sexp[1])) {
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
// Checks to make sure the parsed SExps have the proper structure of a Single BSL DefOrExpr.
var syntaxCheckDefOrExpr = function (sexp) {
    if (Array.isArray(sexp) && sexp.length > 0 && isId(sexp[0]) && sexp[0].value === 'define') {
        return syntaxCheckDefinition(sexp);
    }
    else {
        return syntaxCheckExpr(sexp);
    }
};
var ValueType;
(function (ValueType) {
    ValueType["NonFunction"] = "NonFunction";
    ValueType["BuiltinFunction"] = "BuiltinFunction";
    ValueType["Function"] = "Function";
})(ValueType || (ValueType = {}));
;
// Computes the value of an expression with respect to an enviroment.
// Env is the global environment.
// fEnvs are all the function envs that could have called this valOf call.
var valOf = function (exp, env, fEnvs) {
    if (isAtom(exp)) {
        if (isId(exp)) {
            // Look through the envs (from the end because it's a stack) and see if we can find
            // the Id.
            // if (fEnvs) { // Not sure why this check is necessary but my second suite of tests dont run if i dont
            // put it here.
            for (var i = fEnvs.length; i > 0; i--) {
                if (isInEnv(exp.value, fEnvs[i - 1])) {
                    return getVal(exp.value, fEnvs[i - 1]);
                }
            }
            // }
            // Then look in the global env for the Id.
            if (isInEnv(exp.value, env)) {
                return getVal(exp.value, env);
            }
        }
        return { type: ValueType.NonFunction, value: exp.value };
    }
    else if (exp[0] === 'if') {
        if (exp[1].length !== 3) {
            throw new Error('Invalid invocation of "if".');
        }
        var pred = valOf(exp[1][0], env, fEnvs);
        if (pred.type === ValueType.NonFunction && typeof pred.value === 'boolean') {
            if (pred.value) {
                return valOf(exp[1][1], env, fEnvs);
            }
            else {
                return valOf(exp[1][2], env, fEnvs);
            }
        }
        else {
            throw new Error('Invalid invocation of "if".');
        }
    }
    else if (exp[0] === '+') {
        if (exp[1].length !== 2) {
            throw new Error('Invalid invocation of "+" 1.');
        }
        var a = valOf(exp[1][0], env, fEnvs).value;
        var b = valOf(exp[1][1], env, fEnvs).value;
        if (typeof a === 'number' && typeof b === 'number') {
            return { type: ValueType.NonFunction, value: a + b };
        }
        throw new Error('Invalid invocation of "+" 2.');
    }
    else if (exp[0] === '-') {
        if (exp[1].length !== 2) {
            throw new Error('Invalid invocation of "-".');
        }
        var a = valOf(exp[1][0], env, fEnvs).value;
        var b = valOf(exp[1][1], env, fEnvs).value;
        if (typeof a === 'number' && typeof b === 'number') {
            return { type: ValueType.NonFunction, value: a - b };
        }
        throw new Error('Invalid invocation of "-".');
    }
    else if (exp[0] === '=') {
        if (exp[1].length !== 2) {
            throw new Error('Invalid invocation of "=".');
        }
        var a = valOf(exp[1][0], env, fEnvs).value;
        var b = valOf(exp[1][1], env, fEnvs).value;
        return { type: ValueType.NonFunction, value: a === b };
    }
    else if (isInEnv(exp[0], env)) {
        var f = getVal(exp[0], env);
        if (f.type === ValueType.Function) {
            if (f.value.args.length !== exp[1].length)
                throw new Error('Arity mismatch.');
            var e = new Map();
            var vals = exp[1].map(function (e) { return valOf(e, env, fEnvs); });
            for (var i = 0; i < exp[1].length; i++) {
                extendEnv(f.value.args[i], vals[i], e);
            }
            fEnvs.push(e);
            var _ = valOf(f.value.body, env, fEnvs);
            fEnvs.pop();
            return _;
        }
    }
    throw new Error('oops');
};
// Checks if an identifier is in an enviroment.
var isInEnv = function (id, env) {
    return env.has(id);
};
// Gets an identifier's value from an environment and fails if it's not there.
var getVal = function (id, env) {
    var a = env.get(id);
    if (a !== undefined)
        return a;
    throw new Error(id + ' is not in the current environmnent.');
};
var extendEnv = function (id, v, env) {
    env.set(id, v);
};
module.exports = {
    'syntaxCheckExpr': syntaxCheckExpr,
    'syntaxCheckDefinition': syntaxCheckDefinition,
    'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr,
    'valOf': valOf
};
