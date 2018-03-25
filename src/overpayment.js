import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Money, Percent } from './utils.js';
import { Inputs } from './inputs.js';
import { calculate2, calculateInterestRate, calculateEarnings, calculate, getSavingsFromResults } from './calculator.js';


export class OverPayment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      amount: 200000,
      years: 25,
      bankInterest: 1.53,
      refInterest: 1.5,
      extraCash: 50000,
      extraCashYear: 5
    };

    this.fieldsMeta = {
      amount: {
        step: 10000,
        name: "Wartość kredytu"
      },
      years: {
        step: 1,
        name: "Ilość lat"
      },
      bankInterest: {
        step: 0.01,
        name: "Oprocentowanie banku (- stopa ref)"
      },
      refInterest: {
        step: 0.01,
        name: "Stopa referencyjna"
      },
      extraCash: {
        step: 1000,
        name: "Nadpłata"
      },
      extraCashYear: {
        step: 1,
        name: "Po którym roku nadpłata?"
      }
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(state) {
    this.setState(() => (state));
  }

  render() {

    let calculate3 = (reducer) => {
      return calculate(
        this.state.amount,
        this.state.years,
        this.state.refInterest / 100,
        this.state.bankInterest / 100,
        this.state.extraCash,
        this.state.extraCashYear,
        reducer);
    }

    let constantInstalmentCapital = this.state.amount / this.state.years / 12;

    let result = calculate3((month, extraCash, i) => {
      month.instalmentCapital = Math.min(month.amount, constantInstalmentCapital);
      month.savings = extraCash;
    });


    var constantInstalmentCapitalExtraCash = this.state.amount / this.state.years / 12;

    let result2 = calculate3((month, extraCash, i) => {
      month.instalmentCapital = Math.min(month.amount, constantInstalmentCapitalExtraCash + extraCash);
      month.savings = result.months[i].instalmentSum - month.instalmentSum + extraCash;

      if (extraCash > 0) {
        constantInstalmentCapitalExtraCash = (month.amount - extraCash) / (this.state.years * 12 - i);
      }
    });

    let result3 = calculate3((month, extraCash, i) => {
      month.instalmentCapital = Math.min(month.amount, constantInstalmentCapital + extraCash);
      month.savings = result.months[i].instalmentSum - month.instalmentSum + extraCash;
    });

    let result4 = calculate3((month, extraCash, i) => {
      month.instalmentCapital = Math.min(month.amount, constantInstalmentCapital + extraCash);
      month.savings = 0;

      if (extraCash == 0) {
        let base = result.months[i].instalmentSum - month.instalmentInterest;
        month.instalmentCapital = Math.min(month.amount, base);
        month.savings = base - month.instalmentCapital;
      }
    });


    return (
      <div className="container">

        <h1>Nadpłacanie kredytu</h1>

        <Inputs onChange={this.handleChange} state={this.state} meta={this.fieldsMeta} />

        <h1>Kalkulacja</h1>

        <Results
          title="Brak nadpłaty"
          interest={calculateInterestRate(result.sum.savingsAcc, this.state.extraCash, this.state.years - this.state.extraCashYear)}
          result={result}
        />

        <Results
          title="Nadpłata, zmniejszenie rat"
          interest={calculateInterestRate(result2.sum.savingsAcc, this.state.extraCash, this.state.years - this.state.extraCashYear)}
          result={result2}
        />

        <Results
          title="Nadpłata, skrócenie kredytu"
          interest={calculateInterestRate(result3.sum.savingsAcc, this.state.extraCash, this.state.years - this.state.extraCashYear)}
          result={result3}
        />

        <Results
          title="Nadpłata + dynamiczne nadpłacanie zyskami"
          interest={calculateInterestRate(result4.sum.savingsAcc, this.state.extraCash, this.state.years - this.state.extraCashYear)}
          result={result4}
        />

      </div>
    );
  }
}

class Results extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tableVisible: false
    }

    this.toggleTable = this.toggleTable.bind(this);
  }

  toggleTable(e) {

    this.setState((prev) => ({
      tableVisible: !prev.tableVisible
    }
    ));
  }

  render() {
    return (
      <div className="results">

        <h3>{this.props.title}</h3>

        <p>
          Na koniec extra gotówki: <strong><Money val={this.props.result.sum.savingsAcc} /></strong><br/>
          Stopa zwrotu: <strong><Percent val={this.props.interest} /></strong>
        </p>

         <table className={this.state.tableVisible ? "visible" : "" }>
          <thead>
            <tr className="header">
                <th>Lp</th>
                <th>Kredyt</th>
                <th>Rata<br/>kapitałowa</th>
                <th>Rata<br/>odsetkowa</th>
                <th>Rata<br/>łączna</th>
                <th>Oszcz.</th>
                <th>Oszcz.<br/>kumulacja</th>
            </tr>
          </thead>

          <tbody>

            {this.props.result.months.map(function(m, i) {
                return (
                  <tr>
                    <td>{i + 1}</td>
                    <td><Money val={m.amount} /></td>
                    <td><Money val={m.instalmentCapital} /></td>
                    <td><Money val={m.instalmentInterest} /></td>
                    <td><Money val={m.instalmentSum} /></td>
                    <td><Money val={m.savings} /></td>
                    <td><Money val={m.savingsAcc} /></td>
                  </tr>
                );
            })}

          </tbody>

          <tfoot>
            <tr>
              <td></td>
              <td>-</td>
              <td><Money val={this.props.result.sum.instalmentCapital} /></td>
              <td><Money val={this.props.result.sum.instalmentInterest} /></td>
              <td><Money val={this.props.result.sum.instalmentSum} /></td>
              <td><Money val={this.props.result.sum.savings} /></td>
              <td><Money val={this.props.result.sum.savingsAcc} /></td>
            </tr>

          </tfoot>

        </table>

        <button onClick={this.toggleTable}>{this.state.tableVisible ? "Schowaj tabelę" : "Pokaż szczegóły" }</button>


      </div>
    );
  }

}
