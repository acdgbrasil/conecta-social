//
//  ValueObjectTests.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Testing
import Foundation
@testable import Shared

struct ValueObjectTests {

    // MARK: - Operation Time & Window
    
    @Test("Comparação temporal (Comparable)")
    func timeComparison() {
        let t10_00 = OperationTime(hour: 10, minute: 00)
        let t10_30 = OperationTime(hour: 10, minute: 30)
        let t11_00 = OperationTime(hour: 11, minute: 00)
        
        #expect(t10_00 < t10_30)
        #expect(t10_30 < t11_00)
        #expect(t11_00 > t10_00)
        // Teste de igualdade
        #expect(t10_00 == OperationTime(hour: 10, minute: 0))
    }
    
    @Test("Estrutura da Janela de Operação")
    func operationWindow() throws {
        let open = OperationTime(hour: 8, minute: 0)
        let close = OperationTime(hour: 18, minute: 0)
        let days: Set<Int> = [1, 2, 3, 4, 5]
        
        let window = OperationWindow(openTime: open, closeTime: close, allowedDays: days)
        
        #expect(window.openTime.hour == 8)
        #expect(window.allowedDays.contains(1))
        #expect(!window.allowedDays.contains(6)) // Sábado não permitido
        
        try expectCodableRoundtrip(window)
    }

    // MARK: - Storage & Proof
    
    @Test("Inicialização do StorageReference")
    func storageReferenceInit() {
        let storage = StorageReference(
            path: "/tmp/doc.pdf",
            type: .localPath,
            mediaType: .pdf,
            sizeInBytes: 1024,
            contentHash: "abc123hash"
        )
        
        #expect(storage.path == "/tmp/doc.pdf")
        #expect(storage.type == .localPath)
        #expect(storage.mediaType == .pdf)
        #expect(storage.sizeInBytes == 1024)
        #expect(storage.contentHash == "abc123hash")
    }
    
    @Test("Igualdade do StorageReference")
    func storageReferenceEquality() {
        let s1 = StorageReference(path: "a", type: .s3Key, mediaType: .jpeg)
        let s2 = StorageReference(path: "a", type: .s3Key, mediaType: .jpeg)
        let s3 = StorageReference(path: "b", type: .s3Key, mediaType: .jpeg)
        
        #expect(s1 == s2)
        #expect(s1 != s3)
    }

    @Test("Prova de Atendimento Completa")
    func attendanceProof() throws {
        let professionalID = try ProfessionalID.new()
        let now = Date.dateForTesting
        let resource = StorageReference(path: "key", type: .s3Key, mediaType: .pdf)
        
        let proof = AttendanceProof(
            resourceKey: resource,
            timestamp: now,
            professionalID: professionalID
        )
        
        #expect(proof.resourceKey.path == "key")
        #expect(proof.professionalID == professionalID)
        
        // Verifica se a struct aninhada sobrevive ao JSON roundtrip
        try expectCodableRoundtrip(proof)
    }
}
