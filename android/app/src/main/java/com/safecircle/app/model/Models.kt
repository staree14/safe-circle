package com.safecircle.app.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class EvidenceKind {
    IMAGE, VIDEO, AUDIO
}

data class HashInfo(
    val value: String,
    val at: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
)

data class Evidence(
    val id: String,
    val kind: EvidenceKind,
    val name: String,
    val url: String = "",
    val at: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date()),
    val incidentId: String? = null,
    val size: Long = 0L,
    val format: String = "FILE",
    val duration: Int? = null,
    val sync: String = "demo",
    val access: List<String> = emptyList(),
    val hash: HashInfo? = null,
    val note: String? = null
)

data class Contact(
    val id: String,
    val name: String,
    val relation: String,
    val phone: String,
    val journeyAlerts: Boolean = true,
    val sosAlerts: Boolean = true,
    val missedCheckIn: Boolean = true
)

data class LatLng(
    val latitude: Double,
    val longitude: Double
)

data class Place(
    val id: String,
    val label: String,
    val address: String,
    val pos: LatLng? = null,
    val hideAddress: Boolean = false
)

enum class TimelineKind {
    SOS, ALERT, ACK, NOTE, EVIDENCE, CREATED, RESOLVED
}

data class TimelineEvent(
    val id: String,
    val at: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date()),
    val kind: TimelineKind,
    val text: String,
    val demo: Boolean = true
)

data class Incident(
    val id: String,
    val title: String,
    val type: String = "physical", // "physical" or "digital"
    val category: String,
    val status: String = "open", // "active", "open", "resolved"
    val at: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date()),
    val locationText: String? = null,
    val pos: LatLng? = null,
    val description: String = "",
    val timeline: List<TimelineEvent> = emptyList(),
    val acks: Map<String, String> = emptyMap(),
    val demo: Boolean = true
)

data class Journey(
    val active: Boolean = true,
    val startLabel: String,
    val start: LatLng,
    val destLabel: String,
    val dest: LatLng,
    val mode: String = "cab", // "cab", "walk", "metro"
    val startedAt: String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date()),
    val interval: Int = 15, // minutes
    val shareWith: List<String> = emptyList(),
    val status: String = "on-track", // "on-track", "checkin-due", "overdue", "arrived"
    val lastCheckIn: String? = null,
    val etaMinutes: Int = 18
)

data class SafeSpot(
    val id: String,
    val name: String,
    val type: String, // "Police Station", "Metro Station", "24/7 Pharmacy", "Hospital"
    val address: String,
    val distanceKm: Double,
    val isOpen24x7: Boolean = true,
    val pos: LatLng
)

data class AppSettings(
    val locationSharing: String = "journeys",
    val retentionDays: Int = 180,
    val requireConfirmShare: Boolean = true,
    val notifications: Boolean = true,
    val decoyPin: String = "112"
)

data class UserProfile(
    val name: String = "Shreya Sharma",
    val email: String = "shreya@example.com",
    val phone: String = "+91 98765 43210",
    val emergencyNote: String = "Blood Group: O+ • Allergy: Penicillin"
)
