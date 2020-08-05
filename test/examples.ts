'use strict';

import {
  TokenType, TokenError, Token, SExp,
  ReadError
} from '../src/logic/types';

const Tok = (t: TokenType, v: string): Token => {
  return { type: t, token: v};
}

const Atom = (t: 'String'|'Num'|'Id'|'Bool',
              v: string|number|boolean): SExp => {
  if ((t === 'String' || t === 'Id') && (typeof v === 'string')) {
    return { type:  t, sexp: v };
  } else if (t === 'Num' && (typeof v === 'number')) {
    return { type:  t, sexp: v };
  } else if (t === 'Bool' && (typeof v === 'boolean')) {
    return { type:  t, sexp: v };
  }
  throw new Error('Mismatch in atom type/value');
}

const NumTok     = (v: string): Token => { return Tok(TokenType.Number,       v.toString()); }
const IdTok      = (v: string): Token => { return Tok(TokenType.Identifier,   v);            }
const StringTok  = (v: string): Token => { return Tok(TokenType.String, '"' + v + '"');      }
const BooleanTok = (v: string): Token => { return Tok(TokenType.Boolean,      v);            }

const NumAtom     = (v: number): SExp => { return Atom('Num',            v);  }
const IdAtom      = (v: string): SExp => { return Atom('Id',             v);  }
const StringAtom  = (v: string): SExp => { return Atom('String',         v);  }
const BooleanAtom = (v: string): SExp => { return Atom('Bool', whichBool(v)); }

const TokErr = (v: string): TokenError => { 
  return { tokenError: 'Unidentified Token', string: v };
}
const ReadErr = (
  e: 'No Valid SExp'
  | 'No Closing Paren'
  | 'No Open Paren'
  | 'Mismatched Parens',
  v: Token[]): ReadError => { 
  return { readError: e, tokens: v }; 
}

const [ CP, OP, SPACE, OSP, CSP, OBP, CBP, NL ]: Token[] =
    [
        Tok(TokenType.CloseParen,       ')'),
        Tok(TokenType.OpenParen,        '('), 
        Tok(TokenType.Whitespace,       ' '),
        Tok(TokenType.OpenSquareParen,  '['),
        Tok(TokenType.CloseSquareParen, ']'),
        Tok(TokenType.OpenBraceParen,   '{'),
        Tok(TokenType.CloseBraceParen,  '}'),
        Tok(TokenType.Whitespace,       '\n')
    ];

/**
 * Converts a boolean token into a Boolean SExp.
 * @param t token
 */
const whichBool = (s: string): boolean => {
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
}
/**
 * These test cases are cases which should succeed through
 * the entire pipeline.
 */
const TEST_CASE_SUCCESSES: [string[], Token[][]][] = [
  [
    ['(define x 10)'],
    [[IdTok('define'), IdTok('x'), NumTok('10')]]
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
    '',
    '123','"hello"','#true',
  ],

  [
    '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'
  ],

  ['"abc" def "ghi"', '"abc"def"ghi"'],

  [
    '(define (simple-choice x y z) (if x y z))\n'
  + '(simple-choice #t 10 20)\n'
  + '\n'
  + '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
  + '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n'
  ],

  ['(define (mn x y) (if (< x y) x y))'],

  [
    '(simple-choice #t 10 20)',
    '(* 2 3)',
    '(fact 5)',
    '(f 10)'
  ],

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

  ['(define (fib n) (if (or (= n 0) (= n 1)) n (+ (fib (- n 1)) (fib (- n 2)))))'],
];

/**
 * These are test cases which should have an error at some point in the pipeline.
 */
const TEST_CASE_ERRORS: string[][] = [
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
]

