import React from 'react';
import ReactDOM from 'react-dom';

export class Inputs extends React.Component {

  constructor(props) {
    super(props);

    this.state = Object.assign({}, this.props.state);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {

    let name = e.target.name;
    let val = e.target.value;

    this.setState((prevState, props) => {
      let newState = Object.assign({}, prevState);
      newState[name] = parseFloat(val);
      return newState;
    });
  }

  handleSubmit(e) {
    this.props.onChange(Object.assign({}, this.state));
  }


  render() {
    return (
      <div className="inputs">

        {Object.keys(this.state).map((key) => {
          return (<div className="input">
            <div className="label">{this.props.meta[key].name}</div>
            <div className="field">
              <input type="number" step={this.props.meta[key].step} name={key} value={this.state[key]} onChange={this.handleChange} />
            </div>
          </div>)
        })}

        <div className="input">
          <div className="label"></div>
          <div className="field"><button onClick={this.handleSubmit}>Oblicz</button></div>
        </div>

      </div>
    );
  }


}

// ========================================
