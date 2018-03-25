import React from 'react';
import './index.css';

import { Money, Percent } from './utils.js';
import { Inputs } from './inputs.js';
import { sumAllProps, calculate2, calculateInterestRate, calculateEarnings, calculate, getSavingsFromResults } from './calculator.js';


export class BuyOrRent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      price: 350000,
      ownContribution: 120000,
      years: 20,
      bankInterest: 2, // 1.5 do 2.5
      refInterest: 1.5, // funkcja!
      myInterest: 1.5,
      monthlyCost: 600,
      rentCost: 1700
    };

    this.fieldsMeta = {
      price: {
        step: 10000,
        name: "Wartość nieruchomości"
      },
      ownContribution: {
        step: 10000,
        name: "Wkład własny"
      },
      years: {
        step: 1,
        name: "Ilość lat kredytu"
      },
      bankInterest: {
        step: 0.01,
        name: "Oprocentowanie banku (- stopa ref)"
      },
      refInterest: {
        step: 0.01,
        name: "Stopa referencyjna"
      },
      myInterest: {
        step: 0.01,
        name: "Zysk z inwestowania"
      },
      monthlyCost: {
        step: 10,
        name: "Czynsz + opłaty (kupione)"
      },
      rentCost: {
        step: 100,
        name: "Koszt wynajmu (wszystko)"
      }
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(state) {
    this.setState(() => (state));
  }

  render() {

    let amount = this.state.price - this.state.ownContribution;
    let constantInstalmentCapital = amount / this.state.years / 12;

    let result =  calculate(
      amount,
      this.state.years,
      this.state.refInterest / 100,
      this.state.bankInterest / 100,
      0,
      0,
      (month, extraCash, i) => {
        month.instalmentCapital = Math.min(month.amount, constantInstalmentCapital);
        month.savings = extraCash;
      }
    );

    result.months.forEach((month, i) => {
      month.extraCost = this.state.monthlyCost;
      month.totalBuyCost = month.extraCost + month.instalmentSum;
      month.totalRentCost = this.state.rentCost;

      month.savings = month.totalBuyCost - month.totalRentCost;
      if (i == 0) {
        month.savings += this.state.ownContribution;
      }

      for(var interest = this.state.refInterest / 100; interest <= 0.1; interest += 0.0001) {
        let key = "savingsAcc" + Math.round((interest * 10000)).toString();
        let earnings = calculateEarnings(month.savings, interest, this.state.years * 12 - i);
        month[key] = earnings;
      }

      month.savingsAcc = calculateEarnings(month.savings, this.state.myInterest / 100, this.state.years * 12 - i);
    });

    let sum = sumAllProps(result.months);
    Object.assign(result.sum, sum);

    // console.log(result.sum);


    var closestInterest = 0;
    var distance = 999999999;
    var val = 0;

    for(var interest = this.state.refInterest / 100; interest <= 0.1; interest += 0.0001) {
      let key = "savingsAcc" + Math.round((interest * 10000)).toString();

      let diff = Math.abs(result.sum[key] - this.state.price);
      if (diff < distance) {
        distance = diff;
        closestInterest = interest;
        val = result.sum[key];
      }

    }


    return (
      <div className="container">

        <h1>Kupno czy wynajem</h1>

        <Inputs onChange={this.handleChange} state={this.state} meta={this.fieldsMeta} />

        <h1>Kalkulacja, stan po {this.state.years} latach</h1>

        <h3>Kupno</h3>
        <p>
          Łączna wartość środków: <strong><Money val={this.state.price} /></strong> (wartość nieruchomości)
        </p>

        <h3>Wynajem</h3>
        <p>
          Łączna wartość środków: <strong><Money val={result.sum.savingsAcc} /></strong> (wartość zaoszdzędzonego majątku)
        </p>

        <h3>Podsumowanie</h3>
        <p>
          Stopa zwrotu przy odkładaniu kasy wynajmując: <strong><Percent val={this.state.myInterest / 100} /></strong>
          <br/>
          Stopa zwrotu z kupna: <strong><Percent val={closestInterest} /></strong>
        </p>

        <table className="visible">
          <thead>
            <tr className="header">
                <th>Lp</th>
                <th>Kredyt</th>
                <th>Rata<br/>kapitałowa</th>
                <th>Rata<br/>odsetkowa</th>
                <th>Rata<br/>łączna</th>
                <th>Czynsz<br/>+ opłaty</th>
                <th>Opłaty<br/>razem</th>
                <th>Koszt<br/>wynajmu cały</th>
                <th>Oszczędność</th>
                <th>Oszczędność<br/>kumulacja (stopa ref.)</th>
            </tr>
          </thead>

          <tbody>

            {result.months.map(function(m, i) {
                return (
                  <tr>
                    <td>{i + 1}</td>
                    <td><Money val={m.amount} /></td>
                    <td><Money val={m.instalmentCapital} /></td>
                    <td><Money val={m.instalmentInterest} /></td>
                    <td><Money val={m.instalmentSum} /></td>
                    <td><Money val={m.extraCost} /></td>
                    <td><Money val={m.totalBuyCost} /></td>
                    <td><Money val={m.totalRentCost} /></td>
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
              <td><Money val={result.sum.instalmentCapital} /></td>
              <td><Money val={result.sum.instalmentInterest} /></td>
              <td><Money val={result.sum.instalmentSum} /></td>
              <td><Money val={result.sum.extraCost} /></td>
              <td><Money val={result.sum.totalBuyCost} /></td>
              <td><Money val={result.sum.totalRentCost} /></td>
              <td><Money val={result.sum.savings} /></td>
              <td><Money val={result.sum.savingsAcc} /></td>

            </tr>

          </tfoot>

        </table>


      </div>
    );
  }
}

