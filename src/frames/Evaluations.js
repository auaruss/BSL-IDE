import React from 'react';
import evaluateCode from '../logic/basic-eval';

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
        value={evaluateCode(props.code, eval)}
      ></textarea>
    </div>
  );
}

export default Evaluations;