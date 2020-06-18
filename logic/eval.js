'use strict';
// equal?, check-expect
// browser React 
const parse = require('./parse');
// An Env is a Map: [[Name, Value]]
// A Value is one of:
// - Number
// - Boolean
// - String
// - FunctionVal

// A FunctionVal is a JavaScript function

// array for check-expect results
let tests = [];
let testArr = [];
// setting up the base environment
// need to add conditions to make sure arity is correct
const emptyEnv = new Map();
let initialEnv = new Map();
initialEnv.set('+', function(a, b, ...rest){
  if (a == undefined || b == undefined)
    return {error: "arity mismatch"};
  if (typeof a !== "number" || typeof b !== "number" || parse.orMap(rest, (x) => typeof x !== "number"))
    return {error: "type mismatch"};
  return foldr((x, y) => x + y, a + b, rest);  });
initialEnv.set('-', function(a, b, ...rest){
  if (a == undefined || b == undefined)
    return {error: "arity mismatch"};
  if (!Number.isFinite(a) || !Number.isFinite(b) || parse.orMap(rest, (x) => !Number.isFinite(x)))
    return {error: "type mismatch"};
  let subbed = a - b;
  for (let i = 0; i < rest.length; i++)
    subbed = subbed - rest[i];
  return subbed;
});
initialEnv.set('*', function(a, b, ...rest){
  if (a == undefined || b == undefined)
    return {error: "arity mismatch or argument not defined"};
  if (!Number.isFinite(a) || !Number.isFinite(b) || parse.orMap(rest, (x) => !Number.isFinite(x)))
    return {error: "type mismatch"};
  return foldr((x, y) => x * y, a * b, rest);  
});
initialEnv.set('/', function(a, b, ...rest){
  if (a == undefined || b == undefined)
    return {error: "arity mismatch"};
  if (!Number.isFinite(a) || !Number.isFinite(b) || parse.orMap(rest, (x) => !Number.isFinite(x)))
    return {error: "type mismatch"};
  let div = a / b;
  for (let i = 0; i < rest.length; i++)
    div = div / rest[i];
  return div;
});
initialEnv.set('modulo', function(a, b, ...rest){
  if (a == undefined || b == undefined || rest.length > 0)
    return {error: "arity mismatch"};
  if (!Number.isFinite(a) || !Number.isFinite(b))
    return {error: "type mismatch"};
  return a % b; 
});
initialEnv.set('string-append', function(a, b, ...rest){
  if (a == undefined)
    return {error: "arity mismatch"};
  if (typeof a !== "string" || typeof b !== "string" || parse.orMap(rest, (x) => typeof x !== "string"))
    return {error: "type mismatch"};
  if (b == undefined)
    b = "";
  return a + b + foldr((x, y) => x + y, "", rest);  
});
initialEnv.set('=', function(a, ...rest){
  if (a == undefined)
    return {error: 'arity mismatch'};
  if (typeof a !== 'number' || parse.orMap(rest, (x) => typeof x !== 'number'))
    return {error: 'type mismatch'};
  return parse.andMap(rest, (x) => a == x);
});
initialEnv.set('else', true);
initialEnv.set('cons', (x, xs) => [x].concat(xs));
initialEnv.set('empty', []);
initialEnv.set('first', (xs) => xs[0]);
initialEnv.set('rest', (xs) => xs.slice(1));
initialEnv.set('empty?', function(x, ...args) { 
  if (x == undefined || args.length != 0)
    return {error: "arity mismatch"};
  return Array.isArray(x) && x.length == 0 
});
initialEnv.set('list', function(...args){
  return args;  
});
initialEnv.set('cons?', function(x, ...args) {
  if (x == undefined || args.length != 0)
    return {error: "arity mismatch"};
  return Array.isArray(x) && x.length > 0
});
initialEnv.set('foldr', function(f, base, ls, ...rest){
  if (f == undefined || base == undefined || ls == undefined || rest.length > 0)
    return {error: "arity mismatch"};
  return foldr(f, base, ls);
});
initialEnv.set('filter', function(pred, ls, ...rest){
  if (pred == undefined || ls == undefined || rest.length > 0)
    return {error: "arity mismatch"};
  return filter(pred, ls);
});
initialEnv.set('map', function(op, ls, ...rest) {
  if (op == undefined || ls == undefined || rest.length > 0)
    return {error: 'arity mismatch'};
  return map(op, ls);
});
initialEnv.set('string=?', function(a, b, ...rest){
  if (a == undefined || b == undefined)
    return {error: 'arity mismatch'};
  if (typeof a !== 'string' || typeof b !== 'string' || parse.orMap(rest, (s) => typeof s !== 'string'))
    return {error: 'type error'};
  return a == b && parse.andMap(rest, (s) => a == s);
});
initialEnv.set('substring', function(s, n, ...rest){
  if (rest.length > 1 || s == undefined || n == undefined)
    return {error: 'arity mismatch'};
  if (typeof s !== 'string' || typeof n !== 'number' || parse.orMap(rest, (n) => typeof n !== 'number'))
    return {error: 'type mismatch'};
  if (rest.length == 0)
    return s.slice(n);
  return s.slice(n, rest[0]);
});
initialEnv.set('number->string', function(n, ...rest){
  if (rest.length != 0)
    return {error: 'arity mismatch'};
  if (typeof n !== 'number')
    return {error: 'type error'};
  return String(n);
});
initialEnv.set('append' , function(xs, ys, ...rest){
  if (rest.length != 0)
    return {error: 'arity mismatch'};
  if (!Array.isArray(xs) || !Array.isArray(ys))
    return {error: 'type error'};
  return xs.concat(ys);
});
initialEnv.set('equal?', function(x, y, ...rest){
  if (rest.length != 0)
    return {error: 'arity mismatch'};
  return equal(x, y);
});

