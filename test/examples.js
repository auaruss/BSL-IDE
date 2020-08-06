'use strict';
exports.__esModule = true;
var types_1 = require("../src/logic/types");
var tokenize_1 = require("../src/logic/tokenize");
var Tok = function (t, v) {
    return { type: t, token: v };
};
var Atom = function (t, v) {
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
var NumTok = function (v) { return Tok(types_1.TokenType.Number, v.toString()); };
var IdTok = function (v) { return Tok(types_1.TokenType.Identifier, v); };
var StringTok = function (v) { return Tok(types_1.TokenType.String, '"' + v + '"'); };
var BooleanTok = function (v) { return Tok(types_1.TokenType.Boolean, v); };
var NumAtom = function (v) { return Atom('Num', v); };
var IdAtom = function (v) { return Atom('Id', v); };
var StringAtom = function (v) { return Atom('String', v); };
var BooleanAtom = function (v) { return Atom('Bool', whichBool(v)); };
var TokErr = function (v) {
    return { tokenError: 'Unidentified Token', string: v };
};
var ReadErr = function (e, v) {
    return { readError: e, tokens: v };
};
var _a = [
    Tok(types_1.TokenType.CloseParen, ')'),
    Tok(types_1.TokenType.OpenParen, '('),
    Tok(types_1.TokenType.Whitespace, ' '),
    Tok(types_1.TokenType.OpenSquareParen, '['),
    Tok(types_1.TokenType.CloseSquareParen, ']'),
    Tok(types_1.TokenType.OpenBraceParen, '{'),
    Tok(types_1.TokenType.CloseBraceParen, '}'),
    Tok(types_1.TokenType.Whitespace, '\n')
], CP = _a[0], OP = _a[1], SPACE = _a[2], OSP = _a[3], CSP = _a[4], OBP = _a[5], CBP = _a[6], NL = _a[7];
/**
 * Converts a boolean token into a Boolean SExp.
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
};
/**
 * These test cases are cases which should succeed through
 * the entire pipeline.
 */
var TEST_CASE_SUCCESSES = [
    [
        ['(define x 10)'],
        [
            [OP, IdTok('define'), IdTok('x'), NumTok('10'), CP]
        ]
    ],
    [
        ['#t', '#f', '#true', '#false'],
        [
            [BooleanTok('#t')],
            [BooleanTok('#f')],
            [BooleanTok('#true')],
            [BooleanTok('#false')]
        ]
    ],
    [
        ['', '123', '"hello"', '#true'],
        [
            [],
            [NumTok('123')],
            [StringTok('hello')],
            [BooleanTok('true')]
        ]
    ],
    [
        ['(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'],
        [
            [
                OP,
                IdTok('define'),
                SPACE,
                OP,
                IdTok('fact'),
                SPACE,
                IdTok('n'),
                CP,
                SPACE,
                OP,
                IdTok('if'),
                SPACE,
                OP,
                IdTok('='),
                SPACE,
                IdTok('n'),
                SPACE,
                NumTok('0'),
                CP,
                SPACE,
                NumTok('1'),
                SPACE,
                OP,
                IdTok('*'),
                SPACE,
                IdTok('n'),
                SPACE,
                OP,
                IdTok('fact'),
                SPACE,
                OP,
                IdTok('-'),
                SPACE,
                IdTok('n'),
                SPACE,
                NumTok('1'),
                CP,
                CP,
                CP,
                CP,
                CP
            ]
        ]
    ],
    [
        ['(define (simple-choice x y z) (if x y z))\n'
                + '(simple-choice #t 10 20)\n'
                + '\n'
                + '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
                + '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n'],
        [
            tokenize_1.tokenize('(define (simple-choice x y z) (if x y z))')
                .concat([NL])
                .concat(tokenize_1.tokenize('(simple-choice #t 10 20)'))
                .concat([Tok(types_1.TokenType.Whitespace, '\n\n')])
                .concat(tokenize_1.tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
                .concat([NL])
                .concat(tokenize_1.tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
                .concat([NL])
        ]
    ],
    [
        ['(define (mn x y) (if (< x y) x y))'],
        [
            [
                OP,
                IdTok('define'),
                SPACE,
                OP,
                IdTok('mn'),
                SPACE,
                IdTok('x'),
                SPACE,
                IdTok('y'),
                CP,
                SPACE,
                OP,
                IdTok('if'),
                SPACE,
                OP,
                IdTok('<'),
                SPACE,
                IdTok('x'),
                SPACE,
                IdTok('y'),
                CP,
                SPACE,
                IdTok('x'),
                SPACE,
                IdTok('y'),
                CP,
                CP
            ]
        ]
    ],
    [
        [
            '(simple-choice #t 10 20)',
            '(* 2 3)',
            '(fact 5)',
            '(f 10)'
        ],
        [
            [
                OP,
                IdTok('simple-choice'),
                SPACE,
                BooleanTok('#t'),
                SPACE,
                NumTok('10'),
                SPACE,
                NumTok('20')
            ],
            [
                OP,
                IdTok('*'),
                SPACE,
                NumTok('2'),
                SPACE,
                NumTok('3'),
                CP
            ],
            [
                OP,
                IdTok('fact'),
                SPACE,
                NumTok('5'),
                CP
            ],
            [
                OP,
                IdTok('f'),
                SPACE,
                NumTok('10'),
                CP
            ]
        ]
    ],
    [
        [
            '(define x 100)'
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
                + 'x'
                + 'testNum'
                + 'testBool'
                + 'testStr'
                + '(* 2 3)'
                + '(/ 2 2)'
                + '(- 3 2)'
                + '(+ 2)'
                + '(- 2)'
                + '(* 2)'
                + '(/ 2)'
        ],
        [
            tokenize_1.tokenize('(define x 100)')
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
                .concat(tokenize_1.tokenize('x'))
                .concat(tokenize_1.tokenize('testNum'))
                .concat(tokenize_1.tokenize('testBool'))
                .concat(tokenize_1.tokenize('testStr'))
                .concat(tokenize_1.tokenize('(* 2 3)'))
                .concat(tokenize_1.tokenize('(/ 2 2)'))
                .concat(tokenize_1.tokenize('(- 3 2)'))
                .concat(tokenize_1.tokenize('(+ 2)'))
                .concat(tokenize_1.tokenize('(- 2)'))
                .concat(tokenize_1.tokenize('(* 2)'))
                .concat(tokenize_1.tokenize('(/ 2)'))
        ]
    ],
    [
        ['(define (fib n) (if (or (= n 0) (= n 1)) n (+ (fib (- n 1)) (fib (- n 2)))))'],
        [
            [
                OP,
                IdTok('define'),
                SPACE,
                OP,
                IdTok('fib'),
                SPACE,
                IdTok('n'),
                CP,
                SPACE,
                OP,
                IdTok('if'),
                SPACE,
                OP,
                IdTok('or'),
                SPACE,
                OP,
                IdTok('='),
                SPACE,
                IdTok('n'),
                NumTok('0'),
                CP,
                SPACE,
                OP,
                IdTok('='),
                SPACE,
                IdTok('n'),
                SPACE,
                NumTok('1'),
                CP,
                CP,
                SPACE,
                IdTok('n'),
                SPACE,
                OP,
                IdTok('+'),
                SPACE,
                OP,
                IdTok('fib'),
                SPACE,
                OP,
                IdTok('-'),
                SPACE,
                IdTok('n'),
                SPACE,
                NumTok('1'),
                CP,
                CP,
                SPACE,
                OP,
                OP,
                IdTok('fib'),
                SPACE,
                OP,
                IdTok('-'),
                SPACE,
                IdTok('n'),
                SPACE,
                NumTok('2'),
                CP,
                CP,
                CP,
                CP,
                CP
            ]
        ]
    ]
];
/**
 * These are test cases which should have an error at some point in the pipeline.
 */
var TEST_CASE_ERRORS = [
    ['([[[][][][][][])))[][])))){}{}{}'],
    ['+'],
    ['(123)'],
    [
        '(',
        '[',
        '{',
        ')',
        ']',
        '}',
        'x'
    ],
    [
        '"abc" def "ghi"', '"abc"def"ghi"'
        // [
        //   [StringTok('abc'), SPACE, IdTok('def'), SPACE, StringTok('ghi')],
        //   [StringTok('abc'), IdTok('def'), StringTok('ghi')]
        // ]
    ],
    [
        'define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',
        '(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'
    ],
    [
        '#t123',
        '(define bool #t123)'
    ],
    [') (hello)'],
    ['("hello" world (this "is" "some non" sense (which should be) #t 10 readable))'],
    [
        '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n'
            + '(fact 20)\n'
            + '(define ',
        '(define (fact n)\n' +
            '  (if (= n 0)\n' +
            '      1\n' +
            '      (* n (fact (- n 1))))))' + // error right paren
            '(fact 5)',
        '(define background-image (empty-scene 100 100))' +
            '(define' +
            'background-image' +
            '(define (f x) (+ 1 x))'
    ]
];
