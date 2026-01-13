import Foundation

public struct TaggedID<Tag: IdentifierPolicy>: RawRepresentable, Hashable, Codable {
    public let rawValue: String
    
    public init?(rawValue: String) {
        guard Tag.validate(rawValue: rawValue) else { return nil }
        self.rawValue = rawValue
    }
    
    public init(_ value: String) throws {
        guard Tag.validate(rawValue: value) else {
            throw IdentifierError.invalidFormat(type: String(describing: Tag.self), value: value)
        }
        self.rawValue = value
    }
}


extension TaggedID: ExpressibleByStringLiteral {
    public init(stringLiteral value: StringLiteralType) {
        guard Tag.validate(rawValue: value) else {
            fatalError("Formato inválido para \(Tag.self): \(value)")
        }
        self.rawValue = value
    }
}

extension TaggedID: Sendable, Equatable {}
