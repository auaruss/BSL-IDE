const { tokenize, parse, parseSexp, parseSexps} = require('../logic/parse.js');
const { expect } = require('chai');

function Tok(t, v) { return { type: t, value: v} ; }

const [ CP, OP, SPACE, OSP, CSP, OBP, CBP ] =
      [ Tok('CloseParen', ')'),
        Tok('OpenParen', '('), 
        Tok('Whitespace', ' '),
        Tok('OpenSquareParen', '['),
        Tok('CloseSquareParen', ']'),
        Tok('OpenBraceParen', '{'),
        Tok('CloseBraceParen', '}'),
      ];

function Num(v) { return Tok('Number', v.toString()); }
function Id(v) { return Tok('Identifier', v); }
function String(v) { return Tok('String', '"' + v + '"'); }
function ResultSuccess(t, r) { return {thing: t, remain: r} }
function ResultFailure(e, r) { return {error: e, remain: r} }


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
            OP, OSP, OSP, OSP, CSP, OSP, CSP, OSP, CSP, OSP, CSP, OSP,
            CSP, OSP, CSP, CP, CP, CP, OSP, CSP, OSP, CSP, CP, CP, CP,
            CP, OBP, CBP, OBP, CBP, OBP, CBP,
        ];

        checkExpect(result, expected);
    });

    it('should tokenize a simple variable definition', () => {  
        const result = tokenize('(define x 10)');
        const expected = [ OP, Id('define'), SPACE, Id('x'), SPACE, Num(10), CP ];
        checkExpect(result, expected);
    });

    it('should tokenize 123 as an number here', () => {
        const result = tokenize('(123)');
        const expected = [ OP, Num(123), CP ];
        checkExpect(result, expected);
    });

    it('should tokenize booleans correctly', () => {
        const result = ['#t', '#f', '#true', '#false'];
        const expected = [
            [Tok('Boolean', '#t')],
            [Tok('Boolean', '#f')],
            [Tok('Boolean', '#true')],
            [Tok('Boolean', '#false')]
        ];
        checkExpectMultiple(
            tokenize, result, expected
        );
        function invalidBoolean() { tokenize('#t123'); }
        expect(invalidBoolean).to.throw(Error);
    });

    it('should tokenize factorial correctly', () => {
        let result = tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')
        let expected = [
            OP,
            Id('define'),
            SPACE,
            OP,
            Id('fact'),
            SPACE,
            Id('n'),
            CP,
            SPACE,
            OP,
            Id('if'),
            SPACE,
            OP,
            Id('='),
            SPACE,
            Id('n'),
            SPACE,
            Num(0),
            CP,
            SPACE,
            Num(1),
            SPACE,
            OP,
            Id('*'),
            SPACE,
            Id('n'),
            SPACE,
            OP,
            Id('fact'),
            SPACE,
            OP,
            Id('-'),
            SPACE,
            Id('n'),
            SPACE,
            Num(1),
            CP,
            CP,
            CP,
            CP,
            CP,
        ];
        checkExpect(result, expected);
    });

    // it('should tokenize strings correctly', () => {
    //     const result = [
    //         '"abc" def "ghi"',
    //         '"abc"def"ghi"'
    //     ];
    //     const expected = [
    //         [String('abc'), SPACE, Id('def'), SPACE, String('ghi')],
    //         [String('abc'), Id('def'), String('ghi')]
    //     ];

    //     checkExpectMultiple(tokenize, result, expected);
    // });
});

describe('parseSexp', () => {
    it('', () => {
        const result = [
            tokenize(') (hello)'),
            tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))'),
            tokenize('define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))'),
            tokenize('(fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))')
        ];
        const expected = [
            ResultFailure('Found an unmatched closing parenthesis', tokenize(') (hello)')),
            ResultSuccess(
                [
                    Id('define'),
                    [ 
                        Id('fact'),
                        Id('n'),
                    ],
                    [
                        Id('if'),
                        [ 
                            Id('='),
                            Id('n'), 
                            Num(0),
                        ],
                        Num(1),
                        [
                            Id('*'),
                            Id('n'),
                            [
                                Id('fact'),
                                [
                                    Id('-'),
                                    Id('n'),
                                    Num(1)
                                ]
                            ]
                        ] 
                    ]
                ],
                []
            ),
            ResultSuccess(
                Id('define'),
                tokenize('(fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))').filter(x => x.type !== SPACE)
            ),
            ResultSuccess(
                [
                    Id('fact'),
                    Id('n')
                ],
                tokenize('(if (= n 0) 1 (* n (fact (- 1 n)))))')
            )
        ];
        checkExpectMultiple(parseSexp, result, expected);
    })
});

