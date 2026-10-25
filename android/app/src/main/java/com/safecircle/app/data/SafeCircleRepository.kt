package com.safecircle.app.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.safecircle.app.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

data class AppState(
    val profile: UserProfile = UserProfile(),
    val settings: AppSettings = AppSettings(),
    val contacts: List<Contact> = emptyList(),
    val places: List<Place> = emptyList(),
    val incidents: List<Incident> = emptyList(),
    val evidence: List<Evidence> = emptyList(),
    val safeSpots: List<SafeSpot> = emptyList(),
    val journey: Journey? = null,
    val decoyActive: Boolean = false,
    val toastMessage: String? = null,
    val counter: Int = 143
)

class SafeCircleRepository(private val context: Context) {
    private val gson = Gson()
    private val prefs = context.getSharedPreferences("safecircle_prefs", Context.MODE_PRIVATE)

    private val _state = MutableStateFlow(loadInitialState())
    val state: StateFlow<AppState> = _state.asStateFlow()

    private val ioScope = CoroutineScope(Dispatchers.IO)

    private fun nowIso(): String {
        return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
    }

    private fun seedEvidence(): List<Evidence> = listOf(
        Evidence(
            id = "e1",
            kind = EvidenceKind.IMAGE,
            name = "chat_unknown_user_88.jpg",
            url = "/screenshots/demo_threatening_chat.jpg",
            incidentId = "SC-2026-0138",
            size = 500508L,
            format = "JPEG",
            hash = HashInfo("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
            note = "Fictional demo threat screenshot"
        ),
        Evidence(
            id = "e2",
            kind = EvidenceKind.IMAGE,
            name = "fake_account_profile.jpg",
            url = "/screenshots/demo_suspicious_account.jpg",
            incidentId = "SC-2026-0138",
            size = 333896L,
            format = "JPEG",
            hash = HashInfo("4b22777712dcf93402778ff952bb6c8a94749392285fb20b2496738942b036ec"),
            note = "Fictional demo imposter profile"
        ),
        Evidence(
            id = "e3",
            kind = EvidenceKind.IMAGE,
            name = "impersonation_message.jpg",
            url = "/screenshots/demo_impersonation_message.jpg",
            incidentId = "SC-2026-0138",
            size = 351086L,
            format = "JPEG",
            hash = HashInfo("ef2d127d1425e40e69a9b40bc84d12c98d6333bb6a27e025ec1ff50ad7521c76"),
            note = "Fictional demo SMS phishing evidence"
        ),
        Evidence(
            id = "e4",
            kind = EvidenceKind.VIDEO,
            name = "demo_clip_street_walk.mp4",
            url = "/videos/demo_sample_clip.mp4",
            incidentId = "SC-2026-0142",
            size = 788493L,
            format = "MP4",
            duration = 4,
            hash = HashInfo("9a456fe2b4f981240c11ba90022316e62551a89c3bc8923a1a9e9a4f6e1f0b4d"),
            note = "Neutral sample footage (no real people)"
        ),
        Evidence(
            id = "e5",
            kind = EvidenceKind.VIDEO,
            name = "demo_clip_roadside.mp4",
            url = "/videos/demo_flower_clip.mp4",
            incidentId = "SC-2026-0142",
            size = 1128375L,
            format = "MP4",
            duration = 5,
            hash = HashInfo("4a6b98e1f02c918237b6c7e2d3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f"),
            note = "Neutral sample footage"
        ),
        Evidence(
            id = "e6",
            kind = EvidenceKind.AUDIO,
            name = "demo_audio_short.wav",
            url = "/audio/demo_audio_sample_short.wav",
            incidentId = "SC-2026-0142",
            size = 384044L,
            format = "WAV",
            duration = 12,
            hash = HashInfo("8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"),
            note = "Synthetic tone sample"
        ),
        Evidence(
            id = "e7",
            kind = EvidenceKind.AUDIO,
            name = "demo_audio_long.wav",
            url = "/audio/demo_audio_sample_long.wav",
            incidentId = "SC-2026-0142",
            size = 864044L,
            format = "WAV",
            duration = 27,
            hash = HashInfo("2b56e6328ff91bca7681c2069e20a4b95f1712a819bcf012c4992bb193a055ff"),
            note = "Synthetic tone sample"
        )
    )

    private fun seedContacts(): List<Contact> = listOf(
        Contact("c1", "Priya Sharma", "Mother", "+91 98765 43210", journeyAlerts = true, sosAlerts = true, missedCheckIn = true),
        Contact("c2", "Riya Menon", "Friend", "+91 91234 56780", journeyAlerts = true, sosAlerts = true, missedCheckIn = false),
        Contact("c3", "Karan Sharma", "Brother", "+91 99887 76650", journeyAlerts = false, sosAlerts = true, missedCheckIn = true)
    )

    private fun seedPlaces(): List<Place> = listOf(
        Place("p1", "Home", "Sample address, tap Edit to set your own", LatLng(12.9352, 77.6245), hideAddress = true),
        Place("p2", "College", "Sample College Campus (fictional)", LatLng(12.9698, 77.7499), hideAddress = false),
        Place("p3", "Riya's flat", "Indiranagar (sample)", LatLng(12.9784, 77.6408), hideAddress = false)
    )

    private fun seedSafeSpots(): List<SafeSpot> = listOf(
        SafeSpot("s1", "MG Road Metro Station", "Metro Station", "MG Road, Bengaluru", 0.3, true, LatLng(12.9756, 77.6068)),
        SafeSpot("s2", "Apollo 24/7 Pharmacy", "24/7 Pharmacy", "Brigade Road Junction", 0.5, true, LatLng(12.9716, 77.6075)),
        SafeSpot("s3", "Cubbon Park Police Station", "Police Station", "Kasturba Road", 0.9, true, LatLng(12.9765, 77.5930)),
        SafeSpot("s4", "Bowring & Lady Curzon Hospital", "Hospital", "Shivaji Nagar", 1.4, true, LatLng(12.9830, 77.6010))
    )

    private fun seedIncidents(): List<Incident> = listOf(
        Incident(
            id = "SC-2026-0142",
            title = "Followed after evening class",
            type = "physical",
            category = "Being followed",
            status = "open",
            locationText = "Near MG Road (sample)",
            pos = LatLng(12.9756, 77.6068),
            description = "Fictional demo scenario: a person walked behind me for several blocks after class. Recorded short clips and audio notes.",
            acks = mapOf("c1" to "acknowledged", "c2" to "acknowledged", "c3" to "pending"),
            timeline = listOf(
                TimelineEvent("t1", nowIso(), TimelineKind.CREATED, "Incident record created (demo data)"),
                TimelineEvent("t2", nowIso(), TimelineKind.EVIDENCE, "Video added: demo_clip_street_walk.mp4"),
                TimelineEvent("t3", nowIso(), TimelineKind.EVIDENCE, "Audio added: demo_audio_short.wav"),
                TimelineEvent("t4", nowIso(), TimelineKind.ACK, "Priya acknowledged (sample data)")
            )
        ),
        Incident(
            id = "SC-2026-0138",
            title = "Threats and fake account",
            type = "digital",
            category = "Threats & impersonation",
            status = "open",
            description = "Fictional demo scenario: threatening messages from an unknown account plus a fake profile.",
            timeline = listOf(
                TimelineEvent("t5", nowIso(), TimelineKind.CREATED, "Incident record created (demo data)"),
                TimelineEvent("t6", nowIso(), TimelineKind.EVIDENCE, "Screenshot added: fake_account_profile.jpg"),
                TimelineEvent("t7", nowIso(), TimelineKind.EVIDENCE, "Screenshot added: impersonation_message.jpg")
            )
        )
    )

    private fun loadInitialState(): AppState {
        return AppState(
            contacts = seedContacts(),
            places = seedPlaces(),
            incidents = seedIncidents(),
            evidence = seedEvidence(),
            safeSpots = seedSafeSpots()
        )
    }

    fun triggerSOS(pos: LatLng? = LatLng(12.9850, 77.5850)): String {
        val current = _state.value
        val id = "SC-2026-${String.format(Locale.US, "%04d", current.counter)}"
        val now = nowIso()
        val acks = current.contacts.filter { it.sosAlerts }.associate { it.id to "pending" }

        val newIncident = Incident(
            id = id,
            title = "SOS alert (demo)",
            type = "physical",
            category = "SOS",
            status = "active",
            at = now,
            pos = pos,
            locationText = if (pos != null) "Lat ${pos.latitude}, Lng ${pos.longitude}" else "Location not captured",
            description = "SOS triggered from SafeCircle Android App.",
            acks = acks,
            timeline = listOf(
                TimelineEvent(UUID.randomUUID().toString(), now, TimelineKind.SOS, "SOS triggered by you"),
                TimelineEvent(UUID.randomUUID().toString(), now, TimelineKind.ALERT, "Alert prepared for ${acks.size} contacts. DEMO: simulated.")
            )
        )

        _state.update {
            it.copy(
                counter = it.counter + 1,
                incidents = listOf(newIncident) + it.incidents,
                toastMessage = "Emergency SOS Activated!"
            )
        }

        // Send async telemetry to FastAPI Backend
        ioScope.launch {
            try {
                val url = URL("http://10.0.2.2:8000/api/incidents/physical") // 10.0.2.2 maps to host localhost in Android emulator
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 3000
                conn.readTimeout = 3000

                val payload = """
                    {
                        "user_id": "demo",
                        "lat": ${pos?.latitude ?: 12.9850},
                        "lng": ${pos?.longitude ?: 77.5850},
                        "battery_level": 82,
                        "trigger_mode": "ANDROID_KOTLIN_APP"
                    }
                """.trimIndent()

                OutputStreamWriter(conn.outputStream).use { it.write(payload) }
                conn.responseCode
            } catch (_: Exception) {
                // Silently ignore if backend offline in demo mode
            }
        }

        return id
    }

    fun setDecoyActive(active: Boolean) {
        _state.update { it.copy(decoyActive = active) }
    }

    fun clearToast() {
        _state.update { it.copy(toastMessage = null) }
    }

    fun showToast(msg: String) {
        _state.update { it.copy(toastMessage = msg) }
    }

    fun addContact(name: String, relation: String, phone: String) {
        val newC = Contact(UUID.randomUUID().toString(), name, relation, phone)
        _state.update { it.copy(contacts = it.contacts + newC, toastMessage = "Contact added") }
    }

    fun removeContact(id: String) {
        _state.update { it.copy(contacts = it.contacts.filterNot { c -> c.id == id }) }
    }

    fun addEvidence(name: String, kind: EvidenceKind, size: Long, note: String): String {
        val id = "e_${UUID.randomUUID().toString().take(6)}"
        val hash = Sha256Hasher.hashString("$name-${System.currentTimeMillis()}")
        val item = Evidence(
            id = id,
            kind = kind,
            name = name,
            size = size,
            hash = HashInfo(hash),
            note = note
        )
        _state.update { it.copy(evidence = listOf(item) + it.evidence, toastMessage = "Sealed exhibit $name added") }
        return id
    }

    fun startJourney(startLabel: String, destLabel: String, mode: String, shareWith: List<String>) {
        val j = Journey(
            active = true,
            startLabel = startLabel,
            start = LatLng(12.9716, 77.5946),
            destLabel = destLabel,
            dest = LatLng(12.9850, 77.5850),
            mode = mode,
            shareWith = shareWith,
            status = "on-track"
        )
        _state.update { it.copy(journey = j, toastMessage = "Safe Journey Started") }
    }

    fun checkInJourney() {
        _state.update {
            val cur = it.journey ?: return@update it
            it.copy(
                journey = cur.copy(lastCheckIn = nowIso(), status = "on-track"),
                toastMessage = "Checked in: Safe!"
            )
        }
    }

    fun endJourney() {
        _state.update { it.copy(journey = null, toastMessage = "Journey Ended") }
    }

    fun resetAll() {
        _state.value = loadInitialState()
    }
}
