import React from 'react';
import logo from './logo.svg';
import './App.css';
import evaluateAndOutput from './script';
import Definitions from './frames/Definitions';
import Evaluations from './frames/Evaluations';

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
        <Definitions
          code = {this.state.code}
          handleChange = {this.handleChange}
        />
        <Evaluations code={this.state.code}/>
      </div>
    );
  }
}

export default App;
