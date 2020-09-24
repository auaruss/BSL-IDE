'use strict';

import {
  DefOrExpr, Definition, Expr, ReadError,
  TokenType, TokenError, Token, SExp, ExprResult, Result
} from '../src/logic/types';

import { tokenize                     } from '../src/logic/evaluator/tokenize';
import { read,     readTokens         } from '../src/logic/evaluator/read';
import { parse,    parseSexps         } from '../src/logic/evaluator/parse';
import { evaluate, evaluateDefOrExprs } from '../src/logic/evaluator/eval';
import { print,    printValues        } from '../src/logic/evaluator/print';

import {
  Tok,
  NumTok, NumAtom, NumExpr, NFn,
  StringTok, StringAtom, StringExpr,
  IdTok, IdAtom, IdExpr,
  BooleanTok, BooleanAtom, BooleanExpr,
  TokErr, ReadErr, DefnErr, ExprErr, ValErr,
  CP, OP, SPACE, OSP, CSP, OBP, CBP, NL,
  SExps, VarDefn, FnDefn, Call
} from '../src/logic/constructors';

import { checkExpect } from './check-expect';

import { assert } from 'chai';

const t = (
  input?: string,
  tokens?: Token[],
  sexps?: SExp[],
  deforexprs?: DefOrExpr[],
  values?: Result[],
  output?: string
) => {
  describe(input, () => {
   
    if (input) {
      try {
        let ts = tokenize(input);
        if (tokens) {
          it('should tokenize correctly', () => {
            checkExpect(ts, tokens);
          });
        } else {
          tokens = ts;
        }
      } catch (e) {
        it('Threw this error on the tokenizer: ' + e, () => {
          assert.fail();
        })
      }
    }

    if (tokens) {
      let s: any;
      try {
        s = readTokens(tokens);
        if (sexps) {
          it('should read correctly', () => {
            checkExpect(s, sexps);
          });
        } else {
          sexps = s;
        }
      } catch (e) {
        it('Threw this error on the reader: ' + e, () => {
          assert.fail();
        });
      }
    }

    if (sexps) {
      try {
        let d = parseSexps(sexps);
        if (deforexprs) {
          it('should parse correctly', () => {
            checkExpect(d, deforexprs);
          });
        } else {
          deforexprs = d;
        }
      } catch (e) {
        it('Threw this error on the parser: ' + e, () => {
          assert.fail();
        });
      }
    }

    if (deforexprs) {
      try {
        let doe = evaluateDefOrExprs(deforexprs);
        if (values) {
          it('should evaluate correctly', () => {
            checkExpect(doe, values);
          });
        } else {
          values = doe;
        }
      } catch (e) {
        it('Threw this error on the evaluator: ' + e, () => {
          assert.fail();
        });
      }
    }

    if (values) {
      try {
        let o = printValues(values);
        if (output) {
          it('should output correctly', () => {
            checkExpect(o, output);
          });
        }
      } catch (e) {
        it('Threw this error on the reader: ' + e, () => {
          assert.fail();
        });
      }
    }

  });
}

/*****************************************************************************
 *                        Test cases for correctness.                        *
 *                                                                           *
 * These test cases are intended to test the basic behavior of a BSL program *
 * regardless of live editing behavior.                                      *
 *****************************************************************************/

t('', [], [], [], []);

t('()' /* ... */);

t('123',
  [ NumTok('123') ],
  [ NumAtom(123) ],
  [ NumExpr(123) ],
  [ NFn(123) ], 
  '123'
);

t('"hello"',
  [ StringTok('hello') ],
  [ StringAtom('hello') ],
  [ StringExpr('hello')],
  [ NFn('hello') ],
  'hello'
);

t('hello',
  [ IdTok('hello') ],
  [ IdAtom('hello') ],
  [ IdExpr('hello') ],
  [ ValErr('Id not in environment', IdExpr('hello') )],
  'hello: Id not in environment'
);

t('#true',
  [ BooleanTok('#true') ],
  [ BooleanAtom('#true') ],
  [ BooleanExpr(true) ],
  [ NFn(true)],
  '#t'
);

