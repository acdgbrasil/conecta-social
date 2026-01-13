//
//  VisitFlags.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

public struct VisitFlags: Codable, Sendable, Equatable, Hashable {
    public let hasCarryOver: Bool 
    public let isPriority: Bool
    
    public init(hasCarryOver: Bool, isPriority: Bool) {
        self.hasCarryOver = hasCarryOver
        self.isPriority = isPriority
    }
}
