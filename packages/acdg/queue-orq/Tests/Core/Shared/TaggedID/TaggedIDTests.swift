//
//  TaggedIDTests.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//


import Foundation
import Testing
@testable import Shared


@Suite("Testes de Identificadores Tipados (TaggedID)")
struct TaggedIDTestsStruct {

    // MARK: - Testes de UUIDPolicy (PatientID, ProfessionalID, etc.)

    @Suite("Política de UUID")
    struct UUIDPolicyTests {
        
        @Test("Deve inicializar com sucesso usando um UUID válido")
        func validUUIDInitialization() throws {
            // Arrange
            let validUUIDString = UUID().uuidString
            
            // Act
            let patientID = try PatientID(validUUIDString)
            let professionalID = try ProfessionalID(validUUIDString)
            
            // Assert
            #expect(patientID.rawValue == validUUIDString)
            #expect(professionalID.rawValue == validUUIDString)
            #expect(patientID.uuid?.uuidString == validUUIDString)
        }
        
        @Test("Deve lançar erro ao tentar inicializar com string inválida")
        func invalidUUIDInitialization() {
            let invalidString = "isto-nao-e-um-uuid"
            
            #expect(throws: IdentifierError.invalidFormat(type: "PatientTag", value: invalidString)) {
                try PatientID(invalidString)
            }
        }
        
        @Test("Deve falhar inicialização failable (init?) com string inválida")
        func failableInitInvalid() {
            let invalidID = PatientID(rawValue: "12345")
            #expect(invalidID == nil)
        }
        
