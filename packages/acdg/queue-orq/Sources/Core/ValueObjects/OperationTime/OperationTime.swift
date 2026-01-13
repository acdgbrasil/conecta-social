//
//  OperationTime.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

public struct OperationTime: Codable, Sendable, Comparable,Hashable {
    public let hour: Int
    public let minute: Int
    
    public static func < (lhs: OperationTime, rhs: OperationTime) -> Bool {
        return (lhs.hour * 60 + lhs.minute) < (rhs.hour * 60 + rhs.minute)
    }
}

public struct OperationWindow: Codable, Sendable, Comparable,Hashable {
    
    
    public let openTime: OperationTime
    public let closeTime: OperationTime
    public let allowedDays: Set<Int> // 1 = Domingo, 2 = Segunda...

    public init(openTime: OperationTime, closeTime: OperationTime, allowedDays: Set<Int>) {
        self.openTime = openTime
        self.closeTime = closeTime
        self.allowedDays = allowedDays
    }
        
    public static func < (lhs: OperationWindow, rhs: OperationWindow) -> Bool {
        return lhs.openTime < rhs.closeTime
    }
    
}
