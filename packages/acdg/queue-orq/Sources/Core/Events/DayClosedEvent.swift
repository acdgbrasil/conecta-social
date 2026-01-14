//
//  DayClosedEvent.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation

public struct DayClosedEvent: Codable, Sendable, Equatable {
    public let date: Date
    public let totalVisists: Int
    public let carryOverCount: Int
}
