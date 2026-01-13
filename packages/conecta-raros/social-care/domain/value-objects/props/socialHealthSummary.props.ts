import type { ImutableList } from "@conecta/fn";

export type SocialHealthSummaryProps = {
    requiresConstantCare: boolean;
    hasMobilityImpairment: boolean;
    functionalDependencies: ImutableList<string>;
    hasRelevantDrugTheapy: boolean;
};
