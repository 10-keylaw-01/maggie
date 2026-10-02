export const kes = n => 'KES ' + Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 });

export const discountPct = p =>
  p.compare_at_price && p.compare_at_price > p.price
    ? Math.round((1 - p.price / p.compare_at_price) * 100)
    : null;

export const STATUS_LABEL = {
  pending: 'Pending', prescription_review: 'Prescription review', confirmed: 'Confirmed', processing: 'Processing',
  out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};
export const PAYMENT_LABEL = { unpaid: 'Unpaid', pending: 'Awaiting M-Pesa', paid: 'Paid', failed: 'Failed', refunded: 'Refunded' };
