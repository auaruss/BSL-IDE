import React from 'react';
import { formatEvaluation } from '../logic/eval-bridge';

/**
 * @todo Long term idea for code spacing on the right:
 *       The right area (maybe the left area as well) will be a more complicated
 *       bit of HTML.
 */
function Evaluations(props) {
  return (
    <div class="column">
      <textarea
        id="evaluations"
        name="evaluations"
        rows="40"
        cols="80"
        placeholder="Evaluations"
        readonly="true"
        // value = {evaluate(props.code)}
        value={formatEvaluation(props.code)}
      ></textarea>
    </div>
  );
}

export default Evaluations;