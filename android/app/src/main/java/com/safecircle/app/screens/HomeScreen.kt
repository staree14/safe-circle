package com.safecircle.app.screens

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.theme.*
import com.safecircle.app.viewmodel.SafeCircleViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
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
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(SafeMaroon),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text(text = "SafeCircle", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = SafeMaroon)
            }

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = { viewModel.setDecoyActive(true) },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(SafeCardBg)
                        .border(1.dp, SafeBorder, CircleShape)
                ) {
                    Icon(imageVector = Icons.Default.Lock, contentDescription = "Calculator Decoy", tint = SafeTextDark, modifier = Modifier.size(18.dp))
                }
                IconButton(
                    onClick = { /* Notifications */ },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(SafeCardBg)
                        .border(1.dp, SafeBorder, CircleShape)
                ) {
                    Icon(imageVector = Icons.Default.Notifications, contentDescription = "Alerts", tint = SafeTextDark, modifier = Modifier.size(18.dp))
                }
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(SafeBlush)
                        .clickable { viewModel.navigateTo("profile") },
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "SS", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SafeMaroon)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Greeting & Status Pill
        Text(text = "Good afternoon,", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
        Text(text = state.profile.name.split(" ")[0], fontSize = 28.sp, fontWeight = FontWeight.Bold, color = SafeMaroon)

        Spacer(modifier = Modifier.height(10.dp))

        val activeInc = state.incidents.firstOrNull { it.status == "active" }
        if (activeInc != null) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFFFFEBEE),
                modifier = Modifier.clickable { viewModel.navigateTo("vault") }
            ) {
                Row(modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(EmergencyRed))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Active incident • tap to view", color = EmergencyRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        } else if (state.journey != null) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFFE8F5E9),
                modifier = Modifier.clickable { viewModel.navigateTo("journey") }
            ) {
                Row(modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(SuccessSage))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Safe journey in progress", color = SuccessSage, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Quick Safety Tools Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            QuickToolButton(
                title = "Helplines",
                subtitle = "112 • 1091",
                icon = Icons.Default.Phone,
                iconBg = Color(0xFFFFF0F2),
                iconColor = SafeMaroon,
                modifier = Modifier.weight(1f)
            ) { viewModel.showHelplines = true }

            QuickToolButton(
                title = "Fake Call",
                subtitle = "Escape",
                icon = Icons.Default.Notifications,
                iconBg = Color(0xFFFFF7EC),
                iconColor = WarningAmber,
                modifier = Modifier.weight(1f)
            ) { viewModel.showFakeCall = true }

            QuickToolButton(
                title = "Siren",
                subtitle = "Alarm & strobe",
                icon = Icons.Default.Warning,
                iconBg = Color(0xFFFFEBEE),
                iconColor = EmergencyRed,
                modifier = Modifier.weight(1f)
            ) { viewModel.showSiren = true }

            QuickToolButton(
                title = "Offline SMS",
                subtitle = "1-tap GPS",
                icon = Icons.Default.Send,
                iconBg = Color(0xFFE8F5E9),
                iconColor = SuccessSage,
                modifier = Modifier.weight(1f)
            ) { viewModel.showOfflineSms = true }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // SOS 2-Second Hold Button
        SosHoldButton(
            onTrigger = { viewModel.showSosCountdown = true }
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Action Cards (Journey & Report)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(
                modifier = Modifier
                    .weight(1f)
                    .clickable { viewModel.navigateTo("journey") },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SafeCardBg)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Box(modifier = Modifier.size(36.dp).clip(CircleShape).background(Color(0xFFE8F5E9)), contentAlignment = Alignment.Center) {
                        Icon(imageVector = Icons.Default.Navigation, contentDescription = null, tint = SuccessSage, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = "Safe Journey", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
                    Text(text = "Share route & safe havens", fontSize = 11.sp, color = SafeTextMuted)
                }
            }

            Card(
                modifier = Modifier
                    .weight(1f)
                    .clickable { viewModel.navigateTo("report") },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SafeCardBg)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Box(modifier = Modifier.size(36.dp).clip(CircleShape).background(SafeBlush), contentAlignment = Alignment.Center) {
                        Icon(imageVector = Icons.Default.Flag, contentDescription = null, tint = SafeMaroon, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = "Report Incident", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
                    Text(text = "Preserve legal evidence", fontSize = 11.sp, color = SafeTextMuted)
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Trusted Contacts Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = "Trusted Contacts", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = SafeTextDark)
                Text(text = "${state.contacts.size} people in your circle", fontSize = 12.sp, color = SafeTextMuted)
            }
            TextButton(onClick = { viewModel.navigateTo("people") }) {
                Text("Manage", color = SafeMaroon, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SafeCardBg)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                state.contacts.take(3).forEach { contact ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { viewModel.navigateTo("people") }
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(SafeBlush),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = contact.name.take(1), fontWeight = FontWeight.Bold, color = SafeMaroon, fontSize = 18.sp)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = contact.name.split(" ")[0], fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = SafeTextDark)
                        Text(text = contact.relation, fontSize = 11.sp, color = SafeTextMuted)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}

@Composable
fun QuickToolButton(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconBg: Color,
    iconColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(100.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SafeCardBg)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SafeTextDark)
            Text(text = subtitle, fontSize = 9.sp, color = SafeTextMuted, maxLines = 1)
        }
    }
}

@Composable
fun SosHoldButton(
    onTrigger: () -> Unit
) {
    val view = LocalView.current
    var isHolding by remember { mutableStateOf(false) }
    var holdProgress by remember { mutableFloatStateOf(0f) }
    val animatedProgress by animateFloatAsState(targetValue = holdProgress, label = "hold_progress")
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(isHolding) {
        if (isHolding) {
            val startTime = System.currentTimeMillis()
            while (isHolding) {
                val elapsed = System.currentTimeMillis() - startTime
                holdProgress = (elapsed / 2000f).coerceIn(0f, 1f)
                if (holdProgress >= 1f) {
                    view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                    isHolding = false
                    holdProgress = 0f
                    onTrigger()
                    break
                }
                delay(30)
            }
        } else {
            holdProgress = 0f
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(190.dp)
                .pointerInput(Unit) {
                    detectTapGestures(
                        onPress = {
                            view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                            isHolding = true
                            tryAwaitRelease()
                            isHolding = false
                        }
                    )
                },
            contentAlignment = Alignment.Center
        ) {
            // Circular Progress Indicator around button
            androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
                val strokeWidth = 8.dp.toPx()
                // Track
                drawCircle(
                    color = Color(0xFFFFEBEE),
                    radius = size.minDimension / 2 - strokeWidth / 2,
                    style = Stroke(width = strokeWidth)
                )
                // Progress
                if (animatedProgress > 0f) {
                    drawArc(
                        color = EmergencyRed,
                        startAngle = -90f,
                        sweepAngle = animatedProgress * 360f,
                        useCenter = false,
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                    )
                }
            }

            // Big SOS button
            Box(
                modifier = Modifier
                    .size(160.dp)
                    .clip(CircleShape)
                    .background(EmergencyRed),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "SOS", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "Press and hold for 2 seconds", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
        Text(text = "to start an emergency alert. Releasing early cancels.", fontSize = 12.sp, color = SafeTextMuted)
    }
}
