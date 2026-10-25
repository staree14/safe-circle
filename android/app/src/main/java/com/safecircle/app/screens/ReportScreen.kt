package com.safecircle.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.theme.*
import com.safecircle.app.viewmodel.SafeCircleViewModel

@Composable
fun ReportScreen(
    viewModel: SafeCircleViewModel
) {
    val scrollState = rememberScrollState()
    var incidentType by remember { mutableStateOf("Digital Harassment") }
    var selectedCategory by remember { mutableStateOf("Online Stalking & Harassment") }
    var description by remember { mutableStateOf("") }

    val categories = listOf(
        "Online Stalking & Harassment (BNS Sec 78)",
        "Obscene/Threatening Messages (IT Act Sec 67)",
        "Impersonation & Fake Profile (IT Act Sec 66D)",
        "Physical Following / Suspicious Transit"
    )

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
            Text("File Incident Dossier", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SafeBlush)
        ) {
            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.Gavel, contentDescription = null, tint = SafeMaroon, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Judicial Evidence Preservation", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeMaroon)
                    Text("All attached evidence is hashed with SHA-256 for Section 65B Electronic Evidence compliance.", fontSize = 11.sp, color = SafeTextMuted)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text("Select Threat Classification", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
        Spacer(modifier = Modifier.height(8.dp))

        categories.forEach { cat ->
            val isSelected = cat == selectedCategory
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (isSelected) SafeMaroon else SafeCardBg,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { selectedCategory = cat }
            ) {
                Text(
                    text = cat,
                    color = if (isSelected) Color.White else SafeTextDark,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(14.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text("Incident Statement / Notes", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            placeholder = { Text("Describe what happened, platform or handle, dates...") },
            modifier = Modifier
                .fillMaxWidth()
                .height(130.dp),
            shape = RoundedCornerShape(14.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                viewModel.showToast("Incident Report Sealed & Saved")
                viewModel.navigateTo("vault")
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SafeMaroon)
        ) {
            Text("Seal & Save to Vault", fontWeight = FontWeight.Bold, fontSize = 15.sp)
        }
    }
}
