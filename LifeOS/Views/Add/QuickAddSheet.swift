//
//  QuickAddSheet.swift
//  LifeOS
//

import SwiftUI

public enum QuickAddDestination: String, Identifiable {
    case task = "Task"
    case idea = "Idea"
    case expense = "Expense"
    case habit = "Habit"
    case note = "Note"
    case goal = "Goal"
    
    public var id: String { rawValue }
    
    public var icon: String {
        switch self {
        case .task:
            return "checkmark.circle"
        case .idea:
            return "lightbulb"
        case .expense:
            return "creditcard"
        case .habit:
            return "flame"
        case .note:
            return "note.text"
        case .goal:
            return "target"
        }
    }
    
    public var color: Color {
        switch self {
        case .task:
            return .blue
        case .idea:
            return .purple
        case .expense:
            return .green
        case .habit:
            return .orange
        case .note:
            return .yellow
        case .goal:
            return .indigo
        }
    }
}

public struct QuickAddSheet: View {
    @Environment(\.dismiss) private var dismiss
    
    @State private var quickText: String = ""
    @State private var showingAddTask = false
    @State private var comingSoonMessage: String? = nil
    
    public init() {}
    
    private let columns = [
        GridItem(.flexible(), spacing: 14),
        GridItem(.flexible(), spacing: 14)
    ]
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("What do you want to add?")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(.primary)
                        
                        Text("Choose an item to capture quickly")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    
                    Spacer()
                    
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(.secondary.opacity(0.6))
                    }
                }
                .padding(.top, 8)
                
                // Grid of 6 actions
                LazyVGrid(columns: columns, spacing: 14) {
                    quickButton(for: .task)
                    quickButton(for: .idea)
                    quickButton(for: .expense)
                    quickButton(for: .habit)
                    quickButton(for: .note)
                    quickButton(for: .goal)
                }
                
                if let message = comingSoonMessage {
                    Text(message)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .padding(.vertical, 4)
                        .transition(.opacity)
                }
                
                Spacer()
                
                // Future Smart Capture input bar
                smartCaptureBar
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
            .sheet(isPresented: $showingAddTask) {
                AddTaskView()
            }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
    
    private func quickButton(for item: QuickAddDestination) -> some View {
        Button {
            handleSelection(item)
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(item.color.opacity(0.15))
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: item.icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(item.color)
                }
                
                Text(item.rawValue)
                    .font(.body.weight(.medium))
                    .foregroundStyle(.primary)
                
                Spacer()
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(uiColor: .secondarySystemGroupedBackground))
            )
        }
        .buttonStyle(.plain)
    }
    
    private var smartCaptureBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "sparkles")
                .foregroundStyle(.secondary)
            
            TextField("Type or speak anything...", text: $quickText)
                .font(.subheadline)
                .submitLabel(.done)
                .onSubmit {
                    if !quickText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        // Will connect to smart capture engine in Phase 9
                        showingAddTask = true
                    }
                }
            
            Button {
                // Voice dictation entry
            } label: {
                Image(systemName: "mic.fill")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color(uiColor: .tertiarySystemGroupedBackground))
        )
    }
    
    private func handleSelection(_ item: QuickAddDestination) {
        switch item {
        case .task:
            showingAddTask = true
        case .expense:
            withAnimation { comingSoonMessage = "Expense capture unlocks in Phase 2" }
        case .habit:
            withAnimation { comingSoonMessage = "Habit tracking unlocks in Phase 3" }
        case .idea:
            withAnimation { comingSoonMessage = "Idea vault unlocks in Phase 4" }
        case .note, .goal:
            withAnimation { comingSoonMessage = "\(item.rawValue) capture coming soon" }
        }
    }
}
