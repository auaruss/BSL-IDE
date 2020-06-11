'use strict';
// SExpr Parser in JS
// Sam Soucie

// An SExp is one of:
// - String
// - [SExp]

// A Result is one of:
// - {sexp: SExp, remain: [Token]}
// - {error: String, remain: String}

const space = {type: "ws", value: " "};

// A TType is one of:
// - "num"
// - "id"
// - "op"
// - space
// interpretation: "num" = numerical val, "op" = parens, "id" = identifier

// A Token is {type: TType, value: String}

// tokenize : String -> [Token]
// tokenizes a given string
const tokenize = function(exp)
{
  let tokens = [];
  let i = 0;
  while (i < exp.length)
  {
      let ch = exp[i];
      if (isDig(ch))
      {
        let num = ch;
        while (isDig(exp[++i]))
          num += exp[i];
        tokens.push({type: "num", value: num});
      }
      else if (ch == '"')
      {
        let str = ch;
        while(exp[++i] != '"')
          str += exp[i];
        str += exp[i++];
        tokens.push({type: "id", value: str});
      }
      else if (isId(ch))
      {
        let name = ch;
        while(isId(exp[++i]) || isDig(exp[i]))
          name += exp[i];
        tokens.push({type: "id", value: name});
      }
      else if (isOp(ch))
      {
        i++;
        tokens.push({type: "op", value: ch});
      }
      else if (isWS(ch)) {
        i++;
//        tokens.push(space);
      }
  }
  return tokens;
};

// parse : String -> Result
// parses a string into an SExp, making sure that nothing remains
const parse = function(str)
{
  let res = parseSexp(str);
  if (res.error == undefined && res.remain.length != 0)
    return {error: "not s-exp", remain: res.remain};
  if (res.error != undefined)
    return res;
  return res.sexp;
};

// parseSexp : String -> Result
// parses an SExp String into a result
const parseSexp = function(str)
{
  return parseTokens(tokenize(str));
};
// parseTokens : [Token] -> Result
const parseTokens = function(tokens)
{
  if (tokens.length == 0)
    return {error: "nothing to parse", remain: []};
  let car = first(tokens);
  let cdr = rest(tokens);
//  if (car.value == " " || car.value == "\n")
  //  return parseTokens(cdr);
  if (car.value != "(" && car.value != ")" && car.value != "[" && car.value != "]")
    return {sexp: car.value, remain: cdr};
  if (car.value == "(")
  {
    let children = [];
    let remain = cdr;
    while (remain[0].value != ")")
    {
      const result = parseTokens(remain);
      if (result.error != undefined)
        return result;
      children.push(result.sexp);
      remain = result.remain;
    }
    return {sexp: children, remain: rest(remain)}; // skip the ) since we're in the ( case
  }
  if (car.value == "[")
  {
    let children = [];
    let remain = cdr;
    while (remain[0].value != "]")
    {
      const result = parseTokens(remain);
      if (result.error != undefined)
        return result;
      children.push(result.sexp);
      remain = result.remain;
    }
    return {sexp: children, remain: rest(remain)}; // skip the ) since we're in the ( case
  }
  // return error case for Result
  else
    return {error: car.value, remain: tokens};
};
// parseSexps : String -> [SExp]
// parses a string as a list of sexps
const parseSexps = function(str)
{
  let initialResult = parseSexp(str);
  let result = [];
  while (initialResult.error == undefined && initialResult.remain.length != 0)
  {
    result.push(initialResult.sexp);
    initialResult = parseTokens(initialResult.remain);
  }
  if (initialResult.error != undefined)
    return initialResult;
  result.push(initialResult.sexp);
  return result;
};


// A CondClause is {question: BSLExpr, answer: BSLExpr}
// A CondExpr is [CondClause]

// An IfExpr is {question: BSLExpr, answer: BSLExpr, otherwise: BSLExpr}

// An Application is {name: Name, args: [BSLExpr]}

// An AndExpr is {and: [BSLExpr]}

// An OrExpr is {or: [BSLExpr]}

// A Name is a String without a space or any of these chars: ",'`()[]{}|;#

// A String is enclosed with ""

// A Boolean is one of:
// - true
// - false
// - #t
// - #f
// - #T
// - #F
// - #true
// - #false

// A BSLExpr is one of:
// - Application
// - CondExpr
// - IfExpr
// - AndExpr
// - OrExpr
// - Name
// - Number
// - Boolean
// - String
// note: BSLExpr doesn't include 'name, '(), character

const generateExpr = function(str)
{
  return toBSLExpr(parse(str));  
};

