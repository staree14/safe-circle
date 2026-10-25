package com.safecircle.app.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@Composable
fun CalculatorDecoy(
    onTriggerSos: () -> Unit,
    onExitDecoy: () -> Unit
) {
    var display by remember { mutableStateOf("0") }
    var expressionHistory by remember { mutableStateOf("") }

    fun onKey(key: String) {
        when (key) {
            "C" -> {
                display = "0"
                expressionHistory = ""
            }
            "=" -> {
                // Check for stealth PIN
                if (display == "112" || expressionHistory.endsWith("112")) {
                    onTriggerSos()
                    onExitDecoy()
                    return
                }
                if (display == "0000") {
                    onExitDecoy()
                    return
                }
                // Mock calculation result
                try {
                    val result = (display.toDoubleOrNull() ?: 0.0) * 1.0
                    display = if (result % 1.0 == 0.0) result.toLong().toString() else result.toString()
                } catch (_: Exception) {
                    display = "Error"
                }
            }
            "+", "-", "×", "÷" -> {
                expressionHistory = display + key
                display = "0"
            }
            else -> {
                display = if (display == "0") key else display + key
            }
        }
    }

    Dialog(
        onDismissRequest = { /* Don't dismiss accidentally */ },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F0F12))
                .padding(20.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            // Display Area
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 32.dp),
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = expressionHistory,
                    color = Color(0xFF75757F),
                    fontSize = 24.sp,
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = display,
                    color = Color.White,
                    fontSize = 54.sp,
                    fontWeight = FontWeight.Light,
                    maxLines = 1
                )
            }

            // Buttons Grid
            val buttons = listOf(
                listOf("C", "±", "%", "÷"),
                listOf("7", "8", "9", "×"),
                listOf("4", "5", "6", "-"),
                listOf("1", "2", "3", "+"),
                listOf("0", ".", "=")
            )

            buttons.forEach { row ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    row.forEach { btn ->
                        val isOrange = btn in listOf("÷", "×", "-", "+", "=")
                        val isGrey = btn in listOf("C", "±", "%")
                        val isZero = btn == "0"

                        val bgColor = when {
                            isOrange -> Color(0xFFF0525F)
                            isGrey -> Color(0xFFA5A5A5)
                            else -> Color(0xFF333333)
                        }
                        val textColor = when {
                            isGrey -> Color.Black
                            else -> Color.White
                        }

                        Box(
                            modifier = Modifier
                                .weight(if (isZero) 2f else 1f)
                                .height(72.dp)
                                .clip(if (isZero) RoundedCornerShape(36.dp) else CircleShape)
                                .background(bgColor)
                                .clickable { onKey(btn) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = btn,
                                color = textColor,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Normal,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
