//
//  TodayView.swift
//  LifeOS
//

import SwiftUI
import SwiftData

public struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @AppStorage("userName") private var userName: String = "Poorna"
    
    @Query(
        sort: [
            SortDescriptor(\LifeTask.statusRaw, order: .reverse), // pending before completed
            SortDescriptor(\LifeTask.createdAt, order: .forward)
        ]
    ) private var allTasks: [LifeTask]
    
    @State private var taskToEdit: LifeTask? = nil
    
    public init() {}
    
    // Filter tasks that are due today or overdue
    private var todayTasks: [LifeTask] {
        let calendar = Calendar.current
        let startOfToday = calendar.startOfDay(for: Date())
        let endOfToday = calendar.date(byAdding: .day, value: 1, to: startOfToday) ?? Date()
        
        return allTasks.filter { task in
            // Include if due today or if overdue and incomplete
            if task.dueDate < endOfToday {
                return true
            }
            return false
        }
    }
    
    private var incompleteCount: Int {
        todayTasks.filter { !$0.isCompleted }.count
    }
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header Section
                    headerSection
                        .padding(.horizontal, 20)
                        .padding(.top, 12)
                    
                    // Tasks Section
                    tasksSection
                        .padding(.horizontal, 20)
                        .padding(.bottom, 90) // clearance for bottom tab bar
                }
            }
            .background(Color(uiColor: .systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("LifeOS")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                        .opacity(0.8)
                }
            }
            .sheet(item: $taskToEdit) { task in
                AddTaskView(taskToEdit: task)
            }
        }
    }
    
    // MARK: - Header
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(DateFormatters.greeting())
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            Text(userName.isEmpty ? "Poorna" : userName)
                .font(.system(size: 32, weight: .bold, design: .default))
                .foregroundStyle(.primary)
            
            Text(DateFormatters.todayHeaderDate())
                .font(.footnote)
                .foregroundStyle(.secondary)
                .padding(.top, 2)
        }
    }
    
    // MARK: - Tasks Section
    private var tasksSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Section Header
            HStack {
                Text("TODAY")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                
                Spacer()
                
                Text(taskCountLabel)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 4)
            
            if todayTasks.isEmpty {
                TodayEmptyStateView()
                    .transition(.opacity)
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(todayTasks.enumerated()), id: \.element.id) { index, task in
                        TaskRow(
                            task: task,
                            onToggle: {
                                toggleTask(task)
                            },
                            onEdit: {
                                taskToEdit = task
                            },
                            onDelete: {
                                deleteTask(task)
                            }
                        )
                        
                        if index < todayTasks.count - 1 {
                            Divider()
                                .padding(.leading, 42)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color(uiColor: .secondarySystemGroupedBackground))
                )
            }
        }
    }
    
    private var taskCountLabel: String {
        let count = incompleteCount
        if count == 1 {
            return "1 task"
        } else {
            return "\(count) tasks"
        }
    }
    
    // MARK: - Actions
    private func toggleTask(_ task: LifeTask) {
        task.toggleCompletion()
        if task.isCompleted {
            HapticService.shared.taskCompleted()
        } else {
            HapticService.shared.lightImpact()
        }
        try? modelContext.save()
    }
    
    private func deleteTask(_ task: LifeTask) {
        withAnimation(.easeInOut(duration: 0.2)) {
            modelContext.delete(task)
            HapticService.shared.destructiveAction()
            try? modelContext.save()
        }
    }
}
