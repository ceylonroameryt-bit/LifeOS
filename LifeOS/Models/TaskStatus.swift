//
//  TaskStatus.swift
//  LifeOS
//

import Foundation

public enum TaskStatus: String, Codable, CaseIterable, Identifiable {
    case pending = "pending"
    case completed = "completed"
    case cancelled = "cancelled"
    
    public var id: String { rawValue }
    
    public var displayName: String {
        switch self {
        case .pending:
            return "Pending"
        case .completed:
            return "Completed"
        case .cancelled:
            return "Cancelled"
        }
    }
}
