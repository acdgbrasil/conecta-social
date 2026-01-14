//
//  UUIDPolicy.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

import Foundation

public protocol UUIDPolicy: IdentifierPolicy {}

public extension UUIDPolicy {
    static func validate(rawValue: String) -> Bool {
        return UUID(uuidString: rawValue) != nil
    }
}


public extension TaggedID where Tag: UUIDPolicy {
    static func new() throws -> TaggedID<Tag>  {
        let uuid: UUID = UUID.v7()
        guard let safeID = TaggedID(rawValue: uuid.uuidString) else {
            throw IdentifierError.someThingAreNil
        }
        return safeID
    }
    
    var uuid: Optional<UUID> {
        return UUID(uuidString: rawValue)
    }
}

