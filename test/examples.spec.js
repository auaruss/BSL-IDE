'use strict';
exports.__esModule = true;
var types_1 = require("../src/logic/types");
var tokenize_1 = require("../src/logic/evaluator/tokenize");
var read_1 = require("../src/logic/evaluator/read");
var parse_1 = require("../src/logic/evaluator/parse");
var eval_1 = require("../src/logic/evaluator/eval");
var print_1 = require("../src/logic/evaluator/print");
var constructors_1 = require("../src/logic/constructors");
var check_expect_1 = require("./check-expect");
var chai_1 = require("chai");
var t = function (input, tokens, sexps, deforexprs, values, output) {
    describe(input, function () {
        if (input) {
            try {
                var ts_1 = tokenize_1.tokenize(input);
                if (tokens) {
                    it('should tokenize correctly', function () {
                        check_expect_1.checkExpect(ts_1, tokens);
                    });
                }
                else {
                    tokens = ts_1;
                }
            }
            catch (e) {
                it('Threw this error on the tokenizer: ' + e, function () {
                    chai_1.assert.fail();
                });
            }
        }
        if (tokens) {
            var s_1;
            try {
                s_1 = read_1.readTokens(tokens);
                if (sexps) {
                    it('should read correctly', function () {
                        check_expect_1.checkExpect(s_1, sexps);
                    });
                }
                else {
                    sexps = s_1;
                }
            }
            catch (e) {
                it('Threw this error on the reader: ' + e, function () {
                    chai_1.assert.fail();
                });
            }
        }
        if (sexps) {
            try {
                var d_1 = parse_1.parseSexps(sexps);
                if (deforexprs) {
                    it('should parse correctly', function () {
                        check_expect_1.checkExpect(d_1, deforexprs);
                    });
                }
                else {
                    deforexprs = d_1;
                }
            }
            catch (e) {
                it('Threw this error on the parser: ' + e, function () {
                    chai_1.assert.fail();
                });
            }
        }
        if (deforexprs) {
            try {
                var doe_1 = eval_1.evaluateDefOrExprs(deforexprs);
                if (values) {
                    it('should evaluate correctly', function () {
                        check_expect_1.checkExpect(doe_1, values);
                    });
                }
                else {
                    values = doe_1;
                }
            }
            catch (e) {
                it('Threw this error on the evaluator: ' + e, function () {
                    chai_1.assert.fail();
                });
            }
        }
        if (values) {
            try {
                var o_1 = print_1.printResults(values);
                if (output) {
                    it('should output correctly', function () {
                        check_expect_1.checkExpect(o_1, output);
                    });
                }
            }
            catch (e) {
                it('Threw this error on the reader: ' + e, function () {
                    chai_1.assert.fail();
                });
            }
        }
    });
};
/*****************************************************************************
 *                        Test cases for correctness.                        *
 *                                                                           *
 * These test cases are intended to test the basic behavior of a BSL program *
 * regardless of live editing behavior.                                      *
 *****************************************************************************/
