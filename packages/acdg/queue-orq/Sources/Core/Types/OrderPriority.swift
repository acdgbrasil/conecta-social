//
//  OrderPriority.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

public enum OrderPriority: Int , RawRepresentable , Codable, Sendable, Comparable{
    
    case normal = 1
    case priority = 2
    case carryOverMax = 99
    
    public static func < (lhs: OrderPriority, rhs: OrderPriority) -> Bool { lhs.self .rawValue < rhs.self .rawValue }
    
}


