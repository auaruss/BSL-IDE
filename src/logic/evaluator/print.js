"use strict";
exports.__esModule = true;
var predicates_1 = require("../predicates");
exports.print = function (exp) {
    return '';
};
exports.printResults = function (rs) {
    return rs.reduce(function (acc, elem) {
        return acc + '\n' + printResult(elem);
    }, '');
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
    return 'Defined ' + b.defined + ' to be' + printExprResult(b.toBe) + '.';
};
var printValue = function (v) {
    if (v.type === 'NonFunction') {
        return v.value.toString();
    }
    else if (v.type === 'BuiltinFunction') {
        return 'Builtin function.'; // Do these two ever get printed in BSL?
    }
    else {
        return 'Closure.'; // Do these two ever get printed in BSL?
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
        return 'BindingError: ' + be.bindingError + ' in ' + printDefinition(be.definition);
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
        return 'Value Error: ' + ve.valueError + ' in ' + printExpr(ve.expr);
    }
};
var printTokenError = function (te) {
    return 'Token Error: ' + te.tokenError + ' ' + te.string;
};
var printReadError = function (re) {
    if (predicates_1.isTokenError(re)) {
        return printTokenError(re);
    }
    else {
        return 'Read Error: ' + re.readError + ' in ' + printTokens(re.tokens);
    }
};
var printDefinitionError = function (de) {
    if (predicates_1.isReadError(de))
        return printReadError(de);
    return 'Definition Error: ' + de.defnError + ' in ' + printSexps(de.sexps);
};
var printExprError = function (ee) {
    if (predicates_1.isReadError(ee))
        return printReadError(ee);
    return 'Expression Error: ' + ee.exprError + ' in ' + printSexps(ee.sexps);
};
var printTokens = function (ts) {
    return ts.reduce(function (acc, elem) {
        if (predicates_1.isTokenError(elem)) {
            return printTokenError(elem) + '\n';
        }
        else
            return acc + elem.token;
    }, '');
};
var printSexps = function (sexps) {
    return sexps.reduce(function (acc, elem) {
        if (predicates_1.isReadError(elem))
            return printReadError(elem) + '\n';
        else if (Array.isArray(elem.sexp))
            return acc + printSexps(elem.sexp) + '\n';
        else
            return acc + elem.sexp.toString() + '\n';
    }, '');
};
var printDefinition = function (d) {
    if (predicates_1.isDefinitionError(d))
        return printDefinitionError(d);
    else if (d.type === 'define-constant')
        return d.type + ' ' + d.name + ' ' + printExpr(d.body);
    else
        return (d.type + ' (' + d.name + ' ' +
            d.params.reduce(function (acc, elem) { return elem + ' '; }, '') + ')' +
            printExpr(d.body));
};
var printExpr = function (e) {
    if (predicates_1.isExprError(e))
        return printExprError(e);
    else if (e.type === 'Call')
        return ('(' + e.op + ' ' +
            e.args.reduce(function (acc, elem) { return elem + ' '; }, '') + ')');
    else
        return e["const"].toString();
};