t('', [], [], [], []);
t('()' /* ... */);
t('123', [constructors_1.NumTok('123')], [constructors_1.NumAtom(123)], [constructors_1.NumExpr(123)], [constructors_1.NFn(123)], '123');
t('"hello"', [constructors_1.StringTok('hello')], [constructors_1.StringAtom('hello')], [constructors_1.StringExpr('hello')], [constructors_1.NFn('hello')], 'hello');
t('hello', [constructors_1.IdTok('hello')], [constructors_1.IdAtom('hello')], [constructors_1.IdExpr('hello')], [constructors_1.ValErr('Id not in environment', constructors_1.IdExpr('hello'))], 'hello: Id not in environment');
t('#true', [constructors_1.BooleanTok('#true')], [constructors_1.BooleanAtom('#true')], [constructors_1.BooleanExpr(true)], [constructors_1.NFn(true)], '#t');
t('(', [constructors_1.OP], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP])], 'ReadError: No Closing Paren for (');
t('[', [constructors_1.OSP], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OSP])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OSP])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OSP])], 'ReadError: No Closing Paren for [');
t('{', [constructors_1.OBP], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OBP])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OBP])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OBP])], 'ReadError: No Closing Paren for {');
t(')', [constructors_1.CP], [constructors_1.ReadErr('No Open Paren', [constructors_1.CP])], [constructors_1.ReadErr('No Open Paren', [constructors_1.CP])], [constructors_1.ReadErr('No Open Paren', [constructors_1.CP])], 'ReadError: No Open Paren for )');
t(']', [constructors_1.CSP], [constructors_1.ReadErr('No Open Paren', [constructors_1.CSP])], [constructors_1.ReadErr('No Open Paren', [constructors_1.CSP])], [constructors_1.ReadErr('No Open Paren', [constructors_1.CSP])], 'ReadError: No Open Paren for ]');
t('}', [constructors_1.CBP], [constructors_1.ReadErr('No Open Paren', [constructors_1.CBP])], [constructors_1.ReadErr('No Open Paren', [constructors_1.CBP])], [constructors_1.ReadErr('No Open Paren', [constructors_1.CBP])], 'ReadError: No Open Paren for }');
t('#t', [constructors_1.BooleanTok('#t')], [constructors_1.BooleanAtom('#t')]);
t('#f', [constructors_1.BooleanTok('#f')], [constructors_1.BooleanAtom('#f')]);
t('#true', [constructors_1.BooleanTok('#true')], [constructors_1.BooleanAtom('#true')]);
t('#false', [constructors_1.BooleanTok('#false')], [constructors_1.BooleanAtom('#false')]);
t('x', [constructors_1.IdTok('x')], [constructors_1.IdAtom('x')]);
t('+', [constructors_1.IdTok('+')], [constructors_1.IdAtom('+')]);
t('"abc" def "ghi"', [
    constructors_1.StringTok('abc'),
    constructors_1.SPACE,
    constructors_1.IdTok('def'),
    constructors_1.SPACE,
    constructors_1.StringTok('ghi')
], [
    constructors_1.StringAtom('abc'),
    constructors_1.IdAtom('def'),
    constructors_1.StringAtom('ghi')
]);
t('"abc"def"ghi"', [
    constructors_1.StringTok('abc'),
    constructors_1.IdTok('def'),
    constructors_1.StringTok('ghi')
], [
    constructors_1.StringAtom('abc'),
    constructors_1.IdAtom('def'),
    constructors_1.StringAtom('ghi')
]);
t('#t123', [
    constructors_1.TokErr('#'),
    constructors_1.IdTok('t123')
], [
    constructors_1.TokErr('#'),
    constructors_1.IdAtom('t123')
]);
t('(define x 10)', [constructors_1.OP, constructors_1.IdTok('define'), constructors_1.SPACE, constructors_1.IdTok('x'), constructors_1.SPACE, constructors_1.NumTok('10'), constructors_1.CP], [
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.IdAtom('x'), constructors_1.NumAtom(10))
]);
t('(123)', [
    constructors_1.OP,
    constructors_1.NumTok('123'),
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.NumAtom(123))
]);
t('([[[][][][][][])))[][])))){}{}{}', [
    constructors_1.OP,
    constructors_1.OSP,
    constructors_1.OSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.OSP,
    constructors_1.CSP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.OBP,
    constructors_1.CBP,
    constructors_1.OBP,
    constructors_1.CBP,
    constructors_1.OBP,
    constructors_1.CBP
], [
    constructors_1.SExps(constructors_1.ReadErr('No Closing Paren', [constructors_1.OSP]), constructors_1.ReadErr('No Closing Paren', [constructors_1.OSP]), constructors_1.SExps(), constructors_1.SExps(), constructors_1.SExps(), constructors_1.SExps(), constructors_1.SExps(), constructors_1.SExps()),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.SExps(), constructors_1.SExps(),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.SExps(),
    constructors_1.SExps()
]);
t(') (hello)', [
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('hello'),
    constructors_1.CP
], [
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP]),
    constructors_1.SExps(constructors_1.IdAtom('hello'))
]);
t('(define bool #t123)', [
    constructors_1.OP,
    constructors_1.IdTok('define'),
    constructors_1.SPACE,
    constructors_1.IdTok('bool'),
    constructors_1.SPACE,
    constructors_1.TokErr('#t123'),
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.IdAtom('bool'), constructors_1.TokErr('#t123'))
], [
    constructors_1.DefnErr('Cannot have a definition as the body of a definition', [
        constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.IdAtom('bool'), constructors_1.TokErr('#t123'))
    ])
]);
t('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))', [
    constructors_1.OP,
    constructors_1.IdTok('define'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('if'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('='),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('0'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('*'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('-'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.IdAtom('n')), constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(0)), constructors_1.NumAtom(1), constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.IdAtom('n'), constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(1))))))
], [
    constructors_1.FnDefn('fact', ['n'], constructors_1.Call('if', [
        constructors_1.Call('=', [constructors_1.IdExpr('n'), constructors_1.NumExpr(0)]),
        constructors_1.NumExpr(1),
        constructors_1.Call('*', [
            constructors_1.IdExpr('n'),
            constructors_1.Call('fact', [constructors_1.Call('-', [constructors_1.IdExpr('n'), constructors_1.NumExpr(1)])])
        ])
    ]))
]);
t('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))', [
    constructors_1.IdTok('define'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('if'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('='),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('0'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('*'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('-'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP
], [
    constructors_1.IdAtom('define'),
    constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.IdAtom('n')),
    constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(0)), constructors_1.NumAtom(1), constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.IdAtom('n'), constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(1))))),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP])
]);
t('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))', [
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('if'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('='),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('0'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('*'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('-'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.IdAtom('n')),
    constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(0)), constructors_1.NumAtom(1), constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.IdAtom('n'), constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(1))))),
    constructors_1.ReadErr('No Open Paren', [constructors_1.CP])
]);
t('(define (simple-choice x y z) (if x y z))\n'
    + '(simple-choice #t 10 20)\n'
    + '\n'
    + '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
    + '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n', tokenize_1.tokenize('(define (simple-choice x y z) (if x y z))')
    .concat([constructors_1.NL])
    .concat(tokenize_1.tokenize('(simple-choice #t 10 20)'))
    .concat([constructors_1.Tok(types_1.TokenType.Whitespace, '\n\n')])
    .concat(tokenize_1.tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
    .concat([constructors_1.NL])
    .concat(tokenize_1.tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
    .concat([constructors_1.NL]), [
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.SExps(constructors_1.IdAtom('simple-choice'), constructors_1.IdAtom('x'), constructors_1.IdAtom('y'), constructors_1.IdAtom('z')), constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.IdAtom('x'), constructors_1.IdAtom('y'), constructors_1.IdAtom('z'))),
    constructors_1.SExps(constructors_1.IdAtom('simple-choice'), constructors_1.BooleanAtom('#t'), constructors_1.NumAtom(10), constructors_1.NumAtom(20)),
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.IdAtom('m'), constructors_1.IdAtom('n')), constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(0)), constructors_1.NumAtom(0), constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.IdAtom('m'), constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.IdAtom('m'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(1)))))),
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.IdAtom('n')), constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(0)), constructors_1.NumAtom(1), constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.IdAtom('n'), constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(1))))))
]);
t('(define (mn x y) (if (< x y) x y))', [
    constructors_1.OP,
    constructors_1.IdTok('define'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('mn'),
    constructors_1.SPACE,
    constructors_1.IdTok('x'),
    constructors_1.SPACE,
    constructors_1.IdTok('y'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('if'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('<'),
    constructors_1.SPACE,
    constructors_1.IdTok('x'),
    constructors_1.SPACE,
    constructors_1.IdTok('y'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.IdTok('x'),
    constructors_1.SPACE,
    constructors_1.IdTok('y'),
    constructors_1.CP,
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.SExps(constructors_1.IdAtom('mn'), constructors_1.IdAtom('x'), constructors_1.IdAtom('y')), constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('<'), constructors_1.IdAtom('x'), constructors_1.IdAtom('y')), constructors_1.IdAtom('x'), constructors_1.IdAtom('y')))
]);
t('(simple-choice #t 10 20)', [
    constructors_1.OP,
    constructors_1.IdTok('simple-choice'),
    constructors_1.SPACE,
    constructors_1.BooleanTok('#t'),
    constructors_1.SPACE,
    constructors_1.NumTok('10'),
    constructors_1.SPACE,
    constructors_1.NumTok('20'),
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('simple-choice'), constructors_1.BooleanAtom('#t'), constructors_1.NumAtom(10), constructors_1.NumAtom(20))
]);
t('(* 2 3)', [
    constructors_1.OP,
    constructors_1.IdTok('*'),
    constructors_1.SPACE,
    constructors_1.NumTok('2'),
    constructors_1.SPACE,
    constructors_1.NumTok('3'),
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('*'), constructors_1.NumAtom(2), constructors_1.NumAtom(3))
]);
t('(fact 5)', [
    constructors_1.OP,
    constructors_1.IdTok('fact'),
    constructors_1.SPACE,
    constructors_1.NumTok('5'),
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('fact'), constructors_1.NumAtom(5))
]);
t('(f 10)', [
    constructors_1.OP,
    constructors_1.IdTok('f'),
    constructors_1.SPACE,
    constructors_1.NumTok('10'),
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('f'), constructors_1.NumAtom(10))
]);
t('(define x 100)'
    + '(define testNum 10)'
    + '(define testBool #true)'
    + '(define testStr "Hello")'
    + '(define (simple-choice x y z) (if x y z))'
    + '(simple-choice #t 10 20)'
    + '\n'
    + '(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'
    + '(mul 2 3)'
    + '\n'
    + '\n'
    + '(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'
    + '(fact 5)'
    + '(define (f x) (g (+ x 1)))'
    + '(define (g y) (mul x y))'
    + '\n'
    + 'x\n'
    + 'testNum\n'
    + 'testBool\n'
    + 'testStr\n'
    + '(* 2 3)'
    + '(/ 2 2)'
    + '(- 3 2)'
    + '(+ 2)'
    + '(- 2)'
    + '(* 2)'
    + '(/ 2)', tokenize_1.tokenize('(define x 100)')
    .concat(tokenize_1.tokenize('(define testNum 10)'))
    .concat(tokenize_1.tokenize('(define testBool #true)'))
    .concat(tokenize_1.tokenize('(define testStr "Hello")'))
    .concat(tokenize_1.tokenize('(define (simple-choice x y z) (if x y z))'))
    .concat(tokenize_1.tokenize('(simple-choice #t 10 20)'))
    .concat(tokenize_1.tokenize('\n'))
    .concat(tokenize_1.tokenize('(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'))
    .concat(tokenize_1.tokenize('(mul 2 3)'))
    .concat(tokenize_1.tokenize('\n\n'))
    .concat(tokenize_1.tokenize('(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'))
    .concat(tokenize_1.tokenize('(fact 5)'))
    .concat(tokenize_1.tokenize('(define (f x) (g (+ x 1)))'))
    .concat(tokenize_1.tokenize('(define (g y) (mul x y))'))
    .concat(tokenize_1.tokenize('\n'))
    .concat(tokenize_1.tokenize('x\n'))
    .concat(tokenize_1.tokenize('testNum\n'))
    .concat(tokenize_1.tokenize('testBool\n'))
    .concat(tokenize_1.tokenize('testStr\n'))
    .concat(tokenize_1.tokenize('(* 2 3)'))
    .concat(tokenize_1.tokenize('(/ 2 2)'))
    .concat(tokenize_1.tokenize('(- 3 2)'))
    .concat(tokenize_1.tokenize('(+ 2)'))
    .concat(tokenize_1.tokenize('(- 2)'))
    .concat(tokenize_1.tokenize('(* 2)'))
    .concat(tokenize_1.tokenize('(/ 2)')), read_1.read('(define x 100)')
    .concat(read_1.read('(define testNum 10)'))
    .concat(read_1.read('(define testBool #true)'))
    .concat(read_1.read('(define testStr "Hello")'))
    .concat(read_1.read('(define (simple-choice x y z) (if x y z))'))
    .concat(read_1.read('(simple-choice #t 10 20)'))
    .concat(read_1.read('(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'))
    .concat(read_1.read('(mul 2 3)'))
    .concat(read_1.read('(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'))
    .concat(read_1.read('(fact 5)'))
    .concat(read_1.read('(define (f x) (g (+ x 1)))'))
    .concat(read_1.read('(define (g y) (mul x y))'))
    .concat(read_1.read('x'))
    .concat(read_1.read('testNum'))
    .concat(read_1.read('testBool'))
    .concat(read_1.read('testStr'))
    .concat(read_1.read('(* 2 3)'))
    .concat(read_1.read('(/ 2 2)'))
    .concat(read_1.read('(- 3 2)'))
    .concat(read_1.read('(+ 2)'))
    .concat(read_1.read('(- 2)'))
    .concat(read_1.read('(* 2)'))
    .concat(read_1.read('(/ 2)')));
