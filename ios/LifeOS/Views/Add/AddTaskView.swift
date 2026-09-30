//
//  AddTaskView.swift
//  LifeOS
//

import SwiftUI
import SwiftData

public struct AddTaskView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    var taskToEdit: LifeTask? = nil
    
    @State private var title: String = ""
    @State private var notes: String = ""
    @State private var dueDate: Date = Date()
    @State private var hasTime: Bool = false
    @State private var priority: TaskPriority = .normal
    @State private var hasReminder: Bool = false
    @State private var reminderDate: Date = Date()
    
    @FocusState private var isTitleFocused: Bool
    
    public init(taskToEdit: LifeTask? = nil) {
        self.taskToEdit = taskToEdit
    }
    
    private var isEditing: Bool {
        taskToEdit != nil
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("What needs to be done?", text: $title)
                        .font(.body)
                        .focused($isTitleFocused)
                    
                    TextField("Notes (optional)", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                Section(header: Text("Schedule").font(.caption)) {
                    DatePicker(
                        "Date",
                        selection: $dueDate,
                        displayedComponents: [.date]
                    )
                    
                    Toggle("Time", isOn: $hasTime.animation(.easeInOut(duration: 0.2)))
                    
                    if hasTime {
                        DatePicker(
                            "Time",
                            selection: $dueDate,
                            displayedComponents: [.hourAndMinute]
                        )
                        .datePickerStyle(.compact)
                    }
                }
                
                Section(header: Text("Priority").font(.caption)) {
                    Picker("Priority", selection: $priority) {
                        ForEach(TaskPriority.allCases) { p in
                            Text(p.label).tag(p)
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }
            .navigationTitle(isEditing ? "Edit Task" : "New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button(isEditing ? "Done" : "Save Task") {
                        save()
                    }
                    .fontWeight(.semibold)
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                if let task = taskToEdit {
                    title = task.title
                    notes = task.notes
                    dueDate = task.dueDate
                    hasTime = task.hasTime
                    priority = task.priority
                    if let reminder = task.reminderDate {
                        hasReminder = true
                        reminderDate = reminder
                    }
                } else {
                    isTitleFocused = true
                }
            }
        }
    }
    
    private func save() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedTitle.isEmpty else { return }
        
        if let task = taskToEdit {
            task.title = trimmedTitle
            task.notes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
            task.dueDate = dueDate
            task.hasTime = hasTime
            task.priority = priority
            task.reminderDate = hasReminder ? reminderDate : nil
        } else {
            let newTask = LifeTask(
                title: trimmedTitle,
                notes: notes.trimmingCharacters(in: .whitespacesAndNewlines),
                dueDate: dueDate,
                hasTime: hasTime,
                reminderDate: hasReminder ? reminderDate : nil,
                priority: priority,
                status: .pending
            )
            modelContext.insert(newTask)
        }
        
        try? modelContext.save()
        HapticService.shared.itemSaved()
        dismiss()
    }
}
