import Foundation
import Shared

public protocol DailyVisitBehavior: Codable, Sendable, Equatable, Hashable  {
    var id: VisitID { get }
    var patientID: PatientID { get }
    var date: Date { get }
    var status: DailyVisitStatus { get }
    var orders: [ServiceOrderID] { get }
    var flags: VisitFlags { get }
    
    func checkIn(at timestamp: Date) -> Result<DailyVisit, Error>
    
    func addOrder(_ serviceOrderID: ServiceOrderID) -> Result<DailyVisit, Error>
    
    func closeDay(peddingOrders: Bool) -> Result<DailyVisit, Error>
    
}
