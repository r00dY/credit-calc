import React from 'react';
import ReactDOM from 'react-dom';

var numeral = require('numeral');

export function Money(props) {
  return <span>{ props.val < 1 && props.val > -1 ? 0 : numeral(props.val).format('0,0') }</span>;
}

export function Percent(props) {
  return <span>{ numeral(props.val).format('0.00%') }</span>;
}
