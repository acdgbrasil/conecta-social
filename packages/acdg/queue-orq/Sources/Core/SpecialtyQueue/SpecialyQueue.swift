//
//  SpecialyQueue.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Foundation
import Shared

public enum QueueOrchestrationError:  Error, Equatable, Sendable  {
    case patientAlreadyEnqueued
}

public struct SpecialyQueue: QueueBehavior {
    public var id: UUID
    
    public var specialtyID: SpecialtyID
    
    public var entries: [QueueEntry]
    
    public var window: OperationWindow
    
    public func enqueue(put patientID: PatientID) -> Result<SpecialyQueue, Error> {
        if self.entries.contains(where: { $0.patientID == patientID}) {
            return .failure(QueueOrchestrationError.patientAlreadyEnqueued)
        }
        
        
        
    }
    
    public func pullNext(pull papatientID: PatientID) -> Result<SpecialyQueue, Error> {
        <#code#>
    }
    
    public func estimatedWaitTime(for orderID: ServiceOrderID) -> Result<SpecialyQueue, Error> {
        <#code#>
    }
    
    
}
