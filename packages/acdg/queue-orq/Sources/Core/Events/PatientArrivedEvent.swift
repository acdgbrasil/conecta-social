//
//  PatientArrivedEvent.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation

public struct PatientArrivedEvent: Codable, Sendable, Equatable {
    public let visitID: VisitID
    public let patientID: PatientID
    public let timestamp: Date
}
