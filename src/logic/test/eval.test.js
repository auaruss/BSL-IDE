const eva = require('../eval');
const util = require('util');

// simple values

test('the BSLExpr {Num: "3"} should have value 3', () => {
  expect(eva.evalStrExpr("3", eva.emptyEnv)).toBe(3); 
});
test('the BSLExpr {Bool: "#t"} should have value true', () => {
  expect(eva.evalStrExpr("#t", eva.emptyEnv)).toBe(true); 
});
test('the BSLExpr {Str: "hello"} should have value "hello"', () => {
  expect(eva.evalStrExpr('"hello"', eva.emptyEnv)).toEqual('hello'); 
});

// arithmetic

test('the expression (+ 1 2) should have value 3', () => {
  expect(eva.evalStrExpr("(+ 1 2)", eva.initialEnv)).toBe(3);  
});
test('the expression (+ 1 (* 3 4)) should have value 13', () => {
  expect(eva.evalStrExpr("(+ 1 (* 3 4))", eva.initialEnv)).toBe(13);  
});
test('the expression (string-append "hello" "there!") should have value "hello there!"', () => {
  expect(eva.evalStrExpr('(string-append "hello" "there!")', eva.initialEnv)).toEqual("hellothere!");  
});

// evaluate definitions, expressions, and programs

test('the string "(define x 10)" should extend the environment', () => {
  const envSize = eva.initialEnv.size;
  expect(eva.evaluate('(define x 10)')).toEqual([]);
  expect(eva.initialEnv.size).toBe(envSize + 1);
  expect(eva.evaluate('x')).toEqual([10]);
});
test('the string "(define (f x) (+ x x))" should extend the environment', () => {
  const envSize = eva.initialEnv.size;
  expect(eva.evaluate('(define (f x) (+ x x))')).toEqual([]);
  expect(eva.initialEnv.size).toBe(envSize + 1);
  expect(eva.evaluate('(f 10)')).toEqual([20]);
});
test('the string "(define-struct car [mpg price])" should extend the environment', () => {
  const envSize = eva.initialEnv.size;
  expect(eva.evaluate('(define-struct car [mpg price])')).toEqual([]);
  expect(eva.initialEnv.size).toBe(envSize + 4); // adds 4 functions
  expect(eva.evaluate('(car? (make-car 20 1000)) (car-mpg (make-car 20 1000)) (car-price (make-car 20 1000))')).toEqual([true, 20, 1000]);
});
test('the factorial program', () => {
  expect(eva.evaluate("(define (fact n) (cond [(= 0 n) 1] [else (* n (fact (- n 1)))]))")).toEqual([]);
  expect(eva.evaluate('(fact 5)')).toEqual([120]);
});

// if exprs
test('even? odd? mutual recursion', () => {
  expect(eva.evaluate("(define (even? n) (if (= 0 n) true (odd? (- n 1)))) (define (odd? n) (if (= 0 n) #f (even? (- n 1))))")).toEqual([]);
  expect(eva.evaluate('(even? 3) (even? 4) (odd? 19) (odd? 20)')).toEqual([false, true, true, false]);
});

// assignment 3 211
test('assignment 3 from c211 (without images or comments)', () => {
  expect(eva.evaluate(`(define (format-month m f)(cond [(string=? f "long") m][(string=? f "short") (substring m 0 3)]))
                       (check-expect (format-month "November" "long") "November")
                       (check-expect (format-month "November" "short") "Nov")`)).toEqual([]);
  expect(eva.evaluate('(define (year-month-day->date y m d o f)'+
  '(cond [(string=? o "MDY")'+
         '(string-append (format-month m f) " " (number->string d) ", " (number->string y))]'+
        '[(string=? o "DMY")'+
         '(string-append (number->string d) " " (format-month m f)  " " (number->string y))]))'+
         '(check-expect (year-month-day->date 1936 "November" 12 "MDY" "long") "November 12, 1936")'+
         '(check-expect (year-month-day->date 1936 "November" 12 "MDY" "short") "Nov 12, 1936")'+
         '(check-expect (year-month-day->date 1936 "November" 12 "DMY" "long") "12 November 1936")'+
         '(check-expect (year-month-day->date 1936 "November" 12 "DMY" "short") "12 Nov 1936")')).toEqual([]);
});

