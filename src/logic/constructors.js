"use strict";
exports.__esModule = true;
var types_1 = require("./types");
// ----------------------------------------------------------------------------
// | Token constructors                                                       |
// ----------------------------------------------------------------------------
exports.Tok = function (t, v) {
    return { type: t, token: v };
};
exports.NumTok = function (v) { return exports.Tok(types_1.TokenType.Number, v.toString()); };
exports.IdTok = function (v) { return exports.Tok(types_1.TokenType.Identifier, v); };
exports.StringTok = function (v) { return exports.Tok(types_1.TokenType.String, '"' + v + '"'); };
exports.BooleanTok = function (v) { return exports.Tok(types_1.TokenType.Boolean, v); };
exports.TokErr = function (v) {
    return { tokenError: 'Unidentified Token', string: v };
};
// ----------------------------------------------------------------------------
// | SExp constructors                                                        |
// ----------------------------------------------------------------------------
exports.Atom = function (t, v) {
    if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
        return { type: t, sexp: v };
    }
    else if (t === 'Num' && (typeof v === 'number')) {
        return { type: t, sexp: v };
    }
    else if (t === 'Bool' && (typeof v === 'boolean')) {
        return { type: t, sexp: v };
    }
    throw new Error('Mismatch in atom type/value');
};
exports.NumAtom = function (v) { return exports.Atom('Num', v); };
exports.IdAtom = function (v) { return exports.Atom('Id', v); };
exports.StringAtom = function (v) { return exports.Atom('String', v); };
exports.BooleanAtom = function (v) { return exports.Atom('Bool', whichBool(v)); };
exports.ReadErr = function (e, v) {
    return { readError: e, tokens: v };
};
// ----------------------------------------------------------------------------
// | Definition constructors                                                  |
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// | Expr constructors                                                        |
// ----------------------------------------------------------------------------
exports.PrimitiveExpr = function (t, v) {
    if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
        return { type: t, expr: v };
    }
    else if (t === 'Num' && (typeof v === 'number')) {
        return { type: t, expr: v };
    }
    else if (t === 'Bool' && (typeof v === 'boolean')) {
        return { type: t, expr: v };
    }
    throw new Error('Mismatch in primitive Expr type/value');
};
exports.NumExpr = function (v) { return exports.PrimitiveExpr('Num', v); };
exports.IdExpr = function (v) { return exports.PrimitiveExpr('Id', v); };
exports.StringExpr = function (v) { return exports.PrimitiveExpr('String', v); };
exports.BooleanExpr = function (v) { return exports.PrimitiveExpr('Bool', v); };
exports.ExprErr = function (e, v) {
    return { exprError: e, sexps: v };
};
// ----------------------------------------------------------------------------
// | Value constructors                                                       |
// ----------------------------------------------------------------------------
exports.NFn = function (v) {
    return { type: 'NonFunction', value: v };
};
exports.ValErr = function (e, d) {
    return { valueError: e, deforexprs: d };
};
/**
 * Converts a boolean string in BSL into a boolean.
 * @param t token
 */
var whichBool = function (s) {
    switch (s) {
        case '#T':
        case '#t':
        case '#true':
            return true;
        case '#F':
        case '#f':
        case '#false':
            return false;
    }
    return false;
};
