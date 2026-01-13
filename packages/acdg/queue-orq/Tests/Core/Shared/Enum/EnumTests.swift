//
//  EnumTests.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 25/11/25.
//

import Testing
@testable import Shared

struct EnumTests {

    // MARK: - Priority Tests
    
    @Test("Hierarquia de Prioridade: CarryOver > Priority > Normal")
    func prioritySorting() {
        #expect(OrderPriority.carryOverMax > .priority)
        #expect(OrderPriority.priority > .normal)
        #expect(OrderPriority.carryOverMax > .normal)
    }
    
    @Test("Valores Raw (Int) para compatibilidade com Banco")
    func priorityRawValues() {
        #expect(OrderPriority.normal.rawValue == 1)
        #expect(OrderPriority.priority.rawValue == 2)
        #expect(OrderPriority.carryOverMax.rawValue == 99)
    }
    
    @Test("Todos os casos de Prioridade devem ser Codable", arguments: [
        OrderPriority.normal,
        OrderPriority.priority,
        OrderPriority.carryOverMax
    ])
    func priorityCodable(priority: OrderPriority) throws {
        try expectCodableRoundtrip(priority)
    }

    // MARK: - Status Tests
    
    @Test("Todos os status de OS devem ser Codable", arguments: [
        ServiceOrderStatus.pending,
        .ready,
        .inProgress,
        .finished,
        .canceled,
        .absent
    ])
    func serviceStatusCodable(status: ServiceOrderStatus) throws {
        try expectCodableRoundtrip(status)
    }
    
    @Test("Status de Visita devem ser Codable", arguments: [
        DailyVisitStatus.checkIn,
        .waiting,
        .finished
    ])
    func visitStatusCodable(status: DailyVisitStatus) throws {
        try expectCodableRoundtrip(status)
    }
}