t('(', 
  [ OP ],
  [ ReadErr('No Closing Paren', [ OP ]) ],
  [ ReadErr('No Closing Paren', [ OP ]) ],
  [ ReadErr('No Closing Paren', [ OP ]) ],
  'ReadError: No Closing Paren for ('
);


t('[',
  [ OSP ],
  [ ReadErr('No Closing Paren', [ OSP ]) ],
  [ ReadErr('No Closing Paren', [ OSP ]) ],
  [ ReadErr('No Closing Paren', [ OSP ]) ],
  'ReadError: No Closing Paren for ['
);

t('{',
  [ OBP ],
  [ ReadErr('No Closing Paren', [ OBP ]) ],
  [ ReadErr('No Closing Paren', [ OBP ]) ],
  [ ReadErr('No Closing Paren', [ OBP ]) ],
  'ReadError: No Closing Paren for {'
);

t(')',
  [ CP ],
  [ ReadErr('No Open Paren', [ CP ]) ],
  [ ReadErr('No Open Paren', [ CP ]) ],
  [ ReadErr('No Open Paren', [ CP ]) ],
  'ReadError: No Open Paren for )'
);

t(']',
  [ CSP ],
  [ ReadErr('No Open Paren', [ CSP ]) ],
  [ ReadErr('No Open Paren', [ CSP ]) ],
  [ ReadErr('No Open Paren', [ CSP ]) ],
  'ReadError: No Open Paren for ]'
);

t('}',
  [ CBP ],
  [ ReadErr('No Open Paren', [ CBP ]) ],
  [ ReadErr('No Open Paren', [ CBP ]) ],
  [ ReadErr('No Open Paren', [ CBP ]) ],
  'ReadError: No Open Paren for }'
);

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
    SExps(IdAtom('define'), IdAtom('x'), NumAtom(10))
  ]
);

t('(123)',
  
  [
    OP,
    NumTok('123'),
    CP
  ],

  [
    SExps(NumAtom(123))
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
    SExps(
      ReadErr('No Closing Paren', [ OSP ]),
      ReadErr('No Closing Paren', [ OSP ]),
      SExps(), SExps(), SExps(), SExps(), SExps(), SExps()
    ),
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    SExps(), SExps(),
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    ReadErr('No Open Paren', [ CP ]),
    SExps(),
    SExps()
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
    SExps(IdAtom('hello'))
  ],
);

t('(define bool #t123)',
  
  [
    OP,
    IdTok('define'),
    SPACE,
    IdTok('bool'),
    SPACE,
    TokErr('#t123'),
    CP
  ],

  [
    SExps(
      IdAtom('define'),
      IdAtom('bool'),
      TokErr('#t123')
    )
  ],

  [
    DefnErr('Cannot have a definition as the body of a definition',
    [
      SExps(
        IdAtom('define'),
        IdAtom('bool'),
        TokErr('#t123')
      )
    ])
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
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('fact'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ),
        NumAtom(1),
        SExps(
          IdAtom('*'),
          IdAtom('n'),
          SExps(
            IdAtom('fact'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          )
        )
      )
    )
  ],
  
  [
    FnDefn(
      'fact',
      ['n'],
      Call(
        'if',
        [
          Call(
            '=',
            [ IdExpr('n'), NumExpr(0) ]
          ),
          NumExpr(1),
          Call(
            '*',
            [
              IdExpr('n'),
              Call(
                'fact',
                [ Call('-', [IdExpr('n'), NumExpr(1)]) ]
              )
            ]
          )
        ]
      )
    )
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
    SExps(
      IdAtom('fact'),
      IdAtom('n')
    ),
    SExps(
      IdAtom('if'),
      SExps(
        IdAtom('='),
        IdAtom('n'),
        NumAtom(0)
      ),
      NumAtom(1),
      SExps(
        IdAtom('*'),
        IdAtom('n'),
        SExps(
          IdAtom('fact'),
          SExps(
            IdAtom('-'),
            IdAtom('n'),
            NumAtom(1)
          )
        )
      )
    ),
    ReadErr('No Open Paren', [ CP ])
  ],
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
    SExps(
      IdAtom('fact'),
      IdAtom('n')
    ),
    SExps(
      IdAtom('if'),
      SExps(
        IdAtom('='),
        IdAtom('n'),
        NumAtom(0)
      ),
      NumAtom(1),
      SExps(
        IdAtom('*'),
        IdAtom('n'),
        SExps(
          IdAtom('fact'),
          SExps(
            IdAtom('-'),
            IdAtom('n'),
            NumAtom(1)
          )
        )
      )
    ),
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
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('simple-choice'),
        IdAtom('x'),
        IdAtom('y'),
        IdAtom('z')
      ),
      SExps(
        IdAtom('if'),
        IdAtom('x'),
        IdAtom('y'),
        IdAtom('z')
      )
    ),

    SExps(
        IdAtom('simple-choice'),
        BooleanAtom('#t'),
        NumAtom(10),
        NumAtom(20)
    ),

    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('*'),
        IdAtom('m'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ),
        NumAtom(0),
        SExps(
          IdAtom('+'),
          IdAtom('m'),
          SExps(
            IdAtom('*'),
            IdAtom('m'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          )
        )
      )
    ),

    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('fact'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('='),
          IdAtom('n'),
          NumAtom(0)
        ),
        NumAtom(1),
        SExps(
          IdAtom('*'),
          IdAtom('n'),
          SExps(
            IdAtom('fact'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          )
        )
      )
    )
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
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('mn'),
        IdAtom('x'),
        IdAtom('y')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('<'),
          IdAtom('x'),
          IdAtom('y')
        ),
        IdAtom('x'),
        IdAtom('y')
      )
    )
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
    SExps(
      IdAtom('simple-choice'),
      BooleanAtom('#t'),
      NumAtom(10),
      NumAtom(20)
    )
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
    SExps(
      IdAtom('*'),
      NumAtom(2),
      NumAtom(3)
    )
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
    SExps(
      IdAtom('fact'),
      NumAtom(5)
    )
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
    SExps(
      IdAtom('f'),
      NumAtom(10)
    )
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

