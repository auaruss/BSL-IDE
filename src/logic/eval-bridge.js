import { evaluate } from './eval';

export const formatEvaluation = (code) => {
  let vals = evaluate(code);
  let output = '';
  for (let val of vals) {
    output += val.value + '\n';
  }
  return output;
}
