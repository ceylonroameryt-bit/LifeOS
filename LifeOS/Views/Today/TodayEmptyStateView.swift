//
//  TodayEmptyStateView.swift
//  LifeOS
//

import SwiftUI

public struct TodayEmptyStateView: View {
    public init() {}
    
    public var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "sun.max")
                .font(.system(size: 38, weight: .light))
                .foregroundStyle(Color.secondary.opacity(0.6))
                .padding(.bottom, 4)
            
            Text("No tasks today.")
                .font(.headline)
                .foregroundStyle(.primary)
            
            Text("Enjoy the breathing room.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
        .padding(.horizontal, 24)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(uiColor: .secondarySystemGroupedBackground))
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("No tasks today. Enjoy the breathing room.")
    }
}
