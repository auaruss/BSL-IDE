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
  if (tokens.length === 0) return {thing: [], remain: tokens};

  switch(tokens[0].type) {
    case TokenType.OpenParen:
    case TokenType.OpenSquareParen:
    case TokenType.OpenBraceParen:
      let lookForMatchingParenIndex: number = matchParens(tokens);
      if (lookForMatchingParenIndex === -1) {
        return {error: 'Too few parens in prefix Sexp.', remain: tokens};
      }
      if (! parensMatching(tokens[0].type, tokens[lookForMatchingParenIndex].type)) {
        return {error: 'The wrong type of paren is matching your prefix paren.', remain: tokens};
      }
      return {
        thing: parseSexps(tokens.slice(1, lookForMatchingParenIndex)),
        remain: tokens.slice(lookForMatchingParenIndex+1)
      };
    case TokenType.CloseParen:
    case TokenType.CloseSquareParen:
    case TokenType.CloseBraceParen:
      return {error: 'Found a close paren with no match.', remain: tokens};
    case TokenType.Number:
    case TokenType.String:
    case TokenType.Identifier:
    case TokenType.Boolean:
      return {
        thing: tokens[0] as SExp,
        remain: tokens.slice(1)
      };
  }

  return {
    error: 'dunno?',
    remain: tokens
  };
}

const parseSexps = (tokens: Token[]): SExp[] => {
  if (tokens.length === 0) return [];
  let result = parseSexp(tokens);
  if ((result as ResultSuccess<SExp>).thing) {
    return [(result as ResultSuccess<SExp>).thing].concat(parseSexps(result.remain));
  } else {
    throw new Error((result as ResultFailure<SExp>).error);
  }
}

const parse = (exp:string): SExp[] => {
  return parseSexps(tokenize(exp).filter(x => x.type !== TokenType.Whitespace));
}

// This function can ONLY be guaranteed to work when tokens[0] is a left paren!
const matchParens = (tokens: Token[]): number => {
  let leftParens: number = 1, i:number = 1;
  while (leftParens > 0 && i < tokens.length) {
    if (tokens[i].type === TokenType.OpenParen
        || tokens[i].type === TokenType.OpenSquareParen
        || tokens[i].type === TokenType.OpenBraceParen) {
      leftParens += 1;
    }
    else if (tokens[i].type === TokenType.CloseParen
      || tokens[i].type === TokenType.CloseSquareParen
      || tokens[i].type === TokenType.CloseBraceParen) {
      leftParens -= 1;
    }
    i++;
  }
  return (leftParens > 0) ? -1 : i-1;
}

const parensMatching = (p1: TokenType, p2: TokenType): boolean => {
  if (p1 === TokenType.OpenParen) return p2 === TokenType.CloseParen;
  if (p1 === TokenType.OpenSquareParen) return p2 === TokenType.CloseSquareParen;
  if (p1 === TokenType.OpenBraceParen) return p2 === TokenType.CloseBraceParen;
  return false;
}

module.exports =  {
  'tokenize': tokenize,
  'parse': parse
};