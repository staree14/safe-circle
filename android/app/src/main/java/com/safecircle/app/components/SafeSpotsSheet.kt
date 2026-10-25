package com.safecircle.app.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocalPharmacy
import androidx.compose.material.icons.filled.LocalPolice
import androidx.compose.material.icons.filled.Subway
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.model.SafeSpot
import com.safecircle.app.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SafeSpotsSheet(
    safeSpots: List<SafeSpot>,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SafeCardBg,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 36.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Verified Safe Havens Nearby",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = SafeTextDark
                )
                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = SafeTextMuted)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            safeSpots.forEach { spot ->
                val icon = when {
                    spot.type.contains("Police") -> Icons.Default.LocalPolice
                    spot.type.contains("Pharmacy") -> Icons.Default.LocalPharmacy
                    spot.type.contains("Hospital") -> Icons.Default.LocalHospital
                    else -> Icons.Default.Subway
                }
                val iconColor = when {
                    spot.type.contains("Police") -> Color(0xFF1976D2)
                    spot.type.contains("Pharmacy") -> Color(0xFF388E3C)
                    spot.type.contains("Hospital") -> Color(0xFFD32F2F)
                    else -> Color(0xFF7B1FA2)
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SafeBlush)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(iconColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(24.dp))
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = spot.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SafeTextDark)
                            Text(text = spot.address, fontSize = 12.sp, color = SafeTextMuted)
                            Row(modifier = Modifier.padding(top = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (spot.isOpen24x7) "Open 24/7" else "Daytime Only",
                                    color = if (spot.isOpen24x7) SuccessSage else WarningAmber,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(text = " • ${spot.distanceKm} km away", color = SafeTextMuted, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
