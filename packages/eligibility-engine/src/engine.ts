export interface HouseholdProfile {
  householdId: string;
  householdSize: number;
  grossMonthlyIncomeUsd: number;
  monthlyUtilitiesUsd: number;
  liquidAssetsUsd: number;
  county: string;
}

export interface BenefitEligibilityResult {
  programName: string;
  eligible: boolean;
  maxIncomeLimitUsd: number;
  reason: string;
}

// 2026 Indiana / Federal Standard Estimates for demonstration
const FEDERAL_POVERTY_LEVEL_MONTHLY: Record<number, number> = {
  1: 1255,
  2: 1703,
  3: 2152,
  4: 2600,
  5: 3048,
  6: 3497
};

export function evaluateAidEligibility(profile: HouseholdProfile): BenefitEligibilityResult[] {
  const fpl = FEDERAL_POVERTY_LEVEL_MONTHLY[profile.householdSize] || (2600 + (profile.householdSize - 4) * 450);

  // SNAP Limit: ~130% FPL gross income
  const snapLimit = fpl * 1.30;
  const snapEligible = profile.grossMonthlyIncomeUsd <= snapLimit && profile.liquidAssetsUsd <= 2750;

  // Medicaid / HIP 2.0 Limit: ~138% FPL
  const medicaidLimit = fpl * 1.38;
  const medicaidEligible = profile.grossMonthlyIncomeUsd <= medicaidLimit;

  // LIHEAP Energy Assistance: ~150% FPL
  const liheapLimit = fpl * 1.50;
  const liheapEligible = profile.grossMonthlyIncomeUsd <= liheapLimit;

  return [
    {
      programName: "SNAP (Food Assistance)",
      eligible: snapEligible,
      maxIncomeLimitUsd: Math.round(snapLimit),
      reason: snapEligible ? "Gross income and assets fall within federal SNAP thresholds." : "Gross income or liquid assets exceed SNAP limits."
    },
    {
      programName: "Indiana Medicaid / HIP 2.0",
      eligible: medicaidEligible,
      maxIncomeLimitUsd: Math.round(medicaidLimit),
      reason: medicaidEligible ? "Household income qualifies for state health coverage." : "Income exceeds 138% FPL threshold."
    },
    {
      programName: "LIHEAP (Energy Assistance)",
      eligible: liheapEligible,
      maxIncomeLimitUsd: Math.round(liheapLimit),
      reason: liheapEligible ? "Household qualifies for winter utility and heating relief." : "Income exceeds energy assistance limits."
    }
  ];
}
