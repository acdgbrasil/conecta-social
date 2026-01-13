//
//  ResourceKey.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

public enum StorageType: String, Codable, Sendable {
    case localPath    // Arquivo no disco (/var/data/...)
    case s3Key        // AWS S3
    case url          // Link externo
    case databaseBlob // <--- NOVO: O arquivo está salvo como bytes no próprio SQLite
}


public enum MediaType: String, Codable, Sendable {
    case pdf         = "application/pdf"
    case jpeg        = "image/jpeg"
    case png         = "image/png"
    case unknown     = "application/octet-stream"
}

public struct StorageReference: Codable, Sendable, Equatable, Hashable {
    public let path: String          // O caminho, chave ou URL
    public let type: StorageType     // Onde isso está guardado?
    public let mediaType: MediaType  // É PDF? Imagem?
    public let sizeInBytes: Int64?   // Tamanho (útil para UI não baixar coisa gigante sem avisar)
    public let contentHash: String?  // MD5 ou SHA256 (para garantir integridade)

    public init(
        path: String,
        type: StorageType,
        mediaType: MediaType,
        sizeInBytes: Int64? = nil,
        contentHash: String? = nil
    ) {
        self.path = path
        self.type = type
        self.mediaType = mediaType
        self.sizeInBytes = sizeInBytes
        self.contentHash = contentHash
    }
}
