const { tokenize, parse } = require('../logic/parse.js');
const { expect } = require('chai');
 
describe('tokenizer', () => {
  it('should return the empty list for an empty string', () => {  
    const result = tokenize('');
    expect(result).to.deep.equal([]);
  });
  
  it('should parse a bunch of parenthesis correctly', () => {
    const result = tokenize('([[[][][][][][])))[][])))){}{}{}');
    const expected = [
      { type: 'OpenParen', value: '(' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'OpenSquareParen', value: '[' },
      { type: 'CloseSquareParen', value: ']' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'OpenBraceParen', value: '{' },
      { type: 'CloseBraceParen', value: '}' },
      { type: 'OpenBraceParen', value: '{' },
      { type: 'CloseBraceParen', value: '}' },
      { type: 'OpenBraceParen', value: '{' },
      { type: 'CloseBraceParen', value: '}' }
    ];

    expect(result).to.deep.equal(expected);
  });

  it('should parse a simple variable definition', () => {  
    const result = tokenize('(define x 10)');
    const expected = [
      {type: 'OpenParen', value: '('},
      {type: 'Identifier', value: 'define'},
      {type: 'Whitespace', value: ' '},
      {type: 'Identifier', value: 'x'},
      {type: 'Whitespace', value: ' '},
      {type: 'Number', value: '10'},
      {type: 'CloseParen', value: ')'},
    ]
    expect(result).to.deep.equal(expected);
  });

  it('should parse 123 as an identifier here', () => {
    const result = tokenize('(123)');
  })

  it('should handle booleans correctly', () => {
    // const result = tokenize('#t123');
    // We should expect this to error?
  });

  it('should tokenize factorial correctly', () => {
    let result = tokenize('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))')
    let expected = [
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: 'define' },
      { type: 'Whitespace', value: ' ' },
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: 'fact' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Identifier', value: 'n' },
      { type: 'CloseParen', value: ')' },
      { type: 'Whitespace', value: ' ' },
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: 'if' },
      { type: 'Whitespace', value: ' ' },
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: '=' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Identifier', value: 'n' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Number', value: '0' },
      { type: 'CloseParen', value: ')' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Number', value: '1' },
      { type: 'Whitespace', value: ' ' },
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: '*' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Identifier', value: 'n' },
      { type: 'Whitespace', value: ' ' },
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: 'fact' },
      { type: 'Whitespace', value: ' ' },
      { type: 'OpenParen', value: '(' },
      { type: 'Identifier', value: '-' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Identifier', value: 'n' },
      { type: 'Whitespace', value: ' ' },
      { type: 'Number', value: '1' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' },
      { type: 'CloseParen', value: ')' }
    ];
    expect(result).to.deep.equal(expected);
  })
});

describe('parser', () => {
  it('should parse this fact function', () => {
    const result = parse('(define (fact n) (if (= n 0) 1 (* n (fact (- 1 n)))))');
    const expected = (
      [
        { type: 'Identifier', value: 'define' },
        [ 
          { type: 'Identifier', value: 'fact' },
          { type: 'Identifier', value: 'n' }
        ],
        [
          { type: 'Identifier', value: 'if' },
          [ 
            { type: 'Identifier', value: '=' },
            { type: 'Identifier', value: 'n' }, 
            { type: 'Number', value: '0' }
          ],
          { type: 'Number', value: '1' },
          [
            { type: 'Identifier', value: '*' },
            { type: 'Identifier', value: 'n' },
            [
              { type: 'Identifier', value: 'fact' },
              [
                { type: 'Identifier', value: '-' },
                { type: 'Identifier', value: 'n' },
                { type: 'Number', value: '1' }
              ]
            ]
          ] 
        ]
      ]
    );
    expect(result).to.deep.equal(expected);
  });
});
