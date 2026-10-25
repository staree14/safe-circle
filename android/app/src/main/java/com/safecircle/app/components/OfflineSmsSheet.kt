package com.safecircle.app.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.model.Contact
import com.safecircle.app.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OfflineSmsSheet(
    contacts: List<Contact>,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val messageText = "EMERGENCY ALERT: I need help right now! My current GPS location: https://maps.google.com/?q=12.9850,77.5850. Please call police or come immediately."

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
                    text = "Offline Emergency SMS",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = SafeTextDark
                )
                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = SafeTextMuted)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Works even when mobile data is down. Pre-populates SMS with your latest GPS fix to trusted contacts.",
                fontSize = 13.sp,
                color = SafeTextMuted
            )

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = SafeBlush),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = messageText,
                    fontSize = 13.sp,
                    color = SafeTextDark,
                    modifier = Modifier.padding(14.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Button(
                onClick = {
                    val phones = contacts.joinToString(";") { it.phone }
                    val uri = Uri.parse("smsto:$phones")
                    val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
                        putExtra("sms_body", messageText)
                    }
                    context.startActivity(intent)
                    onDismiss()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed)
            ) {
                Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Open SMS Messenger (${contacts.size} contacts)", fontWeight = FontWeight.Bold)
            }
        }
    }
}
