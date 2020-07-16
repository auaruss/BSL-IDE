const { tokenize, parse, parseSexp, parseSexps} = require('../src/logic/parse.js');
const { expect } = require('chai');

function Loc([startRow, endRow, startCol, endCol]) {
    return {
        start: {
            row: startRow,
            col: startCol
        },
        end: {
            row: endRow,
            col: endCol
        }
    };
}

function Tok(t, v, loc) { return { type: t, value: v, loc: loc}; }
function Atom(t, v) { return { type: t, value: v}; }

function CP(loc)    { return Tok('CloseParen', ')', Loc(loc))}
function OP(loc)    { return Tok('OpenParen', '(', Loc(loc))}
function SPACE(loc) { return Tok('Whitespace', ' ', Loc(loc))}
function OSP(loc)   { return Tok('OpenSquareParen', '[', Loc(loc))}
function CSP(loc)   { return Tok('CloseSquareParen', ']', Loc(loc))}
function OBP(loc)   { return Tok('OpenBraceParen', '{', Loc(loc))}
function CBP(loc)   { return Tok('CloseBraceParen', '}', Loc(loc))}
function NL(loc)    { return Tok('Whitespace', '\n', Loc(loc))}

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
            throw new Error("Called whichBool on a non-boolean.");
    }
}

function NumTok(v, loc)     { return Tok('Number',       v.toString(), loc); }
function IdTok(v, loc)      { return Tok('Identifier',   v,            loc); }
function StringTok(v, loc)  { return Tok('String', '"' + v + '"',      loc); }
function BooleanTok(v, loc) { return Tok('Boolean',      v,            loc); }

function ResultSuccess(t, r) { return {thing: t, remain: r} }
function ResultFailure(e, r) { return {error: e, remain: r} }

function NumAtom(v) { return Atom('Number', v); }
function IdAtom(v) { return Atom('Identifier', v); }
function StringAtom(v) { return Atom('String', v); }
function BooleanAtom(v) { return Atom('Boolean', whichBool(v)); }




const checkExpect = (res, expected) => {
    expect(res).to.deep.equal(expected);
}

function checkExpectMultiple(f, res, expected) {
    res.map((input, idx) => checkExpect(f(input), expected[idx]));
}

describe('checkExpectMultiple', () => {
    it('should test obviously equal things correctly', () => {
        checkExpectMultiple(
            x => x+1,
            [1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7]
        )
    });
})