describe('parseSexps', () => {
    it('', () => {
        const result = [
            tokenize('define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))'),
            tokenize('(fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))')
        ];
        const expected = [
            ResultSuccess(
                [
                    Id('define'),
                    [
                        Id('fact'),
                        Id('n')
                    ],
                    [
                        Id('if'),
                        [
                            Id('='),
                            Id('n'),
                            Num('0'),
                        ],
                        Num(1),
                        [
                            Id('*'),
                            Id('n'),
                            [
                                Id('fact'),
                                [
                                    Id('-'),
                                    Num('1'),
                                    Id('n')
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
                        Id('fact'),
                        Id('n')
                    ],
                    [
                        Id('if'),
                        [
                            Id('='),
                            Id('n'),
                            Num('0'),
                        ],
                        Num(1),
                        [
                            Id('*'),
                            Id('n'),
                            [
                                Id('fact'),
                                [
                                    Id('-'),
                                    Num('1'),
                                    Id('n')
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
    it('', () => {
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
            tokenize(''),
            tokenize('('),
            tokenize('['),
            tokenize('{'),
            tokenize(')'),
            tokenize(']'),
            tokenize('}'),
            tokenize('123'),
            tokenize('"hello"'),
            tokenize('x'),
            tokenize('#true'),
            [Id('define'), Id('x'), Num('10')]
        ];
        checkExpectMultiple(parse, result, expected);
    });

    // it('should parse this fact function', () => {
    //     const result = parse('(define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))');
    //     const expected = (
    //         [
    //             Id('define'),
    //             [ 
    //                 Id('fact'),
    //                 Id('n'),
    //             ],
    //             [
    //                 Id('if'),
    //                 [ 
    //                     Id('='),
    //                     Id('n'),
    //                     Num(0),
    //                 ],
    //                 Num(1),
    //                 [
    //                     Id('*'),
    //                     Id('n'),
    //                     [
    //                         Id('fact'),
    //                         [
    //                             Id('-'),
    //                             Id('n'),
    //                             Num(1)
    //                         ]
    //                     ]
    //                 ] 
    //             ]
    //         ]
    //     );
    //     checkExpect(result, expected);
    // });
});

// parseSExp(tokenize(“(  define x 10) blah )”))
// parseSExp(tokenize(“(  define x 10\n) blah )”))
// parseSExp(tokenize(“(  define x 10 ; hello \n) blah )”))
// parseSExp(tokenize(“\n\n(  define x 10) blah )”))
// parseSExp(filterOutWhitespace(tokenize(“\n\n(  define x 10) blah )”)))


// tokenize('(define x 10)')
// [
//   { type: 'op', value: '(' },
//   { type: 'id', value: 'define' },
//   { type: 'id', value: 'x' },
//   { type: 'num', value: '10' },
//   { type: 'op', value: ')' }
// ]
// > tokenize('(define x "define")')
// [
//   { type: 'op', value: '(' },
//   { type: 'id', value: 'define' },
//   { type: 'id', value: 'x' },
//   { type: 'id', value: '"define"' },
//   { type: 'op', value: ')' }
// ]

// parseSExp(tokenize(“(  define x 10) blah )”))

// [
//   { type: 'op', value: '(' },
//   { type: 'id', value: 'define' },
//   { type: 'num', value: '0' },
//   { type: 'id', value: '+' },
//   { type: 'id', value: '"define"' },
//   { type: 'op', value: ')' }
// ]

// parseSExp : list of tokens -> Result

// > tokenize('(define x 1);hello')
// [
//   { type: 'op', value: '(' },
//   { type: 'id', value: 'define' },
//   { type: 'id', value: 'x' },
//   { type: 'num', value: '1' },
//   { type: 'op', value: ')' },
//   { type: 'id', value: ';hello' }
// ]


// tokenize
// parseSExps
// parseSexp