t('(define (fib n) (if (or (= n 0) (= n 1)) 1 (+ (fib (- n 1)) (fib (- n 2)))))', [
    constructors_1.OP,
    constructors_1.IdTok('define'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fib'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('if'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('or'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('='),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('0'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('='),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('+'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fib'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('-'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('1'),
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('fib'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('-'),
    constructors_1.SPACE,
    constructors_1.IdTok('n'),
    constructors_1.SPACE,
    constructors_1.NumTok('2'),
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP,
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.IdAtom('define'), constructors_1.SExps(constructors_1.IdAtom('fib'), constructors_1.IdAtom('n')), constructors_1.SExps(constructors_1.IdAtom('if'), constructors_1.SExps(constructors_1.IdAtom('or'), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(0)), constructors_1.SExps(constructors_1.IdAtom('='), constructors_1.IdAtom('n'), constructors_1.NumAtom(1))), constructors_1.NumAtom(1), constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.SExps(constructors_1.IdAtom('fib'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(1))), constructors_1.SExps(constructors_1.IdAtom('fib'), constructors_1.SExps(constructors_1.IdAtom('-'), constructors_1.IdAtom('n'), constructors_1.NumAtom(2))))))
]);
t('("hello" world (this "is" "some non" sense (which should be) #t 10 readable))', [
    constructors_1.OP,
    constructors_1.StringTok('hello'),
    constructors_1.SPACE,
    constructors_1.IdTok('world'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('this'),
    constructors_1.SPACE,
    constructors_1.StringTok('is'),
    constructors_1.SPACE,
    constructors_1.StringTok('some non'),
    constructors_1.SPACE,
    constructors_1.IdTok('sense'),
    constructors_1.SPACE,
    constructors_1.OP,
    constructors_1.IdTok('which'),
    constructors_1.SPACE,
    constructors_1.IdTok('should'),
    constructors_1.SPACE,
    constructors_1.IdTok('be'),
    constructors_1.CP,
    constructors_1.SPACE,
    constructors_1.BooleanTok('#t'),
    constructors_1.SPACE,
    constructors_1.NumTok('10'),
    constructors_1.SPACE,
    constructors_1.IdTok('readable'),
    constructors_1.CP,
    constructors_1.CP
], [
    constructors_1.SExps(constructors_1.StringAtom('hello'), constructors_1.IdAtom('world'), constructors_1.SExps(constructors_1.IdAtom('this'), constructors_1.StringAtom('is'), constructors_1.StringAtom('some non'), constructors_1.IdAtom('sense'), constructors_1.SExps(constructors_1.IdAtom('which'), constructors_1.IdAtom('should'), constructors_1.IdAtom('be')), constructors_1.BooleanAtom('#t'), constructors_1.NumAtom(10), constructors_1.IdAtom('readable')))
]);
t('(define y x)\n' +
    '(define x 3)');
// f used before its definition
// must know its got a defn but that it hasnt been 'filled in'
t('(define x (f 3)) (define (f y) y)');
t('(define x (+ (+) 3)');
/*****************************************************************************
 *                   Test cases for live editing behavior.                   *
 *                                                                           *
 * These test cases are intended to illustrate specific live editing         *
 * behavior and the intended output of the live editor with that behavior.   *
 *****************************************************************************/
/**
 * Our demo: (+ 2 3)
 */
t('', [], [], [], [], '');
t('(', [constructors_1.OP], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(".');
t('(+', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+".');
// t('(+ ');
t('(+ 2', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2')], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2')])], 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+ 2".');
t('(+ 2 3', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '3')], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '3')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '3')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '3')])], 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+ 2 3".');
t('(+ 2 3)', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '3'), constructors_1.CP], [constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(2), constructors_1.NumAtom(3))], [constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(3)])], [constructors_1.NFn(5)], '5');
// t('(+ 2 3');
// t('(+ 2 ');
t('(+ 2 4', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4')], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4')])], [constructors_1.ReadErr('No Closing Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4')])], 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+ 2 4".');
t('(+ 2 4)', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.SPACE, constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.SPACE, constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.CP], [constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(2), constructors_1.NumAtom(4))], [constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(4)])], [constructors_1.NFn(6)], '6');
// t('(+ 2 4) ');
t('(+ 2 4) (+', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.CP, constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')], [constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(2), constructors_1.NumAtom(4)), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], [constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(4)]), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], [constructors_1.NFn(6), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+')])], '6\n'
    + 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+".');
