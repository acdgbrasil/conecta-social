import { ImutableList } from "@conecta/fn/imutable-list";

export type SocialHealthSummaryProps = {
    requiresConstantCare: boolean;
    hasMobilityImpairment: boolean;
    functionalDependencies: ImutableList<string>;
    hasRelevantDrugTheapy: boolean;
};
