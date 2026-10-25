package com.safecircle.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.safecircle.app.components.*
import com.safecircle.app.screens.*
import com.safecircle.app.theme.*
import com.safecircle.app.viewmodel.SafeCircleViewModel

@Composable
fun SafeCircleApp(
    viewModel: SafeCircleViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(state.toastMessage) {
        state.toastMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearToast()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (!viewModel.showSosCountdown && !state.decoyActive) {
                NavigationBar(
                    containerColor = SafeCardBg,
                    tonalElevation = 8.dp
                ) {
                    val current = viewModel.currentScreen

                    NavigationBarItem(
                        selected = current == "home",
                        onClick = { viewModel.navigateTo("home") },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Home", fontWeight = if (current == "home") FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = SafeMaroon,
                            selectedTextColor = SafeMaroon,
                            indicatorColor = SafeBlush
                        )
                    )

                    NavigationBarItem(
                        selected = current == "journey",
                        onClick = { viewModel.navigateTo("journey") },
                        icon = { Icon(Icons.Default.Navigation, contentDescription = "Journey") },
                        label = { Text("Journey", fontWeight = if (current == "journey") FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = SafeMaroon,
                            selectedTextColor = SafeMaroon,
                            indicatorColor = SafeBlush
                        )
                    )

                    NavigationBarItem(
                        selected = current == "vault",
                        onClick = { viewModel.navigateTo("vault") },
                        icon = { Icon(Icons.Default.Lock, contentDescription = "Vault") },
                        label = { Text("Vault", fontWeight = if (current == "vault") FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = SafeMaroon,
                            selectedTextColor = SafeMaroon,
                            indicatorColor = SafeBlush
                        )
                    )

                    NavigationBarItem(
                        selected = current == "profile",
                        onClick = { viewModel.navigateTo("profile") },
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile", fontWeight = if (current == "profile") FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = SafeMaroon,
                            selectedTextColor = SafeMaroon,
                            indicatorColor = SafeBlush
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Main Screen Routing
            when (viewModel.currentScreen) {
                "home" -> HomeScreen(viewModel = viewModel)
                "journey" -> JourneyScreen(viewModel = viewModel)
                "vault" -> VaultScreen(viewModel = viewModel)
                "people" -> PeopleScreen(viewModel = viewModel)
                "profile" -> ProfileScreen(viewModel = viewModel)
                "report" -> ReportScreen(viewModel = viewModel)
                else -> HomeScreen(viewModel = viewModel)
            }

            // Full Screen Overlay: SOS Countdown
            if (viewModel.showSosCountdown) {
                SosCountdownScreen(
                    viewModel = viewModel,
                    onCancel = { viewModel.showSosCountdown = false }
                )
            }

            // Full Screen Overlay: Calculator Decoy
            if (state.decoyActive) {
                CalculatorDecoy(
                    onTriggerSos = { viewModel.triggerSosImmediate() },
                    onExitDecoy = { viewModel.setDecoyActive(false) }
                )
            }

            // Modal Dialogs & Sheets
            if (viewModel.showFakeCall) {
                FakeCallDialog(
                    callerName = state.contacts.firstOrNull()?.name?.split(" ")?.firstOrNull() ?: "Priya",
                    onDismiss = { viewModel.showFakeCall = false }
                )
            }

            if (viewModel.showSiren) {
                SirenStrobeDialog(
                    onDismiss = { viewModel.showSiren = false }
                )
            }

            if (viewModel.showHelplines) {
                HelplinesSheet(
                    onDismiss = { viewModel.showHelplines = false }
                )
            }

            if (viewModel.showOfflineSms) {
                OfflineSmsSheet(
                    contacts = state.contacts,
                    onDismiss = { viewModel.showOfflineSms = false }
                )
            }

            if (viewModel.showSafeSpots) {
                SafeSpotsSheet(
                    safeSpots = state.safeSpots,
                    onDismiss = { viewModel.showSafeSpots = false }
                )
            }
        }
    }
}
