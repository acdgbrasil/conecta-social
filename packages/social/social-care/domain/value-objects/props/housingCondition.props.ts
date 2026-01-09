// ===============================================================
// Condições Habitacionais da Família — conforme Prontuário SUAS
// ===============================================================

// Tipo de moradia (posse)
export const HOUSING_CONDITION_TYPE = {
  OWNED: "OWNED",           // Própria
  RENTED: "RENTED",         // Alugada
  CEDED: "CEDED",           // Cedida (sem ônus)
  SQUATTED: "SQUATTED",     // Ocupação / Invadida
} as const;

// Material predominante das paredes externas
export const WALL_MATERIAL = {
  MASONRY: "MASONRY",                       // Alvenaria / Tijolo
  FINISHED_WOOD: "FINISHED_WOOD",           // Madeira aparelhada
  MAKESHIFT_MATERIALS: "MAKESHIFT_MATERIALS", // Materiais aproveitados / improvisados
} as const;

// Forma de abastecimento de água
export const WATER_SUPPLY_TYPE = {
  PUBLIC_NETWORK: "PUBLIC_NETWORK",         // Rede geral de distribuição
  WELL_OR_SPRING: "WELL_OR_SPRING",         // Poço ou nascente
  RAINWATER_HARVEST: "RAINWATER_HARVEST",   // Cisterna de captação de águas pluviais
  WATER_TRUCK: "WATER_TRUCK",               // Carro-pipa
  OTHER: "OTHER",                           // Outra forma
} as const;

// Forma de acesso à energia elétrica
export const ELECTRICITY_ACCESS = {
  METERED_CONNECTION: "METERED_CONNECTION", // Ligação regular com medidor
  IRREGULAR_CONNECTION: "IRREGULAR_CONNECTION", // Ligação improvisada / sem medidor
  NO_ACCESS: "NO_ACCESS",                   // Sem energia elétrica
} as const;

// Forma de escoamento sanitário
export const SEWAGE_DISPOSAL_METHOD = {
  PUBLIC_SEWER: "PUBLIC_SEWER",             // Rede coletora de esgoto/pluvial
  SEPTIC_TANK: "SEPTIC_TANK",               // Fossa séptica
  RUDIMENTARY_PIT: "RUDIMENTARY_PIT",       // Fossa rudimentar / poço negro
  OPEN_SEWAGE: "OPEN_SEWAGE",               // Vala / rio / lago / mar
  NO_BATHROOM: "NO_BATHROOM",               // Domicílio sem banheiro
} as const;

// Forma de coleta de lixo
export const WASTE_COLLECTION_TYPE = {
  DIRECT_COLLECTION: "DIRECT_COLLECTION",   // Coleta direta (no domicílio)
  INDIRECT_COLLECTION: "INDIRECT_COLLECTION", // Coleta indireta (ponto de descarte)
  NO_COLLECTION: "NO_COLLECTION",           // Não há coleta
} as const;

// Grau de acessibilidade do domicílio
export const ACCESSIBILITY_LEVEL = {
  FULLY_ACCESSIBLE: "FULLY_ACCESSIBLE",     // Totalmente acessível
  PARTIALLY_ACCESSIBLE: "PARTIALLY_ACCESSIBLE", // Parcialmente acessível
  NOT_ACCESSIBLE: "NOT_ACCESSIBLE",         // Não acessível
} as const;

// ===============================================================
// Tipagem principal
// ===============================================================

export type HousingConditionProps = {
  housingConditionType: keyof typeof HOUSING_CONDITION_TYPE;
  wallMaterial: keyof typeof WALL_MATERIAL;
  numberOfRooms: number;
  numberOfBathrooms: number;
  waterSupplyType: keyof typeof WATER_SUPPLY_TYPE;
  electricityAccess: keyof typeof ELECTRICITY_ACCESS;
  sewerDisposalMethod: keyof typeof SEWAGE_DISPOSAL_METHOD;
  wasteCollectionType: keyof typeof WASTE_COLLECTION_TYPE;
  accessibilityLevel: keyof typeof ACCESSIBILITY_LEVEL;
  isInGeographicRiskArea: boolean;
  isInSocialConflictArea: boolean;
};
