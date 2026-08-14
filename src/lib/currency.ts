export function formatPrice(
  amount: number | string | undefined | null,
  currency: string = 'INR',
  showDecimals: boolean = false
): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }

  const num = Number(amount);

  if (currency === 'INR') {
    // Format Indian numbering format (lakhs and crores)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: showDecimals ? 2 : 0,
      minimumFractionDigits: showDecimals ? 2 : 0,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
}
