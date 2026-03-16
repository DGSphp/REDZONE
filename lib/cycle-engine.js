/**
 * Partnership Harmony - Cycle Prediction Engine
 * 
 * Logic to calculate menstrual cycle phases and "Context Zones".
 */

/**
 * Adds days to a date and returns a new Date object.
 * @param {Date|string} date 
 * @param {number} days 
 * @returns {Date}
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Predicts the next cycle details.
 * @param {string} lastPeriodStart - ISO Date string (YYYY-MM-DD)
 * @param {number} cycleLength - Average cycle length in days (default 28)
 * @param {number} periodDuration - Average period duration in days (default 5)
 * @returns {Object} Prediction details
 */
export function predictCycle(lastPeriodStart, cycleLength = 28, periodDuration = 5) {
  const startDate = new Date(lastPeriodStart);

  // Predict next period start
  const nextPeriodStart = addDays(startDate, cycleLength);

  // Predict next period end
  const nextPeriodEnd = addDays(nextPeriodStart, periodDuration);

  // Context Zone: 5 days before the next period starts
  // This is the "Danger Zone" / Luteal Phase peak
  const contextZoneStart = addDays(nextPeriodStart, -5);
  const contextZoneEnd = addDays(nextPeriodStart, -1); // Ends the day before period starts

  // Ovulation: Typically 14 days before the next period
  const ovulationDate = addDays(nextPeriodStart, -14);

  // Current period range for display
  const currentPeriodEnd = addDays(startDate, periodDuration);

  // Bad Mood Windows (Start - 1 to Start + 1)
  const currentBadMoodStart = addDays(startDate, -1);
  const currentBadMoodEnd = addDays(startDate, 1);

  const nextBadMoodStart = addDays(nextPeriodStart, -1);
  const nextBadMoodEnd = addDays(nextPeriodStart, 1);

  return {
    lastPeriodStart: startDate.toISOString().split('T')[0],
    currentPeriodEnd: currentPeriodEnd.toISOString().split('T')[0],
    currentBadMoodStart: currentBadMoodStart.toISOString().split('T')[0],
    currentBadMoodEnd: currentBadMoodEnd.toISOString().split('T')[0],
    nextPeriodStart: nextPeriodStart.toISOString().split('T')[0],
    nextPeriodEnd: nextPeriodEnd.toISOString().split('T')[0],
    nextBadMoodStart: nextBadMoodStart.toISOString().split('T')[0],
    nextBadMoodEnd: nextBadMoodEnd.toISOString().split('T')[0],
    contextZoneStart: contextZoneStart.toISOString().split('T')[0],
    contextZoneEnd: contextZoneEnd.toISOString().split('T')[0],
    ovulationDate: ovulationDate.toISOString().split('T')[0],
    currentDate: new Date().toISOString().split('T')[0] // For reference
  };
}

/**
 * Determines the current phase based on a date.
 * @param {string} lastPeriodStart 
 * @param {number} cycleLength 
 * @param {number} periodDuration 
 * @param {string} checkDate - Date to check (default today)
 * @returns {Object} Phase info: { phase: string, isContextZone: boolean, advice: string }
 */
export function getCurrentPhase(lastPeriodStart, cycleLength = 28, periodDuration = 5, checkDate = new Date()) {
  const today = new Date(checkDate);
  const prediction = predictCycle(lastPeriodStart, cycleLength, periodDuration);

  const nextStart = new Date(prediction.nextPeriodStart);
  const nextEnd = new Date(prediction.nextPeriodEnd);
  const contextStart = new Date(prediction.contextZoneStart);
  const contextEnd = new Date(prediction.contextZoneEnd);
  const ovulation = new Date(prediction.ovulationDate);

  const lastStart = new Date(prediction.lastPeriodStart);
  const lastEnd = addDays(lastStart, periodDuration);

  // Reset times for accurate date comparison
  today.setHours(0, 0, 0, 0);
  nextStart.setHours(0, 0, 0, 0);
  nextEnd.setHours(0, 0, 0, 0);
  contextStart.setHours(0, 0, 0, 0);
  contextEnd.setHours(0, 0, 0, 0);
  lastStart.setHours(0, 0, 0, 0);
  lastEnd.setHours(0, 0, 0, 0);

  let phase = "Follicular Phase"; // Default
  let isContextZone = false;
  let advice = "Things should be relatively calm. Great time for active dates.";

  // Check if currently currently on period (from user input) OR predicted next period
  const isCurrentPeriod = (today >= lastStart && today <= lastEnd);
  const isNextPeriod = (today >= nextStart && today <= nextEnd);

  // Bad Mood Window: 1 day before -> 2 days into the cycle (Days -1, 1, 2)
  // Range: [Start - 1, Start + 1] assuming Start is day 0 in date math (actually Start is Day 1)
  const isBadMoodWindow = (baseDate) => {
    const start = addDays(baseDate, -1);
    const end = addDays(baseDate, +1); // Day 1 + 1 = Day 2
    return today >= start && today <= end;
  };

  const isBadMood = isBadMoodWindow(new Date(prediction.lastPeriodStart)) || isBadMoodWindow(new Date(prediction.nextPeriodStart));

  if (today >= contextStart && today <= contextEnd) {
    phase = "Luteal Phase (Context Zone)";
    isContextZone = true;
    advice = "⚠️ Context Zone Active. Be extra supportive. Offer snacks, avoid heavy debates, and be patient.";
  } else if (isCurrentPeriod || isNextPeriod) {
    phase = "Menstruation";
    advice = "Period has started. Comfort is key. Heating pads, chocolate, and rest.";
  } else if (today.getTime() === ovulation.getTime() || (today > addDays(ovulation, -2) && today < addDays(ovulation, 2))) {
    phase = "Ovulation Window";
    advice = "Energy levels might be high. Good time for planning and socializing.";
  }

  return {
    phase,
    isContextZone,
    isBadMood, // New flag
    advice,
    prediction
  };
}
