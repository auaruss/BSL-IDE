const parse = require('../parse');

let space = parse.space;

// test tokenize

test('tokenize "100"', () => {
  expect(parse.tokenize("100")[0].type).toBe("num");
  expect(parse.tokenize("100")[0].value).toBe("100");
});

test('tokenize "(+ 1 2)"', () => {
  let tokens = parse.tokenize("(+ 1 2)");
  expect(tokens).toEqual([{type: "op", value: "("},
                          {type: "id", value: "+"},
//                          space,
                          {type: "num", value: "1"},
//                          space,
                          {type: "num", value: "2"},
                          {type: "op", value: ")"}]);
});

test('tokenize "(string-append a b)"', () => {
  let tokens = parse.tokenize("(string-append a b)");
  expect(tokens).toEqual([{type: "op", value: "("},
                          {type: "id", value: "string-append"},
  //                        space,
                          {type: "id", value: "a"},
  //                        space,
                          {type: "id", value: "b"},
                          {type: "op", value: ")"}]);
});

// test parseSexp

test('the sexp "1" should have no remainder', () => {
  expect(parse.parseSexp("1").sexp).toBe("1");
  expect(parse.parseSexp("1").remain).toEqual(parse.tokenize(""));
});

test('the sexp "+ 1 (+ 2 3))"', () => {
  expect(parse.parseSexp("+ 1 (+ 2 3))")).toEqual({sexp: "+", remain: parse.tokenize(" 1 (+ 2 3))")});
});

test('the sexp " 1 (+ 2 3))"', () => {
  expect(parse.parseSexp(" 1 (+ 2 3))")).toEqual({sexp: "1", remain: parse.tokenize(" (+ 2 3))")});
});

test('the sexp " (+ 2 3))"', () => {
  expect(parse.parseSexp(" (+ 2 3))")).toEqual({sexp: ["+", "2", "3"], remain: parse.tokenize(")")});
});

test('the sexp "(+ 2 3)"', () => {
  expect(parse.parseSexp("(+ 2 3)")).toEqual({sexp: ["+", "2", "3"], remain: parse.tokenize("")});
});

test('the sexp "+ 1 2 (+ 3 4))"', () => {
  expect(parse.parseSexp("+ 1 2 (+ 3 4))")).toEqual({sexp: "+", remain: parse.tokenize(" 1 2 (+ 3 4))")});
});

test('the sexp " 1 2 (+ 3 4))"', () => {
  expect(parse.parseSexp(" 1 2 (+ 3 4))")).toEqual({sexp: "1", remain: parse.tokenize(" 2 (+ 3 4))")});
});

test('the sexp " 2 (+ 3 4))"', () => {
  expect(parse.parseSexp(" 2 (+ 3 4))")).toEqual({sexp: "2", remain: parse.tokenize(" (+ 3 4))")});
});

test('the sexp " (+ 3 4))"', () => {
  expect(parse.parseSexp(" (+ 3 4))")).toEqual({sexp: ["+", "3", "4"], remain: parse.tokenize(")")});
});

test('the sexp "(+ 1 2 (+ 3 4))"', () => {
  expect(parse.parseSexp("(+ 1 2 (+ 3 4))")).toEqual({sexp: ["+", "1", "2", ["+", "3", "4"]], remain: parse.tokenize("")});
});

test('the sexp "((lambda (x) (+ x x)) 1 2)"', () => {
  expect(parse.parseSexp("((lambda (x) (+ x x)) 1 2)")).toEqual({sexp: [["lambda", ["x"], ["+", "x", "x"]], "1", "2"],
                                                                 remain: parse.tokenize("")});
});

// parseSexp failures

test('the non-sexp ")" should fail', () => {
  expect(parse.parseSexp(")")).toEqual({error: ")", remain: parse.tokenize(")")});
});

// test parseSexps

test('the sexp "(+ 1 1) (+ 2 2)"', () => {
  expect(parse.parseSexps("(+ 1 1) (+ 2 2)")).toEqual([["+", "1", "1"], ["+", "2", "2"]]);  
});

test('the sexp "(+ (+ 1 1) 1) (string-append (number->string a) b)"', () => {
  expect(parse.parseSexps("(+ (+ 1 1) 1) (string-append (number->string a) b)")).toEqual(
  [["+", ["+", "1", "1"], "1"], ["string-append", ["number->string", "a"], "b"]]);  
});

