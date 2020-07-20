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
  isTokenError
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
      let firstToken: Token[] = [{type: tokenType, value: result[0]}];
      let restString: string = exp.slice(result[0].length);
      return firstToken.concat(tokenize(restString));
    }
  }

  let firstToken: Token[] = [{error: 'Unidentified Token', value:exp[0]}];
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
    return { thing: {error: 'No Valid SExp', value: ''}, remain: [] }
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
        const parseRest = parseSexps(tokens.slice(1));
        // this means parseRest is the rest of the current SExp. so for
        // '(define hello 1) (define x 10)'
        // parseRest should be equal to
        // {
        //   thing: [Id('define'), Id('hello'), Num('1').
        //   remain: tokenize(') (define x 10)')
        // } (ignoring whitespace in the tokenization)

        if (parseRest.remain.length === 0) {
          return { thing: {error: 'No Closing Paren', value: ''}, remain: tokens }
        }
        const firstTokenAfterSExps = parseRest.remain[0];
        if ((! isTokenError(firstTokenAfterSExps))
          &&
            (firstTokenAfterSExps.type === TokenType.CloseParen
          || firstTokenAfterSExps.type === TokenType.CloseSquareParen
          || firstTokenAfterSExps.type === TokenType.CloseBraceParen)
        ) {
          if (parensMatch(firstToken.type, firstTokenAfterSExps.type))
            return {
              thing: parseRest.thing,
              remain: parseRest.remain.slice(1)
            };
          return {
            thing: {
              error: 'Mismatched Parens',
              value: firstToken.value + ' ' + firstTokenAfterSExps.value
            },
            remain: parseRest.remain.slice(1)
          };
        } else {
          return { thing: {error: 'No Closing Paren', value: ''}, remain: tokens }
        }
      case TokenType.CloseParen:
      case TokenType.CloseSquareParen:
      case TokenType.CloseBraceParen:
        return { thing: {error: 'No Closing Paren', value: ''}, remain: tokens }
      case TokenType.Number:
        return {
          thing: {
            type: 'Num',
            value: Number(tokens[0].value)
          },
          remain: tokens.slice(1)
        };
      case TokenType.String:
        return {
          thing: {
            type: 'String',
            value: tokens[0].value.slice(1,-1) // removes "" from string
          },
          remain: tokens.slice(1)
        };
      case TokenType.Identifier:
        return {
          thing: {
            type: 'Id',
            value: tokens[0].value
          },
          remain: tokens.slice(1)
        };
      case TokenType.Boolean:
        return {
          thing:whichBool(tokens[0]),
          remain: tokens.slice(1)
        };
      default:
        return { thing: {error: 'Parsed non-result (should never be seen)', value: ''}, remain: tokens }
    }
  }
}

/**
 * Parses as many SExp as possible from the start of the list of tokens.
 * @param tokens
 * @throws error when the Result is neither a ResultSuccess nor ResultFailure
 */
const parseSexps = (tokens: Token[]): Result<SExp[]> => {
  if (tokens.length === 0) return { thing: [], remain: [] };
  
  let firstToken = tokens[0];
  
  if (isTokenError(firstToken)) {
    let parseRest = parseSexps(tokens.slice(1));
    parseRest.thing.unshift([firstToken]);
    return { thing: parseRest.thing, remain: parseRest.remain }
  } else if (firstToken.type === TokenType.Whitespace) {
    return parseSexps(tokens.slice(1));
  }
  
  let parseFirst = parseSexp(tokens);
  let parseRest = parseSexps(parseFirst.remain);
  parseRest.thing.unshift([parseFirst.thing]);

  return {
    thing: parseRest.thing,
    remain: parseRest.remain
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
  switch (t.value) {
    case '#T':
    case '#t':
    case '#true':
      return {
        type: 'Bool',
        value: true
      }
    case '#F':
    case '#f':
    case '#false':
      return {
        type: 'Bool',
        value: false
      };
  }
  return { error: 'Non-boolean was processed as a boolean (should never be seen)', value: t.value}
}

module.exports =  {
  'tokenize': tokenize,
  'parse': parse,
  'parseSexp': parseSexp,
  'parseSexps': parseSexps
};