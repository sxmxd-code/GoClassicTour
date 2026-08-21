/**
 * Multi-Currency & Financial Calculations (INR & SAR)
 * Standard live exchange rate: 1 SAR ≈ 22.35 INR
 */

export const DEFAULT_EXCHANGE_RATE_SAR_TO_INR = 22.35;

/**
 * Format Indian Rupees with symbol and comma separator (Lakhs/Crores)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Saudi Riyal with symbol (﷼ or SAR)
 */
export function formatSAR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '﷼ 0';
  return `﷼ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert SAR to INR
 */
export function sarToInr(sarAmount: number, rate = DEFAULT_EXCHANGE_RATE_SAR_TO_INR): number {
  return Math.round(sarAmount * rate);
}

/**
 * Convert INR to SAR
 */
export function inrToSar(inrAmount: number, rate = DEFAULT_EXCHANGE_RATE_SAR_TO_INR): number {
  if (rate === 0) return 0;
  return Number((inrAmount / rate).toFixed(2));
}

export interface CostingBreakdownCalculation {
  flightCostInr: number;
  makkahHotelSar: number;
  makkahHotelInr: number;
  madinahHotelSar: number;
  madinahHotelInr: number;
  totalHotelSar: number;
  totalHotelInr: number;
  visaInsuranceInr: number;
  transportSar: number;
  transportInr: number;
  cateringSar: number;
  cateringInr: number;
  ziyaratSar: number;
  ziyaratInr: number;
  maktabSar: number;
  maktabInr: number;
  totalDirectCostInr: number;
  targetMarginInr: number;
  subTotalInr: number;
  gstAmountInr: number;
  finalSellingPriceInr: number;
  grossProfitMarginPercent: number;
}

export function calculatePackageCost(
  params: {
    flightFareInr: number;
    makkahHotelSarPerNight: number;
    madinahHotelSarPerNight: number;
    makkahNights: number;
    madinahNights: number;
    sharingTierMultiplier: number; // Quad: 0.25 (1/4th room cost), Triple: 0.33, Double: 0.5, Single: 1.0
    visaInsuranceInr: number;
    transportSarPerPerson: number;
    cateringSarPerDay: number;
    ziyaratSar: number;
    maktabMutawwifSar?: number;
    targetMarginInr: number;
    gstPercentage: number;
    exchangeRate?: number;
  }
): CostingBreakdownCalculation {
  const rate = params.exchangeRate || DEFAULT_EXCHANGE_RATE_SAR_TO_INR;
  const totalDays = params.makkahNights + params.madinahNights;

  // Hotel costs per person based on sharing tier
  const makkahHotelSar = params.makkahHotelSarPerNight * params.makkahNights * params.sharingTierMultiplier;
  const makkahHotelInr = sarToInr(makkahHotelSar, rate);

  const madinahHotelSar = params.madinahHotelSarPerNight * params.madinahNights * params.sharingTierMultiplier;
  const madinahHotelInr = sarToInr(madinahHotelSar, rate);

  const totalHotelSar = makkahHotelSar + madinahHotelSar;
  const totalHotelInr = makkahHotelInr + madinahHotelInr;

  // Ground services
  const transportSar = params.transportSarPerPerson;
  const transportInr = sarToInr(transportSar, rate);

  const cateringSar = params.cateringSarPerDay * totalDays;
  const cateringInr = sarToInr(cateringSar, rate);

  const ziyaratSar = params.ziyaratSar;
  const ziyaratInr = sarToInr(ziyaratSar, rate);

  const maktabSar = params.maktabMutawwifSar || 0;
  const maktabInr = sarToInr(maktabSar, rate);

  // Total Direct Cost
  const totalDirectCostInr = 
    params.flightFareInr + 
    totalHotelInr + 
    params.visaInsuranceInr + 
    transportInr + 
    cateringInr + 
    ziyaratInr + 
    maktabInr;

  const subTotalInr = totalDirectCostInr + params.targetMarginInr;
  const gstAmountInr = Math.round((subTotalInr * params.gstPercentage) / 100);
  const finalSellingPriceInr = subTotalInr + gstAmountInr;
  
  const grossProfitMarginPercent = Number(((params.targetMarginInr / finalSellingPriceInr) * 100).toFixed(1));

  return {
    flightCostInr: params.flightFareInr,
    makkahHotelSar,
    makkahHotelInr,
    madinahHotelSar,
    madinahHotelInr,
    totalHotelSar,
    totalHotelInr,
    visaInsuranceInr: params.visaInsuranceInr,
    transportSar,
    transportInr,
    cateringSar,
    cateringInr,
    ziyaratSar,
    ziyaratInr,
    maktabSar,
    maktabInr,
    totalDirectCostInr,
    targetMarginInr: params.targetMarginInr,
    subTotalInr,
    gstAmountInr,
    finalSellingPriceInr,
    grossProfitMarginPercent,
  };
}
