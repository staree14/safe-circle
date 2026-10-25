package com.safecircle.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
fun ProfileScreen(
    viewModel: SafeCircleViewModel
) {
    val state by viewModel.state.collectAsState()
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SafeBackground)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.navigateTo("home") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = SafeTextDark)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text("Settings & Profile", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Profile Avatar Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SafeCardBg)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(SafeBlush),
                    contentAlignment = Alignment.Center
                ) {
                    Text("SS", fontWeight = FontWeight.Bold, fontSize = 24.sp, color = SafeMaroon)
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(text = state.profile.name, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = SafeTextDark)
                    Text(text = state.profile.email, fontSize = 13.sp, color = SafeTextMuted)
                    Text(text = state.profile.phone, fontSize = 13.sp, color = SafeTextMuted)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Emergency Medical Note
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SafeCardBg)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Emergency Medical Info", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = state.profile.emergencyNote, fontSize = 13.sp, color = SafeTextMuted)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Decoy PIN Setup
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
                    Text("Camouflage Decoy PIN", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
                    Text("Current PIN: 112= (triggers stealth SOS)", fontSize = 12.sp, color = SafeTextMuted)
                }
                Button(
                    onClick = { viewModel.setDecoyActive(true) },
                    colors = ButtonDefaults.buttonColors(containerColor = SafeBlush)
                ) {
                    Text("Test Decoy", color = SafeMaroon, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(30.dp))

        // Reset demo state
        OutlinedButton(
            onClick = { viewModel.resetAll() },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Reset Prototype to Default State", color = EmergencyRed, fontWeight = FontWeight.SemiBold)
        }
    }
}