const evalDef = function(str, env)
{
  let expr = parse.generateDefOrExpr(str);
  return evalDefExpr(expr, env);
};
// evalDefExpr : DefineExpr Env -> [Maybe Error]
// either extends the env or returns an error
const evalDefExpr = function(expr, env)
{
  if (expr.name != undefined && expr.body != undefined && expr.args != undefined)
  {
    if (evalExpr(expr.name, env) != undefined)
      return {error: expr.name.Name + " is already defined"};
    env.set(expr.name.Name, function(...args){
      if (args.length != expr.args.length)
        return {error: "arity mismatch"};
      let newEnv = new Map(env);
      for (let i = 0; i < expr.args.length; i++)
      {
        newEnv.set(expr.args[i].Name, args[i]);
      }  
      return evalExpr(expr.body, newEnv);
    });
  }
  else if (expr.name != undefined && expr.body != undefined)
  {
    if (evalExpr(expr.name, env) != undefined)
      return {error: expr.name.Name + " is already defined"};
    env.set(expr.name.Name, evalExpr(expr.body, env)); 
  }  
  else if (expr.name != undefined && expr.fields != undefined)
  {
    let structName = expr.name.Name;
    if (evalStrExpr('make-' + structName, env) != undefined)
      return {error: structName + " is already defined"};
    env.set('make-' + structName, function(...args) {
      if (args.length != expr.fields.length)
        return {error: "arity mismatch"};
      let struct = new Map();
      for (let i = 0; i < args.length; i++)
      {
//        let possibleVal = evalExpr(args[i], env); // arg could be constant
//        if (possibleVal == undefined)
          struct.set(expr.fields[i].Name, args[i]);
//        else
//          struct.set(expr.fields[i].Name, possibleVal);
      }
      return {[structName]: struct};
    });  
    env.set(structName + '?', function(x, ...rest){
      if (rest.length > 0)
        return {error: "arity mismatch"};
      if (x.toString() !== '[object Object]')
        return false;
      if (Object.entries(x)[0][0] != structName) // dumb but works
        return false;
      if (x[structName].toString() !== "[object Map]")
        return false;
      if (x[structName].size != expr.fields.length)
        return false;
      for (let i = 0; i < expr.fields.length; i++)
      {
        if (!x[structName].has(expr.fields[i].Name))
          return false;  
      }
      return true;
    });
    for (let i = 0; i < expr.fields.length; i++)
    {
      let currField = expr.fields[i].Name;
      env.set(structName + "-" + currField, function(structure, ...rest){
        if (rest.length > 0)
          return {error: "arity mismatch"};
        return structure[structName].get(currField);
      });
    }
  }
  else
    return {deferror: "not a define expression"};
};

const evalTestCase = function(expr, env)
{
  if (expr.actual != undefined && expr.expected != undefined)
    return equal(evalExpr(expr.actual, env), evalExpr(expr.expected, env));
  return {testerror: 'not a test expression'};
};

const evalDefOrExpr = function(expr, env)
{
  if (expr.actual != undefined && expr.expected != undefined)
  {
    testArr.push(expr);
    return;
  }
  let val = evalDefExpr(expr, env);
  if (val != undefined && val.deferror != undefined)
    val = evalExpr(expr, env);
  return val;
};

const evalStr = function(str, env)
{
  const expr = parse.generateDefOrExpr(str);
  return evalDefOrExpr(expr, env); 
};

const evalStrExpr = function(str, env)
{
  let expr = parse.generateDefOrExpr(str);
  return evalExpr(expr, env); 
};

