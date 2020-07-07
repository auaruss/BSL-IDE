// A file to bridge between Sam Soucie's evaluator and the React Evaluations component.

const { evaluate } = require("./eval").evaluate;

const formatEvaluation = (code) => {
  try {
    const evals = evaluate(code);
    let output = '';
    for (let elem of evals) {
      output += String(elem) + '\n';
    }
    return output;
  } catch(err) { console.log(err); return 'hewwo'; }
}


// const formatEvaluation = (code) => {
//   try {

//   } catch (err) { return 'hewwo';}
// }

module.exports = formatEvaluation;

