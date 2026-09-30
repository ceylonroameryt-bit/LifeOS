//
//  LifeTaskTests.swift
//  LifeOSTests
//

import XCTest
import SwiftData
@testable import LifeOS

final class LifeTaskTests: XCTestCase {
    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    
    @MainActor
    override func setUpWithError() throws {
        let schema = Schema([LifeTask.self])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        modelContainer = try ModelContainer(for: schema, configurations: [configuration])
        modelContext = modelContainer.mainContext
    }
    
    override func tearDownWithError() throws {
        modelContainer = nil
        modelContext = nil
    }
    
    @MainActor
    func testTaskInitialization() {
        let task = LifeTask(title: "Gym Workout", priority: .important)
        
        XCTAssertEqual(task.title, "Gym Workout")
        XCTAssertEqual(task.priority, .important)
        XCTAssertEqual(task.status, .pending)
        XCTAssertFalse(task.isCompleted)
        XCTAssertNil(task.completedAt)
        XCTAssertTrue(task.isDueToday)
    }
    
    @MainActor
    func testTaskCompletionToggle() {
        let task = LifeTask(title: "Apply for 2 SOC jobs")
        XCTAssertFalse(task.isCompleted)
        XCTAssertNil(task.completedAt)
        
        // Toggle to completed
        task.toggleCompletion()
        XCTAssertTrue(task.isCompleted)
        XCTAssertEqual(task.status, .completed)
        XCTAssertNotNil(task.completedAt)
        
        // Toggle back to pending
        task.toggleCompletion()
        XCTAssertFalse(task.isCompleted)
        XCTAssertEqual(task.status, .pending)
        XCTAssertNil(task.completedAt)
    }
    
    @MainActor
    func testTaskPriorityMapping() {
        let task = LifeTask(title: "Check Email", priority: .low)
        XCTAssertEqual(task.priority, .low)
        XCTAssertEqual(task.priorityRaw, TaskPriority.low.rawValue)
        
        task.priority = .important
        XCTAssertEqual(task.priority, .important)
        XCTAssertEqual(task.priorityRaw, TaskPriority.important.rawValue)
    }
    
    @MainActor
    func testSwiftDataPersistence() throws {
        let task = LifeTask(title: "Work on SOC-AI", priority: .normal)
        modelContext.insert(task)
        try modelContext.save()
        
        let descriptor = FetchDescriptor<LifeTask>()
        let fetchedTasks = try modelContext.fetch(descriptor)
        
        XCTAssertEqual(fetchedTasks.count, 1)
        XCTAssertEqual(fetchedTasks.first?.title, "Work on SOC-AI")
        
        // Delete task
        modelContext.delete(task)
        try modelContext.save()
        
        let afterDelete = try modelContext.fetch(descriptor)
        XCTAssertEqual(afterDelete.count, 0)
    }
    
    @MainActor
    func testTaskOverdueCalculation() {
        let calendar = Calendar.current
        let yesterday = calendar.date(byAdding: .day, value: -1, to: Date())!
        
        let overdueTask = LifeTask(title: "Past task", dueDate: yesterday)
        XCTAssertTrue(overdueTask.isOverdue)
        
        // Completed past task is not considered overdue
        overdueTask.isCompleted = true
        XCTAssertFalse(overdueTask.isOverdue)
    }
}
