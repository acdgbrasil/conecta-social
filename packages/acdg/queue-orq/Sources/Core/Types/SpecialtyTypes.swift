//
//  SpecialtyTypes.swift
//  QueueOrchestration
//
//  Moved from Shared/TaggedID/SlugPolicy/SlugPolicy.swift
//

import Foundation
import Shared

public enum SpecialtyTypes: String, Sendable, Codable {
    case FISIO = "FISIO"
    case TO = "TO"
    case SOCIAL = "SOCIAL"
    case PSIC = "PSIC"
    case FONO = "FONO"
}

public extension TaggedID where Tag: SlugPolicy {
    static func new(prefix: SpecialtyTypes, sequence: Int = 1) throws -> TaggedID<Tag>  {
        let safePrefix = prefix.rawValue.uppercased().components(separatedBy: CharacterSet.alphanumerics.inverted).joined()
        let finalPrefix = safePrefix.isEmpty ? "UNK" : safePrefix
        let uuid:UUID = UUID()
        let generateValue = "\(finalPrefix)-\(uuid.uuidString)-\(sequence)"
        guard let result:TaggedID<Tag> = try? .init(generateValue) else {
            fatalError("[CRITICAL ERROR]: The UUID \(uuid) generated from the prefix \(finalPrefix) and sequence \(sequence) is not valid as a slug.")
        }
        return result
        
    }
}
