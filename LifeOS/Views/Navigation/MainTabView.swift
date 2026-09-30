//
//  MainTabView.swift
//  LifeOS
//

import SwiftUI

public struct MainTabView: View {
    @State private var selectedTab: NavigationTab = .today
    @State private var isQuickAddPresented: Bool = false
    
    public init() {}
    
    public var body: some View {
        ZStack(alignment: .bottom) {
            // Main content
            Group {
                switch selectedTab {
                case .today:
                    TodayView()
                case .me:
                    MeView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Custom Bottom 3-item Navigation Bar
            CustomTabBar(
                selectedTab: $selectedTab,
                onQuickAdd: {
                    isQuickAddPresented = true
                }
            )
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .sheet(isPresented: $isQuickAddPresented) {
            QuickAddSheet()
        }
    }
}
