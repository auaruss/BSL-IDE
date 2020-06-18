'use strict';
// SExpr Parser in TS
// Sam Soucie, Alice Russell

// TODO: abstract tokenizer cases

// An SExp is one of:
// - String
// - [SExp]

// A Result is one of:
// - {sexp: SExp, remain: [Token]}
// - {error: String, remain: String}
type Result<T>
  = {
  thing: T,
  remain: ListOf<Token>
} | {
  error: string,
  remain: ListOf<Token>
};

const space = {type: "ws", value: " "};

type Empty<T> = [];
type NonEmpty<T> = [T, ListOf<T>];
type ListOf<T>
  = Empty<T>
  | NonEmpty<T>;

function empty<T>(): Empty<T> {
  return [];
}
function cons<T>(car: T, cdr: ListOf<T>): ListOf<T> {
  return [car, cdr];
}
function car<T>(ls: NonEmpty<T>): T {
  return ls[0];
}
function cdr<T>(ls: NonEmpty<T>): ListOf<T> {
  return ls[1];
}

enum TokenType {
  OpenParen="OpenParen",
  OpenSquareParen="OpenSquareParen",
  OpenBraceParen="OpenBraceParen",
  CloseParen="CloseParen",
  CloseSquareParen="CloseSquareParen",
  CloseBraceParen="CloseBraceParen",
  Num="Num",
  StringLiteral="StringLiteral",
  Identifier="Identifier",
  Whitespace="Whitespace",
  Boolean="Boolean"
}

type Token
  = {
    type: TokenType
    value: string
  };

const tokenize = (exp: string): ListOf<Token> => {
  if (exp == '') {
    return empty<Token>();
  } else if (exp[0] == '(') {
    return cons<Token>(
      {type: TokenType.OpenParen, value: '('},
      tokenize(exp.slice(1))
    );
  } else if (exp[0] == '[') {
    return cons<Token>(
      {type: TokenType.OpenSquareParen, value: '['},
      tokenize(exp.slice(1))
    );
  } else if (exp[0] == '{') {
    return cons<Token>(
      {type: TokenType.OpenBraceParen, value: '{'},
      tokenize(exp.slice(1))
    );
  } else if (exp[0] == ')') {
    return cons<Token>(
      {type: TokenType.CloseParen, value: ')'},
      tokenize(exp.slice(1))
    );
  } else if (exp[0] == ']') {
    return cons<Token>(
      {type: TokenType.CloseSquareParen, value: ']'},
      tokenize(exp.slice(1))
    );
  } else if (exp[0] == '}') {
    return cons<Token>(
      {type: TokenType.CloseBraceParen, value: '}'},
      tokenize(exp.slice(1))
    );
  } else if (startsWithNumber(exp)) {
    let [val, rest] = splitPrefixNumber(exp);
    return cons<Token>(
      {type: TokenType.Num, value: val},
      tokenize(rest)
    );
  } else if (startsWithString(exp)) {
    let [val, rest] = splitPrefixString(exp);
    return cons<Token>(
      {type: TokenType.StringLiteral, value: val},
      tokenize(rest)
    );
  } else if (startsWithIdentifier(exp)) {
    let [val, rest] = splitPrefixIdentifier(exp);
    return cons<Token>(
      {type: TokenType.Identifier, value: val},
      tokenize(rest)
    );
  } else if (startsWithWhitespace(exp)) {
    let [val, rest] = splitPrefixWhitespace(exp)
    return cons<Token>(
      {type: TokenType.Whitespace, value: val},
      tokenize(rest)
    );
  } else if (startsWithBoolean(exp)) {
    let [val, rest] = splitPrefixBoolean(exp);
    return cons<Token>(
      {type: TokenType.Boolean, value: val},
      tokenize(rest)
    );
  } else {
    throw new Error("error tokenizing");
  }
};

const isDigit = (ch: string): boolean => {
  return /[0-9]/.test(ch);
}

const isWhitespace = (ch: string): boolean => {
    return /\s/.test(ch);
};


