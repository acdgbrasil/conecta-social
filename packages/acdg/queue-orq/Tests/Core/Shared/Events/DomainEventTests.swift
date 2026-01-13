//
//  DomainEventTests.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//


import Testing
import Foundation
@testable import Shared

struct DomainEventTests {

    @Test("Evento: Paciente Chegou")
    func patientArrived() throws {
        let event = PatientArrivedEvent(
            visitID: try VisitID.new(),
            patientID: try PatientID.new(),
            timestamp: .dateForTesting
        )
        try expectCodableRoundtrip(event)
    }

    @Test("Evento: OS Criada")
    func orderCreated() throws {
        let event = ServiceOrderCreatedEvent(
            orderID: try ServiceOrderID.new(),
            visitID: try VisitID.new(),
            specialtyID: try SpecialtyID.new(prefix: .PSIC),
            priority: .priority
        )
        
        #expect(event.priority == .priority)
        try expectCodableRoundtrip(event)
    }
    
    @Test("Evento: Triagem Concluída")
    func triageConcluded() throws {
        let spec1 = try SpecialtyID.new(prefix: .FISIO)
        let spec2 = try SpecialtyID.new(prefix: .PSIC)
        let event = TriageConcludedEvent(
            visitID:try VisitID.new(),
            plan: [spec1, spec2]
        )
        
        #expect(event.plan.count == 2)
        #expect(event.plan.first == spec1)
        try expectCodableRoundtrip(event)
    }
    
    @Test("Evento: Dia Encerrado")
    func dayClosed() throws {
        let date = Date.dateForTesting
        let event = DayClosedEvent(
            date: date,
            totalVisists: 150,
            carryOverCount: 12
        )
        #expect(event.totalVisists == 150)
        #expect(event.carryOverCount == 12)
        try expectCodableRoundtrip(event)
    }
}
