//
//  ServiceOrderStatus.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

public enum ServiceOrderStatus: Codable, Sendable{
    case pending
    case ready
    case inProgress
    case finished
    case canceled
    case absent
}