const evalExpr = function(expr, env)
{
  if (expr.Num != undefined)
    return Number(expr.Num); // BigInt? 
  if (expr.Str != undefined)
    return expr.Str;
  if (expr.Bool != undefined)
  {
    let val = (expr.Bool === 'false' || expr.Bool === '#false' || expr.Bool === '#f' || expr.Bool === '#F') ? 0 : 1;
    return Boolean(val);
  }  
  if (expr.Name != undefined)
  {
    return env.get(expr.Name);
  }
  if (expr.or != undefined)
    return parse.orMap(expr.or, (x) => evalExpr(x, env) == true);
  if (expr.and != undefined)
    return parse.andMap(expr.and, (x) => evalExpr(x, env) == true);
  if (Array.isArray(expr)) // wrap in cond: ?
  {
    while (expr.length != 0)
    {
      if (evalExpr(expr[0].question, env))
        return evalExpr(expr[0].answer, env);
      expr = expr.slice(1);
    }
  }
  if (expr.question != undefined && expr.answer != undefined && expr.otherwise != undefined)
  {
    let pred = evalExpr(expr.question, env);
    if (pred)
    {
      let conseq = evalExpr(expr.answer, env);
      return conseq;
    }
    let ow = evalExpr(expr.otherwise, env);
    return ow;
  }
  if (expr.name != undefined && expr.args != undefined)
  {
    let evalArgs = expr.args.map(arg => evalExpr(arg, env));
    let evalName = evalExpr(expr.name, env);
    return evalName.apply(this, evalArgs);
  }
  if (expr.args != undefined && expr.body != undefined)
  {
    return function(...args){
      if (args.length != expr.args.length)
        return {error: "arity mismatch"};
      let newEnv = new Map(env);
      for (let i = 0; i < expr.args.length; i++)
      {
        newEnv.set(expr.args[i].Name, args[i]);
      }  
      return evalExpr(expr.body, newEnv);
    };
  }
};

const testExprToString = function(expr)
{
  return '(check-expect ' + exprToString(expr.actual) + ' ' + exprToString(expr.expected) + ')';
};

const exprToString = function(expr)
{
  if (expr.Name != undefined)
    return String(expr.Name);
  if (expr.Num != undefined)
    return String(expr.Num);
  if (expr.Str != undefined)
    return '"' + expr.Str + '"';
  if (expr.Bool != undefined)
    return String(expr.Bool);
  if (expr.name != undefined && expr.args != undefined)
  {
    let argsStr = "";
    for (let i = 0; i < expr.args.length; i++)
      argsStr += " " + exprToString(expr.args[i]);
    return "(" + exprToString(expr.name) + argsStr + ")"; 
  }
};

const evalProgram = function(str, env)
{
  let program = parse.generateProgram(str);
  let res = program.map((exp) => evalDefOrExpr(exp, env));
  res = res.filter((e) => e != undefined);
  tests = testArr.map(t => evalTestCase(t, env));
  if (tests.length == 0);
  else if (!tests.includes(false))
    console.log("All tests passed!");
  else
  {
    let ts = 0, fs = 0;
    for (let i = 0; i < tests.length; i++)
      tests[i] == true ? ts++ : fs++;
    console.log(ts + " tests passed, and " + fs + " tests failed.");
    console.log("The failing tests are: ");
    for (let i = 0; i < testArr.length; i++)
      if (tests[i] == false)  
        console.log(testExprToString(testArr[i]));
  }
  testArr = [];
  tests = [];
  return res;
};

// evaluates the program with initialEnv
const evaluate = function(str)
{
  return evalProgram(str, initialEnv);  
};

const foldr = function(f, base, ls)
{
  if (ls.length == 0)
    return base;
  return f(ls[0], foldr(f, base, ls.splice(1)));
};

const filter = function(pred, ls)
{
  if (ls.length == 0)
    return [];
  if (pred(ls[0]))
    return [ls[0]].concat(filter(pred, ls.slice(1)));
  return filter(pred, ls.slice(1));
};

const map = function(op, ls)
{
  if (ls.length == 0)
    return [];
  return [op(ls[0])].concat(map(op, ls.slice(1)));
};

const equal = function(x, y)
{
  if (typeof x !== typeof y)
    return false;
  if ((Array.isArray(x) && !Array.isArray(y)) || (Array.isArray(y) && !Array.isArray(x)))
    return false;
  if (Array.isArray(x) && Array.isArray(y))
  {
    if (x.length != y.length)
      return false;
    for (let i = 0; i < x.length; i++)
    {
      let b = equal(x[i], y[i]);
      if (!b)
        return false;
    }
    return true;
  }
  if (typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean')
    return x === y;
  // testing if structs are equal
  if (typeof x === 'object')
  {
    let xName = Object.keys(x);
    let yName = Object.keys(y);
    let xVals = Array.from(Object.values(x)[0].values());
    let yVals = Array.from(Object.values(y)[0].values());
    return equal(xName, yName) && equal(xVals, yVals);
  }
  return false;
};

// using the interpreter to define the language
// damn this shit is cool
evaluate('(define-struct posn [x y])');

module.exports.evalStrExpr = evalStrExpr;
module.exports.evalDef = evalDef;
module.exports.evalProgram = evalProgram;
module.exports.evaluate = evaluate;
module.exports.emptyEnv = emptyEnv;
module.exports.initialEnv = initialEnv;
