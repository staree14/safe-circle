package com.safecircle.app.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.model.Contact
import com.safecircle.app.theme.*
import com.safecircle.app.viewmodel.SafeCircleViewModel

@Composable
fun PeopleScreen(
    viewModel: SafeCircleViewModel
) {
    val state by viewModel.state.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SafeBackground)
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.navigateTo("home") }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = SafeTextDark)
            }
            Text("Safety Circle", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
            IconButton(onClick = { showAddDialog = true }) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add Contact", tint = SafeMaroon)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Your Trusted Guardians",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = SafeTextDark
        )
        Text(
            text = "These contacts will receive immediate SMS, live GPS coordinates, and Telegram broadcasts when you trigger SOS.",
            fontSize = 13.sp,
            color = SafeTextMuted
        )

        Spacer(modifier = Modifier.height(20.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(state.contacts) { contact ->
                ContactCard(
                    contact = contact,
                    onDelete = { viewModel.removeContact(contact.id) }
                )
            }
        }
    }

    // Add Contact Dialog
    if (showAddDialog) {
        var name by remember { mutableStateOf("") }
        var relation by remember { mutableStateOf("") }
        var phone by remember { mutableStateOf("+91 ") }

        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Trusted Contact") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = relation,
                        onValueChange = { relation = it },
                        label = { Text("Relationship (e.g. Sister, Friend)") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (name.isNotBlank()) {
                            viewModel.addContact(name, relation, phone)
                            showAddDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SafeMaroon)
                ) {
                    Text("Add Contact")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun ContactCard(
    contact: Contact,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SafeCardBg)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(SafeBlush),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = contact.name.take(1), fontWeight = FontWeight.Bold, color = SafeMaroon, fontSize = 20.sp)
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column {
                    Text(text = contact.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = SafeTextDark)
                    Text(text = "${contact.relation} • ${contact.phone}", fontSize = 12.sp, color = SafeTextMuted)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        if (contact.sosAlerts) {
                            Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFFFEBEE)) {
                                Text("SOS Alert", fontSize = 10.sp, color = EmergencyRed, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }
                        if (contact.journeyAlerts) {
                            Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFE8F5E9)) {
                                Text("Journey", fontSize = 10.sp, color = SuccessSage, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }
                    }
                }
            }

            IconButton(onClick = onDelete) {
                Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete", tint = SafeTextMuted)
            }
        }
    }
}