const startsWithNumber = (exp: string): boolean => {
  if (! isDigit(exp[0])) return false;
  
  let i: number = 1;
  while (i < exp.length) {
    if (! isDigit(exp[i])) {
      return isWhitespace(exp[i]);
    }
    i++;
  }

  return true;
}

const startsWithString = (exp: string): boolean => {
  if (! (exp[0] == '"')) return false;
  
  let i: number = 1;
  while (i < exp.length) {
    // check for unescaped " character
    if (exp[i] == '"' && (! (exp[i-1] == "\\"))) {
      return true;
    }
    i++;
  }
  return false;
}

const startsWithIdentifier = (exp: string): boolean => {
  if (isWhitespace(exp[0])) return false;
  let i = 0;
  while (i < exp.length) {
    // Checks for invalid characters in BSL names
    if (/[\"\,\'\`()\[\]\{\}\|;#]/.test(exp[0])) return false;
    if (isWhitespace(exp[i])) return true;
    i++;
  }
  return true;
}

const startsWithWhitespace = (exp: string): boolean => {
  return isWhitespace(exp[0]);
}

const startsWithBoolean = (exp: string) => {
  const lower = exp.toLowerCase();
  return (
    lower.slice(0,2) == '#t'
    || lower.slice(0,2) == '#f'
    || lower.slice(0,5) == '#true'
    || lower.slice(0,6) == '#false'
    );
}

// Breaks an expression which begins with a number into that number and
// the rest of the expression.
const splitPrefixNumber = (exp: string): [string, string] =>  {
  let s:string = '';
  let i:number = 0;

  while (isDigit(exp[i]) && i < exp.length) {
    s += exp[i];
    i++;
  }

  return [s, exp.slice(i)];
}

const splitPrefixString = (exp: string): [string, string] => {
  let s: string = '"';
  let i = 1;

  while (exp[i] != '"') {
    s += exp[i];
    i++;
  }

  s += '"';

  return [s, exp.slice(i+1)];
}

// Breaks an expression which begins with an identifier into that
// identifier and the rest of the expression.
const splitPrefixIdentifier = (exp: string): [string, string] => {
  let s: string = '';
  let i: number = 0;

  while((! isWhitespace(exp[i])) && i < exp.length && /[\"\,\'\`()\[\]\{\}\|;#]/.test(exp[0])) {
    s += exp[i];
    i++;
  }

  return [s, exp.slice(i)];
}

const splitPrefixWhitespace = (exp: string): [string, string] => {
  return [exp[0], exp.slice(1)];
}

const splitPrefixBoolean = (exp: string): [string, string] => {
  let lower = exp.slice(0, 6).toLowerCase();
  if (lower == '#false') return [lower, exp.slice(6)];
  if (lower.slice(0, 5) == '#true') return [lower.slice(0, 5), exp.slice(5)];
  return [lower.slice(0, 2), exp.slice(2)];
}

// // parse : String -> Result
// // parses a string into an SExp, making sure that nothing remains
// const parse = function(str)
// {
//   let res = parseSexp(str);
//   if (res.error == undefined && res.remain.length != 0)
//     return {error: "not s-exp", remain: res.remain};
//   if (res.error != undefined)
//     return res;
//   return res.sexp;
// };

// // parseSexp : String -> Result
// // parses an SExp String into a result
// const parseSexp = function(str)
// {
//   return parseTokens(tokenize(str));
// };
// // parseTokens : [Token] -> Result
// const parseTokens = function(tokens)
// {
//   if (tokens.length == 0)
//     return {error: "nothing to parse", remain: []};
//   let car = first(tokens);
//   let cdr = rest(tokens);
// //  if (car.value == " " || car.value == "\n")
//   //  return parseTokens(cdr);
//   if (car.value != "(" && car.value != ")" && car.value != "[" && car.value != "]")
//     return {sexp: car.value, remain: cdr};
//   if (car.value == "(")
//   {
//     let children = [];
//     let remain = cdr;
//     while (remain[0].value != ")")
//     {
//       const result = parseTokens(remain);
//       if (result.error != undefined)
//         return result;
//       children.push(result.sexp);
//       remain = result.remain;
//     }
//     return {sexp: children, remain: rest(remain)}; // skip the ) since we're in the ( case
//   }
//   if (car.value == "[")
//   {
//     let children = [];
//     let remain = cdr;
//     while (remain[0].value != "]")
//     {
//       const result = parseTokens(remain);
//       if (result.error != undefined)
//         return result;
//       children.push(result.sexp);
//       remain = result.remain;
//     }
//     return {sexp: children, remain: rest(remain)}; // skip the ) since we're in the ( case
//   }
//   // return error case for Result
//   else
//     return {error: car.value, remain: tokens};
// };
// // parseSexps : String -> [SExp]
// // parses a string as a list of sexps
// const parseSexps = function(str)
// {
//   let initialResult = parseSexp(str);
//   let result = [];
//   while (initialResult.error == undefined && initialResult.remain.length != 0)
//   {
//     result.push(initialResult.sexp);
//     initialResult = parseTokens(initialResult.remain);
//   }
//   if (initialResult.error != undefined)
//     return initialResult;
//   result.push(initialResult.sexp);
//   return result;
// };


// // A CondClause is {question: BSLExpr, answer: BSLExpr}
// // A CondExpr is [CondClause]

// // An IfExpr is {question: BSLExpr, answer: BSLExpr, otherwise: BSLExpr}

// // An Application is {name: Name, args: [BSLExpr]}

// // An AndExpr is {and: [BSLExpr]}

// // An OrExpr is {or: [BSLExpr]}

// // A Name is a String without a space or any of these chars: ",'`()[]{}|;#

// // A String is enclosed with ""

// // A Boolean is one of:
// // - true
// // - false
// // - #t
// // - #f
// // - #T
// // - #F
// // - #true
// // - #false

// // A BSLExpr is one of:
// // - Application
// // - CondExpr
// // - IfExpr
// // - AndExpr
// // - OrExpr
// // - Name
// // - Number
// // - Boolean
// // - String
// // note: BSLExpr doesn't include 'name, '(), character

// const generateExpr = function(str)
// {
//   return toBSLExpr(parse(str));  
// };

// const toBSLExpr = function(sexp)
// {
//   if (sexp.error != undefined)
//     return {error: sexp.error};
//   let expr;
//   if (Array.isArray(sexp) && (first(sexp) === "define" || first(sexp) === "define-struct"))
//     return {error: "this is a define expr"};
//   if (isLambda(sexp))
//   {
//     let args = [];
//     for (let i = 0; i < sexp[1].length; i++)
//       args.push(toBSLExpr(sexp[1][i]));
//     let body = toBSLExpr(sexp[2]);
//     expr = {args: args, body: body};    
//   }
//   else if (isCondExpr(sexp))
//   {
//     let clauses = rest(sexp);
//     expr = [];
//     while (clauses.length != 0)
//     {
//       expr.push({question: toBSLExpr(clauses[0][0]), answer: toBSLExpr(clauses[0][1])});
//       clauses = rest(clauses);  
//     }
//   }
//   else if (isIfExpr(sexp))
//   {
//     expr = {question: toBSLExpr(sexp[1]), answer: toBSLExpr(sexp[2]), otherwise: toBSLExpr(sexp[3])};
//   }
//   else if (isAndExpr(sexp))
//   {
//     let cdr = rest(sexp);
//     let bools = [];
//     while (cdr.length != 0)
//     {
//       bools.push(toBSLExpr(first(cdr)));
//       cdr = rest(cdr);  
//     }
//     expr = {and: bools};
//   }
//   else if (isOrExpr(sexp))
//   {
//     let cdr = rest(sexp);
//     let bools = [];
//     while (cdr.length != 0)
//     {
//       bools.push(toBSLExpr(first(cdr)));
//       cdr = rest(cdr);  
//     }
//     expr = {or: bools};
//   }
//   else if (isApp(sexp))
//   {
//     let name = toBSLExpr(first(sexp));
//     let args = [];
//     let cdr = rest(sexp);
//     while (cdr.length != 0)
//     {
//       args.push(toBSLExpr(first(cdr)));
//       cdr = rest(cdr); 
//     }
//     expr = {name: name, args: args};
//   }
//   else if (isName(sexp))
//   {
//     expr = {Name: sexp};    
//   }
//   else if (isNumber(sexp))
//   {
//     expr = {Num: sexp};
//   }
//   else if (isBoolean(sexp))
//   {
//     expr = {Bool: sexp};
//   }
//   else if (isString(sexp))
//   {
//     sexp = sexp.slice(1, sexp.length - 1);
//     expr = {Str: sexp};
//   }
//   else // error
//   {
//     expr = {error: "not a BSL expression."};  
//   }

//   return expr;

// };

// const isLambda = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   if (sexp[0] !== "lambda")
//     return false;
//   if (!Array.isArray(sexp[1]))
//     return false;
//   return andMap(sexp[1], (arg) => isName(arg));
// }

// const isApp = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   return isLambda(first(sexp)) || isName(first(sexp)); // could add && sexp.length > 1
// };

// const isCondExpr = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   if (first(sexp) !== "cond")
//     return false;
//   let cdr = rest(sexp);
//   let result = true;
//   while (cdr.length != 0)
//   {
//     if (!Array.isArray(first(cdr)) || first(cdr).length != 2)
//       result = false;
//     cdr = rest(cdr);
//   }
//   return result;
// };

// const isIfExpr = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   return first(sexp) === "if" && sexp.length == 4; 
// };

// const isAndExpr = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   return first(sexp) === "and" && sexp.length > 2;
// };

// const isOrExpr = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   return first(sexp) === "or" && sexp.length > 2;
// };

// const isName = function(sexp)
// {
//   if (typeof sexp !== "string")
//     return false;
//   if (sexp === "cond" || isBoolean(sexp) || isNumber(sexp) || isString(sexp))
//     return false;
//   return !/("|,|'|`|\(|\)|\[|\]|\{|\}|\||;|#)/.test(sexp);
// };

// const isNumber = function(sexp)
// {
//   if (typeof sexp !== "string")
//     return false;
//   return !/[^0-9]/.test(sexp);
// };

// const isBoolean = function(sexp)
// {
//   return sexp === "true" || sexp === "false" || sexp === "#t" || sexp === "#f" || sexp === "#T" || sexp === "#F" || sexp === "#true" || sexp === "#false";
// };

// const isString = function(sexp)
// {
//   if (typeof sexp !== "string")
//     return false;
//   return sexp[0] === "\"" && sexp[sexp.length - 1] === "\"";
// };

// // A FunctionDef is {name: Name, args: [Name], body: BSLExpr}
// // A ConstantDef is {name: Name, body: BSLExpr}
// // A StructureDef is {name: Name, fields: [Name]}

// // A DefineExpr is one of:
// // - FunctionDef
// // - ConstantDef
// // - StructureDef

// const generateDef = function(str)
// {
//   return toDefineExpr(parse(str));  
// };

// const toDefineExpr = function(sexp)
// {
//   if (sexp.error != undefined)
//     return {error: sexp.error};
//   let expr;
//   if (isFuncDef(sexp))
//   {
//     let args = [];
//     let body = toBSLExpr(sexp[sexp.length - 1]);
//     let header = sexp[1];
//     let cdr = rest(header);
//     while (cdr.length != 0)
//     {
//       args.push(toBSLExpr(first(cdr)));
//       cdr = rest(cdr);  
//     }
//     expr = {name: toBSLExpr(header[0]), args: args, body: body};
//   }
//   else if (isConstDef(sexp))
//   {
//     let name = toBSLExpr(sexp[1]);
//     let body = toBSLExpr(sexp[2]);
//     expr = {name: name, body: body};
//   }
//   else if (isStructDef(sexp))
//   {
//     let name = toBSLExpr(sexp[1]);
//     let fields = [];
//     let names = sexp[sexp.length - 1];
//     while (names.length != 0)
//     {
//       fields.push(toBSLExpr(first(names)));
//       names = rest(names);
//     }
//     expr = {name: name, fields: fields};
//   }
//   else // error case
//   {
//     expr = {error: "no"};  
//   }

//   return expr;
// };

// const isBSLExpr = function(sexp)
// {
//   let bsl = toBSLExpr(sexp);
//   return bsl.error == undefined;
// };

// const isFuncDef = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   if (sexp.length != 3)
//     return false;
//   if (first(sexp) !== "define")
//     return false;
//   if (!isBSLExpr(sexp[2]))
//     return false;
//   let header = sexp[1];
//   if (!Array.isArray(header))
//     return false;
//   return andMap(header, (x) => {return isName(x)});
// };

// const isConstDef = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   if (sexp.length != 3)
//     return false;
//   if (first(sexp) !== "define")
//     return false;
//   return isName(sexp[1]) && isBSLExpr(sexp[2]);
// };

// const isStructDef = function(sexp)
// {
//   if (typeof sexp === "string")
//     return false;
//   if (sexp.length != 3)
//     return false;
//   if (first(sexp) !== "define-struct")
//     return false;
//   if (!isName(sexp[1]))
//     return false;
//   let fields = sexp[2];
//   if (!Array.isArray(fields))
//     return false;
//   return andMap(fields, (x) => {return isName(x)});
// };

// const generateDefOrExpr = function(str)
// {
//   return toDefOrExpr(parse(str));
// };

// const toDefOrExpr = function(sexp)
// {
//   let res = toTestCase(sexp);
//   if (res.testerror != undefined)
//   {
//     res = toBSLExpr(sexp);
//     if (res.error != undefined)
//       res = toDefineExpr(sexp);
//   }
//   return res; 
// };

// const toTestCase = function(sexp)
// {
//   if (!Array.isArray(sexp) || sexp[0] !== "check-expect")
//     return {testerror: "not a test expression"};
//   if (!isBSLExpr(sexp[1] || !isBSLExpr(sexp[2])))
//     return {testerror: "expected and actual must be expressions"};
//   return {actual: toBSLExpr(sexp[1]), expected: toBSLExpr(sexp[2])};
// };

// const generateTestCase = function(str)
// {
//   return toTestCase(parse(str));
// }

// // A Program is a [[Or BSLExpr DefineExpr]]

// const generateProgram = function(str)
// {
//   return toProgram(parseSexps(str));  
// };

// const toProgram = function(sexps)
// {
//   return sexps.map(sexp => toDefOrExpr(sexp));    
// };

// // helpers
// // andMap : [X] [X -> Bool] -> Bool
// // returns true iff predicate holds for all elements of list
// const andMap = function(xs, pred)
// {
//   if (xs.length == 0)
//     return true;
//   return pred(car(xs)) && andMap(cdr(xs), pred);
// };
// const orMap = function(xs, pred)
// {
//   if (xs.length == 0)
//     return false;
//   return pred(car(xs)) || orMap(cdr(xs), pred);
// };

// module.exports.tokenize = tokenize;
// module.exports.parseSexp = parseSexp;
// module.exports.parseSexps = parseSexps;
// module.exports.space = space;
// module.exports.parse = parse;
// module.exports.generateExpr = generateExpr;
// module.exports.generateDef = generateDef;
// module.exports.generateDefOrExpr = generateDefOrExpr;
// module.exports.generateProgram = generateProgram;
// module.exports.orMap = orMap;
// module.exports.andMap = andMap;

module.exports =  {
  'tokenize': tokenize,
  'splitPrefixNumber': splitPrefixNumber,
  'splitPrefixIdentifier': splitPrefixIdentifier
};