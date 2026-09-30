//
//  TaskRow.swift
//  LifeOS
//

import SwiftUI

public struct TaskRow: View {
    @Bindable var task: LifeTask
    var onToggle: () -> Void
    var onEdit: (() -> Void)? = nil
    var onDelete: (() -> Void)? = nil
    
    @State private var isAnimatingCheck = false
    
    public init(
        task: LifeTask,
        onToggle: @escaping () -> Void,
        onEdit: (() -> Void)? = nil,
        onDelete: (() -> Void)? = nil
    ) {
        self.task = task
        self.onToggle = onToggle
        self.onEdit = onEdit
        self.onDelete = onDelete
    }
    
    public var body: some View {
        Button {
            onEdit?()
        } label: {
            HStack(alignment: .top, spacing: 14) {
                // Circular completion button
                Button {
                    withAnimation(.spring(response: 0.28, dampingFraction: 0.7)) {
                        isAnimatingCheck.toggle()
                        onToggle()
                    }
                } label: {
                    ZStack {
                        Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 22, weight: .regular))
                            .foregroundStyle(task.isCompleted ? Color.green : Color.secondary.opacity(0.6))
                            .scaleEffect(isAnimatingCheck ? 1.15 : 1.0)
                    }
                    .frame(width: 28, height: 28)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(task.isCompleted ? "Mark incomplete" : "Mark complete")
                
                // Content
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(task.title)
                            .font(.system(.body, design: .default))
                            .strikethrough(task.isCompleted, color: .secondary.opacity(0.8))
                            .foregroundStyle(task.isCompleted ? .secondary : .primary)
                        
                        if task.priority == .important && !task.isCompleted {
                            Image(systemName: "exclamationmark")
                                .font(.caption.bold())
                                .foregroundStyle(Color.orange)
                        }
                    }
                    
                    if task.hasTime {
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.caption2)
                            Text(DateFormatters.taskTime(from: task.dueDate))
                                .font(.caption)
                        }
                        .foregroundStyle(task.isCompleted ? .secondary.opacity(0.7) : .secondary)
                    }
                }
                
                Spacer()
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 4)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) {
                onDelete?()
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button {
                withAnimation(.spring(response: 0.28, dampingFraction: 0.7)) {
                    onToggle()
                }
            } label: {
                Label(
                    task.isCompleted ? "Mark Incomplete" : "Complete",
                    systemImage: task.isCompleted ? "circle" : "checkmark"
                )
            }
            .tint(task.isCompleted ? .gray : .green)
        }
    }
}
