const { tokenize, parse } = require('../logic/parse.js');
const { expect } = require('chai');

function Tok(t, v) { return { type: t, value: v} ; }

const [ CP, OP, SPACE, OSP, CSP, OBP, CBP ] =
      [ { type: 'CloseParen', value: ')'},
        { type: 'OpenParen', value: '('}, 
        { type: 'Whitespace', value: ' '},
        Tok('OpenSquareParen', '['),
        Tok('CloseSquareParen', ']'),
        Tok('OpenBraceParen', '{'),
        Tok('CloseBraceParen', '}'),
      ];

function Num(v) { return Tok('Number', v.toString()); }
function Id(v) { return Tok('Identifier', v); }
function String(v) { return Tok('String', '"' + v + '"'); }

const checkExpect = (res, expected) => {
    expect(res).to.deep.equal(expected);
}

const checkExpectMultiple = (f, res, expected) => {
    for (let tuple of res.map((x, y) => [x, expected[y]])) {
        checkExpect(f(tuple[0]), tuple[1]);
    }
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
    it('should return the empty list for an empty string', () => {  
        const result = tokenize('');
        checkExpect(result, []);
    });

    it('should tokenize a bunch of parenthesis correctly', () => {
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
        function result() { tokenize('#t123'); }
        expect(tokenize("#t")).to.deep.equal([Tok('Boolean', '#t')]);
        expect(tokenize("#f")).to.deep.equal([Tok('Boolean', '#f')]);
        expect(tokenize("#true")).to.deep.equal([Tok('Boolean', '#true')]);
        expect(tokenize("#false")).to.deep.equal([Tok('Boolean', '#false')]);
        expect(result).to.throw(Error);
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

    it('should tokenize strings correctly', () => {
        const result = [
            '"abc" def "ghi"',
            '"abc"def"ghi"'
        ];
        const expected = [
            [String('abc'), SPACE, Id('def'), SPACE, String('ghi')],
            [String('abc'), Id('def'), String('ghi')]
        ];

        checkExpectMultiple(tokenize, result, expected);
    });
});

describe('parseSexp', () => {
    it('fails on these cases', () => {
        const result = [
            ') (hello)',
            '(define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))',
        ];
        const expected = [
            ResultFailure(TooManyParens, ') (hello)'),
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
            )
        ];
        checkExpectMultiple(parseSexp, result, expected);
    })
});

describe('parseSexps', () => {

});

describe('parse', () => {
    it('should parse this fact function', () => {
        const result = parse('(define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))');
        const expected = (
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
            ]
        );
        checkExpect(result, expected);
    });
});

// tokenizer should never lose characters
// parser has to deal with whitespace tokens


// parseSexp: [Tokens] -> Result??

// // A Result is one of:
// // - {sexp: SExp, remain: [Token]}
// // - {error: String, remain: [Token]}

// // An SExp is one of:
// // - String
// // - Number
// // -
// // - [SExp]

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