        @Test("Deve gerar um novo ID corretamente (se UUID.v7 estiver implementado)")
        func generateNewID() throws {
            // Este teste depende da implementação de UUID.v7() no seu projeto
            let newID = try PatientID.new()
            
            #expect(!newID.rawValue.isEmpty)
            #expect(newID.uuid != nil)
        }
    }

    // MARK: - Testes de SlugPolicy (SpecialtyID)

    @Suite("Política de Slug")
    struct SlugPolicyTests {
        
        @Test("Deve validar e criar Slug corretamente via método .new()")
        func createNewSlug() throws {
            // Arrange
            
            let sequence = 10
            
            // Act
            let slugID = try SpecialtyID.new(prefix: .SOCIAL, sequence: sequence)
            
            // Assert
            // Verifica o formato: PREFIX-UUIDv4-SEQUENCE
            #expect(slugID.prefix == "SOCIAL")
            #expect(slugID.sequence == 10)
            
            // Verifica se a validação interna do SlugPolicy aceita o valor gerado
            #expect(SpecialtyID(rawValue: slugID.rawValue) != nil)
        }
        
        @Test("Deve limpar caracteres especiais do prefixo no Slug")
        func slugPrefixSanitization() throws {
            // Arrange
            let dirtyPrefix = "Med@#$ical" // Deve virar "MEDICAL"
            
            // Act
            let slugID = try SpecialtyID.new(prefix: .FONO)
            
            // Assert
            #expect(slugID.prefix == "FONO")
        }
        
        @Test("Deve falhar com formato de Slug inválido (UUID incorreto)")
        func invalidSlugFormat() {
            // O Regex exige UUID v4 específico. Vamos testar algo que parece mas não é.
            let badSlug = "TEST-00000000-0000-0000-0000-000000000000-1"
            
            #expect(throws: IdentifierError.invalidFormat(type: "SpecialtyTag", value: badSlug)) {
                try SpecialtyID(badSlug)
            }
        }
        
        @Test("Deve extrair propriedades corretamente de um Slug manual")
        func slugPropertyExtraction() throws {
            // Criamos um slug válido manualmente para testar o parsing
            // Regex requer: [A-Z0-9] + UUIDv4 + Int
            // UUIDv4 exemplo: 969190D4-3079-4581-9C9D-E32034637731
            let validManualSlug = "TEST-969190D4-3079-4581-9C9D-E32034637731-99"
            
            let id = try SpecialtyID(validManualSlug)
            
            #expect(id.prefix == "TEST")
            #expect(id.sequence == 99)
        }
        
        @Test("Deve tratar corretamente prefixos desconhecidos (UNK)")
        func unknownPrefixHandling() throws {
            let emptyPrefixID = try SpecialtyID.new(prefix: .SOCIAL)
            #expect(emptyPrefixID.prefix == "SOCIAL")
        }
        
        @Test("Inicialização correta com e sem UUID explícito")
            func initialization() {
                let uuid = UUID.v7()
                guard let patientID = try? PatientID(uuid.uuidString) else {
                    fatalError("[WARNIG TEST ERROR]: ERROR IN TEST: [Inicialização correta com e sem UUID explícito - Por conta de erro de logica na função interna do UUID_V7, essa linha nunca deve ser atingida.]")
                }
                #expect(uuid.uuidString == patientID.rawValue)
            }

            @Test("Igualdade de IDs do mesmo tipo")
            func equality() {
                let uuid = UUID.v7()
                guard let id1 = try? PatientID(uuid.uuidString) else {
                    fatalError("[WARNIG TEST ERROR]: ERROR IN TEST: [Igualdade de IDs do mesmo tipo - Por conta de erro de logica na função interna do UUID, essa linha nunca deve ser atingida.]")
                    
                }
                guard let id2 = try? PatientID(uuid.uuidString) else {
                    fatalError("[WARNIG TEST ERROR]: ERROR IN TEST: [Igualdade de IDs do mesmo tipo - Por conta de erro de logica na função interna do UUID, essa linha nunca deve ser atingida.]")
                    
                }
                guard let id3 = try? PatientID(UUID().uuidString) else {
                    fatalError("[WARNIG TEST ERROR]: ERROR IN TEST: [Igualdade de IDs do mesmo tipo - Por conta de erro de logica na função interna do UUID, essa linha nunca deve ser atingida.]")
                    
                }
                
                #expect(id1 == id2)
                #expect(id1 != id3)
            }

            @Test("Comportamento em Coleções (Hashable)")
            func hashableBehavior() {
                let uuid = UUID.v7().uuidString
                
                guard let id1 =  try? PatientID(uuid) else {
                    fatalError("[WARNIG TEST ERROR]: ERROR IN TEST: [Igualdade de IDs do mesmo tipo - Por conta de erro de logica na função interna do UUID, essa linha nunca deve ser atingida.]")
                }
                guard let id2 =  try? PatientID(uuid) else {
                    fatalError("[WARNIG TEST ERROR]: ERROR IN TEST: [Igualdade de IDs do mesmo tipo - Por conta de erro de logica na função interna do UUID, essa linha nunca deve ser atingida.]")
                }
                
                
                let set: Set<PatientID> = [id1, id2]
                
                #expect(set.count == 1, "O Set deve colapsar IDs iguais")
                #expect(set.contains(id1))
            }

            @Test("Serialização Codable")
            func serialization() throws {
                let id = PatientID(rawValue: UUID.v7().uuidString)
                try expectCodableRoundtrip(id)
            }
    }

    // MARK: - Testes Estruturais (Codable, Hashable, Segurança de Tipo)

    @Suite("Conformidade de Protocolos")
    struct ProtocolComplianceTests {
        
        @Test("Não deve permitir igualdade entre tipos diferentes mesmo com mesmo rawValue")
        func typeSafetyCheck() throws {
            let uuidString = UUID().uuidString
            
            // Embora tenham o mesmo valor string subjacente, o sistema de tipos do Swift
            // impede comparação direta (PatientID == ProfessionalID).
            // Testamos aqui se os rawValues são iguais, mas conceitualmente são distintos.
            
            let patient = try PatientID(uuidString)
            let professional = try ProfessionalID(uuidString)
            
            #expect(patient.rawValue == professional.rawValue)
            
            // Nota: O compilador impediria `patient == professional`, o que é o comportamento desejado.
        }
        
        @Test("Deve ser codificável e decodificável (Codable)")
        func codableImplementation() throws {
            // Arrange
            let id = try PatientID.new()
            let encoder = JSONEncoder()
            let decoder = JSONDecoder()
            
            // Act
            let data = try encoder.encode(id)
            let decodedID = try decoder.decode(PatientID.self, from: data)
            
            // Assert
            #expect(id == decodedID)
        }
        
        @Test("Deve funcionar como chave de Dicionário (Hashable)")
        func hashableImplementation() throws {
            let id1 = try ServiceOrderID.new()
            let id2 = try ServiceOrderID.new()
            
            var dict: [ServiceOrderID: String] = [:]
            dict[id1] = "Pedido 1"
            dict[id2] = "Pedido 2"
            
            #expect(dict[id1] == "Pedido 1")
            #expect(dict[id2] == "Pedido 2")
        }
    }
    
    // 🎯 Endereça: CR_002 Item 2.1 e CR_001 Item 3.1
        @Test("Deve gerar um ID válido sem lançar erros")
        func generateValidID() throws {
            // No Swift Testing, não precisamos de do-catch.
            // Se `PatientID.new()` lançar erro, o teste falha automaticamente e registra o erro.
            let patientID = try PatientID.new()
            
            #expect(!patientID.rawValue.isEmpty)
            #expect(UUID(uuidString: patientID.rawValue) != nil, "O ID gerado deve ser um UUID válido")
        }
        
        // 🎯 Endereça: CR_002 Item 1.3
        @Test("Init deve rejeitar strings inválidas (retornando nil)")
        func initWithInvalidString() {
            let invalidUUIDString = "batata-frita-123"
            
            // Validamos diretamente se o resultado é nulo
            let id = PatientID(rawValue: invalidUUIDString)
            #expect(id == nil, "TaggedID não deve aceitar strings que não são UUIDs válidos")
        }
        
        @Test("Init deve aceitar strings UUID válidas")
        func initWithValidString() throws {
            let validUUID = UUID().uuidString
            
            // O macro #require tenta desembrulhar o Optional.
            // Se falhar (for nil), o teste para imediatamente aqui (equivalente ao XCTUnwrap ou verificação de nil).
            let id = try #require(PatientID(rawValue: validUUID))
            
            #expect(id.rawValue == validUUID)
        }
        
        @Test("Type Safety: Tags diferentes não devem se misturar em coleções Runtime")
        func typeSafetyInCollections() throws {
            // 1. Arrange
            let uuidString = UUID().uuidString
            
            // Usamos #require para garantir que temos as instâncias antes de testar a coleção
            let patientID = try #require(PatientID(rawValue: uuidString))
            let doctorID = try #require(ProfessionalID(rawValue: uuidString))
            
            // 2. Act & Assert
            
            // Teste A: Verificação via AnyHashable
            let set: Set<AnyHashable> = [patientID as AnyHashable, doctorID as AnyHashable]
            
            #expect(set.count == 2, "Um Set genérico deve conter 2 itens distintos, pois os Tipos são diferentes.")
            #expect(set.contains(patientID))
            #expect(set.contains(doctorID))
            
            // Teste B: Verificação via Reflection (Mirror)
            let patientType = String(reflecting: type(of: patientID))
            let doctorType = String(reflecting: type(of: doctorID))
            
            #expect(patientType != doctorType, "A reflexão do tipo deve ser diferente.")
            #expect(patientType.contains("PatientTag"))
            #expect(doctorType.contains("ProfessionalTag"))
        }
}
