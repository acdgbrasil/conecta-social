//
//  IndentifierPolicy.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

import Foundation

public protocol IdentifierPolicy {
    static func validate(rawValue: String) -> Bool
}
