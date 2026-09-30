//
//  LifeOSApp.swift
//  LifeOS
//

import SwiftUI
import SwiftData

@main
struct LifeOSApp: App {
    let container: ModelContainer
    
    init() {
        do {
            let schema = Schema([
                LifeTask.self,
            ])
            let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            container = try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Failed to initialize SwiftData ModelContainer: \(error.localizedDescription)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(container)
    }
}
