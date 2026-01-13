//
//  DomainError.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

public enum ErrorSeverity:Sendable {
    case info
    case warning
    case critical
}

public protocol DomainError:Error {
    var code: String { get }
    var title:String { get }
    var info:[String:String] { get }
    var severity:ErrorSeverity { get }
}


public extension DomainError {
    var info: [String: String] { [:] }
    var severity: ErrorSeverity { .warning }
}