// parseSexps failures

test('the non-sexp "(+ 2 3))(+ 1 1)" should fail', () => {
  expect(parse.parseSexps("(+ 2 3))(+ 1 1)")).toEqual({error: ")", remain: parse.tokenize(")(+ 1 1)")});  
});

test('the non-sexp "(+ 1 1) (+ 2 2))" should fail', () => {
  expect(parse.parseSexps("(+ 1 1) (+ 2 2))")).toEqual({error: ")", remain: parse.tokenize(")")});  
});

// test generateExpr

test('the expr "(f 5)"', () => {
  expect(parse.generateExpr("(f 5)")).toEqual({name: {Name: "f"}, args: [{Num: "5"}]});  
});

test('the expr "(cond [(number? 3) true])"', () => {
  expect(parse.generateExpr("(cond [(number? 3) true])")).toEqual(
  [{question: {name: {Name: "number?"}, args: [{Num: "3"}]}, answer: {Bool: "true"}}]);  
});

test('the expr "(cond [(string=? "hello" "bye") true] [else false])"', () => {
  expect(parse.generateExpr('(cond [(string=? "hello" "bye") true] [else false])')).toEqual(
  [{question: {name: {Name: "string=?"}, args: [{Str: 'hello'},{Str: 'bye'}]}, answer: {Bool: "true"}},
   {question: {Name: "else"}, answer: {Bool: "false"}}]);  
});

test('the expr "(if #t 10 x)"', () => {
  expect(parse.generateExpr('(if #t 10 x)')).toEqual(
  {question: {Bool: '#t'}, answer: {Num: '10'}, otherwise: {Name: 'x'}});  
});

test('the expr "(and true #t false #false)"', () => {
  expect(parse.generateExpr('(and true #t false #false)')).toEqual(
  {and: [{Bool: 'true'}, {Bool: '#t'}, {Bool: 'false'}, {Bool: '#false'}]});  
});

test('the expr "(or true #t false #false)"', () => {
  expect(parse.generateExpr('(or true #t false #false)')).toEqual(
  {or: [{Bool: 'true'}, {Bool: '#t'}, {Bool: 'false'}, {Bool: '#false'}]});  
});

// test generateDef

test('the DefineExpr "(define x 10)"', () => {
  expect(parse.generateDef("(define x 10)")).toEqual(
  {name: {Name: "x"}, body: {Num: "10"}});  
});

test('the DefineExpr "(define (f x) 10)"', () => {
  expect(parse.generateDef("(define (f x) 10)")).toEqual(
  {name: {Name: "f"}, args: [{Name: "x"}], body: {Num: "10"}});  
});

test('the DefineExpr "(define-struct x [a b])"', () => {
  expect(parse.generateDef("(define-struct x [a b])")).toEqual(
  {name: {Name: "x"}, fields: [{Name: "a"}, {Name: "b"}]});  
});

// test generateProgram

test('the program "(define x 10) (+ x x)"', () => {
  expect(parse.generateProgram("(define x 10) (+ x x)")).toEqual(
  [{name: {Name: 'x'}, body: {Num: '10'}},
   {name: {Name: '+'}, args: [{Name: 'x'}, {Name: 'x'}]}]);  
});

test('the program "(define-struct car [mpg price]) (make-car 20 10000)"', () => {
  expect(parse.generateProgram("(define-struct car [mpg price]) (make-car 20 10000)")).toEqual(
  [{name: {Name: 'car'}, fields: [{Name: 'mpg'}, {Name: 'price'}]},
   {name: {Name: 'make-car'}, args: [{Num: '20'}, {Num: '10000'}]}]);  
});

test('the program to sum a list', () => {
  expect(parse.generateProgram("(define (sum xs) (cond [(empty? xs) 0] [else (+ (first xs) (sum (rest xs)))])) (sum (list 1 2 3))")).toEqual(
  [{name: {Name: 'sum'}, args: [{Name: 'xs'}], body: parse.generateExpr("(cond [(empty? xs) 0] [else (+ (first xs) (sum (rest xs)))])")},
   {name: {Name: 'sum'}, args: [{name: {Name: 'list'}, args: [{Num: '1'}, {Num: '2'}, {Num: '3'}]}]}]);  
});

