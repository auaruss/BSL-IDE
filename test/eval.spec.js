const { parse } = require('../logic/parse.js');
const { syntaxCheckExpr } = require('../logic/eval.js');
const { expect } = require('chai');

function Atom(t, v) { return { type: t, value: v}; }

function NumAtom(v) { return Atom('Number', v); }
function IdAtom(v) { return Atom('Identifier', v); }
function StringAtom(v) { return Atom('String', '"' + v + '"'); }
function BooleanAtom(v) { return Atom('Boolean', v); }

const checkExpect = (res, expected) => {
    expect(res).to.deep.equal(expected);
}

function checkExpectMultiple(f, res, expected) {
    res.map((input, idx) => checkExpect(f(input), expected[idx]));
}

describe('syntaxCheckExpr', () => {
    it('should syntax check single atoms.', () => {
        const result = [
            NumAtom(123),
            IdAtom('hello'),
            StringAtom('hello'),
            BooleanAtom(true)
        ];
        const expected = [
            NumAtom(123),
            IdAtom('hello'),
            StringAtom('hello'),
            BooleanAtom(true)
        ];
        checkExpectMultiple(syntaxCheckExpr, result, expected);
    });

    it ('should syntax check and transform larger expressions', () => {
        const result = [
            parse('(+ 2 3 (- 4 6))')[0],
            parse('(if (= n 0) 1 (* n (fact (- n 1))))')[0]
        ];
        const expected = [
            [
                IdAtom('+'),
                [
                    NumAtom(2),
                    NumAtom(3),
                    [
                        IdAtom('-'),
                        [
                            NumAtom(4),
                            NumAtom(6)
                        ]
                    ]
                ]
            ],
            [
                IdAtom('if'),
                [
                    [
                        IdAtom('='),
                        [
                            IdAtom('n'),
                            NumAtom(0)
                        ]
                    ],
                    NumAtom(1),
                    [
                        IdAtom('*'),
                        [
                            IdAtom('n'),
                            [
                                IdAtom('fact'),
                                [
                                    [
                                        IdAtom('-'),
                                        [
                                            IdAtom('n'),
                                            NumAtom(1)
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];
        checkExpectMultiple(syntaxCheckExpr, result, expected);
    });
});