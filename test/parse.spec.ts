function helloTest(){
  return true;
}

import { expect } from 'chai';
import 'mocha';
import { tokenize } from '../src/logic/parse';
 
describe('tokenizer', () => {
  it('should return the empty list for an empty string', () => {  
    const result = tokenize('');
    expect(result).to.equal([]);
  });
  
  it('', () => {  
    const result = tokenize('');
    expect(result).to.equal([]);
  });

});