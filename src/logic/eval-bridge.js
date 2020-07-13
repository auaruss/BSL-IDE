import { evaluate } from './eval';

/**
 * @todo try block 
 * 
 */

export const formatEvaluation = (code) => {
  if (evaluate(code).length > 0)
    return evaluate(code)[0].value;
  return 'default';
}
