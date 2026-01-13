//
//  SlugPolicy.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//
//MARK: /^[A-Z0-9]+\-[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-4[0-9a-fA-F]{3}\-[89abAB][0-9a-fA-F]{3}\-[0-9a-fA-F]{12}\-\d+$/
import Foundation

public protocol SlugPolicy: IdentifierPolicy {}

public extension SlugPolicy {
    
    static func validate(rawValue: String) -> Bool {
        let modernRegexPattern = /^[A-Z0-9]+\-[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-4[0-9a-fA-F]{3}\-[89abAB][0-9a-fA-F]{3}\-[0-9a-fA-F]{12}\-\d+$/
        return rawValue.uppercased().contains(modernRegexPattern)
    }
}

extension TaggedID where Tag: SlugPolicy {
    public var prefix: String {
        guard let prefixSubstring = rawValue.split(separator: "-").first else { return "UNK" }
            return String(prefixSubstring)
        }
    
    public var sequence: Int {
            guard let lastSubstring = rawValue.split(separator: "-").last,
                  let value = Int(lastSubstring) else {
                return 0
            }
            return value
        }
}