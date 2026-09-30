//
//  CustomTabBar.swift
//  LifeOS
//

import SwiftUI

public enum NavigationTab: Hashable {
    case today
    case me
}

public struct CustomTabBar: View {
    @Binding var selectedTab: NavigationTab
    var onQuickAdd: () -> Void
    
    public init(selectedTab: Binding<NavigationTab>, onQuickAdd: @escaping () -> Void) {
        self._selectedTab = selectedTab
        self.onQuickAdd = onQuickAdd
    }
    
    public var body: some View {
        HStack {
            // Today Tab
            Button {
                selectedTab = .today
                HapticService.shared.lightImpact()
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: selectedTab == .today ? "sun.max.fill" : "sun.max")
                        .font(.system(size: 20))
                    Text("Today")
                        .font(.caption2.weight(.medium))
                }
                .foregroundStyle(selectedTab == .today ? Color.accentColor : Color.secondary)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
            
            // Central Quick Add (+) Button
            Button {
                HapticService.shared.lightImpact()
                onQuickAdd()
            } label: {
                ZStack {
                    Circle()
                        .fill(Color.accentColor)
                        .frame(width: 52, height: 52)
                        .shadow(color: Color.accentColor.opacity(0.3), radius: 6, x: 0, y: 3)
                    
                    Image(systemName: "plus")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Quick Add")
            
            // Me Tab
            Button {
                selectedTab = .me
                HapticService.shared.lightImpact()
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: selectedTab == .me ? "person.fill" : "person")
                        .font(.system(size: 20))
                    Text("Me")
                        .font(.caption2.weight(.medium))
                }
                .foregroundStyle(selectedTab == .me ? Color.accentColor : Color.secondary)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 24)
        .padding(.top, 10)
        .padding(.bottom, 22)
        .background(
            Rectangle()
                .fill(.ultraThinMaterial)
                .overlay(
                    Divider()
                        .background(Color.secondary.opacity(0.2)),
                    alignment: .top
                )
                .ignoresSafeArea(edges: .bottom)
        )
    }
}
