export const fromCents = (value: number): number => value / 100;

// TODO determine how to deal with currency
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
// https://www.kevinleary.net/currency-formatting-javascript-typescript/
export const formatCurrency = (value: number): string => `$${fromCents(value).toFixed(2)}`;
