//
//  UUIDv7Tests.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

import Foundation
import Testing
@testable import Shared


@Suite("Testes de UUID v7")
struct UUIDv7Tests {

    // 🎯 Endereça: CR_002 Item 1.1 e Conformidade com RFC 9562 (antiga 4122)
    @Test("Deve gerar UUIDs com Versão 7 e Variante correta", arguments: 0..<100)
    func validateVersionAndVariant(_ iteration: Int) {
        // Act
        let uuid = UUID.v7()
        
        // Assert
        // Acessamos a tupla de bytes interna do UUID (uuid_t)
        // O Swift expõe isso como uma tupla de 16 UInt8: (0, 1, ..., 15)
        
        // 1. Verificação da Versão (Bits 4-7 do byte 6 devem ser 0111 = 7)
        // Byte 6: 0111xxxx
        let versionByte = uuid.uuid.6
        let version = (versionByte >> 4)
        #expect(version == 7, "O UUID gerado deve identificar-se como versão 7")
        
        // 2. Verificação da Variante (Bits 6-7 do byte 8 devem ser 10 = Variant 1)
        // Byte 8: 10xxxxxx. Em Hex: 0x80 a 0xBF.
        let variantByte = uuid.uuid.8
        let variant = (variantByte >> 6)
        #expect(variant == 0b10, "A variante deve ser 'Signed 2s complement' (RFC 4122/9562)")
    }

    @Test("Deve ser ordenável sequencialmente pelo tempo (Sortable)")
    func verifySortability() async throws {
        // Arrange
        var uuids: [String] = []
        let count = 5
        
        // Act
        for _ in 0..<count {
            uuids.append(UUID.v7().uuidString)
            // Pequeno delay para forçar avanço do relógio (v7 depende de ms)
            try await Task.sleep(for: .milliseconds(2))
        }
        
        // Assert
        let sortedUUIDs = uuids.sorted()
        #expect(uuids == sortedUUIDs, "A lista gerada sequencialmente já deveria estar ordenada lexicograficamente")
    }
    
    @Test("Deve garantir unicidade em alta frequência")
    func checkUniqueness() {
        // Arrange
        let total = 10_000
        var generated = Set<UUID>()
        
        // Act
        for _ in 0..<total {
            generated.insert(UUID.v7())
        }
        
        // Assert
        #expect(generated.count == total, "Não deve haver colisões (IDs duplicados) em 10k gerações")
    }

    @Test("Deve codificar o Timestamp correto nos primeiros 48 bits")
    func validateTimestampEmbedding() {
        // Arrange
        // Margem de erro aceitável (delta) entre capturar o tempo no teste e dentro da função
        let toleranceInMillis: Int64 = 100
        let nowMillis = Int64(Date().timeIntervalSince1970 * 1000)
        
        // Act
        let uuid = UUID.v7()
        
        // Extração manual do Timestamp (Big Endian nos bytes 0 a 5)
        let t1 = Int64(uuid.uuid.0) << 40
        let t2 = Int64(uuid.uuid.1) << 32
        let t3 = Int64(uuid.uuid.2) << 24
        let t4 = Int64(uuid.uuid.3) << 16
        let t5 = Int64(uuid.uuid.4) << 8
        let t6 = Int64(uuid.uuid.5)
        
        let extractedTimestamp = t1 | t2 | t3 | t4 | t5 | t6
        
        // Assert
        let difference = abs(extractedTimestamp - nowMillis)
        
        #expect(difference <= toleranceInMillis, "O timestamp dentro do UUID (\(extractedTimestamp)) difere muito do atual (\(nowMillis))")
    }
}
