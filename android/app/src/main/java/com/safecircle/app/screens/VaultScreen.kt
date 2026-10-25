package com.safecircle.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.model.Evidence
import com.safecircle.app.model.EvidenceKind
import com.safecircle.app.theme.*
import com.safecircle.app.viewmodel.SafeCircleViewModel

@Composable
fun VaultScreen(
    viewModel: SafeCircleViewModel
) {
    val state by viewModel.state.collectAsState()
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "Screenshots", "Videos", "Audio")

    val filteredEvidence = remember(state.evidence, selectedFilter) {
        when (selectedFilter) {
            "Screenshots" -> state.evidence.filter { it.kind == EvidenceKind.IMAGE }
            "Videos" -> state.evidence.filter { it.kind == EvidenceKind.VIDEO }
            "Audio" -> state.evidence.filter { it.kind == EvidenceKind.AUDIO }
            else -> state.evidence
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SafeBackground)
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Lock, contentDescription = null, tint = SafeRose, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("PRIVATE • ON THIS DEVICE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SafeRose)
                }
                Text("Evidence vault", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
            }

            IconButton(onClick = { /* Search */ }) {
                Icon(imageVector = Icons.Default.Search, contentDescription = "Search", tint = SafeTextDark)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Filter Tabs
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            filters.forEach { filter ->
                val isSelected = filter == selectedFilter
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (isSelected) SafeCardBg else Color.Transparent,
                    border = if (isSelected) BorderStroke(1.dp, SafeBorder) else null,
                    modifier = Modifier.clickable { selectedFilter = filter }
                ) {
                    Text(
                        text = filter,
                        color = if (isSelected) SafeMaroon else SafeTextMuted,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Actions (Record & Upload)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = {
                    viewModel.addEvidence("incident_mic_recording_${System.currentTimeMillis() % 1000}.wav", EvidenceKind.AUDIO, 420000L, "Live captured audio snippet")
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE8F5E9))
            ) {
                Icon(imageVector = Icons.Default.Mic, contentDescription = null, tint = SuccessSage, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Record Audio", color = SuccessSage, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            Button(
                onClick = {
                    viewModel.addEvidence("harassment_screenshot_${System.currentTimeMillis() % 1000}.jpg", EvidenceKind.IMAGE, 280000L, "Uploaded chat proof")
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SafeBlush)
            ) {
                Icon(imageVector = Icons.Default.FileUpload, contentDescription = null, tint = SafeMaroon, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Upload Proof", color = SafeMaroon, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Evidence Items List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredEvidence) { item ->
                EvidenceCard(item)
            }
        }
    }
}

@Composable
fun EvidenceCard(item: Evidence) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SafeCardBg)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Media Icon Box
            val icon = when (item.kind) {
                EvidenceKind.IMAGE -> Icons.Default.Image
                EvidenceKind.VIDEO -> Icons.Default.Videocam
                EvidenceKind.AUDIO -> Icons.Default.Mic
            }
            val iconBg = when (item.kind) {
                EvidenceKind.IMAGE -> Color(0xFFE3F2FD)
                EvidenceKind.VIDEO -> Color(0xFFFFEBEE)
                EvidenceKind.AUDIO -> Color(0xFFFFF3E0)
            }
            val iconColor = when (item.kind) {
                EvidenceKind.IMAGE -> Color(0xFF1976D2)
                EvidenceKind.VIDEO -> EmergencyRed
                EvidenceKind.AUDIO -> WarningAmber
            }

            Box(
                modifier = Modifier
                    .size(50.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(24.dp))
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = item.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark, maxLines = 1)
                Text(
                    text = "${item.format} • ${item.size / 1024} KB ${item.duration?.let { "• 0:${String.format("%02d", it)}" } ?: ""}",
                    fontSize = 11.sp,
                    color = SafeTextMuted
                )

                Spacer(modifier = Modifier.height(6.dp))

                // SHA-256 Seal Badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(shape = RoundedCornerShape(8.dp), color = Color(0xFFE8F5E9)) {
                        Row(modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = SuccessSage, modifier = Modifier.size(10.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("SHA-256 Sealed", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SuccessSage)
                        }
                    }
                    if (item.hash != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = item.hash.value.take(8) + "...",
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            color = SafeTextMuted
                        )
                    }
                }
            }

            Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = SafeTextMuted)
        }
    }
}
