import Foundation
import Shared

public enum DailyVisitError: Error, Equatable, Sendable {
    case alreadyCheckedIn
    case cannotAddOrderWhenFinished
    case cannotCloseWithoutCheckIn
    case invalidDate
}

public struct DailyVisit: DailyVisitBehavior, Codable, Sendable, Equatable, Hashable {
    public let id: VisitID
    public let patientID: PatientID
    public let date: Date
    public let status: DailyVisitStatus
    public let orders: [ServiceOrderID]
    public let flags: VisitFlags

    public init(
        id: VisitID,
        patientID: PatientID,
        date: Date,
        status: DailyVisitStatus = .waiting,
        orders: [ServiceOrderID] = [],
        flags: VisitFlags = .init(hasCarryOver: false, isPriority: false)
    ) {
        self.id = id
        self.patientID = patientID
        self.date = date
        self.status = status
        self.orders = orders
        self.flags = flags
    }

    // Marca check-in no timestamp informado. Mantém a "date" como data civil da visita.
    public func checkIn(at timestamp: Date) -> Result<DailyVisit, Error> {
        let comps = Calendar.current.dateComponents([.year,.month,.day], from: timestamp)
        guard status != .checkIn else {
            return .failure(DailyVisitError.alreadyCheckedIn)
        }
        
        guard comps.isValidDate(in: .current) else {
            return .failure(DailyVisitError.invalidDate)
        }
        
        let updated = DailyVisit(id: id, patientID: patientID, date: date,status: .checkIn,orders: orders,flags: flags)
        
        return .success(updated)
    }

    public func addOrder(_ serviceOrderID: ServiceOrderID) -> Result<DailyVisit, Error> {
        guard status != .finished else { return .failure(DailyVisitError.cannotAddOrderWhenFinished) }
        let newOrders = orders + [serviceOrderID]
        let updated = DailyVisit( id: id, patientID: patientID, date: date, status: status, orders: newOrders, flags: flags )
        return .success(updated)
    }

    public func closeDay(peddingOrders: Bool) -> Result<DailyVisit, Error> {
        let newFlags: VisitFlags
        if peddingOrders { newFlags = VisitFlags(hasCarryOver: true, isPriority: flags.hasCarryOver) } else { newFlags = flags }

        let updated = DailyVisit(id: id,patientID: patientID,date: date,status: .finished,orders: orders,flags: newFlags)
        return .success(updated)
    }
}

