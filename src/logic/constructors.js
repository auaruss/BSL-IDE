"use strict";
var _a;
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
exports.FunctionExpr = function (fid, args) {
    return [fid, args];
};
exports.ExprErr = function (e, v) {
    return { exprError: e, sexps: v };
};
exports.DefnErr = function (e, v) {
    return { defnError: e, sexps: v };
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
exports.CP = (_a = [
    exports.Tok(types_1.TokenType.CloseParen, ')'),
    exports.Tok(types_1.TokenType.OpenParen, '('),
    exports.Tok(types_1.TokenType.Whitespace, ' '),
    exports.Tok(types_1.TokenType.OpenSquareParen, '['),
    exports.Tok(types_1.TokenType.CloseSquareParen, ']'),
    exports.Tok(types_1.TokenType.OpenBraceParen, '{'),
    exports.Tok(types_1.TokenType.CloseBraceParen, '}'),
    exports.Tok(types_1.TokenType.Whitespace, '\n')
], _a[0]), exports.OP = _a[1], exports.SPACE = _a[2], exports.OSP = _a[3], exports.CSP = _a[4], exports.OBP = _a[5], exports.CBP = _a[6], exports.NL = _a[7];
