const { tokenize, parse } = require('../logic/parse.js');
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

describe('tokenizer', () => {
  it('should return the empty list for an empty string', () => {  
    const result = tokenize('');
    expect(result).to.deep.equal([]);
  });
  
  it('should parse a bunch of parenthesis correctly', () => {
    const result = tokenize('([[[][][][][][])))[][])))){}{}{}');
    const expected = [
        OP, OSP, OSP, OSP, CSP, OSP, CSP, OSP, CSP, OSP, CSP, OSP,
        CSP, OSP, CSP, CP, CP, CP, OSP, CSP, OSP, CSP, CP, CP, CP,
        CP, OBP, CBP, OBP, CBP, OBP, CBP,
    ];

    expect(result).to.deep.equal(expected);
  });

  it('should parse a simple variable definition', () => {  
      const result = tokenize('(define x 10)');
      const expected = [ OP, Id('define'), SPACE, Id('x'), SPACE, Num(10), CP ];
      expect(result).to.deep.equal(expected);
  });

  it('should parse 123 as an identifier here', () => {
      const result = tokenize('(123)');
      const expected = [ OP, Num(123), CP ];
      expect(result).to.deep.equal(expected);
  })

  it('should handle booleans correctly', () => {
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
    expect(result).to.deep.equal(expected);
  })
});

describe('parser', () => {
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
    expect(result).to.deep.equal(expected);
  });
});
