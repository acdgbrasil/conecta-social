//
//  DomainErrorTests.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//

import Foundation
import Testing
@testable import Shared

@Suite("Testes de Erros de Domínio e Convenções")
struct DomainErrorTests {
    
    // 🎯 Endereça: CR_001 Item 1.2 (Typos: ErrorSecerity -> ErrorSeverity)
    @Test("Protocolo DomainError deve usar ortografia correta para Severity")
    func verifySeverityDefinition() {
        
        // Mock local para testar a conformidade com o protocolo
        // Se o protocolo ainda estiver com 'Secerity', o compilador falhará aqui.
        struct MockError: DomainError {
            var code: String = "TEST_001"
            var title: String = "Test Error"
            var severity: ErrorSeverity = .warning
        }
        
        let error = MockError()
        
        #expect(error.severity == .warning, "A severidade padrão ou atribuída deve ser preservada")
    }
    
    // 🎯 Endereça: CR_001 Item 1.2 e 3.1 (IdentifierError naming)
    @Test("IdentifierError deve usar nomenclatura semântica (creationFailed)")
    func verifyIdentifierErrorNaming() {
        // Estamos testando se o case .creationFailed existe e funciona.
        // Se o enum ainda tiver apenas 'someThingAreNil', este código nem compilará.
        let error = IdentifierError.creationFailed(context: "TestScope")
        
        // Pattern matching simplificado com if case
        if case .creationFailed(let context) = error {
            #expect(context == "TestScope")
        } else {
            // Issue.record é o equivalente moderno ao XCTFail
            Issue.record("Esperava-se o case .creationFailed, mas recebeu: \(error)")
        }
    }
}
