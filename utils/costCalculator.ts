import { Companion, CostCalculation } from '../types';

// Price constants
const DAILY_PASS_FULL = 103.78; // 13+ years
const DAILY_PASS_HALF = 51.89;  // 0-12 years
const TRANSPORT_SEAT = 64.19;    // Per person (employee included)

export const calculateCosts = (
  companions: Companion[],
  wantsTransport: boolean,
  childrenOnLap: number[] = [] // Global companion indices of children 0-5 years on lap (free transport)
): CostCalculation => {
  let adultPasses = 0;
  let childPasses = 0;
  let halfPricePasses = 0;
  let transportSeats = 0;

  // Calculate daily passes (employee is FREE)
  companions.forEach(companion => {
    if (companion.age >= 13) {
      adultPasses += 1;
    } else {
      // 0-12 years = half price
      childPasses += 1;
      halfPricePasses += 1;
    }
  });

  const dailyPassesCost = (adultPasses * DAILY_PASS_FULL) + (childPasses * DAILY_PASS_HALF);

  // Calculate transport (employee PAYS + companions, except children on lap)
  let transportCost = 0;
  if (wantsTransport) {
    // Employee always pays transport
    transportSeats = 1;
    
    // Add companions using GLOBAL indices from companions array
    companions.forEach((companion, globalIndex) => {
      // Children 0-5 can be on lap (free), but user can choose to buy seat
      // childrenOnLap contains global companion indices
      const isOnLap = companion.age <= 5 && childrenOnLap.includes(globalIndex);
      if (!isOnLap) {
        transportSeats += 1;
      }
    });

    transportCost = transportSeats * TRANSPORT_SEAT;
  }

  return {
    dailyPasses: dailyPassesCost,
    transport: transportCost,
    total: dailyPassesCost + transportCost,
    breakdown: {
      adultPasses,
      childPasses,
      halfPricePasses,
      transportSeats,
    },
  };
};
