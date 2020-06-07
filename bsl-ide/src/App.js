import React from 'react';
import logo from './logo.svg';
import './App.css';
import evaluateAndOutput from './script';

function App() {
  return (
    <div class="row">
      <Interactions />
      <Evaluations />
    </div>
  );
}

function Interactions(props) {
  return (
    <div class="column">
      <textarea
        id="interactions"
        name="interactions"
        rows="40"
        cols="80"
        placeholder="Interactions"
        onInput={evaluateAndOutput}
      ></textarea>
  </div>
  );
}

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
      ></textarea>
    </div>
  );
}

export default App;
