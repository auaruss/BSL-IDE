'use strict';

/**
 * An S-exp parser for the student languages.
 * @author: Alice Russell, Sam Soucie 
 * 
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and parser must handle '().
 * @todo The tokenizer should remove the quotes around a string.
 * @todo The tokenizer should transform booleans
 * @todo Rename parse functions to read functions
 */

import {
  ParseError, Result,
  SExp, Token, TokenError, TokenType
} from './types';

import {
  isTokenError, isParseError
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
 * Attempts to parse the first SExp from a list of tokens.
 * @remark A failure is produced when no starting SExp is found.
 * @remark Note that this function does not deal with whitespace as we expect to always be calling parse
 *         first and we deal with the whitespace completely in there.
 * @param tokens
 */
const parseSexp = (tokens: Token[]): Result<SExp> | Result<ParseError> => {
  if (tokens.length === 0) {
    return { thing: {parseError: 'No Valid SExp', tokens: []}, remain: [] }
  }

  const firstToken = tokens[0];

  if (isTokenError(firstToken)) {
    const result: Result<ParseError> = {
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
        let insideSexps: Token[] = [];
        for (let token of tokens.slice(1)) {
          if ((! isTokenError(token))
          &&
            (token.type === TokenType.CloseParen
          || token.type === TokenType.CloseSquareParen
          || token.type === TokenType.CloseBraceParen)) {
            if (parensMatch(firstToken.type, token.type)) {
              return {
                // What to do with parseSexps.remain here?
                thing: parseSexps(insideSexps).thing,
                remain: tokens.slice(i+1)
              };
            } else {
              return {
                thing: {parseError: 'Mismatched Parens', tokens: [firstToken, token]},
                remain: tokens.slice(i+1)
              };
            }
          } else {
            insideSexps.push(token);
            i++;
          }
        }
        return {
          thing: {parseError:'No Closing Paren', tokens:insideSexps},
          remain: tokens
        };
      case TokenType.CloseParen:
      case TokenType.CloseSquareParen:
      case TokenType.CloseBraceParen:
        return { thing: {parseError: 'No Closing Paren', tokens: []}, remain: tokens }
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
        return {
          thing: {parseError: 'Parsed non-result (should never be seen)', tokens: []},
          remain: tokens
        };
    }
  }
}

/**
 * Parses as many SExp as possible from the start of the list of tokens.
 * @param tokens
 */
const parseSexps = (tokens: Token[]): Result<SExp[]> | Result<ParseError> => {
  if (tokens.length === 0) return { thing: [], remain: [] };
  
  let firstToken = tokens[0];
  
  if (isTokenError(firstToken)) {
    return { thing: firstToken, remain: tokens.slice(1) };
  } else if (firstToken.type === TokenType.Whitespace) {
    return parseSexps(tokens.slice(1));
  }
  
  let parseFirst = parseSexp(tokens);

  if (isParseError(parseFirst.thing)) {
    return { thing: parseFirst.thing, remain: tokens.slice(1) };
  }

  let parseRest = parseSexps(parseFirst.remain);

  if (isTokenError(parseRest.thing)) {
    return parseFirst;
  } else {
    parseRest.thing.unshift(parseFirst.thing);
    return parseRest;
  }
}

/**
 * Parses as many SExp as possible from the start of an expression.
 * @param exp an expression as a string
 */
export const parse = (exp:string): SExp[] => {
  const parsed = parseSexps(tokenize(exp)).thing;
  return parsed;
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
  return { parseError: 'Non-boolean was processed as a boolean (should never be seen)', tokens: [t] }
}

module.exports =  {
  'tokenize': tokenize,
  'parse': parse,
  'parseSexp': parseSexp,
  'parseSexps': parseSexps
};