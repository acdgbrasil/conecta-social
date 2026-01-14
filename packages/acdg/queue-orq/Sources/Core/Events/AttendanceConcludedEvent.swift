//
//  AttendanceConcludedEvent.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

public struct AttendanceConcludedEvent: Codable, Sendable, Equatable {
    public let orderID: ServiceOrderID
    public let professionalID: ProfessionalID
    public let roomID: RoomID
}
