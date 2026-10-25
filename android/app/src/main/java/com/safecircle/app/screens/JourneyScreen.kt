package com.safecircle.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.theme.*
import com.safecircle.app.viewmodel.SafeCircleViewModel

@Composable
fun JourneyScreen(
    viewModel: SafeCircleViewModel
) {
    val state by viewModel.state.collectAsState()
    val scrollState = rememberScrollState()

    var origin by remember { mutableStateOf("MG Road, Bengaluru") }
    var destination by remember { mutableStateOf("Malleswaram, Bengaluru") }
    var selectedMode by remember { mutableStateOf("Car / cab") }
    val modes = listOf("Car / cab", "Walking", "Metro")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SafeBackground)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(onClick = { viewModel.navigateTo("home") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = SafeTextDark)
            }
            Text(text = "Safe Journey", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
            IconButton(onClick = { viewModel.setDecoyActive(true) }) {
                Icon(imageVector = Icons.Default.Lock, contentDescription = "Decoy", tint = SafeTextMuted)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Check if journey is active
        if (state.journey != null) {
            ActiveJourneyCard(
                journey = state.journey!!,
                onCheckIn = { viewModel.checkInJourney() },
                onEnd = { viewModel.endJourney() }
            )
            return
        }

        // Location inputs
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SafeCardBg)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Origin
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.MyLocation, contentDescription = null, tint = SafeRose, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = origin, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = SafeTextDark)
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = SafeBorder)

                // Destination
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Place, contentDescription = null, tint = EmergencyRed, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = destination, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = SafeTextDark)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Mode of transport & Safe Spots Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            modes.forEach { mode ->
                val isSelected = mode == selectedMode
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (isSelected) SafeMaroon else SafeCardBg,
                    border = if (!isSelected) BorderStroke(1.dp, SafeBorder) else null,
                    modifier = Modifier.clickable { selectedMode = mode }
                ) {
                    Text(
                        text = mode,
                        color = if (isSelected) Color.White else SafeTextDark,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            }

            // Safe Havens trigger
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = SuccessSage,
                modifier = Modifier.clickable { viewModel.showSafeSpots = true }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Safe spots", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Simulated Route Radar Map Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFE8EEF5))
        ) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(imageVector = Icons.Default.Map, contentDescription = null, tint = SafeMaroon, modifier = Modifier.size(44.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Bengaluru Safe Transit Corridor", fontWeight = FontWeight.Bold, color = SafeTextDark, fontSize = 14.sp)
                    Text("4 Verified Safe Havens En Route", color = SafeTextMuted, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Presets (Home, College, Riya's flat)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            state.places.forEach { place ->
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = SafeCardBg,
                    border = BorderStroke(1.dp, SafeBorder),
                    modifier = Modifier.clickable { destination = place.address }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Place, contentDescription = null, tint = SafeRose, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = place.label, fontSize = 12.sp, color = SafeTextDark)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Estimated Arrival
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SafeCardBg)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "ESTIMATED ARRIVAL", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SafeTextMuted)
                    Text(text = "5:58 pm", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = SafeMaroon)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "8 min", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
                    Text(text = "7.3 km • $selectedMode", fontSize = 12.sp, color = SafeTextMuted)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Share with circle contacts
        Text(text = "Share with (they'd see your journey when it starts):", fontSize = 13.sp, color = SafeTextMuted)
        Spacer(modifier = Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            state.contacts.forEach { contact ->
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(SafeBlush)
                        .border(1.5.dp, SafeMaroon, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = contact.name.take(1), fontWeight = FontWeight.Bold, color = SafeMaroon)
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = {
                viewModel.startJourney(origin, destination, selectedMode, state.contacts.map { it.id })
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SafeMaroon)
        ) {
            Icon(imageVector = Icons.Default.Navigation, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "Start Safe Journey", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ActiveJourneyCard(
    journey: com.safecircle.app.model.Journey,
    onCheckIn: () -> Unit,
    onEnd: () -> Unit
) {
    Column {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = SafeMaroon)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "JOURNEY IN PROGRESS", color = Color(0xFFFFD5DD), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Surface(shape = RoundedCornerShape(12.dp), color = SuccessSage) {
                        Text(text = "On track", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(text = "ARRIVING AT", color = Color(0xFFFFD5DD), fontSize = 11.sp)
                        Text(text = "5:59 pm", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                        Text(text = journey.destLabel, color = Color(0xFFF0E4E7), fontSize = 13.sp)
                    }
                    Text(text = "8 min", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = onCheckIn,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE8F5E9))
        ) {
            Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = SuccessSage)
            Spacer(modifier = Modifier.width(8.dp))
            Text("I'm safe: check in", color = SuccessSage, fontWeight = FontWeight.Bold, fontSize = 15.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(imageVector = Icons.Default.Schedule, contentDescription = null, tint = SafeTextMuted, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Next check-in in 15 min. Auto-alert triggers if missed.", fontSize = 12.sp, color = SafeTextMuted)
        }

        Spacer(modifier = Modifier.height(28.dp))

        OutlinedButton(
            onClick = onEnd,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(14.dp)
        ) {
            Text("End Journey", color = SafeMaroon, fontWeight = FontWeight.SemiBold)
        }
    }
}