// t('(+ 2 4) (+ ');
t('(+ 2 4) (+ 4', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.CP, constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4')], [constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(2), constructors_1.NumAtom(4)), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4')])], [constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(4)]), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4')])], [constructors_1.NFn(6), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4')])], '6\n'
    + 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+ 4".');
// t('(+ 2 4) (+ 4 ');
t('(+ 2 4) (+ 4 7', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.CP, constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.Tok(types_1.TokenType.Number, '7')], [constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(2), constructors_1.NumAtom(4)), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.Tok(types_1.TokenType.Number, '7')])], [constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(4)]), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.Tok(types_1.TokenType.Number, '7')])], [constructors_1.NFn(6), constructors_1.ReadErr('No Open Paren', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.Tok(types_1.TokenType.Number, '7')])], '6\n'
    + 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
    + 'Found in: "(+ 4 7".');
t('(+ 2 4) (+ 4 7)', [constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '2'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.CP, constructors_1.OP, constructors_1.Tok(types_1.TokenType.Identifier, '+'), constructors_1.Tok(types_1.TokenType.Number, '4'), constructors_1.Tok(types_1.TokenType.Number, '7'), constructors_1.CP], [constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(2), constructors_1.NumAtom(4)), constructors_1.SExps(constructors_1.IdAtom('+'), constructors_1.NumAtom(4), constructors_1.NumAtom(7))], [constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(4)]), constructors_1.Call('+', [constructors_1.NumExpr(2), constructors_1.NumExpr(4)])], [constructors_1.NFn(6), constructors_1.NFn(11)], '6\n' +
    '11');
