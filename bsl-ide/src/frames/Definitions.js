import React from 'react';

class Definitions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="column">
        <textarea
          id="definitions"
          name="definitions"
          rows="40"
          cols="80"
          placeholder="Definitions"
          value={this.props.code}
          onChange={this.props.handleChange} 
        />
      </div>
    );
  }
}

export default Definitions;