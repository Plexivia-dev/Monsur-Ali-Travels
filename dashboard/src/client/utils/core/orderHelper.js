export const effectivePrice = (price, offerPrice) =>
  offerPrice != null && offerPrice > 0 && offerPrice < price ? offerPrice : price;

export const formatBDT = (amount) => `BDT ${amount.toLocaleString("en-BD")}`;
