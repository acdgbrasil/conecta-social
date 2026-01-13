//
//  QueueBehavior.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation
import Shared

public protocol QueueBehavior: Codable, Sendable, Equatable, Hashable {
    var id: UUID { get }
    var specialtyID: SpecialtyID { get }
    var entries: [QueueEntry] { get }
    var window: OperationWindow { get }

    func enqueue(put patientID: PatientID) -> Result<SpecialyQueue,Error>
    
    func pullNext(pull papatientID: PatientID) -> Result<SpecialyQueue,Error>
    
    func estimatedWaitTime(for orderID: ServiceOrderID) -> Result<SpecialyQueue,Error>
    
    
}
