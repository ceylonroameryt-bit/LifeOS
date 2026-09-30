//
//  LifeTask.swift
//  LifeOS
//

import Foundation
import SwiftData

@Model
final public class LifeTask {
    public var id: UUID = UUID()
    public var title: String = ""
    public var notes: String = ""
    public var dueDate: Date = Date()
    public var hasTime: Bool = false
    public var reminderDate: Date? = nil
    public var priorityRaw: String = TaskPriority.normal.rawValue
    public var statusRaw: String = TaskStatus.pending.rawValue
    public var createdAt: Date = Date()
    public var completedAt: Date? = nil

    public init(
        id: UUID = UUID(),
        title: String,
        notes: String = "",
        dueDate: Date = Date(),
        hasTime: Bool = false,
        reminderDate: Date? = nil,
        priority: TaskPriority = .normal,
        status: TaskStatus = .pending,
        createdAt: Date = Date(),
        completedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.notes = notes
        self.dueDate = dueDate
        self.hasTime = hasTime
        self.reminderDate = reminderDate
        self.priorityRaw = priority.rawValue
        self.statusRaw = status.rawValue
        self.createdAt = createdAt
        self.completedAt = completedAt
    }

    public var priority: TaskPriority {
        get { TaskPriority(rawValue: priorityRaw) ?? .normal }
        set { priorityRaw = newValue.rawValue }
    }

    public var status: TaskStatus {
        get { TaskStatus(rawValue: statusRaw) ?? .pending }
        set {
            statusRaw = newValue.rawValue
            if newValue == .completed {
                completedAt = Date()
            } else if newValue == .pending {
                completedAt = nil
            }
        }
    }

    public var isCompleted: Bool {
        get { status == .completed }
        set {
            status = newValue ? .completed : .pending
        }
    }

    public func toggleCompletion() {
        if isCompleted {
            status = .pending
        } else {
            status = .completed
        }
    }
    
    public var isDueToday: Bool {
        Calendar.current.isDateInToday(dueDate)
    }
    
    public var isOverdue: Bool {
        !isCompleted && dueDate < Calendar.current.startOfDay(for: Date())
    }
}