// lab 12 211
test('lab 12 from c211 (generative recursion)', () => {
  expect(eva.evaluate('(define (power x p)'+ 
                        '(cond [(= 0 p) 1]'+ 
                              '[else (* x (power x (- p 1)))]))'+
                      '(check-expect (power 2 3) 8)'+
                      '(check-expect (power 100 0) 1)')).toEqual([]);

  expect(eva.evaluate('(define-struct zeroth [])'+
                      '(define-struct oddth  [sub1])'+
                      '(define-struct eventh [half])'+
                      '(define (power-tree-exponent pt)'+
                        '(cond [(zeroth? pt) 0]'+
                              '[(oddth?  pt) (+ 1 (power-tree-exponent (oddth-sub1  pt)))]'+
                              '[(eventh? pt) (* 2 (power-tree-exponent (eventh-half pt)))]))')).toEqual([]);


  expect(eva.evaluate('(define (generate-power-tree n)'+
                        '(cond [(= 0 n) (make-zeroth)]'+
                              '[(= 0 (modulo n 2)) (make-eventh (generate-power-tree (/ n 2)))]'+
                              '[else (make-oddth (generate-power-tree (- n 1)))]))'+
                      '(check-expect (power-tree-exponent (generate-power-tree 10000)) 10000)'+
                      '(check-expect (power-tree-exponent (generate-power-tree 9)) 9)'+
                      '(check-expect (power-tree-exponent (generate-power-tree 0)) 0)'+
                      '(check-expect (generate-power-tree 0)'+
                                    '(make-zeroth))'+
                      '(check-expect (generate-power-tree 1)'+
                                    '(make-oddth (make-zeroth)))'+
                      '(check-expect (generate-power-tree 2)'+
                                    '(make-eventh (make-oddth (make-zeroth))))'+
                      '(check-expect (generate-power-tree 4)'+
                                    '(make-eventh (make-eventh (make-oddth (make-zeroth)))))'+
                      '(check-expect (generate-power-tree 9)'+
                                    '(make-oddth (make-eventh (make-eventh'+
                                     '(make-eventh (make-oddth (make-zeroth)))))))')).toEqual([]);

  expect(eva.evaluate('(define (power-tree-result x pt)'+
                        '(cond [(zeroth? pt) 1]'+
                              '[(eventh? pt) (* (power-tree-result x (eventh-half pt))'+
                                               '(power-tree-result x (eventh-half pt)))]'+
                              '[(oddth? pt) (* x (power-tree-result x (oddth-sub1 pt)))]))'+
                      '(define (fast-power x n)'+
                        '(power-tree-result x (generate-power-tree n)))'+
                      '(check-expect (fast-power 2 3) 8)'+
                      '(check-expect (fast-power 2 5) 32)')).toEqual([]);
});

// c211 prefix trees!
test('prefix trees', () => {
  let str1 = 
`
(define-struct end [])
(define-struct initial [letter forest])
(define tree1
  (make-initial "o"
            (list (make-initial "n" (list
                                   (make-end)
                                   (make-initial "e" (list (make-end)))))
                  (make-initial "f" (list
                                   (make-end)
                                   (make-initial "f" (list (make-end)))
                                   (make-initial "t" (list (make-end)))))
                  (make-initial "r" (list (make-end))))))
(define (add-to-forest w pf)
  (cond [(empty? w) pf]
        [(empty? (rest pf)) (if (and (initial? (first pf))
                                     (string=? (first w) (initial-letter (first pf))))
                                (list (add-to-tree w (first pf)))
                                (cons (word->tree w) pf))]
        [else (if (and (initial? (first pf)) (string=? (first w) (initial-letter (first pf))))
                  (cons (add-to-tree w (first pf)) (rest pf))
                  (cons (first pf) (add-to-forest w (rest pf))))]))
(define (add-to-tree w pt)
  (cond [(end? pt) (word->tree w)]
        [else (make-initial (first w) (add-to-forest (rest w) (initial-forest pt)))]))
(define (word->tree w)
  (cond [(empty? w) (make-end)]
        [else (make-initial (first w) (list (word->tree (rest w))))]))
(define tree2 (make-initial "t"
                         (list (make-initial "o" (list
                                               (make-end)
                                               (make-initial "n" (list (make-end)))))
                               (make-initial "h" (list
                                               (make-initial "e" (list (make-end)))
                                               (make-initial "y" (list (make-end))))))))

(define tree3 (make-initial "s"
                         (list (make-initial "o" (list
                                               (make-end)
                                               (make-initial "n" (list (make-end)))))
                               (make-initial "a" (list
                                               (make-initial "m" (list
                                                               (make-end)
                                                               (make-initial "e"
                                                                          (list (make-end))))))))))

(define forest1 (list tree1))
(define forest2 (list tree2 tree3))

(define (tree->list pt)
  (cond [(end? pt) (list "")]
        [else (map (lambda (s) (string-append (initial-letter pt) s))
                   (forest->list (initial-forest pt)))]))

(define (forest->list pf)
  (cond [(empty? (rest pf)) (tree->list (first pf))]
        [else (append (tree->list (first pf))
                      (forest->list (rest pf)))]))

(tree->list tree1)
(tree->list (add-to-tree (list "o" "f" "t" "e" "n") tree1))
(check-expect (word->tree (list "h" "e" "y"))
              (make-initial "h"
                            (list (make-initial "e"
                                                (list (make-initial "y" (list (make-end))))))))
(check-expect tree1 tree1)

`;
expect(eva.evaluate(str1)).toEqual([ [ 'on', 'one', 'of', 'off', 'oft', 'or' ],
                                     [ 'on', 'one', 'of', 'off', 'often', 'oft', 'or' ] ]);
});

// test equal? 

test('equal?', () => {
  let str = 
  `
    (equal? 1 1)
    (equal? (+ 1 2) 3)
    (equal? (* 2 2) (* 4 1))
    (equal? true #t)
    (equal? "hello" "hello")
    (define-struct x [y z])
    (equal? (make-x 1 1) (make-x 1 1))
    (define x1 (make-x 10 20))
    (equal? (make-x 10 20) x1)
    (equal? (make-x (+ 1 1) 10) (make-x 2 (+ 5 5)))
    (equal? (list 1 2 3) (list 1 2 3))
    (equal? (list x1 (make-x 10 20)) (list (make-x 10 20) x1))
  `
  let ev = eva.evaluate(str);
  expect(ev.length).toBe(10);
  expect(ev).toContain(true);
  expect(ev).not.toContain(false);
});
