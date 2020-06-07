import React from 'react';
import logo from './logo.svg';
import './App.css';
import evaluateAndOutput from './script';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }
  
  handleChange(e) {
    this.setState({code: e.target.value});
  }

  render() {
    return (
      <div class="row">
        <Interactions
          code = {this.state.code}
          handleChange = {this.handleChange}
        />
        <Evaluations code={this.state.code}/>
      </div>
    );
  }
}

class Interactions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="column">
        <textarea
          id="interactions"
          name="interactions"
          rows="40"
          cols="80"
          placeholder="Interactions"
          value={this.props.code}
          onChange={this.props.handleChange} 
        />
      </div>
    );
  }
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
        value={props.code}
      ></textarea>
    </div>
  );
}

export default App;
