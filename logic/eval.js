'use strict';
exports.__esModule = true;
// TODO: Check for functions-as-values in syntax checker
var builtinEnv = function () {
    var m = new Map();
    m.set('+', function (args) { return args.reduce(function (x, y) { return x + y; }, 0); });
    m.set('-', function (args) { return args[0] - args[1]; });
    m.set('if', function (args) { return (args[0] ? args[1] : args[2]); });
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
// const isFunction = (x: any): x is Fn => {
// }
var valOf = function (exp, env) {
    if (isAtom(exp)) {
        if (isId(exp) && isInEnv(exp.value, env)) {
            // getVal(exp, env);
            throw new Error('');
        }
        return { type: ValueType.NonFunction, value: exp.value };
    }
    else if (isBuiltin(exp[0])) {
        var vals = exp[1].map(function (e) { return valOf(e, env); });
        return applyBuiltin(getBuiltIn(exp[0]), vals);
    }
    throw new Error('oops');
};
var getVal = function (id, env) {
    var _ = env.get(id);
    if (_ !== undefined)
        return _;
    throw new Error('Tried to look up a value that doesnt exist in the environment.');
};
var isBuiltin = function (id) {
    return BUILTIN_ENV.has(id);
};
var getBuiltIn = function (id) {
    var _ = BUILTIN_ENV.get(id);
    if (_ !== undefined)
        return _;
    throw new Error('Tried to look up a function that doesnt exist in the builtin functions.');
};
var applyBuiltin = function (f, args) {
    if (args.every(function (x) { return x.type === ValueType.NonFunction; })) {
        return { type: ValueType.NonFunction, value: f(args.map(function (x) { return x.value; })) };
    }
    throw new Error('Tried to pass a function to another function.');
};
var isInEnv = function (id, env) {
    return env.has(id);
};
module.exports = {
    'syntaxCheckExpr': syntaxCheckExpr,
    'syntaxCheckDefinition': syntaxCheckDefinition,
    'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr,
    'valOf': valOf
};
