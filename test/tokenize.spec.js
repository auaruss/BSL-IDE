'use strict';

const { tokenize } = require('../src/logic/tokenize.js');
const { checkExpect, checkExpectMultiple } = require('./check-expect');

function Tok     (t, v) { return { type:  t, token: v }; }

function NumTok     (v) { return Tok('Number',       v.toString()); }
function IdTok      (v) { return Tok('Identifier',   v);            }
function StringTok  (v) { return Tok('String', '"' + v + '"');      }
function BooleanTok (v) { return Tok('Boolean',      v);            }

function TokErr     (v) { return { tokenError: 'Unidentified Token', string: v }; }

const [ CP, OP, SPACE, OSP, CSP, OBP, CBP, NL ] =
      [
        Tok('CloseParen',       ')'),
        Tok('OpenParen',        '('), 
        Tok('Whitespace',       ' '),
        Tok('OpenSquareParen',  '['),
        Tok('CloseSquareParen', ']'),
        Tok('OpenBraceParen',   '{'),
        Tok('CloseBraceParen',  '}'),
        Tok('Whitespace',       '\n')
      ];

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

    it('should tokenize the plus symbol', () => {
        const result = tokenize('+');
        const expected = [IdTok('+')];
        checkExpect(result, expected);
    });

    it('should tokenize a simple variable definition', () => {  
        const result = tokenize('(define x 10)');
        const expected = [ OP, IdTok('define'), SPACE, IdTok('x'), SPACE, NumTok(10), CP ];
        checkExpect(result, expected);
    });

    it('should tokenize 123 as an number here', () => {
        const result = tokenize('(123)');
        const expected = [ OP, NumTok(123), CP ];
        checkExpect(result, expected);
    });

    it('should tokenize booleans correctly', () => {
        const result = ['#t', '#f', '#true', '#false'];
        const expected = [
            [BooleanTok('#t')],
            [BooleanTok('#f')],
            [BooleanTok('#true')],
            [BooleanTok('#false')]
        ];
        checkExpectMultiple(
            tokenize, result, expected
        );
    });

    it('should tokenize factorial correctly', () => {
        let result = tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')
        let expected = [
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
            [StringTok('abc'), SPACE, IdTok('def'), SPACE, StringTok('ghi')],
            [StringTok('abc'), IdTok('def'), StringTok('ghi')]
        ];

        checkExpectMultiple(tokenize, result, expected);
    });

    it('should handle newlines correctly', () =>{
        const newlineTestStr = (
                '(define (simple-choice x y z) (if x y z))\n'
            + '(simple-choice #t 10 20)\n'
            + '\n'
            + '(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))\n'
            + '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n'
        );
        const expected = (
            tokenize('(define (simple-choice x y z) (if x y z))')
                .concat([NL])
                .concat(tokenize('(simple-choice #t 10 20)'))
                .concat([{type: 'Whitespace', token: '\n\n'}])
                .concat(tokenize('(define (* m n) (if (= n 0) 0 (+ m (* m (- n 1)))))'))
                .concat([NL])
                .concat(tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))'))
                .concat([NL])
        );
        checkExpect(tokenize(newlineTestStr), expected);
    });

    it('should handle errors consistently', () => {
        const errorInput = tokenize('#t123');
        const errorExpected = [TokErr('#'), IdTok('t123')];

        checkExpect(errorInput, errorExpected);
    })
});