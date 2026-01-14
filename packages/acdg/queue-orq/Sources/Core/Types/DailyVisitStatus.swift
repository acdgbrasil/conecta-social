//
//  DailyVisitStatus.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation

public enum DailyVisitStatus: Codable, Sendable, Equatable, Hashable {
    case checkIn
    case waiting
    case finished
}
