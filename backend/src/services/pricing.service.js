/**
 * Smart Pricing Service
 * Rule-based dynamic pricing: adjusts price based on time and demand
 */
const getPricingMultiplier = () => {
  const hour = new Date().getHours();
  // Peak hours: 7-10am and 5-8pm
  const isPeakMorning = hour >= 7 && hour <= 10;
  const isPeakEvening = hour >= 17 && hour <= 20;
  const isWeekend = [0, 6].includes(new Date().getDay());

  if (isPeakMorning || isPeakEvening) return 1.5;
  if (isWeekend) return 1.3;
  return 1.0;
};

const getDynamicPrice = (basePrice, demandScore = 50) => {
  const timeMultiplier = getPricingMultiplier();
  // Demand multiplier: 1.0 to 1.4 based on demand (0-100)
  const demandMultiplier = 1 + (demandScore / 100) * 0.4;
  const finalPrice = basePrice * timeMultiplier * demandMultiplier;
  return {
    basePrice,
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    timeMultiplier,
    demandMultiplier: parseFloat(demandMultiplier.toFixed(2)),
    isPeakHour: timeMultiplier > 1.0,
    pricingReason: getPricingReason(timeMultiplier),
  };
};

const getPricingReason = (multiplier) => {
  if (multiplier >= 1.5) return 'Peak hours - high demand';
  if (multiplier >= 1.3) return 'Weekend - moderate demand';
  return 'Regular hours - standard pricing';
};

const getPeakHours = () => {
  return {
    morning: '7:00 AM - 10:00 AM',
    evening: '5:00 PM - 8:00 PM',
    currentMultiplier: getPricingMultiplier(),
    recommendation: getPricingMultiplier() === 1.0
      ? 'Great time to rent! Standard pricing applies.'
      : 'Peak hours active. Consider renting later for better rates.',
  };
};

module.exports = { getDynamicPrice, getPeakHours, getPricingMultiplier };
