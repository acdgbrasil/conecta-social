import Foundation

extension UUID {
  static func v7() -> UUID {
      let timestamp: Int64 = Int64(Date().timeIntervalSince1970 * 1000) 
      var uuid: uuid_t = (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      withUnsafeMutableBytes(of: &uuid) { buffer in
          for i in 0...15 {
              buffer[i] = UInt8.random(in: 0...255)
              
          }
          buffer[0] = UInt8((timestamp >> 40) & 0xFF)
          buffer[1] = UInt8((timestamp >> 32) & 0xFF)
          buffer[2] = UInt8((timestamp >> 24) & 0xFF)
          buffer[3] = UInt8((timestamp >> 16) & 0xFF)
          buffer[4] = UInt8((timestamp >> 8) & 0xFF)
          buffer[5] = UInt8(timestamp & 0xFF)
          
          buffer[6] = (buffer[6] & 0x0F) | 0x70
          buffer[8] = (buffer[8] & 0x3F) | 0x80
          
      }
      
      return UUID(uuid: uuid)
  }
  

}