describe('tokenize', () => {
    it('should handle the base case correctly', () => {  
        const result = tokenize('');
        checkExpect(result, []);
    });

    it('should tokenize parenthesis correctly', () => {
        const result = tokenize('([[[][][][][][])))[][])))){}{}{}');
        const expected = [
            OP([0,1,0,0]),
            OSP([1,2,0,0]),
            OSP([2,3,0,0]),
            OSP([3,4,0,0]),
            CSP([4,5,0,0]),
            OSP([5,6,0,0]),
            CSP([6,7,0,0]),
            OSP([7,8,0,0]),
            CSP([8,9,0,0]),
            OSP([9,10,0,0]),
            CSP([10,11,0,0]),
            OSP([11,12,0,0]),
            CSP([12,13,0,0]),
            OSP([13,14,0,0]),
            CSP([14,15,0,0]),
            CP([15,16,0,0]),
            CP([16,17,0,0]),
            CP([17,18,0,0]),
            OSP([18,19,0,0]),
            CSP([19,20,0,0]),
            OSP([20,21,0,0]),
            CSP([21,22,0,0]),
            CP([22,23,0,0]),
            CP([23,24,0,0]),
            CP([24,25,0,0]),
            CP([25,26,0,0]),
            OBP([26,27,0,0]),
            CBP([27,28,0,0]),
            OBP([28,29,0,0]),
            CBP([29,30,0,0]),
            OBP([30,31,0,0]),
            CBP([31,32,0,0])
        ];

        checkExpect(result, expected);
    });

    it('should tokenize the plus symbol', () => {
        const result = tokenize('+');
        const expected = [IdTok('+', [0,1,0,0])];
        checkExpect(result, expected);
    });

    it('should tokenize a simple variable definition', () => {  
        const result = tokenize('(define x 10)');
        const expected = [
            OP([0,1,0,0]),
            IdTok('define', [1,7,0,0]),
            SPACE([7,8,0,0]),
            IdTok('x', [8,9,0,0]),
            SPACE([9,10,0,0]),
            NumTok(10, [10,12,0,0]),
            CP([12,13,0,0])
        ];
        checkExpect(result, expected);
    });

    it('should tokenize 123 as an number here', () => {
        const result = tokenize('(123)');
        const expected = [ OP([0,1,0,0]), NumTok(123, [1,4,0,0]), CP([4,5,0,0]) ];
        checkExpect(result, expected);
    });

    it('should tokenize booleans correctly', () => {
        const result = ['#t', '#f', '#true', '#false'];
        const expected = [
            [BooleanTok('#t', [0,1,0,0])],
            [BooleanTok('#f', [0,1,0,0])],
            [BooleanTok('#true', [0,1,0,0])],
            [BooleanTok('#false', [0,1,0,0])]
        ];
        checkExpectMultiple(
            tokenize, result, expected
        );
        checkExpect(
            tokenize('#t123'),
            ErrorTok('#t123', [0,1,0,0])
        );
        
    });

    it('should tokenize factorial correctly', () => {
        let result = tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')
        let expected = [
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
            CP,
        ];
        checkExpect(result, expected);
    });

    it('should tokenize strings correctly', () => {
        const result = [
            '"abc" def "ghi"',
            '"abc"def"ghi"'
        ];
        const expected = [
            [StringTok('abc'), SPACE, IdTok('def'), SPACE, StringTok('ghi')],
            [StringTok('abc'), IdTok('def'), StringTok('ghi')]
        ];

        checkExpectMultiple(tokenize, result, expected);
    });

    it('should handle newlines correctly', () =>{
        const newlineTestStr = (
            '(define (simple-choice x y z) (if x y z))\n'
            + '(simple-choice #t 10 20)\n'
            + '\n'
            + '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
            + '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n'
        );
        const expected = (
            tokenize('(define (simple-choice x y z) (if x y z))')
              .concat([NL])
              .concat(tokenize('(simple-choice #t 10 20)'))
              .concat([{type: 'Whitespace', value: '\n\n'}])
              .concat(tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
              .concat([NL])
              .concat(tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
              .concat([NL])
        );
        checkExpect(tokenize(newlineTestStr), expected);
    });
});

describe('parseSexp', () => {
    it('', () => {
        checkExpect(parseSexp([CP]),    {error: 'Found a closing parenthesis with no matching opening parenthesis.', remain: [CP] });
        checkExpect(parseSexp([OP,CP]), {thing: [], remain: [] });
        const result = [
            tokenize(') (hello)').filter(x => x.type !== SPACE),
            tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE),
            tokenize('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE),
            tokenize('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE)
        ];
        const expected = [
            ResultFailure(
                'Found a closing parenthesis with no matching opening parenthesis.',
                tokenize(') (hello)').filter(x => x.type !== SPACE)
            ),
            ResultSuccess(
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
            ResultSuccess(
                IdAtom('define'),
                tokenize(' (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE)
            ),
            ResultSuccess(
                [
                    IdAtom('fact'),
                    IdAtom('n')
                ],
                tokenize(' (if (= n 0) 1 (* n (fact (- n 1)))))').filter(x => x.type !== SPACE)
            )
        ];
        checkExpectMultiple(parseSexp, result, expected);
    })
});

describe('parseSexps', () => {
    it('', () => {
        checkExpect(parseSexps([CP]), {thing: [], remain: [CP] });
        const result = [
            tokenize(') (hello)'),
            tokenize('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'),
            tokenize('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'),
        ];
        const expected = [
            ResultSuccess(
                [],
                tokenize(') (hello)')
            ),
            ResultSuccess(
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
                    ]
                ],
                [CP]
            ),
            ResultSuccess(
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
                    ]
                ],
                [CP]
            )
        ];
        checkExpectMultiple(parseSexps, result, expected);
    });
});

describe('parse', () => {
    it('should parse these simpler things', () => {
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
            [],
            [],
            [],
            [],
            [],
            [],
            [NumAtom(123)],
            [StringAtom('hello')],
            [IdAtom('x')],
            [BooleanAtom('#true')],
            [[IdAtom('define'), IdAtom('x'), NumAtom(10)]]
        ];
        checkExpectMultiple(parse, result, expected);
    });

    it('should parse this fact function', () => {
        const result = parse('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))');
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

    it('should parse this fib function', () => {
        const result = parse('(define (fib n) (if (or (= n 0) (= n 1)) n (+ (fib (- n 1)) (fib (- n 2)))))');
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
    });

    it('should parse some nonsense like this', () => {
        const result = parse('("hello" world (this "is" "some non" sense (which should be) #t 10 parsable))');
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
                    IdAtom('parsable')
                ]
            ]
        ];
        checkExpect(result, expected);
    })
});