t('(define (fib n) (if (or (= n 0) (= n 1)) 1 (+ (fib (- n 1)) (fib (- n 2)))))',
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
  ],

  [
    SExps(
      IdAtom('define'),
      SExps(
        IdAtom('fib'),
        IdAtom('n')
      ),
      SExps(
        IdAtom('if'),
        SExps(
          IdAtom('or'),
          SExps(
            IdAtom('='),
            IdAtom('n'),
            NumAtom(0)
          ),
          SExps(
            IdAtom('='),
            IdAtom('n'),
            NumAtom(1)
          )
        ),
        NumAtom(1),
        SExps(
          IdAtom('+'),
          SExps(
            IdAtom('fib'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(1)
            )
          ),
          SExps(
            IdAtom('fib'),
            SExps(
              IdAtom('-'),
              IdAtom('n'),
              NumAtom(2)
            )
          )
        )
      )
    )
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
    SExps(
      StringAtom('hello'),
      IdAtom('world'),
      SExps(
        IdAtom('this'),
        StringAtom('is'),
        StringAtom('some non'),
        IdAtom('sense'),
        SExps(
          IdAtom('which'),
          IdAtom('should'),
          IdAtom('be')
        ),
        BooleanAtom('#t'),
        NumAtom(10),
        IdAtom('readable')
      )
    )
  ]
);


t('(define y x)\n' + 
'(define x 3)');

// f used before its definition
// must know its got a defn but that it hasnt been 'filled in'

t('(define x (f 3)) (define (f y) y)'

);

/*****************************************************************************
 *                   Test cases for live editing behavior.                   *
 *                                                                           *
 * These test cases are intended to illustrate specific live editing         *
 * behavior and the intended output of the live editor with that behavior.   *
 *****************************************************************************/

/**
 * Our demo: (+ 2 3)
 */
t('', [], [], [], [], '');

t('(',
  [OP],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(".'
);

t('(+',
  [OP, Tok(TokenType.Identifier, '+')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+')])],
  'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+".'
);

// t('(+ ');

t('(+ 2',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2')])],
  'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+ 2".'
);

t('(+ 2 3',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3')])],
  'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+ 2 3".'
);


t('(+ 2 3)',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '3'), CP],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(3)) ],
  [ Call('+', [NumExpr(2), NumExpr(3)]) ],
  [ NFn(5) ],
  '5'
);

