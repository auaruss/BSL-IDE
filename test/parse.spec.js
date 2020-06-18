const { tokenize } = require('../logic/parse.js');
const { expect } = require('chai');
 
describe('tokenizer', () => {
  it('should return the empty list for an empty string', () => {  
    const result = tokenize('');
    expect(result).to.deep.equal([]);
  });
  
  it('should parse a simple variable definition', () => {  
    const result = tokenize('(123)');
    const expected = [
      {type: 'OpenParen', value: '('},
      {type: 'OpenParen', value: 'define'},
      {type: 'OpenParen', value: ' '},
      {type: 'OpenParen', value: 'x'},
      {type: 'OpenParen', value: ' '},
      {type: 'OpenParen', value: '10'},
      {type: 'OpenParen', value: ')'},
    ]
    expect(result).to.deep.equal(expected);
  });

});