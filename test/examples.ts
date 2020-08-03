const EXAMPLES: string[] = [
  '(define (fact n) (if (= n 0) 1 (* n (fact (- n 1)))))\n'
  + '(fact 20)\n'
  + '(define ',

  '(define (fact n)\n' +
  '  (if (= n 0)\n' +
  '      1\n' +
  '      (* n (fact (- n 1))))))' + // error right paren
  '(fact 5)',

  '(define background-image (empty-scene 100 100))' +
  '(define' +
  'background-image' +
  '(define (f x) (+ 1 x))'
]