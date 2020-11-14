"use strict";
exports.__esModule = true;
var predicates_1 = require("../predicates");
var types_1 = require("../types");
var eval_1 = require("./eval");
exports.print = function (exp) {
    return exports.printResults(eval_1.evaluate(exp));
};
exports.printResults = function (rs) {
    if (rs.length === 0)
        return '\n';
    return rs.slice(1).reduce(function (acc, elem) {
        return "" + acc + printResult(elem) + "\n";
    }, printResult(rs[0]) + '\n');
};
var printResult = function (r) {
    if (predicates_1.isDefinitionResult(r)) {
        return printDefinitionResult(r);
    }
    else {
        return printExprResult(r);
    }
};
var printDefinitionResult = function (dr) {
    if (predicates_1.isBindingError(dr)) {
        return printBindingError(dr);
    }
    else {
        return printBinding(dr);
    }
};
var printExprResult = function (er) {
    if (predicates_1.isValueError(er)) {
        return printValueError(er);
    }
    else {
        return printValue(er);
    }
};
var printBinding = function (b) {
    return "Defined " + b.defined + " to be " + printExprResult(b.toBe) + ".";
};
var printValue = function (v) {
    if (v.type === 'NonFunction') {
        if (v.value === true)
            return "#t";
        if (v.value === false)
            return "#f";
        if (typeof v.value === 'string')
            return "\"" + v.value + "\"";
        return v.value.toString();
    }
    else if (v.type === 'BuiltinFunction') {
        return 'Builtin function.';
    }
    else {
        return printExpr(v.value.body);
    }
};
var printBindingError = function (be) {
    if (predicates_1.isTokenError(be)) {
        return printTokenError(be);
    }
    else if (predicates_1.isReadError(be)) {
        return printReadError(be);
    }
    else if (predicates_1.isDefinitionError(be)) {
        return printDefinitionError(be);
    }
    else {
        return "Binding Error: " + be.bindingError + " in " + printDefinition(be.definition);
    }
};
var printValueError = function (ve) {
    if (predicates_1.isTokenError(ve)) {
        return printTokenError(ve);
    }
    else if (predicates_1.isReadError(ve)) {
        return printReadError(ve);
    }
    else if (predicates_1.isExprError(ve)) {
        return printExprError(ve);
    }
    else {
        return "Value Error: " + ve.valueError + "; value: " + printExpr(ve.expr);
    }
};
var printTokenError = function (te) {
    return "Token Error: " + te.tokenError + " in " + te.string;
};
var printReadError = function (re) {
    if (predicates_1.isTokenError(re)) {
        return printTokenError(re);
    }
    else {
        return "Read Error: " + re.readError + " for " + printTokens(re.tokens);
    }
};
var printDefinitionError = function (de) {
    if (predicates_1.isReadError(de))
        return printReadError(de);
    return "Definition Error: " + de.defnError + " in (" + printSexps(de.sexps) + ")";
};
var printExprError = function (ee) {
    if (predicates_1.isReadError(ee))
        return printReadError(ee);
    if (ee.exprError === 'Empty Expr')
        return 'Expression Error: Empty Expr in ()';
    return "Expression Error: " + ee.exprError + " in (" + printSexps(ee.sexps) + ")";
};
var printTokens = function (ts) {
    return ts.reduce(function (acc, elem) {
        if (predicates_1.isTokenError(elem)) {
            return printTokenError(elem) + '\n';
        }
        else if (elem.type === types_1.TokenType.OpenParen
            || elem.type === types_1.TokenType.OpenSquareParen
            || elem.type === types_1.TokenType.OpenBraceParen) {
            return acc + elem.token;
        }
        else
            return acc + elem.token + ' ';
    }, '').trim();
};
var printSexps = function (sexps) {
    return sexps.reduce(function (acc, elem) {
        if (predicates_1.isReadError(elem))
            return printReadError(elem);
        else if (Array.isArray(elem.sexp))
            return acc + '(' + printSexps(elem.sexp) + ')';
        else
            return acc + elem.sexp.toString() + ' ';
    }, '').trim();
};
var printDefinition = function (d) {
    if (predicates_1.isDefinitionError(d))
        return printDefinitionError(d);
    else if (d.type === 'define-constant')
        return '(define' + ' ' + d.name + ' ' + printExpr(d.body) + ')';
    else
        return ("(define (" + d.name + " " + d.params.reduce(function (acc, elem) { return acc.concat(elem).concat(' '); }, '').trim() + ") " + printExpr(d.body) + ")");
};
var printExpr = function (e) {
    if (predicates_1.isExprError(e))
        return printExprError(e);
    else if (e.type === 'Call')
        return ("(" + e.op + " " + e.args.reduce(function (acc, elem) { return acc + printExpr(elem) + ' '; }, '').trim() + ")");
    else
        return e["const"].toString();
};
