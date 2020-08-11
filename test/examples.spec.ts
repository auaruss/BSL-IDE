'use strict';

import {
  DefOrExpr, ReadError, TokenType, TokenError, Token, SExp, Value
} from '../src/logic/types';

import { tokenize } from '../src/logic/tokenize';
import { read } from '../src/logic/read';
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

  //  if (tokens) {
  //     try {
  //       let s = read(tokens); // Change this to something like readTokens
  //     } catch {
  //       assertFailure();
  //     }
  //     if (sexps) {
  //       it('should read correctly', () => {
  //         checkExpect(s, sexps);
  //       });
  //     } else {
  //       sexps = screen;
  //     }
  //   }

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

/**
 * These test cases are cases which should succeed through
 * the entire pipeline.
 */
t(
  '(define x 10)',
  [OP, IdTok('define'), SPACE, IdTok('x'), SPACE, NumTok('10'), CP]
);

t('#t', [BooleanTok('#t')]);
t('#f', [BooleanTok('#f')]);
t('#true', [BooleanTok('#true')]);
t('#false', [BooleanTok('#false')]);

t('', []);
t('123', [NumTok('123')]);
t('"hello"', [StringTok('hello')]);
t('#true', [BooleanTok('#true')]);

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
  ]
);

t('(define (simple-choice x y z) (if x y z))\n'
+ '(simple-choice #t 10 20)\n'
+ '\n'
+ '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
+ '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n',

  tokenize('(define (simple-choice x y z) (if x y z))')
  .concat([NL])
  .concat(tokenize('(simple-choice #t 10 20)'))
  .concat([Tok(TokenType.Whitespace, '\n\n')])
  .concat(tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
  .concat([NL])
  .concat(tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
  .concat([NL])
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
  ]
);

t('(fact 5)',
  [
    OP,
    IdTok('fact'),
    SPACE,
    NumTok('5'),
    CP
  ]
);

t('(f 10)',
  [
    OP,
    IdTok('f'),
    SPACE,
    NumTok('10'),
    CP
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
    .concat(tokenize('(/ 2)'))

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
  ]
);

t('+',
  [ IdTok('+') ]
);

t('(123)',
  [
    OP,
    NumTok('123'),
    CP
  ]
);

t('(',
  [ OP ]
);

t('[',
  [ OSP ]
);

t('{',
  [ OBP ]
);

t(')',
  [ CP ]
);

t(']',
  [ CSP ]
);

t('}',
  [ CBP ]
);

t('x',
  [ IdTok('x') ]
);

t('"abc" def "ghi"',
  [
    StringTok('abc'),
    SPACE,
    IdTok('def'),
    SPACE,
    StringTok('ghi')
  ]
);

t('"abc"def"ghi"',
  [
    StringTok('abc'),
    IdTok('def'),
    StringTok('ghi')
  ]
);

t('#t123',
  [
    TokErr('#'),
    IdTok('t123')
  ]
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
  ]
);

t(') (hello)',
  [
    CP,
    SPACE,
    OP,
    IdTok('hello'),
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
  ]
);

// t('(define background-image (empty-scene 100 100))\n' +
// '(define\n' +
// 'background-image\n' +
// '(define (f x) (+ 1 x))\n',
// );