const toBSLExpr = function(sexp)
{
  if (sexp.error != undefined)
    return {error: sexp.error};
  let expr;
  if (Array.isArray(sexp) && (first(sexp) === "define" || first(sexp) === "define-struct"))
    return {error: "this is a define expr"};
  if (isLambda(sexp))
  {
    let args = [];
    for (let i = 0; i < sexp[1].length; i++)
      args.push(toBSLExpr(sexp[1][i]));
    let body = toBSLExpr(sexp[2]);
    expr = {args: args, body: body};    
  }
  else if (isCondExpr(sexp))
  {
    let clauses = rest(sexp);
    expr = [];
    while (clauses.length != 0)
    {
      expr.push({question: toBSLExpr(clauses[0][0]), answer: toBSLExpr(clauses[0][1])});
      clauses = rest(clauses);  
    }
  }
  else if (isIfExpr(sexp))
  {
    expr = {question: toBSLExpr(sexp[1]), answer: toBSLExpr(sexp[2]), otherwise: toBSLExpr(sexp[3])};
  }
  else if (isAndExpr(sexp))
  {
    let cdr = rest(sexp);
    let bools = [];
    while (cdr.length != 0)
    {
      bools.push(toBSLExpr(first(cdr)));
      cdr = rest(cdr);  
    }
    expr = {and: bools};
  }
  else if (isOrExpr(sexp))
  {
    let cdr = rest(sexp);
    let bools = [];
    while (cdr.length != 0)
    {
      bools.push(toBSLExpr(first(cdr)));
      cdr = rest(cdr);  
    }
    expr = {or: bools};
  }
  else if (isApp(sexp))
  {
    let name = toBSLExpr(first(sexp));
    let args = [];
    let cdr = rest(sexp);
    while (cdr.length != 0)
    {
      args.push(toBSLExpr(first(cdr)));
      cdr = rest(cdr); 
    }
    expr = {name: name, args: args};
  }
  else if (isName(sexp))
  {
    expr = {Name: sexp};    
  }
  else if (isNumber(sexp))
  {
    expr = {Num: sexp};
  }
  else if (isBoolean(sexp))
  {
    expr = {Bool: sexp};
  }
  else if (isString(sexp))
  {
    sexp = sexp.slice(1, sexp.length - 1);
    expr = {Str: sexp};
  }
  else // error
  {
    expr = {error: "not a BSL expression."};  
  }

  return expr;

};

const isLambda = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  if (sexp[0] !== "lambda")
    return false;
  if (!Array.isArray(sexp[1]))
    return false;
  return andMap(sexp[1], (arg) => isName(arg));
}

const isApp = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  return isLambda(first(sexp)) || isName(first(sexp)); // could add && sexp.length > 1
};

const isCondExpr = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  if (first(sexp) !== "cond")
    return false;
  let cdr = rest(sexp);
  let result = true;
  while (cdr.length != 0)
  {
    if (!Array.isArray(first(cdr)) || first(cdr).length != 2)
      result = false;
    cdr = rest(cdr);
  }
  return result;
};

const isIfExpr = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  return first(sexp) === "if" && sexp.length == 4; 
};

const isAndExpr = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  return first(sexp) === "and" && sexp.length > 2;
};

const isOrExpr = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  return first(sexp) === "or" && sexp.length > 2;
};

const isName = function(sexp)
{
  if (typeof sexp !== "string")
    return false;
  if (sexp === "cond" || isBoolean(sexp) || isNumber(sexp) || isString(sexp))
    return false;
  return !/("|,|'|`|\(|\)|\[|\]|\{|\}|\||;|#)/.test(sexp);
};

const isNumber = function(sexp)
{
  if (typeof sexp !== "string")
    return false;
  return !/[^0-9]/.test(sexp);
};

const isBoolean = function(sexp)
{
  return sexp === "true" || sexp === "false" || sexp === "#t" || sexp === "#f" || sexp === "#T" || sexp === "#F" || sexp === "#true" || sexp === "#false";
};

const isString = function(sexp)
{
  if (typeof sexp !== "string")
    return false;
  return sexp[0] === "\"" && sexp[sexp.length - 1] === "\"";
};

// A FunctionDef is {name: Name, args: [Name], body: BSLExpr}
// A ConstantDef is {name: Name, body: BSLExpr}
// A StructureDef is {name: Name, fields: [Name]}

// A DefineExpr is one of:
// - FunctionDef
// - ConstantDef
// - StructureDef

const generateDef = function(str)
{
  return toDefineExpr(parse(str));  
};

const toDefineExpr = function(sexp)
{
  if (sexp.error != undefined)
    return {error: sexp.error};
  let expr;
  if (isFuncDef(sexp))
  {
    let args = [];
    let body = toBSLExpr(sexp[sexp.length - 1]);
    let header = sexp[1];
    let cdr = rest(header);
    while (cdr.length != 0)
    {
      args.push(toBSLExpr(first(cdr)));
      cdr = rest(cdr);  
    }
    expr = {name: toBSLExpr(header[0]), args: args, body: body};
  }
  else if (isConstDef(sexp))
  {
    let name = toBSLExpr(sexp[1]);
    let body = toBSLExpr(sexp[2]);
    expr = {name: name, body: body};
  }
  else if (isStructDef(sexp))
  {
    let name = toBSLExpr(sexp[1]);
    let fields = [];
    let names = sexp[sexp.length - 1];
    while (names.length != 0)
    {
      fields.push(toBSLExpr(first(names)));
      names = rest(names);
    }
    expr = {name: name, fields: fields};
  }
  else // error case
  {
    expr = {error: "no"};  
  }

  return expr;
};

const isBSLExpr = function(sexp)
{
  let bsl = toBSLExpr(sexp);
  return bsl.error == undefined;
};

const isFuncDef = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  if (sexp.length != 3)
    return false;
  if (first(sexp) !== "define")
    return false;
  if (!isBSLExpr(sexp[2]))
    return false;
  let header = sexp[1];
  if (!Array.isArray(header))
    return false;
  return andMap(header, (x) => {return isName(x)});
};

