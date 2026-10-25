package com.safecircle.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
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
import kotlinx.coroutines.delay

@Composable
fun SosCountdownScreen(
    viewModel: SafeCircleViewModel,
    onCancel: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var secondsRemaining by remember { mutableIntStateOf(5) }

    LaunchedEffect(secondsRemaining) {
        if (secondsRemaining > 0) {
            delay(1000)
            secondsRemaining--
        } else {
            viewModel.triggerSosImmediate()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onCancel) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Cancel", tint = Color.White)
            }
            Text("EMERGENCY • ACTIVE SOS", color = EmergencyRed, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(modifier = Modifier.size(48.dp))
        }

        // Countdown Area
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Sending SOS in…", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Bold)

            Spacer(modifier = Modifier.height(28.dp))

            Box(
                modifier = Modifier
                    .size(160.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1F1424)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = secondsRemaining.toString(),
                        color = Color.White,
                        fontSize = 58.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text("seconds", color = Color(0xFFA59AA8), fontSize = 13.sp)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Dispatching live GPS coordinates and emergency alert broadcast to ${state.contacts.filter { it.sosAlerts }.size} trusted guardians.",
                color = Color(0xFFA59AA8),
                fontSize = 13.sp,
                modifier = Modifier.padding(horizontal = 16.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Checklist
            listOf(
                "Create incident record on this device",
                "Stream GPS telemetry & audio chunk",
                "Broadcast Telegram & SMS alert pins"
            ).forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(22.dp)
                            .clip(CircleShape)
                            .background(SuccessSage),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(text = item, color = Color.White, fontSize = 13.sp)
                }
            }
        }

        // Actions
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onCancel,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF26202B))
            ) {
                Text("Cancel — I'm safe", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
            }

            Button(
                onClick = { viewModel.triggerSosImmediate() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed)
            ) {
                Text("Send Now (Immediate)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }
}
