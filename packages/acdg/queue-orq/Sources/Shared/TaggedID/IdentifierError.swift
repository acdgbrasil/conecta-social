//
//  IdentifierError.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

import Foundation

public enum IdentifierError: Error,Equatable {
    case invalidFormat(type: String, value: String)
    case someThingAreNil
    case creationFailed(context: String)
}



extension IdentifierError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .invalidFormat(type: let type, value: let value):
            return "O valor '\(value)' não corresponde ao formato esperado para o tipo '\(type)"
        case .someThingAreNil:
            return "[WARNING!] Verifique em tempo de compilação, se algum campo obrigatório não foi preenchido."
        case .creationFailed(context: let context):
            return "Erro na criação do objeto: \(context)"
        }
    }
}
