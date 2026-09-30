//
//  DateFormatters.swift
//  LifeOS
//

import Foundation

public enum DateFormatters {
    /// Formats the header date like "Wednesday, 30 September"
    public static func todayHeaderDate(from date: Date = Date()) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, d MMMM"
        return formatter.string(from: date)
    }
    
    /// Formats time like "6:00 PM"
    public static func taskTime(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return formatter.string(from: date)
    }
    
    /// Returns dynamic greeting based on hour of the day: "Good morning", "Good afternoon", "Good evening"
    public static func greeting(for date: Date = Date()) -> String {
        let hour = Calendar.current.component(.hour, from: date)
        switch hour {
        case 5..<12:
            return "Good morning"
        case 12..<17:
            return "Good afternoon"
        case 17..<22:
            return "Good evening"
        default:
            return "Good night"
        }
    }
}
