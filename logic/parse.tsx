'use strict';
// SExpr Parser in TS
// Alice Russell, Sam Soucie

type Identifier = string;

// BSL Grammar
type Program = DefOrExpr[];

type DefOrExpr
  = Definition
  | Expr
  | TestCase
  | LibraryRequire;

type Definition
  = ['define', [Identifier, Identifier, Identifier[]?], Expr]
  | ['define', Identifier, Expr]
  | ['define', Identifier, ['lambda'|'λ', Identifier[], Expr]]
  | ['define-struct', Identifier, Identifier[]]

type Cond = ['cond', [Expr, Expr][], ['else', Expr]?]

type Expr
  = symbol
  | number
  | boolean
  | string
  | Identifier
  | []
  | [Identifier, Expr[]]
  | Cond
  | ['if', Expr, Expr, Expr]
  | ['and', Expr[]]
  | ['or', Expr[]];

type TestCase
  = ['check-expect', Expr, Expr]
  | ['check-random', Expr, Expr]
  | ['check-within', Expr, Expr, Expr]
  | ['check-member-of', Expr[]]
  | ['check-range', Expr, Expr, Expr]
  | ['check-satisfied', Expr, Identifier]
  | ['check-error', Expr, Expr?];
  
type LibraryRequire
  = ['require', string]
  | ['require', ['lib', string[]]]
  | ['require', ['planet', string, Package]];

type Package
  = [string, string, number, number];

type SExp
  = 
  | { 
    type: TokenType.String|TokenType.Number|TokenType.Boolean|TokenType.Identifier,
    value: string
  }
  | SExp[];

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

const isSuccess = (result: Result<any>): result is ResultSuccess<any> => {
  return (result as ResultSuccess<any>).thing !== undefined;
}

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
  [TokenType.String, /^".*"/],
  [TokenType.Identifier, /^[^",'`\(\)\[\]{};#\+\s]+/],
  [TokenType.Whitespace, /^\s+/],
  [TokenType.Boolean, /^#t\b|#T\b|#f\b|#F\b|#true\b|#false\b/]
];

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

  return [{type: TokenType.Error, value: exp[0]}]
    .concat(tokenize(exp.slice(1)));
};

// type SExp = string | SExp[];
// type Result<T>
//   = {
//   thing: T,
//   remain: Token[]
// } | {
//   error: string,
//   remain: Token[]
// };

const parseSexp = (tokens: Token[]): Result<SExp> => {
  if (tokens.length === 0) return {thing: [], remain: []};

  switch(tokens[0].type) {
    case TokenType.OpenParen:
    case TokenType.OpenSquareParen:
    case TokenType.OpenBraceParen:
      const partsOfSexp = parseSexps(tokens.slice(1));
      if (isSuccess(partsOfSexp)) {
        if (isClosingParen(partsOfSexp.remain[0])) {
          return ({
            thing: partsOfSexp.thing,
            remain: partsOfSexp.remain.slice(1)
          });
        } else { 
          return ({
            thing: [],
            remain: tokens
          });
        }
      } // else handle failure here
      break;
    case TokenType.CloseParen:
    case TokenType.CloseSquareParen:
    case TokenType.CloseBraceParen:
      // return {thing: [], remain: tokens};
    case TokenType.Number:
    case TokenType.String:
    case TokenType.Identifier:
    case TokenType.Boolean:
      return {
        thing: tokens[0] as SExp,
        remain: tokens.slice(1)
      };
  }

  throw new Error('dunno?');
  // return {
  //   : 'dunno?',
  //   remain: tokens
  // };
}

const parseSexps = (tokens: Token[]): Result<SExp[]> => {
  if (tokens.length === 0) return {thing: [], remain: []};
  let result = parseSexp(tokens);
  if (isSuccess(result)) {
    
      const nextParse = parseSexps(result.remain);

      if (isSuccess(nextParse)) {
        return ({
          thing: [result.thing].concat(nextParse.thing),
          remain: nextParse.remain
        });
      }
  }  // else handle failure here
}

const parse = (exp:string): SExp[] => {
  const parsed = parseSexps(tokenize(exp).filter(x => x.type !== TokenType.Whitespace));
  if (isSuccess(parsed)) { 
    return parsed.thing;
  }
}

const isClosingParen = (t: any): boolean => {
  if ((t as Token).type) {
    return (
         (t as Token).type === TokenType.CloseParen
      || (t as Token).type === TokenType.CloseSquareParen
      || (t as Token).type === TokenType.CloseBraceParen
    );
  }
  return false;
}

module.exports =  {
  'tokenize': tokenize,
  'parse': parse,
  'parseSexp': parseSexp,
  'parseSexps': parseSexps
};