// t('(+ 2 3');
// t('(+ 2 ');


t('(+ 2 4',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')])],
  [ReadErr('No Closing Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4')])],
  'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+ 2 4".'
);

t('(+ 2 4)',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4'), CP],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)) ],
  [ Call('+', [NumExpr(2), NumExpr(4)]) ],
  [ NFn(6) ],
  '6'
);

// t('(+ 2 4) ');

t('(+ 2 4) (+',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4'), CP, OP, Tok(TokenType.Identifier, '+')],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+')])],
  [ Call('+', [NumExpr(2), NumExpr(4)]), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+')]) ],
  [ NFn(6), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+')]) ],
  '6\n'
  + 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+".'
);

// t('(+ 2 4) (+ ');

t('(+ 2 4) (+ 4',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4'), CP, OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')])],
  [ Call('+', [NumExpr(2), NumExpr(4)]), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')]) ],
  [ NFn(6), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4')]) ],
  '6\n'
  + 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+ 4".'
);

// t('(+ 2 4) (+ 4 ');

t('(+ 2 4) (+ 4 7',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4'), CP, OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')])],
  [ Call('+', [NumExpr(2), NumExpr(4)]), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')]) ],
  [ NFn(6), ReadErr('No Open Paren', [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7')]) ],
  '6\n'
  + 'ReadError: Found an opening parenthesis without a closing parenthesis.\n'
  + 'Found in: "(+ 4 7".'
);

t('(+ 2 4) (+ 4 7)',
  [OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '2'), Tok(TokenType.Number, '4'), CP, OP, Tok(TokenType.Identifier, '+'), Tok(TokenType.Number, '4'), Tok(TokenType.Number, '7'), CP],
  [ SExps(IdAtom('+'), NumAtom(2), NumAtom(4)), SExps(IdAtom('+'), NumAtom(4), NumAtom(7))],
  [ Call('+', [NumExpr(2), NumExpr(4)]), Call('+', [NumExpr(2), NumExpr(4)]) ],
  [ NFn(6), NFn(11) ],
  '6\n' +
  '11'
);



/** 
 * Our demo: Someone tries to define fib.
 */

// ''
// '('
// ...
t('(define (fib n)\n' +
'  (if (= fib 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib n - 2) + (fib n - 1))))');

// ...
// missing parens
t('(define (fib n)\n' +
'  (if (= fib 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib n - 2) + (fib n - 1))))))');

// ...
// The student is reminded of prefix notation

t('(define (fib n)\n' +
'  (if (= fib 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib (- n 2) + (fib (- n 1))))))');

// ...
// The student is told fib cant equal 0

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      (n 1)\n' + 
'      (else if (= fib 1)\n' +
'            (n 1)\n' +
'            (else (n (fib (- n 2) + (fib (- n 1))))))');

// ...
// Student is told 'you can't call n'

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      n 1\n' + 
'      (else if (= fib 1)\n' +
'            n 1\n' +
'            (else n (fib (- n 2) + (fib (- n 1)))))');

// ...
// Student is told something like 'now get rid of those n'
t('(define (fib)\n' +
'  (if (= 0)\n' + 
'      1\n' + 
'      (else if (= fib 1)\n' +
'            1\n' +
'            (else (fib (- 2) + (fib (- 1)))))');

// ...
// 'No, not all the n.' 

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      1\n' + 
'      (else if (= fib 1)\n' +
'            1\n' +
'            (else (fib (- n 2) + (fib (- n 1)))))');

// ...
// Prefix notation again.

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      1\n' + 
'      (else if (= fib 1)\n' +
'            1\n' +
'            (else (+ (fib (- n 2)) (fib (- n 1)))))))');

// ...
// Else isn't a thing here.

t('(define (fib n)\n' +
'  (if (= n 0)\n' + 
'      1\n' + 
'      (if (= fib 1)\n' +
'           1\n' +
'           (+ (fib (- n 2)) (fib (- n 1))))))');

 /**
 * Behavior:
 * Someone uses an editor that inserts matching parens automatically.
 * when they write (fib 10), it goes from () to (fib 10) one character at a time.
 */

/**
 * Behavior:
 * A user comments out a piece of code.
 */
