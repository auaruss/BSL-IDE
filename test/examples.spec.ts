'use strict';

import {
  DefOrExpr, ReadError, TokenType, TokenError, Token, SExp, Value
} from '../src/logic/types';

import { tokenize } from '../src/logic/tokenize';
import { read, readTokens } from '../src/logic/read';
// import { parse, valOf } from '../src/logic/eval';
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
        let s = readTokens(tokens); // Change this to something like readTokens
      if (sexps) {
        it('should read correctly', () => {
          checkExpect(s, sexps);
        });
      } else {
        sexps = s;
      }
    }

  //   if (sexps) {
  //     let d = parse(sexps);
  //     if (deforexprs) {
  //       it('should parse correctly', () => {
  //         checkExpect(d, deforexprs);
  //       });
  //     } else {
  //       deforexprs = d;
  //     }
  //   }

  //   if (deforexprs) {
  //     let doe = valOf(deforexprs);
  //     if (values) {
  //       it('should evaluate correctly', () => {
  //         checkExpect(doe, values);
  //       });
  //     } else {
  //       values = doe;
  //     }
  //   }

  //   if (values) {
  //     let o = printOut(values);
  //     if (output) {
  //       it('should output correctly', () => {
  //         checkExpect(o, output);
  //       });
  //     }
  //   }

  });
}

/*****************************************************************************
 *                        Test cases for correctness.                        *
 *                                                                           *
 * These test cases are intended to test the basic behavior of a BSL program *
 * regardless of live editing behavior.                                      *
 *****************************************************************************/

t('', [], []);
t('123', [ NumTok('123') ], [ NumAtom(123) ] );
t('"hello"', [ StringTok('hello') ], [ StringAtom('hello') ]);
t('#true', [ BooleanTok('#true') ], [ BooleanAtom('#true') ]);

t('(', [ OP ], [ ReadErr('No Closing Paren', [ OP ]) ]);
t('[', [ OSP ], [ ReadErr('No Closing Paren', [ OSP ]) ]);
t('{', [ OBP ], [ ReadErr('No Closing Paren', [ OBP ]) ]);
t(')', [ CP ], [ ReadErr('No Open Paren', [ CP ]) ]);
t(']', [ CSP ], [ ReadErr('No Open Paren', [ CSP ]) ]);
t('}', [ CBP ], [ ReadErr('No Open Paren', [ CBP ]) ]);

t('#t', [ BooleanTok('#t') ], [ BooleanAtom('#t') ]);
t('#f', [ BooleanTok('#f') ], [ BooleanAtom('#f') ]);
t('#true', [ BooleanTok('#true') ], [ BooleanAtom('#true') ]);
t('#false', [ BooleanTok('#false') ], [ BooleanAtom('#false') ]);

t('x', [ IdTok('x') ], [ IdAtom('x') ]);
t('+', [ IdTok('+') ], [ IdAtom('+') ]);

t('"abc" def "ghi"',
  
  [
    StringTok('abc'),
    SPACE,
    IdTok('def'),
    SPACE,
    StringTok('ghi')
  ],
  
  [
    StringAtom('abc'),
    IdAtom('def'),
    StringAtom('ghi')
  ]
);

t('"abc"def"ghi"',
  
  [
    StringTok('abc'),
    IdTok('def'),
    StringTok('ghi')
  ],

  [
    StringAtom('abc'),
    IdAtom('def'),
    StringAtom('ghi')
  ]
);

t('#t123',
  [
    TokErr('#'),
    IdTok('t123')
  ],

  [
    TokErr('#'),
    IdAtom('t123')
  ]
);

t(
  '(define x 10)',
  [ OP, IdTok('define'), SPACE, IdTok('x'), SPACE, NumTok('10'), CP ],
  [ 
    [ IdAtom('define'), IdAtom('x'), NumAtom(10) ]
  ]
);

t('(123)',
  
  [
    OP,
    NumTok('123'),
    CP
  ],

  [
    [ NumAtom(123) ]
  ]
);

t('([[[][][][][][])))[][])))){}{}{}',
  
  [
    OP,
    OSP,
    OSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    OSP,
    CSP,
    CP,
    CP,
    CP,
    OSP,
    CSP,
    OSP,
    CSP,
    CP,
    CP,
    CP,
    CP,
    OBP,
    CBP,
    OBP,
    CBP,
    OBP,
    CBP
  ],

  [
    [
      ReadErr('No Closing Paren', [ OSP ]),
      ReadErr('No Closing Paren', [ OSP ]),
      [],[],[],[],[],[]
    ],
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    [],[],
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    [],
    []
  ]
);

t(') (hello)',
  
  [
    CP,
    SPACE,
    OP,
    IdTok('hello'),
    CP
  ],

  [
    ReadErr('No Open Paren', [ CP ]),
    [
      IdAtom('hello')
    ]
  ],
);

t('(define bool #t123)',
  
  [
    OP,
    IdTok('define'),
    SPACE,
    IdTok('bool'),
    SPACE,
    TokErr('#'),
    IdTok('t123'),
    CP
  ],

  [
    [
      IdAtom('define'),
      IdAtom('bool'),
      TokErr('#'),
      IdAtom('t123')
    ]
  ]
);

t('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',
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
  ],

  [
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
          NumAtom(0)
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
  ]
);

t('define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',

  [
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
  ],

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
        NumAtom(0)
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
    ReadErr('No Open Paren', [ CP ])
  ]
);

t('(fact n) (if (= n 0) 1 (* n (fact (- n 1)))))',
  [
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
  ],

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
        NumAtom(0)
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
    ReadErr('No Open Paren', [ CP ])
  ]
);

