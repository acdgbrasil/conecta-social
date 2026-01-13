//
//  ServiceOrderBehavior.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation
import Shared

public protocol ServiceOrderBehavior : Codable, Sendable, Equatable, Hashable {
    var id: ServiceOrderID { get }
    var visitID: VisitID { get }
    var specialty: SpecialtyID { get }
    var priority: OrderPriority { get }
    var status: ServiceOrderStatus { get }
    var arrivalTimestamp: Date { get }
    var proof: AttendanceProof? { get }
    
    func startAttendace(at timestamp: Date) -> ServiceOrderStatus
    func finish(with proof:AttendanceProof) -> ServiceOrderStatus
    func prometeToCarryOver() -> OrderPriority
    
}