/**
 * Our demo: Someone tries to define fib.
 */
// ''
// '('
// ...
t('(define (fib n)\n' +
    '  (if (= fib 0)\n' +
    '      (n 1)\n' +
    '      (else if (= fib 1)\n' +
    '            (n 1)\n' +
    '            (else (n (fib n - 2) + (fib n - 1))))');
// ...
// missing parens
t('(define (fib n)\n' +
    '  (if (= fib 0)\n' +
    '      (n 1)\n' +
    '      (else if (= fib 1)\n' +
    '            (n 1)\n' +
    '            (else (n (fib n - 2) + (fib n - 1))))))');
// ...
// The student is reminded of prefix notation
t('(define (fib n)\n' +
    '  (if (= fib 0)\n' +
    '      (n 1)\n' +
    '      (else if (= fib 1)\n' +
    '            (n 1)\n' +
    '            (else (n (fib (- n 2) + (fib (- n 1))))))');
// ...
// The student is told fib cant equal 0
t('(define (fib n)\n' +
    '  (if (= n 0)\n' +
    '      (n 1)\n' +
    '      (else if (= fib 1)\n' +
    '            (n 1)\n' +
    '            (else (n (fib (- n 2) + (fib (- n 1))))))');
// ...
// Student is told 'you can't call n'
t('(define (fib n)\n' +
    '  (if (= n 0)\n' +
    '      n 1\n' +
    '      (else if (= fib 1)\n' +
    '            n 1\n' +
    '            (else n (fib (- n 2) + (fib (- n 1)))))');
// ...
// Student is told something like 'now get rid of those n'
t('(define (fib)\n' +
    '  (if (= 0)\n' +
    '      1\n' +
    '      (else if (= fib 1)\n' +
    '            1\n' +
    '            (else (fib (- 2) + (fib (- 1)))))');
// ...
// 'No, not all the n.' 
t('(define (fib n)\n' +
    '  (if (= n 0)\n' +
    '      1\n' +
    '      (else if (= fib 1)\n' +
    '            1\n' +
    '            (else (fib (- n 2) + (fib (- n 1)))))');
// ...
// Prefix notation again.
t('(define (fib n)\n' +
    '  (if (= n 0)\n' +
    '      1\n' +
    '      (else if (= fib 1)\n' +
    '            1\n' +
    '            (else (+ (fib (- n 2)) (fib (- n 1)))))))');
// ...
// Else isn't a thing here.
t('(define (fib n)\n' +
    '  (if (= n 0)\n' +
    '      1\n' +
    '      (if (= fib 1)\n' +
    '           1\n' +
    '           (+ (fib (- n 2)) (fib (- n 1))))))');
