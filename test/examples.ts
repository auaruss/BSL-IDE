'use strict';

import {
  DefOrExpr, ReadError, TokenType, TokenError, Token, SExp,
} from '../src/logic/types';

import { tokenize } from '../src/logic/tokenize';
import { read } from '../src/logic/read';
import { parse, valOf } from '../src/logic/eval';
import { checkExpect } from './check-expect';

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

const t = (
  input?: string,
  tokens?: Token[],
  sexps?: SExp[],
  deforexprs?: DefOrExpr[],
  values?: Value[],
  output?: string
) => {
  describe(input, () => {
   
    if (input) {
      let ts = tokenize(input);
      if (tokens) {
        it('should tokenize correctly', () => {
          checkExpect(ts, tokens);
        });
      } else {
        tokens = ts;
      }
    }

    if (tokens) {
      let s = read(tokens); // Change this to something like readTokens
      if (sexps) {
        it('should read correctly', () => {
          checkExpect(s, sexps);
        });
      } else {
        sexps = screen;
      }
    }

    if (sexps) {
      let d = parse(sexps);
      if (deforexprs) {
        it('should parse correctly', () => {
          checkExpect(d, deforexprs);
        });
      } else {
        deforexprs = d;
      }
    }

    if (deforexprs) {
      let doe = valOf(deforexprs);
      if (values) {
        it('should evaluate correctly', () => {
          checkExpect(doe, values);
        });
      } else {
        values = doe;
      }
    }

    if (values) {
      let o = printOut(values);
      if (output) {
        it('should output correctly', () => {
          checkExpect(o, output);
        });
      }
    }

  });
};


/**
 * These test cases are cases which should succeed through
 * the entire pipeline.
 */
const TEST_CASE_SUCCESSES: [string[], Token[][]][] = [
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
    ['','123','"hello"','#true'],
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
    tokenize('(define (simple-choice x y z) (if x y z))')
    .concat([NL])
    .concat(tokenize('(simple-choice #t 10 20)'))
    .concat([Tok(TokenType.Whitespace, '\n\n')])
    .concat(tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
    .concat([NL])
    .concat(tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
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
      tokenize('(define x 100)')
        .concat(tokenize('(define testNum 10)'))
        .concat(tokenize('(define testBool #true)'))
        .concat(tokenize('(define testStr "Hello")'))
        .concat(tokenize('(define (simple-choice x y z) (if x y z))'))
        .concat(tokenize('(simple-choice #t 10 20)'))
        .concat(tokenize('\n'))
        .concat(tokenize('(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'))
        .concat(tokenize('(mul 2 3)'))
        .concat(tokenize('\n\n'))
        .concat(tokenize('(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'))
        .concat(tokenize('(fact 5)'))
        .concat(tokenize('(define (f x) (g (+ x 1)))'))
        .concat(tokenize('(define (g y) (mul x y))'))
        .concat(tokenize('\n'))
        .concat(tokenize('x'))
        .concat(tokenize('testNum'))
        .concat(tokenize('testBool'))
        .concat(tokenize('testStr'))
        .concat(tokenize('(* 2 3)'))
        .concat(tokenize('(/ 2 2)'))
        .concat(tokenize('(- 3 2)'))
        .concat(tokenize('(+ 2)'))
        .concat(tokenize('(- 2)'))
        .concat(tokenize('(* 2)'))
        .concat(tokenize('(/ 2)'))
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
]