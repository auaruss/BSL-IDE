'use strict';

/**
 * An S-exp reader for the student languages.
 * @author: Alice Russell, Sam Soucie 
 * 
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and reader must handle '().
 * @todo The tokenizer should remove the quotes around a string.
 * @todo The tokenizer should transform booleans
 * @todo Rename read functions to read functions
 */

import {
  ReadError, Result,
  SExp, Token, TokenError, TokenType
} from './types';

import {
  isTokenError, isReadError
} from './predicates';

// Regexp Definitions.
const tokenExpressions: [TokenType, RegExp][] = [
  [TokenType.OpenParen, /^\(/],
  [TokenType.OpenSquareParen, /^\[/],
  [TokenType.OpenBraceParen, /^\{/],
  [TokenType.CloseParen, /^\)/],
  [TokenType.CloseSquareParen, /^]/],
  [TokenType.CloseBraceParen, /^}/],
  [TokenType.Number, /^\d+/],
  [TokenType.String, /^"[^"]*"/],
  [TokenType.Identifier, /^[^",'`\(\)\[\]{};#\s]+/],
  [TokenType.Whitespace, /^\s+/],
  [TokenType.Boolean, /^#t\b|#T\b|#f\b|#F\b|#true\b|#false\b/]
];

/**
 * Transforms a string into a list of tokens.
 * @param exp expression as a string
 */
const tokenize = (exp: string): Token[] => {
  if (exp == '') {
    return [];
  }
  for (let [tokenType, expression] of tokenExpressions) {
    let result = expression.exec(exp);
    if (result) {
      let firstToken: Token[] = [{type: tokenType, token: result[0]}];
      let restString: string = exp.slice(result[0].length);
      return firstToken.concat(tokenize(restString));
    }
  }

  let firstToken: Token[] = [{tokenError: 'Unidentified Token', string: exp[0]}];
  let restString = exp.slice(1);
  return firstToken.concat(tokenize(restString));
}

/**
 * Attempts to read the first SExp from a list of tokens.
 * @remark A failure is produced when no starting SExp is found.
 * @remark Note that this function does not deal with whitespace as we expect to always be calling read
 *         first and we deal with the whitespace completely in there.
 * @param tokens
 */
const readSexp = (tokens: Token[]): Result<SExp> | Result<ReadError> => {
  if (tokens.length === 0) {
    return { thing: {readError: 'No Valid SExp', tokens: []}, remain: [] }
  }

  const firstToken = tokens[0];

  if (isTokenError(firstToken)) {
    const result: Result<ReadError> = {
      thing: firstToken,
      remain: tokens.slice(1)
    }
    return result;
  } else {
    switch(firstToken.type) {
      case TokenType.OpenParen:
      case TokenType.OpenSquareParen:
      case TokenType.OpenBraceParen:
        let i = 1;
        let leftGTRight = 1;
        let insideSexps: Token[] = [];

        for (let token of tokens.slice(1)) {
          if (! isTokenError(token)) {
            if (token.type === TokenType.CloseParen
             || token.type === TokenType.CloseSquareParen
             || token.type === TokenType.CloseBraceParen) {
              leftGTRight = leftGTRight - 1;
            }
             
            if (token.type === TokenType.OpenParen
             || token.type === TokenType.OpenSquareParen
             || token.type === TokenType.OpenBraceParen) {
              leftGTRight = leftGTRight + 1;
            }
          
            if (leftGTRight === 0) {
              if (parensMatch(firstToken.type, token.type)) {
                return {
                  // What to do with readSexps.remain here?
                  thing: readSexps(insideSexps).thing,
                  remain: tokens.slice(i+1)
                };
              } else {
                return {
                  thing: {readError: 'Mismatched Parens', tokens: [firstToken, token]},
                  remain: tokens.slice(i+1)
                };
              }
            } else {
              insideSexps.push(token);
              i += 1;
            }
          } else {
            insideSexps.push(token);
            i += 1;
          }
        }
        return {
          thing: {readError:'No Closing Paren', tokens:insideSexps},
          remain: []
        };
      case TokenType.CloseParen:
      case TokenType.CloseSquareParen:
      case TokenType.CloseBraceParen:
        return { thing: {readError: 'No Open Paren', tokens: [firstToken]}, remain: tokens.slice(1) }
      case TokenType.Number:
        return {
          thing: {
            type: 'Num',
            sexp: Number(firstToken.token)
          },
          remain: tokens.slice(1)
        };
      case TokenType.String:
        return {
          thing: {
            type: 'String',
            sexp: firstToken.token.slice(1,-1) // removes "" from string
          },
          remain: tokens.slice(1)
        };
      case TokenType.Identifier:
        return {
          thing: {
            type: 'Id',
            sexp: firstToken.token
          },
          remain: tokens.slice(1)
        };
      case TokenType.Boolean:
        return {
          thing: whichBool(firstToken),
          remain: tokens.slice(1)
        };
      default:
        return readSexp(tokens.slice(1));
    }
  }
}

/**
 * Reads as many SExp as possible from the start of the list of tokens.
 * @param tokens
 */
const readSexps = (tokens: Token[]): Result<SExp[]> => {
  if (tokens.length === 0) return { thing: [], remain: [] };
  
  let firstToken = tokens[0];
  
  if (isTokenError(firstToken)) {
    return { thing: [firstToken], remain: tokens.slice(1) };
  } else if (firstToken.type === TokenType.Whitespace) {
    return readSexps(tokens.slice(1));
  }
  
  let readFirst = readSexp(tokens);

  if (isReadError(readFirst.thing)) {
    return { thing: [readFirst.thing], remain: tokens.slice(1) };
  }

  let readRest = readSexps(readFirst.remain);

  if (isReadError(readRest.thing)) {
    return { thing: [readFirst.thing], remain: readFirst.remain };
  } else {
    readRest.thing.unshift(readFirst.thing);
    return readRest;
  }
}

/**
 * Reads as many SExp as possible from the start of an expression.
 * @param exp an expression as a string
 */
export const read = (exp:string): SExp[] | ReadError => {
  const sexpsRead = readSexps(tokenize(exp)).thing;
  return sexpsRead;
}

/**
 * Given two token types, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 * 
 * @param op open paren token
 * @param cp close paren token
 * @return True if the tokens match in the correct order,
 *         False if given any other tokens, or given the tokens in the wrong order.
 */
const parensMatch = (
  op: TokenType, cp: TokenType): boolean => {
  if (op === TokenType.OpenParen) {
    return cp === TokenType.CloseParen;
  } else if (op === TokenType.OpenSquareParen) {
    return cp === TokenType.CloseSquareParen;
  } else if (op === TokenType.OpenBraceParen) {
    return cp === TokenType.CloseBraceParen;
  }
  return false;
}

/**
 * Converts a boolean token into a Boolean SExp.
 * @param t token
 */
const whichBool = (t: Token): SExp => {
  if (isTokenError(t)) return t;
  switch (t.token) {
    case '#T':
    case '#t':
    case '#true':
      return {
        type: 'Bool',
        sexp: true
      }
    case '#F':
    case '#f':
    case '#false':
      return {
        type: 'Bool',
        sexp: false
      };
  }
  return { readError: 'Non-boolean was processed as a boolean (should never be seen)', tokens: [t] }
}

module.exports =  {
  'tokenize': tokenize,
  'read': read,
  'readSexp': readSexp,
  'readSexps': readSexps
};