t('(define (simple-choice x y z) (if x y z))\n'
+ '(simple-choice #t 10 20)\n'
+ '\n'
+ '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
+ '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n',

  tokenize('(define (simple-choice x y z) (if x y z))')
  .concat([ NL ])
  .concat(tokenize('(simple-choice #t 10 20)'))
  .concat([ Tok(TokenType.Whitespace, '\n\n') ])
  .concat(tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
  .concat([ NL ])
  .concat(tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
  .concat([ NL ]),

  [
    [
      IdAtom('define'),
      [
        IdAtom('simple-choice'),
        IdAtom('x'),
        IdAtom('y'),
        IdAtom('z')
      ],
      [
        IdAtom('if'),
        IdAtom('x'),
        IdAtom('y'),
        IdAtom('z')
      ]
    ],

    [
        IdAtom('simple-choice'),
        BooleanAtom('#t'),
        NumAtom(10),
        NumAtom(20)
    ],

    [
      IdAtom('define'),
      [
        IdAtom('*'),
        IdAtom('m'),
        IdAtom('n')
      ],
      [
        IdAtom('if'),
        [
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ],
        NumAtom(0),
        [
          IdAtom('+'),
          IdAtom('m'),
          [
            IdAtom('*'),
            IdAtom('m'),
            [
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            ]
          ]
        ]
      ]
    ],

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
          NumAtom(0)
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
  ]
);

t(
  '(define (mn x y) (if (< x y) x y))',
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
  ],

  [
    [
      IdAtom('define'),
      [
        IdAtom('mn'),
        IdAtom('x'),
        IdAtom('y')
      ],
      [
        IdAtom('if'),
        [
          IdAtom('<'),
          IdAtom('x'),
          IdAtom('y')
        ],
        IdAtom('x'),
        IdAtom('y')
      ]
    ]
  ]
);




t('(simple-choice #t 10 20)',

  [
    OP,
    IdTok('simple-choice'),
    SPACE,
    BooleanTok('#t'),
    SPACE,
    NumTok('10'),
    SPACE,
    NumTok('20'),
    CP
  ],

  [
    [ 
      IdAtom('simple-choice'),
      BooleanAtom('#t'),
      NumAtom(10),
      NumAtom(20)
    ]
  ]
);

t('(* 2 3)',
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
    [
      IdAtom('*'),
      NumAtom(2),
      NumAtom(3)
    ]
  ]
);

t('(fact 5)',
  
  [
    OP,
    IdTok('fact'),
    SPACE,
    NumTok('5'),
    CP
  ],

  [
    [
      IdAtom('fact'),
      NumAtom(5)
    ]
  ]
);

t('(f 10)',
  
  [
    OP,
    IdTok('f'),
    SPACE,
    NumTok('10'),
    CP
  ],

  [
    [
      IdAtom('f'),
      NumAtom(10)
    ]
  ]
);

t('(define x 100)'
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
  + 'x\n'
  + 'testNum\n'
  + 'testBool\n'
  + 'testStr\n'
  + '(* 2 3)'
  + '(/ 2 2)'
  + '(- 3 2)'
  + '(+ 2)'
  + '(- 2)'
  + '(* 2)'
  + '(/ 2)',

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
    .concat(tokenize('x\n'))
    .concat(tokenize('testNum\n'))
    .concat(tokenize('testBool\n'))
    .concat(tokenize('testStr\n'))
    .concat(tokenize('(* 2 3)'))
    .concat(tokenize('(/ 2 2)'))
    .concat(tokenize('(- 3 2)'))
    .concat(tokenize('(+ 2)'))
    .concat(tokenize('(- 2)'))
    .concat(tokenize('(* 2)'))
    .concat(tokenize('(/ 2)')),

  read('(define x 100)')
    .concat(read('(define testNum 10)'))
    .concat(read('(define testBool #true)'))
    .concat(read('(define testStr "Hello")'))
    .concat(read('(define (simple-choice x y z) (if x y z))'))
    .concat(read('(simple-choice #t 10 20)'))
    .concat(read('(define (mul m n) (if (= n 0) 0 (+ m (mul m (- n 1)))))'))
    .concat(read('(mul 2 3)'))
    .concat(read('(define (fact n) (if (= n 0) 1 (mul n (fact (- n 1)))))'))
    .concat(read('(fact 5)'))
    .concat(read('(define (f x) (g (+ x 1)))'))
    .concat(read('(define (g y) (mul x y))'))
    .concat(read('x'))
    .concat(read('testNum'))
    .concat(read('testBool'))
    .concat(read('testStr'))
    .concat(read('(* 2 3)'))
    .concat(read('(/ 2 2)'))
    .concat(read('(- 3 2)'))
    .concat(read('(+ 2)'))
    .concat(read('(- 2)'))
    .concat(read('(* 2)'))
    .concat(read('(/ 2)'))
);

t('(define (fib n) (if (or (= n 0) (= n 1)) n (+ (fib (- n 1)) (fib (- n 2)))))',
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
    SPACE,
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
);

t('("hello" world (this "is" "some non" sense (which should be) #t 10 readable))',
  
  [
    OP,
    StringTok('hello'),
    SPACE,
    IdTok('world'),
    SPACE,
    OP,
    IdTok('this'),
    SPACE,
    StringTok('is'),
    SPACE,
    StringTok('some non'),
    SPACE,
    IdTok('sense'),
    SPACE,
    OP,
    IdTok('which'),
    SPACE,
    IdTok('should'),
    SPACE,
    IdTok('be'),
    CP,
    SPACE,
    BooleanTok('#t'),
    SPACE,
    NumTok('10'),
    SPACE,
    IdTok('readable'),
    CP,
    CP
  ],

  [
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
  ]
);

// t('(define background-image (empty-scene 100 100))\n' +
// '(define\n' +
// 'background-image\n' +
// '(define (f x) (+ 1 x))\n',
// );