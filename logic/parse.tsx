'use strict';
// SExpr Parser in TS
// Alice Russell, Sam Soucie

// TODO: The tokenizer and parser must handle '().
// TODO: The tokenizer should handle negative numbers and decimals.

enum TokenType {
  Error='Error',
  OpenParen='OpenParen',
  OpenSquareParen='OpenSquareParen',
  OpenBraceParen='OpenBraceParen',
  CloseParen='CloseParen',
  CloseSquareParen='CloseSquareParen',
  CloseBraceParen='CloseBraceParen',
  Number='Number',
  String='String',
  Identifier='Identifier',
  Whitespace='Whitespace',
  Boolean='Boolean'
};

type Token
  = {
    type: TokenType
    value: string
  };

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

// Transforms a string into a list of tokens.
const tokenize = (exp: string): Token[] => {
  if (exp == '') {
    return [];
  }
  for (let [tokenType, expression] of tokenExpressions) {
    if (expression.test(exp)) {
      let result = expression.exec(exp);
      return [{type: tokenType, value: result ? result[0]: ''}]
        .concat(tokenize(result ? result.input.slice(result[0].length) : ''));
    }
  }

  throw new Error('Found a substring with no valid prefix token.');
};

enum AtomType {
  String='String',
  Number='Number',
  Boolean='Boolean',
  Identifier='Identifier'
}

type Str
  = {
    type: AtomType.String,
    value: string
  };

type Num
  = {
    type: AtomType.Number,
    value: number
  };

type Id
  = {
    type: AtomType.Identifier,
    value: string
  };

type Bool = {
  type: AtomType.Boolean,
  value: boolean
};

type Atom
  = Str | Num | Id | Bool;

type SExp
  = Atom | SExp[];

type Result<T> = ResultSuccess<T> | ResultFailure<T>;
type ResultSuccess<T>
  = {
    thing: T,
    remain: Token[]
  };
type ResultFailure<T>
  = {
    error: string,
    remain: Token[]
  };

// Determines whether a Result is a ResultSuccess.
const isSuccess = (result: Result<any>): result is ResultSuccess<any> => {
  return (result as ResultSuccess<any>).thing !== undefined;
}

// Determines whether a Result is a ResultFailure.
const isFailure = (result: Result<any>): result is ResultFailure<any> => {
  return (result as ResultFailure<any>).error !== undefined;
}


// Attempts to parse the first SExp from a list of tokens.
// A failure is produced when no starting SExp is found.
// Note that this function does not deal with whitespace as we expect to always be calling parse
// first and we deal with the whitespace completely in there.
const parseSexp = (tokens: Token[]): Result<SExp> => {
  if (tokens.length === 0) return {error: 'Reached the end without finding an SExpression.', remain: []};

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
        return {
          error: 'Found an opening parenthesis with no matching closing parenthesis.',
          remain: tokens
        };
      } else if (parensMatch(tokens[0], parseRest.remain[0])) {
        return {
          thing: parseRest.thing,
          remain: parseRest.remain.slice(1)
        };
      } else {
        return {
          error: 'Found an opening parenthesis with no matching closing parenthesis.',
          remain: tokens
        };
      }
    case TokenType.CloseParen:
    case TokenType.CloseSquareParen:
    case TokenType.CloseBraceParen:
      return {
        error: 'Found a closing parenthesis with no matching opening parenthesis.',
        remain: tokens
      };
    case TokenType.Number:
      return {
        thing: {
          type: AtomType.Number,
          value: Number(tokens[0].value)
        },
        remain: tokens.slice(1)
      };
    case TokenType.String:
      return {
        thing: {
          type: AtomType.String,
          value: tokens[0].value.slice(1,-1)
        },
        remain: tokens.slice(1)
      };
    case TokenType.Identifier:
      return {
        thing: {
          type: AtomType.Identifier,
          value: tokens[0].value
        },
        remain: tokens.slice(1)
      };
    case TokenType.Boolean:
      return {
        thing: {
          type: AtomType.Boolean,
          value: whichBool(tokens[0])
        },
        remain: tokens.slice(1)
      };
  }

  throw new Error('dunno? parseSexp');
}

// Parses as many SExp as possible from the start of the list of tokens.
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
    throw new Error('dunno? parseSexps');
  }
}

const parse = (exp:string): SExp[] => {
  const parsed = parseSexps(tokenize(exp)).thing;
  return parsed;
}

// Given two tokens, if the first is an opening paren token and the second a closing paren token,
// determines whether they are matching paren types.
// False if given any other tokens, or given the tokens in the wrong order.
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