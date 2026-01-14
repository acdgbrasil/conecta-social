//
//  ServiceOrderCreatedEvent.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//


public struct ServiceOrderCreatedEvent: Codable, Sendable, Equatable {
    public let orderID: ServiceOrderID
    public let visitID: VisitID
    public let specialtyID: SpecialtyID
    public let priority: OrderPriority
}
