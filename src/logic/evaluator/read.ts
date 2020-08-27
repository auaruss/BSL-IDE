'use strict';

/**
 * An S-exp reader for the student languages.
 */



import {
  ReadError, ReadResult,
  SExp, Token, TokenType
} from '../types';

import { tokenize } from './tokenize';

import {
  isTokenError, isReadError
} from '../predicates';

import {
  Atom, NumAtom, IdAtom, StringAtom, BooleanAtom, ReadErr, SExps, SExpsFromArray, Res
} from '../constructors';

/**
 * Attempts to read the first SExp from a list of tokens.
 * @remark A failure is produced when no starting SExp is found.
 * @remark Note that this function does not deal with whitespace as we expect to always be calling read
 *         first and we deal with the whitespace completely in there.
 * @param tokens
 */
export const readSexp = (tokens: Token[]): ReadResult<SExp> | ReadResult<ReadError> => {
  if (tokens.length === 0) {
    return { thing: {readError: 'No Valid SExp', tokens: []}, remain: [] }
  }

  const firstToken = tokens[0];

  if (isTokenError(firstToken)) {
    const result: ReadResult<ReadError> = {
      thing: firstToken,
      remain: tokens.slice(1)
    }
    return result;
  } else {
    switch(firstToken.type) {
      case TokenType.OpenParen:
      case TokenType.OpenSquareParen:
      case TokenType.OpenBraceParen:
        const readRest = readSexps(tokens.slice(1));
        // this means parseRest is the rest of the current SExp. so for
        // '(define hello 1) (define x 10)'
        // parseRest should be equal to
        // {
        //   thing: [Id('define'), Id('hello'), Num('1').
        //   remain: tokenize(') (define x 10)')
        // } (ignoring whitespace in the tokenization)

        // Note that parseRest always returns a success, so we can assume that an SExp exists at the
        // start of the expression if and only if the remain from parsing the rest starts with a closing paren
        // which matches our current open paren.

        // This also means if the remain is empty we return a failure.
        if (readRest.remain.length === 0) {
          return {
            thing: ReadErr('No Closing Paren', [firstToken]),
            remain: tokens.slice(1)
          }
        } else {
          const firstUnprocessedToken = readRest.remain[0];
          if (isTokenError(firstUnprocessedToken)) {
            return { thing: ReadErr('No Valid SExp', []), remain: [] }
          } else if (firstUnprocessedToken.type === TokenType.CloseParen
                  || firstUnprocessedToken.type === TokenType.CloseSquareParen
                  || firstUnprocessedToken.type === TokenType.CloseBraceParen) {
            if (parensMatch(firstToken.type, firstUnprocessedToken.type))
              return Res(SExpsFromArray(readRest.thing), readRest.remain.slice(1));
            return {
              thing: ReadErr('Mismatched Parens', [firstToken, firstUnprocessedToken]),
              remain: readRest.remain.slice(1)
            };
          } else {
            return { thing: {readError: 'No Valid SExp', tokens: []}, remain: [] }
          }
        }
      case TokenType.CloseParen:
      case TokenType.CloseSquareParen:
      case TokenType.CloseBraceParen:
        return { thing: ReadErr('No Open Paren', [firstToken]), remain: tokens.slice(1) }
      case TokenType.Number:
        return {
          thing: NumAtom(Number(firstToken.token)),
          remain: tokens.slice(1)
        };
      case TokenType.String:
        return {
          thing: StringAtom(firstToken.token.slice(1,-1)),
          remain: tokens.slice(1)
        };
      case TokenType.Identifier:
        return {
          thing: IdAtom(firstToken.token),
          remain: tokens.slice(1)
        };
      case TokenType.Boolean:
        return {
          thing: BooleanAtom(firstToken.token),
          remain: tokens.slice(1)
        };
      case TokenType.Whitespace:
        return readSexp(tokens.slice(1));
    }
  }
}

/**
 * Reads as many SExp as possible from the start of the list of tokens.
 * @param tokens
 */
export const readSexps = (tokens: Token[]): ReadResult<SExp[]> => {
  if (tokens.length === 0) return { thing: [], remain: [] };
  
  let firstToken = tokens[0];
  
  if (isTokenError(firstToken)) {
    let thingToReturn = readSexps(tokens.slice(1));
    thingToReturn.thing.unshift(firstToken);
    return { thing: thingToReturn.thing, remain: thingToReturn.remain };
  } else if (firstToken.type === TokenType.Whitespace) {
    return readSexps(tokens.slice(1));
  }
  
  let readFirst = readSexp(tokens);

  if (isReadError(readFirst.thing)) {
    return { thing: [], remain: tokens };
  }

  let readRest = readSexps(readFirst.remain);

  if (isReadError(readRest.thing)) {
    return { thing: [readFirst.thing], remain: readFirst.remain };
  } else {
    readRest.thing.unshift(readFirst.thing);
    return readRest;
  }
}

export const readTokens = (ts: Token[]): SExp[] => {
  let tokens = ts.slice(); 
  let sexps = [];
  
  while (tokens.length !== 0) {
    let next = readSexp(tokens);
    sexps.push(next.thing);
    tokens = next.remain;
  }

  return sexps;
}

/**
 * Reads as many SExp as possible from the start of an expression.
 * @param exp an expression as a string
 */
export const read = (exp:string): SExp[] => {
  return readTokens(tokenize(exp));
}

/**
 * Given two token types, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 * 
 * @param op open paren token type
 * @param cp close paren token type
 * @return True if the types in the correct order and the paren types match,
 *         False if given any other token types, or given the types in the wrong order.
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

module.exports.read      = read;
module.exports.readSexp  = readSexp;
module.exports.readSexps = readSexps;