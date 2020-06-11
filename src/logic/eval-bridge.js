// A file to bridge between Sam Soucie's evaluator and the React Evaluations component.

const { evaluate } = require("./eval");

const example = (
  '(define (fact n)\n' +
  '  (cond\n' +
  '    [(= n 0) 1]\n' +
  '    [else (* n (fact (- n 1)))]))\n' +
  '\n' +
  '(fact 3)\n' +
  '\n' +
  '(fact 5)\n' +
  '\n' +
  '(define (repeat n str)\n' +
  '  (cond\n' +
  '    [(= n 0) ""]\n' +
  '    [else (string-append str (repeat (- n 1) str))]))\n' +
  '\n' +
  '(repeat 10 "hello\\n")\n' +
  '\n' +
  '(repeat 10 "goodbye\\n")'
);

const formatEvaluation = (code) => {
  try {
    const evals = evaluate(code);
    let output = '';
    for (let elem of evals) {
      output += String(elem) + '\n';
    }
    return output;
  } catch(err) { return ''; }
}

module.exports = formatEvaluation;

