package com.safecircle.app.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.safecircle.app.theme.*

data class Helpline(val number: String, val title: String, val subtitle: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelplinesSheet(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val list = listOf(
        Helpline("112", "National Emergency Number", "Police, Fire, Ambulance (All-in-one)"),
        Helpline("1091", "Women's Helpline (Police)", "Immediate 24/7 police assistance for women"),
        Helpline("181", "Women Helpline (Domestic Abuse)", "24-hour toll-free support"),
        Helpline("1090", "Women Power Line", "Anti-stalking & harassment rapid response")
    )

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
                    text = "Emergency Helplines",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = SafeTextDark
                )
                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = SafeTextMuted)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            list.forEach { item ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .clickable {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${item.number}"))
                            context.startActivity(intent)
                        },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SafeBlush)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = item.title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, color = SafeTextDark)
                            Text(text = item.subtitle, fontSize = 12.sp, color = SafeTextMuted)
                        }
                        Button(
                            onClick = {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${item.number}"))
                                context.startActivity(intent)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SafeMaroon),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = item.number, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
