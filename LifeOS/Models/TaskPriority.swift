//
//  TaskPriority.swift
//  LifeOS
//

import SwiftUI

public enum TaskPriority: String, Codable, CaseIterable, Identifiable {
    case low = "Low"
    case normal = "Normal"
    case important = "Important"
    
    public var id: String { rawValue }
    
    public var label: String { rawValue }
    
    public var iconName: String? {
        switch self {
        case .low:
            return "arrow.down"
        case .normal:
            return nil
        case .important:
            return "exclamationmark"
        }
    }
    
    public var color: Color {
        switch self {
        case .low:
            return .secondary
        case .normal:
            return .blue
        case .important:
            return .orange
        }
    }
}
