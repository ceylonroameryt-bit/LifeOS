//
//  MeView.swift
//  LifeOS
//

import SwiftUI

public struct MeView: View {
    @AppStorage("userName") private var userName: String = "Poorna"
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Profile Header
                    HStack(spacing: 16) {
                        Circle()
                            .fill(Color.blue.opacity(0.15))
                            .frame(width: 56, height: 56)
                            .overlay(
                                Text(String(userName.prefix(1)))
                                    .font(.title2.bold())
                                    .foregroundStyle(Color.blue)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(userName.isEmpty ? "Poorna" : userName)
                                .font(.title2.bold())
                                .foregroundStyle(.primary)
                            
                            Text("Personal Control Centre")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    
                    // Overview Cards Placeholder
                    VStack(spacing: 12) {
                        meCard(title: "Money", detail: "Phase 2", icon: "creditcard", color: .green)
                        meCard(title: "Habits", detail: "Phase 3", icon: "flame", color: .orange)
                        meCard(title: "Ideas", detail: "Phase 4", icon: "lightbulb", color: .purple)
                        meCard(title: "Goals", detail: "Coming Soon", icon: "target", color: .indigo)
                    }
                    .padding(.horizontal, 20)
                    
                    // Simple Settings / About section
                    VStack(alignment: .leading, spacing: 10) {
                        Text("PREFERENCES")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 24)
                        
                        VStack(spacing: 0) {
                            HStack {
                                Label("Name", systemImage: "person")
                                Spacer()
                                TextField("Your Name", text: $userName)
                                    .multilineTextAlignment(.trailing)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(16)
                            
                            Divider().padding(.leading, 44)
                            
                            HStack {
                                Label("Version", systemImage: "info.circle")
                                Spacer()
                                Text("1.0.0 (Phase 1)")
                                    .foregroundStyle(.secondary)
                            }
                            .padding(16)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(Color(uiColor: .secondarySystemGroupedBackground))
                        )
                        .padding(.horizontal, 20)
                    }
                    .padding(.top, 12)
                    .padding(.bottom, 90)
                }
            }
            .background(Color(uiColor: .systemGroupedBackground))
            .navigationTitle("Me")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private func meCard(title: String, detail: String, icon: String, color: Color) -> some View {
        HStack {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
                .frame(width: 32)
            
            Text(title)
                .font(.body.weight(.medium))
                .foregroundStyle(.primary)
            
            Spacer()
            
            Text(detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(uiColor: .secondarySystemGroupedBackground))
        )
    }
}
