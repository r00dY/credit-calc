
export function calculate(
    amount,
    years,
    refInterest,
    bankInterest,
    extraCash,
    extraCashYear,
    reducer, // method should calculate savings and instalmentCapital based on extraCash and previous month.
  ) {

  let numOfMonths = years * 12;

  var months = [];
  var sum = {
    instalmentInterest: 0,
    instalmentCapital: 0,
    instalmentSum: 0,
    savings: 0,
    savingsAcc: 0,
  }

  var previousMonth = {
    amount: amount,
    instalmentInterest: 0,
    instalmentCapital: 0,
    savings: 0,
    savingsAcc: 0,
  };

  for(var i = 0; i < numOfMonths; i++) {

    let month = {
      get instalmentSum() {
        return this.instalmentCapital + this.instalmentInterest;
      }
    };

    month.amount = previousMonth.amount - previousMonth.instalmentCapital;
    month.instalmentInterest = month.amount * (refInterest + bankInterest) / 12;
    month.savings = 0;

    reducer(month, i == extraCashYear * 12 ? extraCash : 0, i); // dynamically calculate instalment interest, instalment capital and savings

    month.savingsAcc = calculateEarnings(month.savings, refInterest, numOfMonths - i);
    months.push(month);
    previousMonth = month;

    sum.instalmentInterest += month.instalmentInterest;
    sum.instalmentCapital += month.instalmentCapital;
    sum.instalmentSum += month.instalmentSum;
    sum.savings += month.savings;
    sum.savingsAcc += month.savingsAcc;
  }

  return {
      months: months,
      sum: sum
  };

  return months;
}



export function calculateEarnings(amount, interest, monthsToEnd) {

    var fullYearsToEnd = Math.floor(monthsToEnd / 12);
    var monthsRest = monthsToEnd - fullYearsToEnd * 12;

    var result = amount * Math.pow((1 + interest), fullYearsToEnd);
    result += result * interest * monthsRest / 12;

    return result;
}

export function getSavingsFromResults(result, base, loan_interest, years) {

    var savings = {
        months: [],
        sum: {
            val: 0,
            valAcc: 0
        }
    };

    result.months.forEach(function(month, i) {
        var val = base.months[i].instalmentSum - month.instalmentSum;
        var valAcc = calculateEarnings(val, loan_interest, years*12 - i);

        savings.months.push({
            val: val,
            valAcc: valAcc
        })
    });

    savings.sum.val = savings.months.reduce((acc, month) => acc + month.val, 0);
    savings.sum.valAcc = savings.months.reduce((acc, month) => acc + month.valAcc, 0);

    return savings;
}

export function calculateInterestRate(after, before, years) {
    return Math.pow(after / before, 1 / years) - 1;
}

