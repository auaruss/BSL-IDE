var AtomType;
(function (AtomType) {
    AtomType["String"] = "String";
    AtomType["Number"] = "Number";
    AtomType["Boolean"] = "Boolean";
    AtomType["Identifier"] = "Identifier";
})(AtomType || (AtomType = {}));
// Tells whether x is an Atom.
var isAtom = function (x) {
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
    return Array.isArray(x) && x.reduce(function (acc, elem) { return acc && isId(elem); }, true);
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
var syntaxCheckDefinition = function (sexp) {
    if (Array.isArray(sexp) && sexp.length !== 0 && isId(sexp[0]) && sexp[0].value === 'define') {
        if (sexp.length === 3 && Array.isArray(sexp[1])) {
            if (sexp[1].length === 2 && isIdArray(sexp[1])) {
                // I wanted to put sexp[1] here instead of [sexp[1][0], sexp[1][1],
                // because I think they should be identical. The typechecker seems to disagree for some reason.
                return ['define', [sexp[1][0], sexp[1].slice(1)], syntaxCheckExpr(sexp[2])];
            }
            else {
                throw new Error('Invalid Definition: The defintion provided matches no case of Definition');
            }
        }
        else if (sexp.length === 3 && isId(sexp[1])) {
            return ['define', sexp[1], syntaxCheckExpr(sexp[2])];
        }
        else {
            throw new Error('Invalid Definition: The defintion provided matches no case of Definition');
        }
    }
    else {
        throw new Error('Invalid Definition: Tried to syntax-check a non-definition.');
    }
};
var syntaxCheckDefOrExpr = function (sexp) {
    if (Array.isArray(sexp)) {
        if (sexp.length === 0) {
            throw new Error('Invalid Expression: Found an empty expression.');
        }
        else if (isId(sexp[0]) && sexp[0].value === 'define') {
            return syntaxCheckDefinition(sexp);
        }
        else {
            return syntaxCheckExpr(sexp);
        }
    }
    else {
        // We know the only non-array values allowed in a DefOrExpr is the Atom case of Expr.
        return syntaxCheckExpr(sexp);
    }
};
module.exports = {
    'syntaxCheckExpr': syntaxCheckExpr,
    'syntaxCheckDefinition': syntaxCheckDefinition,
    'syntaxCheckDefOrExpr': syntaxCheckDefOrExpr
};
