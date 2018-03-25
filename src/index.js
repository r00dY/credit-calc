import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Money, Percent } from './utils.js';
import { Inputs } from './inputs.js';
import { calculate2, calculateInterestRate, calculateEarnings, calculate, getSavingsFromResults } from './calculator.js';
import { OverPayment } from './overpayment.js';
import { BuyOrRent } from './buy-or-rent.js';


class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <BuyOrRent />
      </div>
    )
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
