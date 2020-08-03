const { tokenize } = require('../src/logic/tokenize.js');
const { read, readSexp, readSexps } = require('../src/logic/read.js');
const { checkExpect, checkExpectMultiple } = require('./check-expect');

function Tok  (t, v) { return { type:  t, token: v }; }
function Atom (t, v) { return { type:  t, sexp: v }; }

function Result   (t, r) { return {thing: t, remain: r} }

function NumAtom     (v) { return Atom('Num',               v);  }
function IdAtom      (v) { return Atom('Id',                v);  }
function StringAtom  (v) { return Atom('String',            v);  }
function BooleanAtom (v) { return Atom('Bool',    whichBool(v)); }

function TokErr     (v) { return { tokenError: 'Unidentified Token', string: v }; }
function ReadErr (e, v) { return { readError: e,                     tokens: v }; }

const [ CP, OP, SPACE, OSP, CSP, OBP, CBP, NL ] =
    [
        Tok('CloseParen',       ')'),
        Tok('OpenParen',        '('), 
        Tok('Whitespace',       ' '),
        Tok('OpenSquareParen',  '['),
        Tok('CloseSquareParen', ']'),
        Tok('OpenBraceParen',   '{'),
        Tok('CloseBraceParen',  '}'),
        Tok('Whitespace',       '\n')
    ];

const whichBool = (t) => {
    switch (t) {
        case '#T':
        case '#t':
        case '#true':
            return true;
        case '#F':
        case '#f':
        case '#false':
            return false;
        default:
            throw new Err("Called whichBool on a non-boolean.");
    }
}

