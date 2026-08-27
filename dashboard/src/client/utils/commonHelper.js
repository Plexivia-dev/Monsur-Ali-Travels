export function formatCurrency(amount, currency = "BDT ") {
  return `${currency}${amount.toFixed(2)}`;
}
