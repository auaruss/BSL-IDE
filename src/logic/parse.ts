'use strict';

/**
 * An S-exp parser for the student languages.
 * @author: Alice Russell, Sam Soucie 
 * 
 * @todo The tokenizer should handle negative numbers and decimals.
 * @todo The tokenizer and parser must handle '().
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
 * @throws error if a non-token is in the Token[].
 */
const parseSexp = (tokens: Token[]): Result<SExp> | Result<ParseError> => {
  if (tokens.length === 0) {
    return { thing: {error: 'No Valid SExp', value: ''}, remain: [] }
  }
  if (isTokenError(tokens[0])) {
    const result: Result<ParseError> = {
      thing: tokens[0],
      remain: tokens.slice(1)
    }
    return result;
  } else {
    switch(tokens[0].type) {
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

        // Note that parseRest always returns a success, so we can assume that an SExp exists at the
        // start of the expression if and only if the remain from parsing the rest starts with a closing paren
        // which matches our current open paren.

        // This also means if the remain is empty we return a failure.
        if (parseRest.remain.length === 0) {
          return { thing: {error: 'No Closing Paren', value: ''}, remain: tokens }
        } else if (parensMatch(tokens[0], parseRest.remain[0])) {
          return {
            thing: parseRest.thing,
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
            value: tokens[0].value.slice(1,-1)
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
          thing: {
            type: 'Bool',
            value: whichBool(tokens[0])
          },
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
const parseSexps = (tokens: Token[]): ResultSuccess<SExp[]> => {
  if (tokens.length === 0) return { thing: [], remain: []};
  if (tokens[0].type === TokenType.Whitespace) { return parseSexps(tokens.slice(1)); }
  let parseFirst = parseSexp(tokens);
  if (isSuccess(parseFirst)) {
    const parseRest = parseSexps(parseFirst.remain);
    return {
      thing: [parseFirst.thing].concat(parseRest.thing),
      remain: parseRest.remain
    };
  } else if (isFailure(parseFirst)) {
  return { thing: [], remain: tokens }
  } else {
    throw new Error('Not a ResultSuccess or ResultFailure somehow.');
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
 * Given two tokens, if the first is an opening paren token and the second a closing paren token,
 * determines whether they are matching paren types.
 * 
 * @param op open paren token
 * @param cp close paren token
 * @return True if the tokens match in the correct order,
 *         False if given any other tokens, or given the tokens in the wrong order.
 */
const parensMatch = (op: Token, cp: Token): boolean => {
  if (op.type === TokenType.OpenParen) {
    return cp.type === TokenType.CloseParen;
  } else if (op.type === TokenType.OpenSquareParen) {
    return cp.type === TokenType.CloseSquareParen;
  } else if (op.type === TokenType.OpenBraceParen) {
    return cp.type === TokenType.CloseBraceParen;
  }
  return false;
}

/**
 * Checks whether a given boolean token is true or false.
 * @param t token
 * @throws error when called on non-boolean token
 */
const whichBool = (t: Token): boolean => {
  switch (t.value) {
    case '#T':
    case '#t':
    case '#true':
      return true;
    case '#F':
    case '#f':
    case '#false':
      return false;
    default:
      throw new Error("Called whichBool on a non-boolean token.");
  }
}

module.exports =  {
  'tokenize': tokenize,
  'parse': parse,
  'parseSexp': parseSexp,
  'parseSexps': parseSexps
};