describe('readSexp', () => {
    it('', () => {
        checkExpect(readSexp([CP]), Result(ReadErr('No Open Paren',[CP]), []));
        checkExpect(readSexp([OP,CP]), {thing: [], remain: [] });
        const result = [
            tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE),
            tokenize('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE),
            tokenize('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE)
        ];
        const expected = [
            Result(
                [
                    IdAtom('define'),
                    [ 
                        IdAtom('fact'),
                        IdAtom('n'),
                    ],
                    [
                        IdAtom('if'),
                        [ 
                            IdAtom('='),
                            IdAtom('n'), 
                            NumAtom(0),
                        ],
                        NumAtom(1),
                        [
                            IdAtom('*'),
                            IdAtom('n'),
                            [
                                IdAtom('fact'),
                                [
                                    IdAtom('-'),
                                    IdAtom('n'),
                                    NumAtom(1)
                                ]
                            ]
                        ]
                    ]
                ],
                []
            ),
            Result(
                IdAtom('define'),
                tokenize(' (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE)
            ),
            Result(
                [
                    IdAtom('fact'),
                    IdAtom('n')
                ],
                tokenize(' (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE)
            )
        ];
        checkExpectMultiple(readSexp, result, expected);
    });

    it('should handle error tokens', () => {
        const errorInput = readSexp(tokenize('(define bool #t123)'));
        const errorExpected = Result(
            [IdAtom('define'), IdAtom('bool'), TokErr('#'), IdAtom('t123')],
            []
        )
        checkExpect(errorInput, errorExpected);
    });

    it('should handle errors', () => {
        const errorInput = [
            tokenize(') (hello)'),
        ];
        const errorExpected = [
            Result(
                ReadErr('No Open Paren', [CP]),
                tokenize(' (hello)')
            ),
        ];
        checkExpectMultiple(readSexp, errorInput, errorExpected);
    });

});

describe('readSexps', () => {
    it('', () => {
        checkExpect(readSexps([CP]), {thing: [], remain: [CP] });
        const result = [
            tokenize(') (hello)'),
            tokenize('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'),
            tokenize('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'),
        ];
        const expected = [
            Result(
                [],
                tokenize(') (hello)')
            ),
            Result(
                [
                    IdAtom('define'),
                    [
                        IdAtom('fact'),
                        IdAtom('n')
                    ],
                    [
                        IdAtom('if'),
                        [
                            IdAtom('='),
                            IdAtom('n'),
                            NumAtom(0),
                        ],
                        NumAtom(1),
                        [
                            IdAtom('*'),
                            IdAtom('n'),
                            [
                                IdAtom('fact'),
                                [
                                    IdAtom('-'),
                                    IdAtom('n'),
                                    NumAtom(1)
                                ]
                            ]
                        ]
                    ],
                ],
                [CP]
            ),
            Result(
                [
                    [
                        IdAtom('fact'),
                        IdAtom('n')
                    ],
                    [
                        IdAtom('if'),
                        [
                            IdAtom('='),
                            IdAtom('n'),
                            NumAtom(0),
                        ],
                        NumAtom(1),
                        [
                            IdAtom('*'),
                            IdAtom('n'),
                            [
                                IdAtom('fact'),
                                [
                                    IdAtom('-'),
                                    IdAtom('n'),
                                    NumAtom(1)
                                ]
                            ]
                        ]
                    ],
                ],
                [CP]
            )
        ];
        checkExpectMultiple(readSexps, result, expected);
    });
});

describe('read', () => {
    it('should read these simpler things', () => {
        const result = [
            '',
            '(',
            '[',
            '{',
            ')',
            ']',
            '}',
            '123',
            '"hello"',
            'x',
            '#true',
            '(define x 10)'
        ];
        const expected = [
            [],
            [ReadErr('No Closing Paren', [OP])],
            [ReadErr('No Closing Paren', [OSP])],
            [ReadErr('No Closing Paren', [OBP])],
            [ReadErr('No Open Paren', [CP])],
            [ReadErr('No Open Paren', [CSP])],
            [ReadErr('No Open Paren', [CBP])],
            [NumAtom(123)],
            [StringAtom('hello')],
            [IdAtom('x')],
            [BooleanAtom('#true')],
            [[IdAtom('define'), IdAtom('x'), NumAtom(10)]]
        ];
        checkExpectMultiple(read, result, expected);
    });

    it('should read this fact function', () => {
        const result = read('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))');
        const expected = [
            [
                IdAtom('define'),
                [ 
                    IdAtom('fact'),
                    IdAtom('n'),
                ],
                [
                    IdAtom('if'),
                    [ 
                        IdAtom('='),
                        IdAtom('n'),
                        NumAtom(0),
                    ],
                    NumAtom(1),
                    [
                        IdAtom('*'),
                        IdAtom('n'),
                        [
                            IdAtom('fact'),
                            [
                                IdAtom('-'),
                                IdAtom('n'),
                                NumAtom(1)
                            ]
                        ]
                    ] 
                ]
            ]
        ];
        checkExpect(result, expected);
    });

    it('should read this fib function', () => {
        const result = read('(define (fib n) (if (or (= n 0) (= n 1)) n (+ (fib (- n 1)) (fib (- n 2)))))');
        const expected = [
            [
                IdAtom('define'),
                [
                    IdAtom('fib'),
                    IdAtom('n')
                ],
                [
                    IdAtom('if'),
                    [
                        IdAtom('or'),
                        [
                            IdAtom('='),
                            IdAtom('n'),
                            NumAtom(0)
                        ],
                        [
                            IdAtom('='),
                            IdAtom('n'),
                            NumAtom(1)
                        ]
                    ],
                    IdAtom('n'),
                    [
                        IdAtom('+'),
                        [
                            IdAtom('fib'),
                            [
                                IdAtom('-'),
                                IdAtom('n'),
                                NumAtom(1)
                            ]
                        ],
                        [
                            IdAtom('fib'),
                            [
                                IdAtom('-'),
                                IdAtom('n'),
                                NumAtom(2)
                            ]
                        ]
                    ]
                ]
            ]
        ];
        checkExpect(result, expected);
    });

    it('should read some nonsense like this', () => {
        const result = read('("hello" world (this "is" "some non" sense (which should be) #t 10 readable))');
        const expected = [
            [
                StringAtom('hello'),
                IdAtom('world'),
                [
                    IdAtom('this'),
                    StringAtom('is'),
                    StringAtom('some non'),
                    IdAtom('sense'),
                    [
                        IdAtom('which'),
                        IdAtom('should'),
                        IdAtom('be')
                    ],
                    BooleanAtom('#t'),
                    NumAtom(10),
                    IdAtom('readable')
                ]
            ]
        ];
        checkExpect(result, expected);
    });
});
