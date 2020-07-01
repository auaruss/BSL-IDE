var AtomType;
(function (AtomType) {
    AtomType["String"] = "String";
    AtomType["Number"] = "Number";
    AtomType["Boolean"] = "Boolean";
    AtomType["Identifier"] = "Identifier";
})(AtomType || (AtomType = {}));
var isAtom = function (x) {
    return ((x.type === AtomType.String && (typeof x.value === "string"))
        || (x.type === AtomType.Number && (typeof x.value === "number"))
        || (x.type === AtomType.Identifier && (typeof x.value === "string"))
        || (x.type === AtomType.Boolean && (typeof x.value === "boolean")));
};
// Tells whether an Atom is a Str.
var isStr = function (x) {
    return isAtom(x) && x.type === AtomType.String;
};
// Tells whether an Atom is a Num.
var isNum = function (x) {
    return isAtom(x) && x.type === AtomType.Number;
};
// Tells whether an Atom is a Id.
var isId = function (x) {
    return isAtom(x) && x.type === AtomType.Identifier;
};
// Tells whether an Atom is a Bool.
var isBool = function (x) {
    return isAtom(x) && x.type === AtomType.Boolean;
};
// Checks to make sure the parsed SExps have the proper structure of a BSL program.
// Note: This function makes some adjustments to the structure of its input, namely separating
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
            var restOfExprs = sexp.slice(1).map(function (x) { return syntaxCheckExpr(x); });
            return [sexp[0], restOfExprs];
        }
        else {
            throw new Error('Invalid expression: Expression missing a starting identifier.');
        }
    }
    throw new Error('Invalid expression: Unknown error.');
};
module.exports = {
    'syntaxCheckExpr': syntaxCheckExpr
};
