const { parse } = require('../logic/parse.js');
const { syntaxCheckExpr, syntaxCheckDefinition, syntaxCheckDefOrExpr } = require('../logic/eval.js');
const { expect } = require('chai');

function Atom(t, v) { return { type: t, value: v}; }

function Num(v) { return Atom('Number', v); }
function Id(v) { return Atom('Identifier', v); }
function Str(v) { return Atom('String', v); }
function Bool(v) { return Atom('Boolean', v); }

const checkExpect = (res, expected) => {
    expect(res).to.deep.equal(expected);
}

function checkExpectMultiple(f, res, expected) {
    res.map((input, idx) => checkExpect(f(input), expected[idx]));
}

describe('syntaxCheckExpr', () => {
    it('should syntax check single atoms.', () => {
        const result = [
            Num(123),
            Id('hello'),
            Str('hello'),
            Bool(true)
        ];
        const expected = [
            Num(123),
            Id('hello'),
            Str('hello'),
            Bool(true)
        ];
        checkExpectMultiple(syntaxCheckExpr, result, expected);
    });

    it ('should syntax check and transform larger expressions', () => {
        const examples = [
            parse('(+ 2 3 (- 4 6))')[0],
            parse('(if (= n 0) 1 (* n (fact (- n 1))))')[0]
        ];
        const expected = [
            [
                Id('+'),
                [
                    Num(2),
                    Num(3),
                    [
                        Id('-'),
                        [
                            Num(4),
                            Num(6)
                        ]
                    ]
                ]
            ],
            [
                Id('if'),
                [
                    [
                        Id('='),
                        [
                            Id('n'),
                            Num(0)
                        ]
                    ],
                    Num(1),
                    [
                        Id('*'),
                        [
                            Id('n'),
                            [
                                Id('fact'),
                                [
                                    [
                                        Id('-'),
                                        [
                                            Id('n'),
                                            Num(1)
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        checkExpectMultiple(syntaxCheckExpr, examples, expected);
    });
});

describe('syntaxCheckDefinition', () => {
    it('should syntax check these definitions properly', () => {
       const examples = [
            parse('(define x 10)')[0],
            parse('(define (mn x y) (if (< x y) x y))')[0],
            parse('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')[0]
       ];
       const expected = [
            ['define', Id('x'), Num(10)],
            [
                'define',
                [Id('mn'), [Id('x'), Id('y')]],
                [
                    Id('if'),
                    [
                        [
                            Id('<'),
                            [
                                Id('x'),
                                Id('y')
                            ]
                        ],
                        Id('x'),
                        Id('y')
                    ]
                ]
            ],
            [
                'define',
                [Id('fact'), [Id('n')]],
                [
                    Id('if'),
                    [
                        [
                            Id('='),
                            [
                                Id('n'),
                                Num(0)
                            ]
                        ],
                        Num(1),
                        [
                            Id('*'),
                            [
                                Id('n'),
                                [
                                    Id('fact'),
                                    [
                                        [
                                            Id('-'),
                                            [
                                                Id('n'),
                                                Num(1)
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
       ];
       checkExpectMultiple(syntaxCheckDefinition, examples, expected);
    });
});

describe('syntaxCheckDefOrExpr', () => {
    it('should parse all the Exprs that syntaxCheckExpr does', () => {
        const examples = [
            Num(123),
            Id('hello'),
            Str('hello'),
            Bool(true),
            parse('(+ 2 3 (- 4 6))')[0],
            parse('(if (= n 0) 1 (* n (fact (- n 1))))')[0]
        ];
        const expected = [
            Num(123),
            Id('hello'),
            Str('hello'),
            Bool(true),
            [
                Id('+'),
                [
                    Num(2),
                    Num(3),
                    [
                        Id('-'),
                        [
                            Num(4),
                            Num(6)
                        ]
                    ]
                ]
            ],
            [
                Id('if'),
                [
                    [
                        Id('='),
                        [
                            Id('n'),
                            Num(0)
                        ]
                    ],
                    Num(1),
                    [
                        Id('*'),
                        [
                            Id('n'),
                            [
                                Id('fact'),
                                [
                                    [
                                        Id('-'),
                                        [
                                            Id('n'),
                                            Num(1)
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        checkExpectMultiple(syntaxCheckDefOrExpr, examples, expected);
    });

    it('should parse all the Definitions that syntaxCheckDefinition does', () => {
        const examples = [
            parse('(define x 10)')[0],
            parse('(define (mn x y) (if (< x y) x y))')[0],
            parse('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')[0]
        ];
        const expected = [
            ['define', Id('x'), Num(10)],
            [
                'define',
                [Id('mn'), [Id('x'), Id('y')]],
                [
                    Id('if'),
                    [
                        [
                            Id('<'),
                            [
                                Id('x'),
                                Id('y')
                            ]
                        ],
                        Id('x'),
                        Id('y')
                    ]
                ]
            ],
            [
                'define',
                [Id('fact'), [Id('n')]],
                [
                    Id('if'),
                    [
                        [
                            Id('='),
                            [
                                Id('n'),
                                Num(0)
                            ]
                        ],
                        Num(1),
                        [
                            Id('*'),
                            [
                                Id('n'),
                                [
                                    Id('fact'),
                                    [
                                        [
                                            Id('-'),
                                            [
                                                Id('n'),
                                                Num(1)
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        checkExpectMultiple(syntaxCheckDefOrExpr, examples, expected);
    });
});