package com.safecircle.app.viewmodel

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import com.safecircle.app.data.AppState
import com.safecircle.app.data.SafeCircleRepository
import com.safecircle.app.model.EvidenceKind
import com.safecircle.app.model.LatLng
import kotlinx.coroutines.flow.StateFlow

class SafeCircleViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = SafeCircleRepository(application)
    val state: StateFlow<AppState> = repo.state

    var currentScreen by mutableStateOf("home")
        private set

    // Modal Sheet & Dialog States
    var showFakeCall by mutableStateOf(false)
    var showSiren by mutableStateOf(false)
    var showHelplines by mutableStateOf(false)
    var showOfflineSms by mutableStateOf(false)
    var showSafeSpots by mutableStateOf(false)
    var showSosCountdown by mutableStateOf(false)

    fun navigateTo(screen: String) {
        currentScreen = screen
    }

    fun triggerSosImmediate(pos: LatLng? = null): String {
        showSosCountdown = false
        val id = repo.triggerSOS(pos)
        navigateTo("home")
        return id
    }

    fun setDecoyActive(active: Boolean) {
        repo.setDecoyActive(active)
    }

    fun clearToast() {
        repo.clearToast()
    }

    fun showToast(msg: String) {
        repo.showToast(msg)
    }

    fun addContact(name: String, relation: String, phone: String) {
        repo.addContact(name, relation, phone)
    }

    fun removeContact(id: String) {
        repo.removeContact(id)
    }

    fun addEvidence(name: String, kind: EvidenceKind, size: Long, note: String): String {
        return repo.addEvidence(name, kind, size, note)
    }

    fun startJourney(startLabel: String, destLabel: String, mode: String, shareWith: List<String>) {
        repo.startJourney(startLabel, destLabel, mode, shareWith)
        navigateTo("journey")
    }

    fun checkInJourney() {
        repo.checkInJourney()
    }

    fun endJourney() {
        repo.endJourney()
    }

    fun resetAll() {
        repo.resetAll()
        navigateTo("home")
    }
}
