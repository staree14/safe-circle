package com.safecircle.app.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import kotlinx.coroutines.delay

@Composable
fun FakeCallDialog(
    callerName: String = "Priya",
    onDismiss: () -> Unit
) {
    var isCallAccepted by remember { mutableStateOf(false) }
    var callSeconds by remember { mutableIntStateOf(0) }

    LaunchedEffect(isCallAccepted) {
        if (isCallAccepted) {
            while (true) {
                delay(1000)
                callSeconds++
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF16151A))
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top caller info
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(top = 48.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF332F3D)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = callerName.take(1).uppercase(),
                            color = Color.White,
                            fontSize = 40.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = callerName,
                        color = Color.White,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = if (!isCallAccepted) "Mobile" else String.format("%02d:%02d", callSeconds / 60, callSeconds % 60),
                        color = Color(0xFFA19EA8),
                        fontSize = 16.sp
                    )
                }

                // In-call script / prompt
                AnimatedVisibility(visible = isCallAccepted) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF23202B), shape = CircleShape)
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "\"Hey! Where are you? I'm waiting outside in the car, please come right now.\"",
                            color = Color(0xFFE2DFE8),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Normal
                        )
                    }
                }

                // Bottom Call Action Buttons
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (!isCallAccepted) {
                        // Decline
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            IconButton(
                                onClick = onDismiss,
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFE53935))
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CallEnd,
                                    contentDescription = "Decline",
                                    tint = Color.White,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Decline", color = Color.White, fontSize = 14.sp)
                        }

                        // Accept
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            IconButton(
                                onClick = { isCallAccepted = true },
                                modifier = Modifier
                                    .size(72.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2E7D32))
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Call,
                                    contentDescription = "Accept",
                                    tint = Color.White,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Accept", color = Color.White, fontSize = 14.sp)
                        }
                    } else {
                        // End Call
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            IconButton(
                                onClick = onDismiss,
                                modifier = Modifier
                                    .size(76.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFE53935))
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CallEnd,
                                    contentDescription = "End Call",
                                    tint = Color.White,
                                    modifier = Modifier.size(36.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("End Call", color = Color.White, fontSize = 14.sp)
                        }
                    }
                }
            }
        }
    }
}
