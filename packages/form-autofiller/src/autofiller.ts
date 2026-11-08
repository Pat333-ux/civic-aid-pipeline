import { BenefitEligibilityResult, HouseholdProfile } from "@civic/eligibility-engine";

export interface ApplicationPacket {
  packetId: string;
  timestamp: string;
  applicantHouseholdId: string;
  eligiblePrograms: string[];
  statePortalPayload: {
    agency: string;
    targetSystem: string;
    formattedData: Record<string, unknown>;
  };
  recertificationDeadline: string;
}

export function generateApplicationPacket(
  profile: HouseholdProfile,
  results: BenefitEligibilityResult[]
): ApplicationPacket {
  const eligiblePrograms = results.filter((r) => r.eligible).map((r) => r.programName);
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 365); // Standard annual certification window

  return {
    packetId: `PKT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    applicantHouseholdId: profile.householdId,
    eligiblePrograms,
    statePortalPayload: {
      agency: "Indiana Family and Social Services Administration (FSSA)",
      targetSystem: "IN-Bridges Unified Intake API",
      formattedData: {
        household_size: profile.householdSize,
        monthly_income: profile.grossMonthlyIncomeUsd,
        monthly_utilities: profile.monthlyUtilitiesUsd,
        county_code: profile.county,
        requested_benefits: eligiblePrograms
      }
    },
    recertificationDeadline: deadlineDate.toISOString().split("T")[0]
  };
}
