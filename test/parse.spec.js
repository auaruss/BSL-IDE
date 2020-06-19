const { tokenize } = require('../logic/parse.js');
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

  // it('should parse a simple variable definition', () => {  
  //   const result = tokenize('(define x 10)');
  //   const expected = [
  //     {type: 'OpenParen', value: '('},
  //     {type: 'OpenParen', value: 'define'},
  //     {type: 'OpenParen', value: ' '},
  //     {type: 'OpenParen', value: 'x'},
  //     {type: 'OpenParen', value: ' '},
  //     {type: 'OpenParen', value: '10'},
  //     {type: 'OpenParen', value: ')'},
  //   ]
  //   expect(result).to.deep.equal(expected);
  // });

  // it('should parse 123 as an identifier here', () => {
  //   const result = tokenize('(123)');
  // })
});