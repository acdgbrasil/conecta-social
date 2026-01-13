//
//  QueueEntry.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation


public struct QueueEntry: Identifiable, Sendable, Equatable,Codable,Hashable {
    public let id: ServiceOrderID
    public let patientID: PatientID
    public let priority: OrderPriority
    public let arrivalTimestamp: Date
    
    public init(id: ServiceOrderID, patientID: PatientID, priority: OrderPriority, arrivalTimestamp: Date) {
        self.id = id
        self.patientID = patientID
        self.priority = priority
        self.arrivalTimestamp = arrivalTimestamp
    }
    
    public init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(ServiceOrderID.self, forKey: .id)
        self.patientID = try container.decode(PatientID.self, forKey: .patientID)
        self.priority = try container.decode(OrderPriority.self, forKey: .priority)
        self.arrivalTimestamp = try container.decode(Date.self, forKey: .arrivalTimestamp)
    }
}

extension QueueEntry : Comparable {
    public static func < (lhs: QueueEntry, rhs: QueueEntry) -> Bool {
        if lhs.priority != rhs.priority {
            return lhs.priority > rhs.priority
        }
        return lhs.arrivalTimestamp < rhs.arrivalTimestamp
    }
}
