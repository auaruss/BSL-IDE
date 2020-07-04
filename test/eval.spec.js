const { parse } = require('../logic/parse.js');
const { syntaxCheckExpr, syntaxCheckDefinition, syntaxCheckDefOrExpr,
        valOf } = require('../logic/eval.js');
const { expect } = require('chai');

function Atom(t, v) { return { type: t, value: v}; }

function Num(v) { return Atom('Number', v); }
function Id(v) { return Atom('Identifier', v); }
function Str(v) { return Atom('String', v); }
function Bool(v) { return Atom('Boolean', v); }

function Value(t, v) { return { type: t, value: v}; }

function NFn(v) { return Value('NonFunction', v); }
function BFn(v) { return Value('BuiltinFunction', v); }

function Fn(args, env, exp) {
    return {
        type: 'Function',
        args: args,
        env: env,
        body: exp
    };
}

function testEnv() {
    const simpleEnv = new Map();
    simpleEnv.set('hello', NFn(10));
    simpleEnv.set('fact', Fn(['n'], [], factExpr));
}


const checkExpect = (res, expected) => {
    expect(res).to.deep.equal(expected);
}

function checkExpectMultiple(f, res, expected) {
    res.map((input, idx) => checkExpect(f(input), expected[idx]));
}

const factExpr = [
    'if',
    [
        [
            '=',
            [
                Id('n'),
                Num(0)
            ]
        ],
        Num(1),
        [
            '*',
            [
                Id('n'),
                [
                    'fact',
                    [
                        [
                            '-',
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
];

const exampleExprs = [
    Num(123),
    Id('hello'),
    Str('hello'),
    Bool(true),
    parse('(+ 2 3 (- 4 6))')[0],
    parse('(if (= n 0) 1 (* n (fact (- n 1))))')[0]
];
const expectedExprs = [
    Num(123),
    Id('hello'),
    Str('hello'),
    Bool(true),
    [
        '+',
        [
            Num(2),
            Num(3),
            [
                '-',
                [
                    Num(4),
                    Num(6)
                ]
            ]
        ]
    ],
    factExpr
];

const exampleExprsValOf = [
    Num(123),
    Str('hello'),
    Bool(true),
    expectedExprs[4]
];

describe('syntaxCheckExpr', () => {
    it ('should syntax check expressions', () => {
        checkExpectMultiple(syntaxCheckExpr, exampleExprs, expectedExprs);
    });
});

const exampleDefns = [
    parse('(define x 10)')[0],
    parse('(define (mn x y) (if (< x y) x y))')[0],
    parse('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')[0]
];
const expectedDefns = [
    ['define', 'x', Num(10)],
    [
        'define',
        ['mn', ['x', 'y']],
        [
            'if',
            [
                [
                    '<',
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
        ['fact', ['n']],
        [
            'if',
            [
                [
                    '=',
                    [
                        Id('n'),
                        Num(0)
                    ]
                ],
                Num(1),
                [
                    '*',
                    [
                        Id('n'),
                        [
                            'fact',
                            [
                                [
                                    '-',
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
describe('syntaxCheckDefinition', () => {
    it('should syntax check definitions', () => {
       checkExpectMultiple(syntaxCheckDefinition, exampleDefns, expectedDefns);
    });
});

describe('syntaxCheckDefOrExpr', () => {
    it('should parse all the Exprs that syntaxCheckExpr does', () => {
        checkExpectMultiple(syntaxCheckDefOrExpr, exampleExprs, expectedExprs);
    });
    it('should parse all the Definitions that syntaxCheckDefinition does', () => {
        checkExpectMultiple(syntaxCheckDefOrExpr, exampleDefns, expectedDefns);
    });
});

describe('valOf', () => {
    it('should evaluate these with the empty env', () =>{
        const emptyEnv = new Map();
        const exampleExprsValOf = [
            Num(123),
            Str('hello'),
            Bool(true),
            ['if', [Bool(true), Num(10), exampleExprs[4]]]
        ]
        const expectedValues = [
            NFn(123),
            NFn('hello'),
            NFn(true),
            NFn(10)
        ];
        checkExpectMultiple(x => valOf(x, emptyEnv), exampleExprsValOf, expectedValues);
    });

    it('should evaluate these with this env', () => {
        const env = testEnv();
        const examples = [
            
        ];
        
        const expected = [
        ];
        checkExpectMultiple(x => valOf(x, env), examples, expected);
    });
});