const isConstDef = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  if (sexp.length != 3)
    return false;
  if (first(sexp) !== "define")
    return false;
  return isName(sexp[1]) && isBSLExpr(sexp[2]);
};

const isStructDef = function(sexp)
{
  if (typeof sexp === "string")
    return false;
  if (sexp.length != 3)
    return false;
  if (first(sexp) !== "define-struct")
    return false;
  if (!isName(sexp[1]))
    return false;
  let fields = sexp[2];
  if (!Array.isArray(fields))
    return false;
  return andMap(fields, (x) => {return isName(x)});
};

const generateDefOrExpr = function(str)
{
  return toDefOrExpr(parse(str));
};

const toDefOrExpr = function(sexp)
{
  let res = toTestCase(sexp);
  if (res.testerror != undefined)
  {
    res = toBSLExpr(sexp);
    if (res.error != undefined)
      res = toDefineExpr(sexp);
  }
  return res; 
};

const toTestCase = function(sexp)
{
  if (!Array.isArray(sexp) || sexp[0] !== "check-expect")
    return {testerror: "not a test expression"};
  if (!isBSLExpr(sexp[1] || !isBSLExpr(sexp[2])))
    return {testerror: "expected and actual must be expressions"};
  return {actual: toBSLExpr(sexp[1]), expected: toBSLExpr(sexp[2])};
};

const generateTestCase = function(str)
{
  return toTestCase(parse(str));
}

// A Program is a [[Or BSLExpr DefineExpr]]

const generateProgram = function(str)
{
  return toProgram(parseSexps(str));  
};

const toProgram = function(sexps)
{
  return sexps.map(sexp => toDefOrExpr(sexp));    
};

// helpers
// andMap : [X] [X -> Bool] -> Bool
// returns true iff predicate holds for all elements of list
const andMap = function(xs, pred)
{
  if (xs.length == 0)
    return true;
  return pred(first(xs)) && andMap(rest(xs), pred);
};
const orMap = function(xs, pred)
{
  if (xs.length == 0)
    return false;
  return pred(first(xs)) || orMap(rest(xs), pred);
};

// appendAll : [String] -> String
const appendAll = function(los)
{
  if (los.length == 0)
    return "";
  return first(los) + appendAll(rest(los));
};

// cons : X [X] -> [X]
const cons = function(x, xs)
{
  return [x].concat(xs);
};

// first : [X] -> X
const first = function(xs)
{
  return xs[0];  
};

// rest : [X] -> [X]
const rest = function(xs)
{
  return xs.slice(1);  
};

// isOp : String -> Bool
const isOp = function(ch)
{
    return /[()\[\]]/.test(ch);
};

// isId : String -> Bool
const isId = function(ch)
{
    return typeof ch === "string" && !isOp(ch) && !isDig(ch) && !isWS(ch);
};

// isDig : String -> Bool
const isDig = function(ch)
{
    return /[0-9]/.test(ch);
};

// is WS : String -> Bool
const isWS = function(ch)
{
    return /\s/.test(ch);
};
module.exports.tokenize = tokenize;
module.exports.parseSexp = parseSexp;
module.exports.parseSexps = parseSexps;
module.exports.space = space;
module.exports.parse = parse;
module.exports.generateExpr = generateExpr;
module.exports.generateDef = generateDef;
module.exports.generateDefOrExpr = generateDefOrExpr;
module.exports.generateProgram = generateProgram;
module.exports.orMap = orMap;
module.exports.andMap = andMap;
