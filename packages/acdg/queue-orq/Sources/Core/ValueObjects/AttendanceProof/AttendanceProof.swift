//
//  AttendanceProof.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

import Foundation

public struct AttendanceProof: Codable, Equatable, Hashable,Sendable {
    let resourceKey:StorageReference
    let timestamp:Date
    let professionalID:ProfessionalID
    
}
