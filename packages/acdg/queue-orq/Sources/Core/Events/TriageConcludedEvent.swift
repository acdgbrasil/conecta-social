//
//  P.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

public struct TriageConcludedEvent: Codable, Sendable, Equatable {
    public let visitID: VisitID
    public let plan: [SpecialtyID]
}
