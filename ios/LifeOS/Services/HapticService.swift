//
//  HapticService.swift
//  LifeOS
//

import UIKit

@MainActor
public final class HapticService {
    public static let shared = HapticService()
    
    private init() {}
    
    /// Subtle feedback for completing a task or toggling checkmark
    public func taskCompleted() {
        let generator = UIImpactFeedbackGenerator(style: .medium)
        generator.prepare()
        generator.impactOccurred()
    }
    
    /// Light feedback for unchecking or low-impact toggle
    public func lightImpact() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.prepare()
        generator.impactOccurred()
    }
    
    /// Success feedback when saving a task, expense, or habit
    public func itemSaved() {
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.success)
    }
    
    /// Warning or destructive feedback for deletions
    public func destructiveAction() {
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.warning)
    }
}
