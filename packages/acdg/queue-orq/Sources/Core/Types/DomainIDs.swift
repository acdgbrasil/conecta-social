//
//  DomainTaggedID.swift
//  QueueOrchestration
//
//  Created by Gabriel Vieira Soriano Aderaldo on 24/11/25.
//


public enum PatientTag: UUIDPolicy {}
public enum ProfessionalTag: UUIDPolicy {}
public enum ServiceOrderTag: UUIDPolicy {}
public enum SpecialtyTag: SlugPolicy {}
public enum VisitTag: UUIDPolicy {}
public enum OrderTag: UUIDPolicy {}
public enum RoomTag: UUIDPolicy {}

public typealias SpecialtyID = TaggedID<SpecialtyTag>
public typealias PatientID = TaggedID<PatientTag>
public typealias ProfessionalID = TaggedID<ProfessionalTag>
public typealias ServiceOrderID = TaggedID<ServiceOrderTag>
public typealias VisitID = TaggedID<VisitTag>
public typealias OrderID = TaggedID<OrderTag>
public typealias RoomID = TaggedID<RoomTag>
