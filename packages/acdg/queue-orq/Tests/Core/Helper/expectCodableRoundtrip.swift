//
//  expectCodableRoundtrip.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Testing
import Foundation

// Helper genérico para validar Codable (Roundtrip)
func expectCodableRoundtrip<T: Codable & Equatable>(
    _ value: T,
    sourceLocation: SourceLocation = #_sourceLocation
) throws {
    let encoder = JSONEncoder()
    let decoder = JSONDecoder()
    
    // Estratégia que preserva frações de segundos (RFC 3339 com fractional seconds)
    encoder.dateEncodingStrategy = .millisecondsSince1970
    decoder.dateDecodingStrategy = .millisecondsSince1970
    
    encoder.outputFormatting = .prettyPrinted
    
    let data = try encoder.encode(value)
    let decoded = try decoder.decode(T.self, from: data)
    
    #expect(value == decoded, sourceLocation: sourceLocation)
}

extension Date {
    static let dateForTesting: Date = Date(timeIntervalSince1970: 1672531200)
}
